import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254 || /[\r\n]/.test(email)) return null;
  // Basic practical validation; the inbox provider will handle actual deliverability.
  if (!/^[^\s@]{1,64}@[^\s@]+\.[a-z]{2,63}$/i.test(email)) return null;
  return email;
}

export function hashText(input) {
  return createHash('sha256').update(input).digest('hex');
}

export function makeUnsubscribeToken(email, secret) {
  const encodedEmail = Buffer.from(email, 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(encodedEmail).digest('base64url');
  return `${encodedEmail}.${signature}`;
}

export function decodeUnsubscribeToken(token, secret) {
  if (typeof token !== 'string' || token.length > 600 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  const [encodedEmail, givenSignature] = token.split('.');
  const expectedSignature = createHmac('sha256', secret).update(encodedEmail).digest('base64url');
  const actual = Buffer.from(givenSignature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  const email = normalizeEmail(Buffer.from(encodedEmail, 'base64url').toString('utf8'));
  return email && Buffer.from(email, 'utf8').toString('base64url') === encodedEmail ? email : null;
}

export function emailHtml({ unsubscribeUrl, logoUrl = 'https://neurojnaai.com/assets/logo.png' }) {
  const unSubSection = unsubscribeUrl
    ? `<p style="margin:28px 0 0;font-size:12px;line-height:1.8;color:#94a3b8">Only launch-related updates, never spam. <a href="${unsubscribeUrl}" style="color:#2563eb;text-decoration:underline;">Unsubscribe</a> anytime.</p>`
    : `<p style="margin:28px 0 0;font-size:12px;line-height:1.8;color:#94a3b8">Only launch-related updates, never spam. Reply to this message to request removal.</p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="background:#f8fafd;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;margin:0;padding:36px 12px;color:#0f172a">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto"><tr><td>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="vertical-align:middle;padding-right:12px;">
          <img src="${logoUrl}" alt="Neurojna-AI Logo" width="46" height="46" style="display:block;width:46px;height:46px;border:0;outline:none;text-decoration:none;object-fit:contain;" />
        </td>
        <td style="vertical-align:middle;">
          <div style="font-size:19px;font-weight:800;letter-spacing:-0.5px;color:#0b172d;line-height:1.15;font-family:Arial,Helvetica,sans-serif;">NEUROJNA<span style="color:#2563eb;">-</span>AI</div>
          <div style="font-size:8.5px;font-weight:700;letter-spacing:3px;color:#78889b;line-height:1;margin-top:2px;font-family:Arial,Helvetica,sans-serif;">PRIVATE LIMITED</div>
        </td>
      </tr>
    </table>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:40px 36px;box-shadow:0 4px 20px rgba(11,23,45,0.03);">
      <div style="display:inline-block;padding:8px 14px;background:#ecfdf5;border:1px solid #d1fae5;border-radius:30px;color:#059669;font-size:12px;font-weight:700">✓ Subscription confirmed</div>
      <h1 style="font-size:30px;line-height:1.25;letter-spacing:-1px;margin:24px 0 14px;color:#0f172a">Hurray! You're on<br/>the list. 🎉</h1>
      <p style="font-size:15px;line-height:1.8;margin:0 0 20px;color:#64748b">You've successfully subscribed to updates from <strong style="color:#1e293b">Neurojna-AI Pvt. Ltd.</strong></p>
      <p style="font-size:15px;line-height:1.8;margin:0;color:#64748b">Our website will be launching soon. We'll let you know as soon as we go live — you'll be among the first to hear.</p>
      <div style="height:1px;background:#f1f5f9;margin:28px 0"></div>
      <p style="font-size:14px;line-height:1.8;margin:0;color:#475569">For any support, help, or business inquiries, feel free to drop mail to <a href="mailto:contact@neurojnaai.com" style="color:#2563eb;text-decoration:underline;">contact@neurojnaai.com</a>.</p>
      <p style="font-size:14px;line-height:1.8;margin:12px 0 0;color:#475569">Thank you for visiting and for being part of our journey.</p>
      <p style="font-size:14px;line-height:1.7;margin:20px 0 0;color:#64748b">Warm regards,<br/><strong style="color:#1e293b">Team Neurojna-AI</strong></p>
      ${unSubSection}
    </div>
    <p style="text-align:center;font-size:11.5px;color:#94a3b8;margin:24px 0 0;font-family:Arial,Helvetica,sans-serif">© ${new Date().getFullYear()} Neurojna-AI Pvt. Ltd. · All rights reserved.</p>
  </td></tr></table>
</body></html>`;
}

export function emailText({ unsubscribeUrl }) {
  return `Hurray! You've successfully subscribed to Neurojna-AI Pvt. Ltd.!\n\nOur website will be launching soon. We'll email you when it goes live.\n\nThank you for visiting and being part of our journey.\n\nTeam Neurojna-AI\n${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : '\nReply to this email to request removal.'}`;
}
