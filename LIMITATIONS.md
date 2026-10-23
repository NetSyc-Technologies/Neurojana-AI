# Neurojana AI — Architecture Limitations & Future Integration Guide

This document transparently records the architectural boundaries of running in **Strict Frontend-Only Mode**, and the prerequisites required before production automated email delivery can be authorized.

---

## 1. Strict Frontend-Only Constraints

1. **No Client-Side Email Delivery API Keys:**
   - Provider keys (such as `RESEND_API_KEY`) must never be held in browser memory or frontend build bundles.
   - Doing so would expose the key to any malicious visitor, allowing quota exhaustion and unauthorized email broadcasts.
2. **No Background Server Cron or Scheduled Queue:**
   - Browser clients cannot run background daemons or scheduled tasks when closed.
   - Appointment reminder emails or scheduled newsletter broadcasts cannot trigger automatically without a server/worker.
3. **App Check & Rate Limiting Residual Risk:**
   - While client form throttling and validation are implemented, strict IP-based rate limiting requires a server or Cloudflare/Vercel edge middleware.
4. **Social Sharing Metadata (OG Tags) for Client-Routed Pages:**
   - In a purely client-rendered Vite SPA, social media crawlers (e.g. LinkedIn, Twitter, Facebook) that do not execute JavaScript will see the root Open Graph tags defined in `index.html`.
   - Dynamic per-post OG tags require build-time static pre-rendering or an Edge worker.

---

## 2. Honest Email Handling in Strict Mode

To respect these constraints without compromising user trust:
- **Receipts:** Upon booking consultation requests, visitors are presented with a clear reference receipt (`NJA-APT-XXXXXXXX`) on screen with date and timezone confirmation.
- **Outbox System:** All triggered communications (Appointment Confirmation, Reschedule Proposals, Staff Assignment, Newsletter Campaigns) generate formatted drafts in the `email_outbox` Firestore collection with state `pending_manual`.
- **Admin Workflow:** Administrators can open the outbox in the Admin Dashboard, inspect the rendered HTML, and either:
  1. Click **Dispatch via Default Mail Client** to launch their configured email client (`mailto:`) with prefilled recipient, subject, and body.
  2. Export consenting recipients as a standardized CSV for import into an authorized marketing tool.
- **Truth in UI:** The dashboard explicitly marks these notifications as `pending_manual` or `manually_completed` and never fabricates automated delivery.

---

## 3. Future Serverless Email Adapter Prerequisites

If and when the project owner decides to deploy a minimal trusted serverless function (e.g. Vercel Serverless Function or Cloudflare Worker), the application is architected with a clean pluggable interface:

```typescript
interface EmailGateway {
  sendAppointmentNotice(appointmentId: string, type: string, payload: any): Promise<DispatchResult>;
  sendCampaign(campaignId: string, filter: CampaignFilter): Promise<DispatchResult>;
}
```

### Steps required before enabling automated emails:
1. **Domain & DNS Verification in Resend:**
   - Configure DNS records for `neurojanaai.com` in your domain registrar:
     - SPF (TXT): `v=spf1 include:amazonses.com ~all`
     - DKIM (CNAME / TXT as provided by Resend)
     - DMARC (TXT): `v=DMARC1; p=none; rua=mailto:dmarc@neurojanaai.com`
   - Verify domain status in the Resend dashboard.
2. **Secure Key Management:**
   - Store `RESEND_API_KEY` strictly in Vercel / Cloudflare Environment Variables (server-only, non-`VITE_` prefixed).
3. **ID Token Verification:**
   - Ensure the serverless endpoint verifies the Firebase Auth ID Token for admin endpoints and validates request signatures.
4. **Quota & Billing Review:**
   - Verify that Resend and serverless invocations fall within acceptable free-tier or paid quotas before large-scale broadcasts.
