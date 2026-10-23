# Neurojana AI — Comprehensive Project Audit & Preservation Report

**Audit Date:** 2026-10-24  
**Project:** Neurojana AI Website & Administration System  
**Audit Purpose:** Comprehensive discovery of existing code, schemas, configuration, assets, security boundaries, and migration paths before the Master Build execution.

---

## 1. Executive Summary & Verified Facts

- **Official Public Name:** Neurojana AI (Neurojna-AI Pvt. Ltd. referenced in existing legal copy; standardized as Neurojana AI in all public and brand assets).
- **Business Type:** IT solutions, software engineering, web application development, Android applications, custom software, and AI-enabled digital services.
- **Primary Domain:** `neurojanaai.com` and `www.neurojanaai.com` (note historical alias `neurojnaai.com` preserved for backward-compatibility in DNS/redirects).
- **Public Contact:** `contact@neurojanaai.com`
- **Future Automated Sender:** `updates@neurojanaai.com` (subject to verified domain in Resend and serverless execution environment).
- **Authorized Admin Allowlist (Google OAuth Only):**
  - `admin@neurojanaai.com`
  - `admin@netsyc.com`
- **Current Deployed State:** Minimal coming-soon landing page with newsletter signup, deployed on Vercel.

---

## 2. Existing Repository Stack & Architecture

- **Build Tool:** Vite 7
- **Base Runtime:** Node.js >= 20
- **Existing Dependencies:**
  - `firebase` (v12.4.0) — Firebase Web client SDK
  - `firebase-admin` (v13.5.0) — previously used in `/api` serverless functions
  - `resend` (v6.3.0) — previously used in `/api` serverless functions
- **Previous Architecture:**
  - Single-page vanilla HTML/CSS/JS (`index.html`, `src/main.js`, `src/style.css`).
  - Vercel Serverless Functions in `/api/subscribe.js` and `/api/unsubscribe.js`.
  - Vite dev server middleware simulating `/api/subscribe` and `/api/unsubscribe`.
- **Target Architecture (Master Build):**
  - React + Vite Single Page Application with client-side routing.
  - Pure Vanilla CSS Design System with customized CSS variables/tokens adhering to modern aesthetics (electric-blue/violet accents, clean off-white canvas, dark navy typography).
  - Pure client-side Firebase Web SDK (Auth + Firestore).
  - Strict Frontend-Only mode: no `/api` serverless functions in the strict production build; email outbox with manual dispatch / drafts.
  - Future-proof `EmailGateway` interface for optional later serverless integration.

---

## 3. Brand Assets & Verification

All existing authentic brand assets have been audited and preserved in `public/assets/`:
- `public/assets/logo.png` (872 KB, official high-resolution logo)
- `public/assets/logo.mp4` (2.2 MB, official brand video animation)
- `public/assets/hero_bg.jpg` (397 KB, background artwork)
- `public/robots.txt` & `public/sitemap.xml`

**Policy on Inventions:**
No fake testimonials, artificial clients, fictitious awards, or fake team members will be presented as live verified content. Real drafts will be stored in Firestore CMS with unpublished status until authorized by Neurojana AI.

---

## 4. Existing Firestore Schema & Data Migration Strategy

### Existing Coming-Soon Collection: `launchSubscribers`
The legacy subscription endpoint stored documents in `launchSubscribers` with document ID `sha256(lowercase_trimmed_email)`:
- `email` (string): Lowercase normalized email.
- `subscriptionStatus` (string): `'active'` | `'unsubscribed'`
- `deliveryStatus` (string): `'pending'` | `'sent'` | `'failed'`
- `subscribedAt` (timestamp)
- `lastAttemptMs` (number)
- `updatedAt` (timestamp)
- `confirmationEmailId` (string | null)
- `confirmationSentAt` (timestamp | null)

### Unified Target Collection: `subscribers`
To support the expanded CMS, marketing consent tracking, audience filtering, and campaign exports, the new unified schema is:
- `email` (string, unique normalized)
- `subscriptionStatus` (string): `'active'` | `'unsubscribed'`
- `source` (string): `'homepage'` | `'blog'` | `'footer'` | `'coming_soon_migration'`
- `consentMarketing` (boolean)
- `consentTimestamp` (timestamp)
- `consentIpHash` (string, privacy-preserving)
- `deliveryStatus` (string): `'pending_manual'` | `'sent'` | `'failed'`
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `unsubscribedAt` (timestamp | null)

### Migration & Compatibility Layer:
1. The Admin Subscriber view will query both the `subscribers` collection and legacy `launchSubscribers` collection seamlessly, merging deduplicated records in real time.
2. A non-destructive migration helper in the Admin dashboard allows one-click upgrading of legacy records into the unified `subscribers` collection without losing `subscribedAt` timestamps or prior delivery notes.

---

## 5. Environment Variables Audit (Names Only)

### Browser-Safe Environment Variables (Vite client build):
- `VITE_FIREBASE_API_KEY`: Firebase Web API identifier
- `VITE_FIREBASE_AUTH_DOMAIN`: e.g. `neurojna-ai-web.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: e.g. `neurojna-ai-web`
- `VITE_FIREBASE_STORAGE_BUCKET`: e.g. `neurojna-ai-web.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: numeric sender identifier
- `VITE_FIREBASE_APP_ID`: Firebase Web App ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Google Analytics measurement ID (optional)

### Server-Only / Secret Variables (NEVER exposed to frontend):
- `RESEND_API_KEY`: Strictly reserved for future optional trusted serverless functions. **Not used in browser bundles.**
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`: Service account credentials reserved for trusted environments.
- `SUBSCRIPTION_SECRET`: HMAC signing secret for unsubscribe links.

---

## 6. Strict Frontend-Only Feasibility & Email Boundary

1. **The Fundamental Boundary:**
   In a pure frontend application, client code cannot securely possess third-party API secret keys (such as `RESEND_API_KEY`). Transmitting or bundling a Resend key into browser JavaScript or Firestore allows any visitor to extract the key and abuse the email quota.
2. **Honest Product Behavior:**
   - When visitors submit consultation bookings or inquiries, the client stores them in Firestore under `pending_review` and displays an on-screen reference receipt with clear timezone and date confirmation.
   - Notifications for booking approvals, reschedules, and campaigns are generated into an `email_outbox` Firestore collection with status `pending_manual`.
   - The Admin console provides:
     - 1-click `mailto:` dispatch for individual customer/employee emails with pre-filled subject and formatted body.
     - Audience CSV export for legitimate newsletter sending tools.
     - Outbox status updates (`pending_manual` → `manually_completed`).
3. **Future Trusted Adapter:**
   - Architecture includes an abstract `EmailGateway` interface:
     - `ManualEmailGateway` (Active): Safe browser-only implementation.
     - `TrustedResendGateway` (Reserved): Serverless adapter ready to connect if the project owner deploys a secured serverless worker in the future.

---

## 7. Version Control Checkpoint & Rollback Plan

- **Baseline Checkpoint Commit:** `master` branch created and committed with all original coming-soon files (`index.html`, `src/`, `api/`, `lib/`, `tests/`, `vercel.json`).
- **Feature Branch:** `feature/full-website-cms` created for the active master build.
- **Rollback Procedure:**
  To revert immediately to the original coming-soon page at any time:
  ```bash
  git checkout master
  npm run build
  ```
  Vercel will redeploy the baseline coming-soon landing page cleanly without downtime.
