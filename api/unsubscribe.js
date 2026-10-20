import { FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from '../lib/firebase-admin.js';
import { decodeUnsubscribeToken, hashText } from '../lib/subscription.js';

function page(content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe | Neurojna-AI</title><style>
  *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;background:#f6f9fe;color:#1a335d;min-height:100vh;display:grid;place-items:center;padding:22px;margin:0}main{background:white;max-width:480px;width:100%;border:1px solid #e5ebf5;padding:40px;border-radius:18px;box-shadow:0 18px 55px #24456b0c}h1{font-size:27px;letter-spacing:-1px;margin:23px 0 10px}p{font-size:15px;line-height:1.7;color:#66768b}button,a.button{background:#2468d8;color:white;border:0;border-radius:9px;padding:13px 21px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;margin-top:9px}.brand{font-weight:800;font-size:18px;letter-spacing:-.5px}.brand span{color:#6d9ee6}</style></head><body><main><div class="brand">NEUROJNA<span>-</span>AI</div>${content}</main></body></html>`;
}
function respond(res, status, markup) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
  return res.status(status).send(page(markup));
}

export default async function handler(req, res) {
  if (!['GET','POST'].includes(req.method)) return respond(res, 405, '<h1>Unsupported action</h1>');
  const token = req.method === 'GET'
    ? req.query?.token
    : (typeof req.body === 'string' ? new URLSearchParams(req.body).get('token') : req.body?.token);
  const secret = process.env.SUBSCRIPTION_SECRET;
  const email = secret?.length >= 32 ? decodeUnsubscribeToken(token, secret) : null;
  if (!email) return respond(res, 400, '<h1>Invalid unsubscribe link</h1><p>This link has expired or is invalid. Please contact us to request removal.</p>');

  if (req.method === 'GET') {
    // Confirmation step avoids email security scanners accidentally unsubscribing.
    return respond(res, 200, `<h1>Leave our update list?</h1><p>By confirming, you'll stop receiving launch-related emails from Neurojna-AI.</p><form method="post" action="/api/unsubscribe"><input type="hidden" name="token" value="${token}"><button type="submit">Confirm unsubscribe</button></form>`);
  }

  try {
    const db = getDatabase();
    const doc = db.collection('launchSubscribers').doc(hashText(email));
    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(doc);
      if (snapshot.exists) {
        tx.update(doc, { subscriptionStatus: 'unsubscribed', unsubscribedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      }
    });
    return respond(res, 200, '<h1>You’ve been unsubscribed</h1><p>We won’t send further launch updates to this email address. Thank you for your interest.</p><a class="button" href="/">Return to website</a>');
  } catch (error) {
    console.error('Unsubscribe error:', error?.message || error);
    return respond(res, 503, '<h1>Something went wrong</h1><p>Please try again in a few moments.</p>');
  }
}
