import { Resend } from 'resend';
import { FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from '../lib/firebase-admin.js';
import {
  normalizeEmail, hashText, makeUnsubscribeToken, emailHtml, emailText,
} from '../lib/subscription.js';

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed.' });
  if (Number(req.headers['content-length'] || 0) > 2048) return json(res, 413, { message: 'Request too large.' });

  // Blocking cross-site browser form submissions reduces drive-by abuse.
  const origin = req.headers.origin;
  if (origin) {
    let sameSite = false;
    try {
      const actualOrigin = new URL(origin);
      const currentHost = req.headers.host;
      const configuredSite = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
      const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
      sameSite = actualOrigin.host === currentHost || actualOrigin.origin === configuredSite ||
        (localHosts.includes(actualOrigin.hostname) && localHosts.includes(String(currentHost || '').split(':')[0]));
    } catch { /* invalid origins should be refused */ }
    if (!sameSite) return json(res, 403, { message: 'Request origin not permitted.' });
  }

  let input = req.body;
  if (!input && typeof req.on === 'function') {
    try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const raw = Buffer.concat(buffers).toString('utf8');
      input = raw ? JSON.parse(raw) : {};
    } catch {
      return json(res, 400, { message: 'Invalid request.' });
    }
  } else if (typeof input === 'string') {
    try { input = JSON.parse(input); } catch { return json(res, 400, { message: 'Invalid request.' }); }
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json(res, 400, { message: 'Invalid request.' });
  // Non-interactive bot submissions are silently discarded.
  if (input.company) return json(res, 200, { message: 'Thank you for subscribing.' });
  const email = normalizeEmail(input.email);
  if (!email) return json(res, 400, { message: 'Please enter a valid email address.' });

  const from = process.env.RESEND_FROM_EMAIL || 'updates@neurojnaai.com';
  const apiKey = process.env.RESEND_API_KEY;
  const secret = process.env.SUBSCRIPTION_SECRET || 'f515c63400adcc38ce488e4e59508a7465d4b222676d379a59da599f977f8614';
  const siteUrl = process.env.SITE_URL || 'https://neurojnaai.com';
  if (!apiKey) {
    console.error('RESEND_API_KEY is missing.');
    return json(res, 400, { message: 'RESEND_API_KEY is not configured in .env. Please set your Resend API key.' });
  }
  let baseUrl;
  try {
    baseUrl = new URL(siteUrl);
  } catch {
    baseUrl = new URL('https://neurojnaai.com');
  }

  let db = null;
  let subscriberRef = null;
  try {
    db = getDatabase();
    subscriberRef = db.collection('launchSubscribers').doc(hashText(email));
    const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim().slice(0,100);
    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    const rateRef = db.collection('subscriptionRateLimits').doc(hashText(`${secret}:${ip}:${hour}`));
    const now = Date.now();

    const decision = await db.runTransaction(async (transaction) => {
      const [rateSnap, subSnap] = await Promise.all([
        transaction.get(rateRef), transaction.get(subscriberRef),
      ]);
      const attempts = rateSnap.exists ? Number(rateSnap.data().attempts || 0) : 0;
      if (attempts >= 15) return 'rate_limit';
      transaction.set(rateRef, {
        attempts: attempts + 1,
        expiresAt: new Date((hour + 2) * 60 * 60 * 1000),
      }, { merge: true });
      if (subSnap.exists) {
        const existing = subSnap.data();
        if (existing.subscriptionStatus === 'active' && existing.deliveryStatus === 'sent') return 'duplicate';
      }
      transaction.set(subscriberRef, {
        email,
        subscriptionStatus: 'active',
        deliveryStatus: 'pending',
        subscribedAt: subSnap?.exists ? subSnap.data().subscribedAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
        lastAttemptMs: now,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return 'send';
    });

    if (decision === 'rate_limit') return json(res, 429, { message: 'Too many attempts. Please try again later.' });
    if (decision === 'duplicate') {
      return json(res, 200, { message: 'You are already subscribed! Please check your inbox.' });
    }
  } catch (dbErr) {
    console.warn('Firestore Admin record skipped (credentials or connection unavailable):', dbErr?.message);
  }

  try {
    const unsubscribeUrl = new URL('/api/unsubscribe', baseUrl);
    unsubscribeUrl.searchParams.set('token', makeUnsubscribeToken(email, secret));
    const logoUrl = new URL('/assets/logo.png', baseUrl).href;
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: from.includes('<') ? from : `Neurojana-AI <${from}>`,
      to: [email],
      subject: "Hurray! You're subscribed 🎉 | Neurojana-AI",
      html: emailHtml({ unsubscribeUrl: unsubscribeUrl.href, logoUrl }),
      text: emailText({ unsubscribeUrl: unsubscribeUrl.href }),
    });
    if (error) {
      console.error('Resend delivery rejected:', error);
      if (subscriberRef) {
        await subscriberRef.update({ deliveryStatus: 'failed', updatedAt: FieldValue.serverTimestamp() }).catch(() => {});
      }
      return json(res, 400, { message: `Resend error: ${error.message || 'Could not send confirmation email.'}` });
    }
    if (subscriberRef) {
      await subscriberRef.update({
        deliveryStatus: 'sent',
        confirmationEmailId: data?.id || null,
        confirmationSentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }).catch(() => {});
    }
    return json(res, 200, { message: 'Subscription successful! Please check your inbox.', emailId: data?.id });
  } catch (error) {
    console.error('Subscription email delivery error:', error?.message || error);
    return json(res, 500, { message: `Email delivery failed: ${error?.message || 'Server error'}` });
  }
}
