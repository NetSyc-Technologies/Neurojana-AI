/**
 * Neurojana AI — Email Gateway System
 *
 * Implements strict frontend-only manual email workflow with honest status tracking.
 * Prepares formatted drafts for the admin outbox, mailto dispatch links, and CSV export.
 * Also defines the future TrustedResendGateway interface for optional serverless integration.
 */

import { collection, addDoc, serverTimestamp, db } from './firebase.js';

export const EMAIL_STATUS = {
  PENDING_MANUAL: 'pending_manual',
  DRAFT_READY: 'draft_ready',
  MANUALLY_COMPLETED: 'manually_completed',
  SENT: 'sent',
  FAILED: 'failed',
};

/**
 * Base Email Gateway interface
 */
export class EmailGateway {
  async queueNotice(notice) {
    throw new Error('Method queueNotice() must be implemented.');
  }
}

/**
 * Manual Email Gateway — Active Strict Frontend Mode Solution
 * Writes to Firestore email_outbox with status 'pending_manual'.
 */
export class ManualEmailGateway extends EmailGateway {
  /**
   * Queues an email notice in the email_outbox collection for manual admin review/dispatch
   * @param {object} notice
   * @param {string} notice.type - e.g. 'appointment_approval', 'reschedule_proposed', 'campaign'
   * @param {string} notice.recipient - email address
   * @param {string} notice.recipientName - full name
   * @param {string} notice.subject - email subject line
   * @param {string} notice.html - rendered HTML template
   * @param {string} notice.text - plain text version
   * @param {string} [notice.appointmentId] - optional associated appointment
   * @param {string} [notice.employeeId] - optional associated employee
   */
  async queueNotice(notice) {
    const payload = {
      type: notice.type,
      recipient: notice.recipient,
      recipientName: notice.recipientName || '',
      subject: notice.subject,
      htmlBody: notice.html,
      textBody: notice.text,
      appointmentId: notice.appointmentId || null,
      employeeId: notice.employeeId || null,
      status: notice.status || EMAIL_STATUS.PENDING_MANUAL,
      emailId: notice.emailId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      attempts: notice.status === 'sent' ? 1 : 0,
      notes: notice.notes || (notice.status === 'sent' ? 'Dispatched automatically via Resend.' : 'Prepared in strict frontend mode for admin-assisted dispatch.'),
    };

    try {
      const outboxRef = collection(db, 'email_outbox');
      const docRef = await addDoc(outboxRef, payload);
      return { id: docRef.id, ...payload };
    } catch (err) {
      console.warn('Manual outbox write fallback (offline or permission):', err);
      return { id: `local-${Date.now()}`, ...payload };
    }
  }

  /**
   * Generates a mailto: link for 1-click dispatch via default email client
   */
  generateMailtoLink(recipient, subject, textBody) {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(textBody);
    return `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  /**
   * Generates opt-in recipient CSV for legitimate mailing platforms
   */
  exportSubscribersCSV(subscribers) {
    const headers = ['Email', 'Subscription Status', 'Consent Marketing', 'Subscribed At', 'Source'];
    const rows = subscribers
      .filter((sub) => sub.subscriptionStatus === 'active')
      .map((sub) => [
        `"${sub.email}"`,
        `"${sub.subscriptionStatus}"`,
        `"${sub.consentMarketing ? 'Yes' : 'No'}"`,
        `"${sub.createdAt ? new Date(sub.createdAt).toISOString() : ''}"`,
        `"${sub.source || 'website'}"`,
      ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

/**
 * Reserved Future Serverless Gateway
 * Connects only if a trusted serverless function (Vercel/Cloudflare) is explicitly authorized.
 */
export class TrustedResendGateway extends EmailGateway {
  constructor(endpointUrl) {
    super();
    this.endpointUrl = endpointUrl;
  }

  async queueNotice(notice) {
    // Requires verified Firebase ID token and trusted serverless handler.
    throw new Error(
      'Automated serverless email delivery is reserved for an authorized trusted serverless function. Please use ManualEmailGateway in strict frontend mode.'
    );
  }
}

// Active singleton instance for the frontend
const DEFAULT_LOGO_URL = 'https://neurojnaai.com/assets/logo.png';

// Pre-built Branded Template Generators
export function renderAppointmentReceivedEmail({
  fullName = 'Valued Client',
  referenceId = '',
  serviceName = 'Consultation',
  preferredDate = '',
  preferredTime = '',
  timezone = 'UTC',
  logoUrl = DEFAULT_LOGO_URL,
}) {
  const subject = `Appointment Request Received: [${referenceId}] | Neurojana AI`;
  const text = [
    `Hello ${fullName},`,
    '',
    `We have received your consultation booking request for "${serviceName}".`,
    '',
    `--- BOOKING DETAILS ---`,
    `Reference ID: ${referenceId}`,
    `Service: ${serviceName}`,
    `Requested Date: ${preferredDate}`,
    `Requested Time: ${preferredTime} (${timezone})`,
    `Status: Pending administrative review`,
    '',
    `Our engineering leads are reviewing specialist availability and will dispatch an official confirmation notice once scheduled.`,
    '',
    `Warm regards,`,
    `Neurojana AI Engineering Team`,
    `contact@neurojanaai.com · https://neurojnaai.com`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="background:#f4f6fa;margin:0;padding:32px 12px;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0b172d;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;margin:0 auto;">
    <tr>
      <td>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(11,23,45,0.05);">
          <!-- Top Header Bar with Logo -->
          <div style="background:#0b172d;padding:24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:12px;">
                        <img src="${logoUrl}" alt="Neurojana AI Logo" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:10px;border:0;object-fit:contain;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:-0.4px;line-height:1.2;">NEUROJANA <span style="color:#38bdf8;">AI</span></div>
                        <div style="color:#94a3b8;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:2px;">Digital Engineering & Practical AI</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:5px 12px;background:rgba(217,119,6,0.18);border:1px solid rgba(217,119,6,0.4);color:#fbbf24;font-size:11px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                    Received
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body -->
          <div style="padding:32px 28px;">
            <div style="display:inline-block;padding:6px 14px;background:#fef3c7;border:1px solid #fde68a;color:#92400e;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:16px;">
              ⏳ Awaiting Administrative Confirmation
            </div>

            <h1 style="color:#0b172d;font-size:23px;font-weight:800;margin:0 0 12px 0;line-height:1.3;">
              Consultation Request Received
            </h1>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
              Hello <strong>${fullName}</strong>, thank you for reaching out to Neurojana AI. We have received your booking request for <strong>${serviceName}</strong>.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;">
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;width:35%;">Reference ID</td>
                  <td style="padding:5px 0;font-family:monospace;font-weight:800;color:#0b172d;font-size:15px;">
                    <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;">${referenceId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Service</td>
                  <td style="padding:5px 0;color:#0b172d;font-weight:600;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Requested Slot</td>
                  <td style="padding:5px 0;color:#0b172d;font-weight:600;">${preferredDate} at ${preferredTime} (${timezone})</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Status</td>
                  <td style="padding:5px 0;color:#d97706;font-weight:700;">Pending administrative review</td>
                </tr>
              </table>
            </div>

            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
              Our engineering leads are reviewing specialist availability to align the right lead for your session. You will receive an official confirmation notice containing your video meeting link once finalized.
            </p>

            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

            <!-- Brand Footer -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 10px auto;">
              <tr>
                <td style="vertical-align:middle;padding-right:8px;">
                  <img src="${logoUrl}" alt="Neurojana AI" width="26" height="26" style="display:block;width:26px;height:26px;border-radius:6px;border:0;object-fit:contain;" />
                </td>
                <td style="vertical-align:middle;font-size:14px;font-weight:800;color:#0b172d;">
                  NEUROJANA <span style="color:#0284c7;">AI</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11.5px;color:#94a3b8;text-align:center;">
              <a href="https://neurojnaai.com" style="color:#64748b;text-decoration:none;">neurojnaai.com</a> · <a href="mailto:contact@neurojanaai.com" style="color:#64748b;text-decoration:none;">contact@neurojanaai.com</a>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}

export function renderAppointmentApprovedCustomerEmail({
  fullName = 'Valued Client',
  referenceId = '',
  serviceName = 'Consultation',
  date = '',
  time = '',
  timezone = 'UTC',
  meetingLink = '',
  notes = '',
  originalDate = '',
  originalTime = '',
  isAdjusted = false,
  company = '',
  assignedEmployeeName = '',
  assignedEmployeeRole = '',
  clientMessage = '',
  logoUrl = DEFAULT_LOGO_URL,
}) {
  const adjustedTag = isAdjusted ? ' [Schedule Updated]' : '';
  const subject = `Confirmed${adjustedTag}: Consultation on ${date} [${referenceId}] | Neurojana AI`;

  const isAdjustedTextNotice = isAdjusted
    ? `\n[NOTE: SCHEDULE ADJUSTED BY SPECIALIST]\nYour consultation date/time was adjusted to: ${date} at ${time} (${timezone}).\n(Originally requested: ${originalDate || date} at ${originalTime || time})\n`
    : '';

  const text = [
    `Hello ${fullName},`,
    '',
    `Your technical consultation for "${serviceName}" with Neurojana AI has been confirmed.`,
    isAdjustedTextNotice,
    `--- CONSULTATION DETAILS ---`,
    `Reference ID: ${referenceId}`,
    `Service: ${serviceName}`,
    company ? `Company / Organization: ${company}` : '',
    `Confirmed Schedule: ${date} at ${time} (${timezone})`,
    assignedEmployeeName ? `Assigned Specialist: ${assignedEmployeeName}${assignedEmployeeRole ? ` (${assignedEmployeeRole})` : ''}` : '',
    meetingLink ? `Virtual Meeting Link: ${meetingLink}` : 'Meeting Link: Will be provided prior to the session start',
    notes ? `\n--- SPECIALIST NOTES & AGENDA ---\n${notes}` : '',
    clientMessage ? `\n--- YOUR SUBMITTED BRIEF ---\n${clientMessage}` : '',
    '',
    `--- PREPARATION & NEXT STEPS ---`,
    `1. Please save this confirmed session to your calendar: ${date} at ${time} (${timezone}).`,
    `2. Have any current architecture diagrams, specifications, or wireframes ready.`,
    `3. If you need to reschedule or have questions, reply directly to this email or reach us at contact@neurojanaai.com.`,
    '',
    `Warm regards,`,
    `Neurojana AI Engineering Team`,
    `https://neurojnaai.com`,
  ].filter(Boolean).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="background:#f4f6fa;margin:0;padding:32px 12px;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0b172d;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:590px;margin:0 auto;">
    <tr>
      <td>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(11,23,45,0.06);">
          
          <!-- Top Branded Header Ribbon with Logo -->
          <div style="background:#0b172d;padding:22px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:12px;">
                        <img src="${logoUrl}" alt="Neurojana AI Logo" width="46" height="46" style="display:block;width:46px;height:46px;border-radius:10px;border:0;object-fit:contain;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.4px;line-height:1.2;">NEUROJANA <span style="color:#38bdf8;">AI</span></div>
                        <div style="color:#94a3b8;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:2px;">Digital Engineering & Practical AI</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:5px 12px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:11px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                    Confirmed
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Main Email Content Body -->
          <div style="padding:32px 28px;">
            
            <!-- Confirmed Pill Badge -->
            <div style="display:inline-block;padding:6px 14px;background:#ecfdf5;border:1px solid #a7f3d0;color:#059669;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:16px;">
              ✓ Consultation Confirmed
            </div>

            <h1 style="color:#0b172d;font-size:23px;font-weight:800;margin:0 0 12px 0;line-height:1.3;letter-spacing:-0.3px;">
              Your Consultation is Confirmed
            </h1>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
              Hello <strong>${fullName}</strong>, thank you for choosing Neurojana AI. We have confirmed your technical consultation session for <strong>${serviceName}</strong>.
            </p>

            ${isAdjusted ? `
            <!-- Schedule Adjustment Alert -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:10px;margin-bottom:20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:top;width:24px;padding-right:8px;font-size:16px;line-height:1;">⚡</td>
                  <td style="vertical-align:top;font-size:13px;color:#92400e;line-height:1.5;">
                    <strong style="color:#78350f;display:block;margin-bottom:2px;">Schedule Adjusted by Lead Specialist</strong>
                    Based on specialist availability, your session has been scheduled for <strong>${date} at ${time} (${timezone})</strong> (originally requested: ${originalDate || date} at ${originalTime || time}).
                  </td>
                </tr>
              </table>
            </div>
            ` : ''}

            <!-- Booking Specifications Card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <div style="background:#f1f5f9;padding:10px 18px;border-bottom:1px solid #e2e8f0;font-size:11.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;">
                Consultation Specifications
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;">
                <tr>
                  <td style="padding:10px 18px;color:#64748b;font-weight:600;width:38%;border-bottom:1px solid #f1f5f9;">Reference ID</td>
                  <td style="padding:10px 18px;font-family:monospace;font-weight:800;color:#0b172d;font-size:15px;border-bottom:1px solid #f1f5f9;">
                    <span style="background:#e0f2fe;color:#0369a1;padding:3px 8px;border-radius:6px;border:1px solid #bae6fd;">${referenceId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 18px;color:#64748b;font-weight:600;border-bottom:1px solid #f1f5f9;">Service Requested</td>
                  <td style="padding:10px 18px;color:#0b172d;font-weight:600;border-bottom:1px solid #f1f5f9;">${serviceName}</td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding:10px 18px;color:#64748b;font-weight:600;border-bottom:1px solid #f1f5f9;">Organization</td>
                  <td style="padding:10px 18px;color:#0b172d;border-bottom:1px solid #f1f5f9;">${company}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:10px 18px;color:#64748b;font-weight:600;border-bottom:1px solid #f1f5f9;">Confirmed Schedule</td>
                  <td style="padding:10px 18px;color:#059669;font-weight:800;font-size:15px;border-bottom:1px solid #f1f5f9;">
                    📅 ${date} at ${time} (${timezone})
                  </td>
                </tr>
                ${assignedEmployeeName ? `
                <tr>
                  <td style="padding:10px 18px;color:#64748b;font-weight:600;border-bottom:1px solid #f1f5f9;">Lead Specialist</td>
                  <td style="padding:10px 18px;color:#0b172d;font-weight:600;border-bottom:1px solid #f1f5f9;">
                    👤 ${assignedEmployeeName} ${assignedEmployeeRole ? `<span style="color:#64748b;font-weight:400;font-size:12px;">(${assignedEmployeeRole})</span>` : ''}
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Virtual Meeting Room Section -->
            <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:1px solid #7dd3fc;border-radius:12px;padding:20px;margin-bottom:24px;">
              <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:1px;color:#0369a1;font-weight:800;margin-bottom:8px;">
                🎥 Virtual Meeting Room
              </div>
              ${meetingLink ? `
                <p style="margin:0 0 14px 0;font-size:14px;color:#0c4a6e;line-height:1.5;">
                  Your dedicated video consultation room is ready. Please join 2–3 minutes prior to the start time.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                  <tr>
                    <td align="center" style="border-radius:8px;background:#0284c7;">
                      <a href="${meetingLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 26px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;border:1px solid #0284c7;">
                        Join Video Consultation Room →
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:12px;color:#475569;word-break:break-all;">
                  Or copy meeting link: <a href="${meetingLink}" style="color:#0284c7;text-decoration:underline;">${meetingLink}</a>
                </div>
              ` : `
                <p style="margin:0;font-size:14px;color:#0c4a6e;line-height:1.5;">
                  A direct Google Meet or Zoom link will be shared by your lead specialist prior to the session start time.
                </p>
              `}
            </div>

            ${notes ? `
            <!-- Specialist Notes & Agenda -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #3b82f6;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:1px;color:#1d4ed8;font-weight:700;margin-bottom:6px;">
                📌 Specialist Instructions & Agenda
              </div>
              <div style="font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${notes}</div>
            </div>
            ` : ''}

            ${clientMessage ? `
            <!-- Client Brief -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;margin-bottom:6px;">
                📝 Your Submitted Project Scope
              </div>
              <div style="font-size:13px;color:#475569;line-height:1.6;font-style:italic;">"${clientMessage}"</div>
            </div>
            ` : ''}

            <!-- Preparation & Next Steps -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:28px;font-size:13px;color:#475569;line-height:1.6;">
              <strong style="color:#0b172d;font-size:14px;display:block;margin-bottom:8px;">Preparation & Next Steps:</strong>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:13px;">
                <tr>
                  <td style="vertical-align:top;width:20px;padding-bottom:6px;">1.</td>
                  <td style="padding-bottom:6px;color:#475569;">Please add this confirmed session to your calendar: <strong>${date} at ${time} (${timezone})</strong>.</td>
                </tr>
                <tr>
                  <td style="vertical-align:top;width:20px;padding-bottom:6px;">2.</td>
                  <td style="padding-bottom:6px;color:#475569;">Have any current architecture diagrams, wireframes, or API specifications accessible.</td>
                </tr>
                <tr>
                  <td style="vertical-align:top;width:20px;padding-bottom:6px;">3.</td>
                  <td style="padding-bottom:6px;color:#475569;">If you need to reschedule or share documents in advance, reply directly to this email or write to <a href="mailto:contact@neurojanaai.com" style="color:#0284c7;font-weight:600;">contact@neurojanaai.com</a>.</td>
                </tr>
              </table>
            </div>

            <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 4px 0;">Warm regards,</p>
            <p style="font-size:14px;font-weight:700;color:#0b172d;margin:0 0 28px 0;">The Neurojana AI Engineering Team</p>

            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px 0;" />

            <!-- Professional Corporate Footer -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 10px auto;">
              <tr>
                <td style="vertical-align:middle;padding-right:8px;">
                  <img src="${logoUrl}" alt="Neurojana AI" width="28" height="28" style="display:block;width:28px;height:28px;border-radius:6px;border:0;object-fit:contain;" />
                </td>
                <td style="vertical-align:middle;font-size:14px;font-weight:800;color:#0b172d;letter-spacing:-0.3px;">
                  NEUROJANA <span style="color:#0284c7;">AI</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 6px 0;font-size:12px;color:#64748b;text-align:center;">
              Digital Engineering, Full-Stack Platforms & Practical AI Integrations
            </p>
            <p style="margin:0 0 10px 0;font-size:12px;text-align:center;">
              <a href="https://neurojnaai.com" style="color:#0284c7;text-decoration:none;font-weight:600;">neurojnaai.com</a> · 
              <a href="mailto:contact@neurojanaai.com" style="color:#0284c7;text-decoration:none;font-weight:600;">contact@neurojanaai.com</a> · 
              <a href="mailto:updates@neurojnaai.com" style="color:#0284c7;text-decoration:none;font-weight:600;">updates@neurojnaai.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
              © ${new Date().getFullYear()} Neurojana AI. All rights reserved. Registered consultation dispatch.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}

export function renderAppointmentApprovedEmployeeEmail({
  employeeName,
  customerName,
  customerEmail,
  customerPhone,
  referenceId,
  serviceName,
  date,
  time,
  timezone,
  notes = '',
  meetingLink = '',
  company = '',
  clientMessage = '',
  logoUrl = DEFAULT_LOGO_URL,
}) {
  const subject = `Staff Assignment: Consultation with ${customerName} [${referenceId}]`;
  const text = [
    `Hello ${employeeName},`,
    '',
    `You have been assigned as the lead specialist for the consultation with ${customerName}.`,
    '',
    `--- CLIENT & CONSULTATION DETAILS ---`,
    `Reference ID: ${referenceId}`,
    `Service: ${serviceName}`,
    `Client Name: ${customerName}`,
    company ? `Company / Org: ${company}` : '',
    `Client Email: ${customerEmail}`,
    `Client Phone: ${customerPhone || 'N/A'}`,
    `Scheduled Time: ${date} at ${time} (${timezone})`,
    meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting Link: Not assigned yet',
    notes ? `\n--- ADMIN BRIEF ---\n${notes}` : '',
    clientMessage ? `\n--- CLIENT REQUIREMENTS ---\n${clientMessage}` : '',
    '',
    `Please review client requirements and attend promptly.`,
    '',
    `Neurojana AI Admin`,
  ].filter(Boolean).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="background:#f4f6fa;margin:0;padding:32px 12px;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0b172d;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;margin:0 auto;">
    <tr>
      <td>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(11,23,45,0.05);">
          <!-- Top Header Bar with Logo -->
          <div style="background:#0b172d;padding:22px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:12px;">
                        <img src="${logoUrl}" alt="Neurojana AI Logo" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:10px;border:0;object-fit:contain;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:-0.4px;line-height:1.2;">NEUROJANA <span style="color:#38bdf8;">AI</span></div>
                        <div style="color:#94a3b8;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:2px;">Internal Staff Dispatch</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:5px 12px;background:rgba(59,130,246,0.18);border:1px solid rgba(59,130,246,0.4);color:#60a5fa;font-size:11px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                    Assigned
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body -->
          <div style="padding:32px 28px;">
            <div style="display:inline-block;padding:6px 12px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:14px;">
              👤 Staff Assignment Notice
            </div>
            <h2 style="color:#0b172d;margin:0 0 12px 0;font-size:22px;font-weight:800;">Consultation Assignment Notice</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
              Hello <strong>${employeeName}</strong>, you are assigned as the lead specialist for the consultation with <strong>${customerName}</strong>.
            </p>
            
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:20px;font-size:14px;color:#334155;">
              <div style="margin-bottom:8px;"><strong>Reference:</strong> <span style="font-family:monospace;font-weight:800;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;">${referenceId}</span></div>
              <div style="margin-bottom:8px;"><strong>Service:</strong> ${serviceName}</div>
              <div style="margin-bottom:8px;"><strong>Customer:</strong> ${customerName} (${customerEmail} / ${customerPhone || 'N/A'})${company ? ` · <strong>${company}</strong>` : ''}</div>
              <div style="margin-bottom:8px;"><strong>Scheduled Time:</strong> <strong style="color:#059669;">📅 ${date} at ${time} (${timezone})</strong></div>
              ${meetingLink ? `<div style="margin-bottom:8px;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color:#0284c7;font-weight:600;">${meetingLink}</a></div>` : ''}
              ${notes ? `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;"><strong>Admin Brief:</strong> ${notes}</div>` : ''}
              ${clientMessage ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;"><strong>Client Requirements:</strong> "${clientMessage}"</div>` : ''}
            </div>
            <p style="font-size:13px;color:#64748b;margin:0 0 20px 0;">Please review client requirements and connect promptly.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px 0;" />
            <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;">Neurojana AI Internal Automated Staff Notification</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}

export function renderAppointmentRescheduledEmail({
  fullName = 'Valued Client',
  referenceId = '',
  serviceName = 'Consultation',
  proposedDate = '',
  proposedTime = '',
  timezone = 'UTC',
  reason = '',
  originalDate = '',
  originalTime = '',
  notes = '',
  company = '',
  logoUrl = DEFAULT_LOGO_URL,
}) {
  const subject = `Reschedule Proposed: Consultation on ${proposedDate} [${referenceId}] | Neurojana AI`;
  const text = [
    `Hello ${fullName},`,
    '',
    `Due to engineering specialist availability, we propose an updated schedule for your consultation on "${serviceName}".`,
    '',
    `--- SCHEDULE DETAILS ---`,
    `Reference ID: ${referenceId}`,
    `Service: ${serviceName}`,
    company ? `Company: ${company}` : '',
    `Proposed New Date: ${proposedDate}`,
    `Proposed New Time: ${proposedTime} (${timezone})`,
    originalDate ? `Original Requested Slot: ${originalDate} at ${originalTime}` : '',
    reason ? `Reason: ${reason}` : '',
    notes ? `Specialist Notes: ${notes}` : '',
    '',
    `Please reply directly to this email or contact contact@neurojanaai.com to confirm if this new time works for you or to suggest an alternative.`,
    '',
    `Warm regards,`,
    `Neurojana AI Engineering Team`,
    `https://neurojnaai.com`,
  ].filter(Boolean).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="background:#f4f6fa;margin:0;padding:32px 12px;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0b172d;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;margin:0 auto;">
    <tr>
      <td>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(11,23,45,0.05);">
          <!-- Top Header Bar with Logo -->
          <div style="background:#0b172d;padding:22px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:12px;">
                        <img src="${logoUrl}" alt="Neurojana AI Logo" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:10px;border:0;object-fit:contain;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:-0.4px;line-height:1.2;">NEUROJANA <span style="color:#38bdf8;">AI</span></div>
                        <div style="color:#94a3b8;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-top:2px;">Digital Engineering & Practical AI</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:5px 12px;background:rgba(37,99,235,0.18);border:1px solid rgba(37,99,235,0.4);color:#60a5fa;font-size:11px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
                    Reschedule
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body -->
          <div style="padding:32px 28px;">
            <div style="display:inline-block;padding:6px 12px;background:#eff6ff;color:#2563eb;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:16px;">
              Schedule Update Proposed
            </div>
            <h2 style="color:#0b172d;margin:0 0 12px 0;font-size:22px;font-weight:800;">Proposed Schedule Update</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px 0;">
              Hello <strong>${fullName}</strong>, due to engineering availability, we propose the following updated time for your consultation on <strong>${serviceName}</strong>:
            </p>
            
            <div style="background:#f1f5f9;border-left:4px solid #2563eb;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;">
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;width:35%;">Reference ID</td>
                  <td style="padding:5px 0;font-family:monospace;font-weight:800;color:#0b172d;font-size:15px;">
                    <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;">${referenceId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Proposed Slot</td>
                  <td style="padding:5px 0;color:#2563eb;font-weight:800;font-size:15px;">📅 ${proposedDate} at ${proposedTime} (${timezone})</td>
                </tr>
                ${originalDate ? `
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Original Request</td>
                  <td style="padding:5px 0;color:#64748b;">${originalDate} at ${originalTime}</td>
                </tr>
                ` : ''}
                ${reason ? `
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Reason</td>
                  <td style="padding:5px 0;color:#334155;">${reason}</td>
                </tr>
                ` : ''}
                ${notes ? `
                <tr>
                  <td style="padding:5px 0;color:#64748b;font-weight:600;">Admin Note</td>
                  <td style="padding:5px 0;color:#334155;">${notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
              Please reply directly to this email or write to <a href="mailto:contact@neurojanaai.com" style="color:#2563eb;font-weight:600;">contact@neurojanaai.com</a> to let us know if this proposed slot works for you or to suggest an alternative.
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px 0;" />
            <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;">Neurojana AI · contact@neurojanaai.com · neurojnaai.com</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}
