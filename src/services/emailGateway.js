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
      status: EMAIL_STATUS.PENDING_MANUAL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      attempts: 0,
      notes: 'Prepared in strict frontend mode for admin-assisted dispatch.',
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
export const emailGateway = new ManualEmailGateway();

// Pre-built Branded Template Generators
export function renderAppointmentReceivedEmail({ fullName, referenceId, serviceName, preferredDate, preferredTime, timezone }) {
  const subject = `Appointment Request Received: [${referenceId}] | Neurojana AI`;
  const text = `Hello ${fullName},\n\nWe have received your consultation request for "${serviceName}".\n\nReference: ${referenceId}\nRequested Date: ${preferredDate}\nRequested Time: ${preferredTime} (${timezone})\nStatus: Pending administrative review\n\nOur team is reviewing the schedule and will confirm shortly.\n\nWarm regards,\nNeurojana AI\ncontact@neurojanaai.com`;
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f8fafc;padding:32px;color:#0b172d;">
      <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(11,23,45,0.04);">
        <h2 style="color:#0b172d;margin-top:0;">Consultation Request Received</h2>
        <p style="color:#475569;">Hello <strong>${fullName}</strong>,</p>
        <p style="color:#475569;">We have received your consultation booking request for <strong>${serviceName}</strong>.</p>
        <div style="background:#f1f5f9;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700;">Reference ID</div>
          <div style="font-size:18px;font-weight:800;color:#0b172d;">${referenceId}</div>
          <div style="margin-top:10px;font-size:14px;color:#334155;"><strong>Date:</strong> ${preferredDate} at ${preferredTime} (${timezone})</div>
          <div style="margin-top:4px;font-size:14px;color:#d97706;font-weight:600;">Status: Awaiting Administrative Confirmation</div>
        </div>
        <p style="color:#475569;font-size:14px;">Our engineering leads are reviewing team availability. You will receive an official confirmation notice once finalized.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:12px;color:#94a3b8;">Neurojana AI · contact@neurojanaai.com · neurojanaai.com</p>
      </div>
    </div>
  `;
  return { subject, text, html };
}

export function renderAppointmentApprovedCustomerEmail({ fullName, referenceId, serviceName, date, time, timezone, meetingLink, notes }) {
  const subject = `Confirmed: Consultation on ${date} [${referenceId}] | Neurojana AI`;
  const text = `Hello ${fullName},\n\nYour consultation for "${serviceName}" has been approved.\n\nReference: ${referenceId}\nConfirmed Date: ${date}\nConfirmed Time: ${time} (${timezone})\n${meetingLink ? `Meeting Link: ${meetingLink}\n` : ''}${notes ? `Notes: ${notes}\n` : ''}\nWe look forward to speaking with you.\n\nWarm regards,\nNeurojana AI\ncontact@neurojanaai.com`;
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f8fafc;padding:32px;color:#0b172d;">
      <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;box-shadow:0 4px 20px rgba(11,23,45,0.04);">
        <div style="display:inline-block;padding:6px 12px;background:#ecfdf5;color:#059669;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:16px;">✓ Consultation Confirmed</div>
        <h2 style="color:#0b172d;margin-top:0;">Your Consultation is Confirmed</h2>
        <p style="color:#475569;">Hello <strong>${fullName}</strong>,</p>
        <p style="color:#475569;">We have scheduled your session for <strong>${serviceName}</strong>.</p>
        <div style="background:#f1f5f9;border-left:4px solid #059669;padding:16px;border-radius:8px;margin:20px 0;">
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700;">Reference ID</div>
          <div style="font-size:18px;font-weight:800;color:#0b172d;">${referenceId}</div>
          <div style="margin-top:10px;font-size:15px;color:#0b172d;"><strong>Confirmed Schedule:</strong> ${date} at ${time} (${timezone})</div>
          ${meetingLink ? `<div style="margin-top:8px;font-size:14px;"><a href="${meetingLink}" style="color:#2563eb;font-weight:600;">Join Meeting Link</a></div>` : ''}
          ${notes ? `<div style="margin-top:8px;font-size:13px;color:#475569;"><strong>Admin Note:</strong> ${notes}</div>` : ''}
        </div>
        <p style="color:#475569;font-size:14px;">If you need to reschedule or have prior project documentation to share, please reply to contact@neurojanaai.com.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:12px;color:#94a3b8;">Neurojana AI · contact@neurojanaai.com</p>
      </div>
    </div>
  `;
  return { subject, text, html };
}

export function renderAppointmentApprovedEmployeeEmail({ employeeName, customerName, customerEmail, customerPhone, referenceId, serviceName, date, time, timezone, notes }) {
  const subject = `Staff Assignment: Consultation with ${customerName} [${referenceId}]`;
  const text = `Hello ${employeeName},\n\nYou have been assigned as the lead engineer for the consultation with ${customerName}.\n\nReference: ${referenceId}\nService: ${serviceName}\nClient Email: ${customerEmail}\nClient Phone: ${customerPhone || 'N/A'}\nDate: ${date}\nTime: ${time} (${timezone})\n${notes ? `Notes: ${notes}\n` : ''}\nPlease review requirements and attend promptly.\n\nNeurojana AI Admin`;
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f8fafc;padding:32px;color:#0b172d;">
      <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;">
        <h2 style="color:#0b172d;margin-top:0;">Staff Assignment Notice</h2>
        <p style="color:#475569;">Hello <strong>${employeeName}</strong>,</p>
        <p style="color:#475569;">You are assigned to the upcoming consultation for <strong>${customerName}</strong>.</p>
        <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:20px 0;font-size:14px;color:#334155;">
          <div><strong>Reference:</strong> ${referenceId}</div>
          <div style="margin-top:6px;"><strong>Service:</strong> ${serviceName}</div>
          <div style="margin-top:6px;"><strong>Customer:</strong> ${customerName} (${customerEmail} / ${customerPhone || 'N/A'})</div>
          <div style="margin-top:6px;"><strong>Scheduled Time:</strong> ${date} at ${time} (${timezone})</div>
          ${notes ? `<div style="margin-top:6px;"><strong>Internal Brief:</strong> ${notes}</div>` : ''}
        </div>
        <p style="font-size:13px;color:#64748b;">Neurojana AI Internal Notification</p>
      </div>
    </div>
  `;
  return { subject, text, html };
}

export function renderAppointmentRescheduledEmail({ fullName, referenceId, serviceName, proposedDate, proposedTime, timezone, reason }) {
  const subject = `Reschedule Proposed: Consultation [${referenceId}] | Neurojana AI`;
  const text = `Hello ${fullName},\n\nWe propose an updated schedule for your consultation on "${serviceName}".\n\nReference: ${referenceId}\nProposed Date: ${proposedDate}\nProposed Time: ${proposedTime} (${timezone})\n${reason ? `Reason: ${reason}\n` : ''}\nPlease reply to contact@neurojanaai.com to confirm or suggest an alternative time.\n\nWarm regards,\nNeurojana AI`;
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f8fafc;padding:32px;color:#0b172d;">
      <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px;">
        <div style="display:inline-block;padding:6px 12px;background:#eff6ff;color:#2563eb;font-size:12px;font-weight:700;border-radius:20px;margin-bottom:16px;">Schedule Update Proposed</div>
        <h2 style="color:#0b172d;margin-top:0;">Proposed Schedule Update</h2>
        <p style="color:#475569;">Hello <strong>${fullName}</strong>,</p>
        <p style="color:#475569;">Due to engineering availability, we propose the following updated time for your consultation on <strong>${serviceName}</strong>:</p>
        <div style="background:#f1f5f9;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;font-weight:700;">Reference ID</div>
          <div style="font-size:18px;font-weight:800;color:#0b172d;">${referenceId}</div>
          <div style="margin-top:10px;font-size:15px;color:#0b172d;"><strong>Proposed:</strong> ${proposedDate} at ${proposedTime} (${timezone})</div>
          ${reason ? `<div style="margin-top:8px;font-size:13px;color:#475569;"><strong>Reason:</strong> ${reason}</div>` : ''}
        </div>
        <p style="color:#475569;font-size:14px;">Please reply to this email or write to <a href="mailto:contact@neurojanaai.com">contact@neurojanaai.com</a> to let us know if this works for you.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:12px;color:#94a3b8;">Neurojana AI · contact@neurojanaai.com</p>
      </div>
    </div>
  `;
  return { subject, text, html };
}
