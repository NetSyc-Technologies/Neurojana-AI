# Neurojana AI — Security Policy & Threat Model

**Status:** Active  
**Mode:** Strict Frontend-Only Application  
**Target Environment:** Vercel Static Hosting + Firebase Authentication + Cloud Firestore

---

## 1. Security Architecture & Trust Boundaries

In this strict frontend-only mode, the client browser is considered an untrusted execution environment. Therefore:
1. **No Secret Keys in Frontend:** Third-party credentials such as `RESEND_API_KEY` or Firebase Admin private keys are **never** bundled into browser code, committed to the repository, or stored in Firestore.
2. **Firebase Client Config is Public:** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and related web parameters are identifiers, not authorization secrets.
3. **Firestore Security Rules are the Primary Defense:** Because anyone with the public Firebase project ID could invoke the Firestore REST API, all collection access, document writes, field mutations, and role verifications are strictly guarded by server-enforced `firestore.rules`.
4. **Google-Only Admin Allowlist:**
   - Administrative capabilities are exclusively restricted to verified Google identities on the exact allowlist:
     - `admin@neurojanaai.com`
     - `admin@netsyc.com`
   - Both client UI checks and `firestore.rules` enforce `request.auth.token.email_verified == true` and case-normalized matching against this list.

---

## 2. Threat Model & Mitigations

| Threat | Risk Level | Mitigation Strategy |
|---|---|---|
| **Direct Firestore Admin Tampering** | High | `firestore.rules` blocks write/update access to `services`, `portfolio`, `blog_posts`, `site_settings`, `employees`, `campaigns`, `email_outbox`, and `audit_logs` unless authenticated as an allowlisted admin. |
| **Public Browsing of Customer Inquiries or Appointments** | High | Read access to `appointments`, `contact_inquiries`, `subscribers`, `employees`, and `email_outbox` is completely blocked for unauthenticated and non-admin users. |
| **Self-Promotion to Admin Role** | Critical | Role flags cannot be passed by the client. Authorization relies entirely on Google OAuth token email and Firestore Security Rules. |
| **Spam / Mass Document Creation** | Medium | Public write permissions are restricted to `create` only on `subscribers`, `appointments`, and `contact_inquiries`, with schema validation (length limits, required strings, valid email bounds, and forced initial statuses like `pending_review` or `new`). |
| **Base64 Payload Inflation in Firestore** | Medium | Client-side compression validates MIME types, strips EXIF, resizes image dimensions, and enforces a hard payload limit (<200 KiB target, <750 KiB hard cap) to guarantee safe headroom below Firestore's 1 MiB document ceiling. |
| **Stored XSS via Blog or CMS Markup** | High | All rich text and blog content is sanitized through `DOMPurify` before rendering to prevent malicious HTML/script injections. |

---

## 3. Email Outbox & Delivery Honesty

Because email sending cannot securely occur directly from a browser without exposing private API keys:
- The system operates an **honest manual outbox** (`email_outbox`).
- When appointments are approved, rescheduled, or cancelled, or when campaigns are drafted, notification payloads are placed in the outbox with status `pending_manual`.
- Administrators can review the pre-rendered HTML/text and trigger a 1-click `mailto:` dispatch for individual recipients or export a verified CSV for marketing services.
- The UI never falsely claims that an automated email has been sent until genuine delivery has occurred.
