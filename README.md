# NEUROJANA AI — Digital Engineering Platform & Administration Console

A modern, high-performance web platform and Cloud Firestore administration system for **Neurojana AI**.

---

## 1. Project Architecture & Mode

- **Operating Mode:** Strict Frontend-Only Mode.
- **Client Stack:** React 19 + Vite 7 + Vanilla CSS Design Tokens + React Router.
- **Authentication:** Firebase Authentication (Google OAuth Only for Administrators).
- **Database:** Google Cloud Firestore with server-enforced `firestore.rules`.
- **Media Storage:** Client-compressed Base64 strings stored directly inside Firestore (`media_assets` collection, <200 KiB target, <750 KiB hard cap).
- **Email Workflow:** Honest Manual Outbox (`email_outbox`) with pre-rendered branded templates, 1-click `mailto:` dispatch, and CSV export for marketing tools.
- **Hosting:** Vercel Static Single Page Application (SPA rewrites configured in `vercel.json`).

---

## 2. Authorized Administrator Google Accounts

Administrative access is restricted to verified Google identities on the exact allowlist:
1. `admin@neurojanaai.com`
2. `admin@netsyc.com`

> **Note:** Administrative checks are enforced both in the client application and server-side in `firestore.rules`. Any unauthorized Google account is gracefully rejected and immediately signed out.

---

## 3. Public Website Routes

| Route | Purpose |
|---|---|
| `/` | Homepage with hero, brand video (`/assets/logo.mp4`), trust statement, services preview, engineering principles, delivery roadmap, and newsletter subscription. |
| `/about` | Company introduction, mission, engineering philosophy, and core principles. |
| `/services` | Comprehensive services catalog with category filtering. |
| `/services/:slug` | Dynamic service detail pages with scope breakdown, key deliverables, tech stack, and FAQs. |
| `/portfolio` | Published client case studies with client clearance confidentiality status. |
| `/blog` | Filterable engineering notebook with keyword search, category tags, and reading times. |
| `/blog/:slug` | Full article view with DOMPurify sanitization, tags, reading time, and share tools. |
| `/book-appointment` | Public consultation booking form with collision-resistant reference IDs (`NJA-APT-XXXXXXXX`), timezone selector (`Asia/Kolkata` default), and receipt confirmation. |
| `/contact` | Validated commercial inquiry form and direct email details. |
| `/privacy` | Honest privacy notice draft detailing data collection, processing, and retention. |
| `/terms` | Honest terms and conditions draft. |
| `/unsubscribe` | Self-service newsletter opt-out form with immediate feedback. |
| `/404` | Branded not-found page with quick navigation. |

---

## 4. Administration Console (`/admin`)

Access via the subtle lock icon in the footer or directly at `/admin/login`.

### Admin Modules:
1. **Overview:** Real-time metrics for pending bookings, approved sessions, new leads, active subscribers, and articles.
2. **Appointments:** Complete booking manager with status state machine (`pending_review` → `approved`, `reschedule_proposed`, `rejected`, `cancelled_by_admin`). Assign saved or inline employees, specify meeting links, and automatically generate formatted notices in the outbox.
3. **Employees:** Staff directory management (name, work email, phone, role, active status) used for appointment assignments.
4. **Inbox / Leads:** Inbound inquiries management with status updates (`new`, `responded`, `archived`) and internal notes.
5. **Content → Services:** Full CRUD for service offerings (title, slug, category, summary, scope, deliverables, order, published flag).
6. **Content → Blog:** Full article editor (title, slug, author, reading time, summary, sanitized HTML content, tags, published flag).
7. **Content → Portfolio:** Project case study manager with client approval clearance controls.
8. **Media Library:** Upload JPEG, PNG, or WebP images; compressed via HTML5 Canvas to WebP/JPEG Base64 and stored in Firestore. 1-click clipboard copy of Base64 strings.
9. **Subscribers:** Unified list merging active subscribers and legacy coming-soon subscribers, with search and 1-click Opt-in CSV export.
10. **Email Outbox:** Inspection of pending manual email notices with pre-rendered templates, 1-click `mailto:` dispatch, and status tracking.
11. **Site Settings:** Global brand metadata, contact email, default timezones, and blackout dates.
12. **Activity / Audit Trail:** Immutable log of administrative actions with actor identity and timestamp.
13. **Google Profile:** Active authentication state, provider details, and allowlist verification.

---

## 5. Local Setup & Commands

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation & Run
```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Firebase Console Configuration & Deployment

### 1. Enable Authentication
1. Go to **Firebase Console** → Project `neurojna-ai-web` → **Build → Authentication**.
2. Under the **Sign-in method** tab, enable **Google**.
3. Under **Authorized domains**, ensure your production domains are added:
   - `localhost`
   - `neurojanaai.com`
   - `www.neurojanaai.com`
   - `*.vercel.app`

### 2. Deploy Firestore Security Rules
Install the Firebase CLI if not already installed, then deploy rules:
```bash
npm install -g firebase-tools
firebase login
firebase use neurojna-ai-web
firebase deploy --only firestore:rules
```
The file `firestore.rules` enforces authorization against the Google admin allowlist and protects private business collections (`appointments`, `employees`, `contact_inquiries`, `email_outbox`, `audit_logs`).

### 3. Deploy Firestore Composite Indexes
```bash
firebase deploy --only firestore:indexes
```
The file `firestore.indexes.json` declares the required indexes for sorting and filtering.

---

## 7. Rollback & Checkpoint Procedure

The initial coming-soon landing page is preserved in Git version control on branch `master`.

To instantly revert the codebase to the original coming-soon landing page:
```bash
git checkout master
npm run build
```
Redeploying the `master` branch to Vercel will immediately restore the previous coming-soon page without data loss.
