import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ManualEmailGateway,
  renderAppointmentReceivedEmail,
  renderAppointmentApprovedCustomerEmail,
  renderAppointmentApprovedEmployeeEmail,
  renderAppointmentRescheduledEmail,
} from '../src/services/emailGateway.js';

const AUTHORIZED_ADMIN_EMAILS = [
  'admin@neurojanaai.com',
  'admin@netsyc.com',
];

function isAuthorized(email) {
  if (!email || typeof email !== 'string') return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

test('Google admin allowlist allows exact authorized emails case-insensitively', () => {
  assert.equal(isAuthorized('admin@neurojanaai.com'), true);
  assert.equal(isAuthorized('admin@netsyc.com'), true);
  assert.equal(isAuthorized('  Admin@NeurojanaAI.com  '), true);
  assert.equal(isAuthorized('ADMIN@NETSYC.COM'), true);
});

test('Google admin allowlist rejects unauthorized emails', () => {
  assert.equal(isAuthorized('user@example.com'), false);
  assert.equal(isAuthorized('admin@otherdomain.com'), false);
  assert.equal(isAuthorized(''), false);
  assert.equal(isAuthorized(null), false);
  assert.equal(isAuthorized('attacker@neurojanaai.com.fake.com'), false);
});

test('ManualEmailGateway generates valid mailto: link for default email client', () => {
  const gateway = new ManualEmailGateway();
  const link = gateway.generateMailtoLink(
    'client@example.com',
    'Consultation Confirmed: [NJA-APT-12345678]',
    'Hello Client,\nYour meeting is scheduled.'
  );

  assert.match(link, /^mailto:client@example\.com\?subject=/);
  assert.match(link, /Consultation%20Confirmed/);
  assert.match(link, /Hello%20Client/);
});

test('ManualEmailGateway exports clean CSV for legitimate marketing services', () => {
  const gateway = new ManualEmailGateway();
  const subscribers = [
    { email: 'active@example.com', subscriptionStatus: 'active', consentMarketing: true, createdAt: '2026-01-01T00:00:00Z', source: 'homepage' },
    { email: 'optout@example.com', subscriptionStatus: 'unsubscribed', consentMarketing: false, createdAt: '2026-01-02T00:00:00Z', source: 'blog' },
  ];

  const csv = gateway.exportSubscribersCSV(subscribers);
  assert.match(csv, /Email,Subscription Status,Consent Marketing,Subscribed At,Source/);
  assert.match(csv, /"active@example\.com","active","Yes"/);
  // Unsubscribed contacts must NOT be included in active opt-in CSV
  assert.equal(csv.includes('optout@example.com'), false);
});

test('Appointment notification templates include reference code and truthful details', () => {
  const notice = renderAppointmentReceivedEmail({
    fullName: 'David Miller',
    referenceId: 'NJA-APT-9922AA11',
    serviceName: 'Web Applications',
    preferredDate: '2026-11-05',
    preferredTime: '14:00',
    timezone: 'Asia/Kolkata',
  });

  assert.match(notice.subject, /NJA-APT-9922AA11/);
  assert.match(notice.text, /Pending administrative review/);
  assert.match(notice.html, /NJA-APT-9922AA11/);

  const approved = renderAppointmentApprovedCustomerEmail({
    fullName: 'David Miller',
    referenceId: 'NJA-APT-9922AA11',
    serviceName: 'Web Applications',
    date: '2026-11-05',
    time: '14:00',
    timezone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    notes: 'Please bring your current wireframes.',
  });

  assert.match(approved.subject, /Confirmed/);
  assert.match(approved.text, /https:\/\/meet\.google\.com\/abc-def-ghi/);
  assert.match(approved.html, /Confirmed Schedule/);

  // Test schedule adjustment notice & complete metadata
  const approvedAdjusted = renderAppointmentApprovedCustomerEmail({
    fullName: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    referenceId: 'NJA-APT-5544BB22',
    serviceName: 'AI Integrations & Workflow Automation',
    date: '2026-11-08',
    time: '16:00',
    timezone: 'Asia/Kolkata',
    originalDate: '2026-11-07',
    originalTime: '10:00',
    isAdjusted: true,
    meetingLink: 'https://meet.google.com/xyz-123-abc',
    notes: 'Focusing on LLM security & data pipelines.',
    assignedEmployeeName: 'John Doe',
    assignedEmployeeRole: 'Principal AI Architect',
    clientMessage: 'Need semantic vector search over internal manuals.',
  });

  assert.match(approvedAdjusted.subject, /Schedule Updated/);
  assert.match(approvedAdjusted.html, /Cyberdyne Systems/);
  assert.match(approvedAdjusted.html, /Schedule Adjusted/);
  assert.match(approvedAdjusted.html, /John Doe/);
  assert.match(approvedAdjusted.html, /Principal AI Architect/);
  assert.match(approvedAdjusted.html, /Need semantic vector search/);
  assert.match(approvedAdjusted.text, /SCHEDULE ADJUSTED BY SPECIALIST/);

  const empNotice = renderAppointmentApprovedEmployeeEmail({
    employeeName: 'John Doe',
    customerName: 'Sarah Connor',
    customerEmail: 'sarah@cyberdyne.com',
    customerPhone: '+91 98765 43210',
    company: 'Cyberdyne Systems',
    referenceId: 'NJA-APT-5544BB22',
    serviceName: 'AI Integrations',
    date: '2026-11-08',
    time: '16:00',
    timezone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/xyz-123-abc',
    notes: 'High priority enterprise lead.',
    clientMessage: 'Looking for prompt engineering guidelines.',
  });
  assert.match(empNotice.subject, /Staff Assignment/);
  assert.match(empNotice.html, /sarah@cyberdyne\.com/);
  assert.match(empNotice.html, /Cyberdyne Systems/);
  assert.match(empNotice.text, /High priority enterprise lead/);

  const resched = renderAppointmentRescheduledEmail({
    fullName: 'Sarah Connor',
    referenceId: 'NJA-APT-5544BB22',
    serviceName: 'AI Integrations',
    proposedDate: '2026-11-12',
    proposedTime: '11:00',
    timezone: 'Asia/Kolkata',
    reason: 'Lead engineer attending developer summit',
  });
  assert.match(resched.subject, /Reschedule Proposed/);
  assert.match(resched.html, /developer summit/);
  assert.match(resched.text, /NJA-APT-5544BB22/);

  // Logo presence checks across all templates
  assert.match(notice.html, /assets\/logo\.png/);
  assert.match(approved.html, /assets\/logo\.png/);
  assert.match(empNotice.html, /assets\/logo\.png/);
  assert.match(resched.html, /assets\/logo\.png/);
});
