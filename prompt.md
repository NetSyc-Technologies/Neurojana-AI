# MASTER BUILD PROMPT — NEUROJANA AI

> **Purpose:** Give this entire file to an AI coding agent working inside the **existing Neurojana AI website repository**. Build, test, and prepare a complete, elegant, secure, responsive public website and a functional Firestore-backed administration console. This is a **build instruction**, not a request for mockups, a plan-only response, or placeholder UI.
>
> **Project constraints:** Frontend-only application; Firebase Authentication + Cloud Firestore; images stored as compressed Base64 strings **inside Firestore**; Google-only admin sign-in; no traditional/custom backend server; use only services/free-tier features that are genuinely available for this use case. Existing coming-soon project and its branding/configuration must be reused wherever possible.
>
> **Important feasibility boundary:** **Secure, automatically delivered Resend emails are not possible from a strictly frontend-only application.** A Resend API key must not enter browser JavaScript, a `VITE_*` variable, HTML, source control, or Firestore. This prompt requires a **fully functional, honest frontend-only mode** with an email outbox, delivery states, and admin-assisted sending. It also defines a clean, optional *future* trusted serverless email adapter so automated emails can be enabled **only if the project owner later authorizes a minimal server-side component**. Do not secretly create a backend, expose a secret, fabricate successful email delivery, or claim automatic email delivery works when it cannot.

---

## 1. Project identity and verified facts

- **Public company name:** Neurojana AI (check source repository for the exact legally approved company name before adding “Private Limited”, “Pvt. Ltd.” or corporate registration claims).
- **Business type:** IT solutions, software engineering, web and mobile application development, custom software, and relevant AI-enabled digital services.
- **Primary domain expected by this brief:** `neurojanaai.com` and `www.neurojanaai.com` — confirm actual Vercel project domains and DNS before editing deployment settings. An earlier site might have used a similar spelling; **never assume the domain variants are interchangeable**.
- **Public contact:** `contact@neurojanaai.com`.
- **Future automated update sender:** `updates@neurojanaai.com`, subject to verified Resend domain setup and a trusted sending environment.
- **Exact Google-login administrator email allowlist:**
  - `admin@neurojanaai.com`
  - `admin@netsyc.com`
- **Current deployed state:** An existing minimal coming-soon website is already deployed on Vercel. Reuse its source, styles/assets/configuration if available; preserve the live page until the full site is validated and intentionally released.
- **Existing visual assets:** Find and reuse the authentic logo (`logo.png`, SVG, or similarly named original) and any `logo.mp4` animated brand introduction in the existing repository. Do not generate a replacement identity by default. If absent, explicitly report missing assets and use a temporary text mark rather than impersonating the original.
- **Do not invent:** founders, team profiles, clients, awards, partner logos, testimonials, phone numbers, addresses, legal registrations, certifications, project metrics, pricing, or case studies. Use safe draft/hidden CMS entries until real information is provided.

## 2. First action: audit and preserve the existing project

Before writing application code:

1. Inspect the root directory, `package.json`, routes, assets, deployed configuration, Firebase initialization, email-related code, environment files (`.env`, `.env.local`, `.env.production`, Vercel settings where accessible), Firestore collections, authentication providers, and previous coming-soon subscription flow.
2. Determine the actual framework. Prefer improving the existing modern React/Vite/TypeScript stack if that is what the project uses. Do **not** rebuild from scratch merely for convenience; preserve working features, subscriptions, important URLs, and brand assets.
3. Verify which environment variables are intended for the browser. **Firebase Web SDK config values can be public**, but database access must be controlled by properly deployed security rules. **Resend API keys, service-account credentials, and private keys are secrets.**
4. Never print, repeat, commit, expose in screenshots, write into the generated prompt, or send any secrets to logs. Do not copy an exposed Resend secret into a frontend environment variable. If a Resend key has previously appeared in a chat, repo, deployed frontend, or public environment, mark it for **rotation** before any future server-side integration.
5. Inspect and preserve the existing subscriber records, including schema variants. Build a migration/compatibility layer rather than losing subscribers or overwriting consent metadata.
6. Document findings in `PROJECT_AUDIT.md` with **variable names only**, service availability, asset paths, existing schema, and any blockers. No secret values.
7. Create a rollback-ready checkpoint/version-control branch before replacing the deployed coming-soon UI. Do not destroy Vercel domain, DNS or project configuration.
8. If local source code or secrets are unavailable, implement the app with configuration placeholders and clearly state what must be supplied. Never claim to have recovered credentials that were not accessible.

## 3. Desired visual direction: premium digital engineering company

Create a **refined, minimalist, animated, high-end SaaS/technology aesthetic**, not a generic “AI startup” template.

- **Personality:** credible, technically capable, modern, precise, restrained, friendly, high-performance.
- **Palette:** near-white or off-white canvas; deep ink/navy text; carefully limited electric-blue/violet highlights informed by the existing logo. Provide a polished dark mode only if it can be maintained consistently.
- **Typography:** modern, readable system or freely licensed web typography (e.g., Geist/Inter or equivalent); fluid responsive type scaling; restrained heading tracking; excellent line length and contrast.
- **Layout:** strong hierarchy, abundant whitespace, aligned grids, elegant cards, generous gutters, smooth section rhythm, consistent section widths, purposeful shadows and borders.
- **Hero concept:** distinctive large headline about translating ideas into software that matters; concise supporting copy; strong primary CTA “Book a Consultation”; secondary CTA “Explore Services”; polished graphic based on abstract architecture, code/product UI, or brand mark. Avoid random robot heads, overpowering neural-network clichés, fake dashboard data and visually noisy parallax.
- **Motion:** Framer Motion or Motion for React if appropriate; hover micro-interactions, subtle scroll reveals, staggered cards, animated gradients/lines, navigation transitions and button feedback. Honor `prefers-reduced-motion`, keep animations GPU-friendly, and do not block clicks or meaningful content.
- **Brand intro:** reuse `logo.mp4` if present, but do not force replay of a long unskippable video on every visit. Prefer a short accessible branded loading/intro sequence only when it provides value; respect reduced motion and repeat visits. Check video autoplay/muted rules, failures and mobile performance.
- **Responsiveness:** design and actually test phone, small phone, tablet, laptop, ultrawide; no horizontal overflow, broken grids, cut-off dialogs or small tap targets.
- **Quality:** recognizable custom design system, real content, real interactions; no lorem ipsum, dead buttons, arbitrary generic stock graphics or inflated brand claims.

### UI design tokens

Centralize spacing, colors, radii, elevation, transitions, typography and breakpoints in tokens. Support AA color contrast, keyboard focus indicators, clear status feedback, loading skeletons, empty states, recoverable errors, toast notifications and accessible dialogs. Use lucide-react or a similarly consistent open-source icon set. Optimize `font-display`, bundle sizes, images and motion.

## 4. Technical architecture — strict frontend-only mode

**Suggested stack** (adapt to the existing repository where practical):

- React + TypeScript + Vite (or preserve existing equivalent).
- React Router with lazy-loaded routes and route-level error boundaries.
- Tailwind CSS + reusable accessible UI primitives, or existing styling framework when already robust.
- Firebase Web SDK modular imports: Authentication (Google for admins; optionally anonymous auth for public bookings), Cloud Firestore.
- Zod or equivalent for form validation; React Hook Form or equivalent.
- Motion for React/Framer Motion only when compatible with the stack.
- React Query/TanStack Query or a lightweight data service layer as needed, with sensible Firebase subscriptions and caching.
- `date-fns` + timezone-aware date handling where needed.
- `DOMPurify` or equivalently safe content sanitization; prefer structured/block-based blog content over unrestricted raw HTML.
- Static frontend deploy to existing Vercel project, with no custom Node/Express API, no `/api` routes and no serverless functions **in strict mode**.

**State the limits accurately:** Firebase itself is a managed backend service, but no **custom application backend** is maintained in this mode. Firestore Rules, Firebase Auth and App Check, where available, are the trust/security boundaries. Browser logic alone is not security.

### Supported in strict mode

- Public pages; CMS-driven content; Google admin login; admin dashboard; subscriptions; consultation request submissions; status tracking under properly protected records; employee directory; appointment review/rescheduling/assignment; project/inquiry management; publication controls; campaign drafting; email outbox preparation; data export; basic Firestore analytics; live site settings.

### Not securely achievable in strict mode

- Automatic Resend campaigns or approval emails triggered by users/admins; trusted delayed email processing; secure email-domain verification from browser; secret-key email APIs; trustworthy server-side rate limits or scheduled jobs; email tracking webhooks; server-side SEO for each dynamic blog URL unless prerender/static generation is included in the build process.

**Implement graceful product behavior**, not imitation: show `Email pending — manual dispatch required` rather than “Email sent”; expose campaign delivery as `draft`/`ready_for_manual_send`/`manually_completed` until a real trusted adapter exists. Do not set `sentAt` unless delivery genuinely succeeded. For manual sending, allow an admin to open a prepared email using `mailto:` for one recipient, or export opt-in recipient CSV and campaign content for a legitimate mailing service. Make clear that a CSV export is not automatic mailing, that `mailto:` cannot reliably send bulk email, and that admins must respect unsubscribe/consent status.

### Optional automation integration — NOT allowed without explicit approval

Architect but **do not deploy** an `EmailGateway` interface, with two possible implementations:

- `ManualEmailGateway` as the default safe and working strict-frontend solution.
- `TrustedResendGateway` reserved for an explicitly approved Cloudflare Worker/Vercel Function or another trusted service, where `RESEND_API_KEY` is stored exclusively as a secret and **never transmitted to the browser**. The trusted service must verify Firebase ID tokens, enforce admin roles for campaigns, authorize booking notification jobs, idempotently process jobs and respect rate limits, subscription consent and unsubscribes. Hosting cost/free quota and commercial eligibility must be verified before enabling; **do not promise permanent unlimited free services**.

The project owner must be told that production automated email delivery and strictly frontend-only deployment are incompatible constraints. Never disguise a function as “frontend-only”.

## 5. Public pages and routing

Create the following polished, genuinely functional public routes (adapt URL slugs to existing URLs and add redirects only when needed):

| Route | Purpose and required experience |
|---|---|
| `/` | Premium animated homepage with strong hero, value proposition, featured services, process, selected case studies only if verified, capability highlights, blog previews, FAQs, booking CTA, newsletter signup and footer. |
| `/about` | Company introduction, mission, vision, values, delivery approach, genuine team details only when approved, credibility without fabrication. |
| `/services` | Service overview with filtering or categorization, visually refined reusable service cards and detail CTAs. |
| `/services/:slug` | SEO-friendly CMS-backed detail pages: challenge, offering, scope, technologies, process, deliverables, FAQs, booking CTA. |
| `/solutions` | Business solutions / industries only when real material is available; otherwise hide route from navigation and indexing. |
| `/portfolio` | Published projects/case studies, screenshots, categories and detail views; empty state when none are verified. |
| `/portfolio/:slug` | Published case-study details with problem, approach, work completed, approved visuals/outcomes. |
| `/blog` | Searchable, tag-filterable, paginated published articles; featured posts and reading times. |
| `/blog/:slug` | Accessible article experience with author, date, cover image, share link, related posts, sanitized body and SEO metadata. |
| `/book-appointment` | Consultation booking form and clear pending-admin-confirmation UX. |
| `/contact` | Validated business inquiry form; contact email prominently displayed; service selection and response expectations without false promises. |
| `/privacy` | Honest privacy notice draft clearly awaiting business/legal review; explain data categories, processors, retention, opt-out and contact. |
| `/terms` | Terms page draft awaiting approval; avoid inventing legal guarantees. |
| `/unsubscribe` | Self-service opt-out design and only genuinely secure/usable unsubscribe flow; do not expose subscriber directory or require admin access. |
| `/404` | Useful branded not-found page with links to home/services/contact. |

If a legal notice, employee list, testimonial or portfolio item has no confirmed source material, keep it as an unpublished CMS draft instead of publishing invented claims.

### Homepage sections, in suggested order

1. Fixed but unobtrusive global header (desktop navigation, mobile accessible drawer, scroll state, brand logo).
2. Distinctive hero with 2 CTAs and restrained animated brand/product illustration.
3. One-line trust/value statement without unverified metrics.
4. Services preview: Web Development, Web Applications, Custom Software, Android Applications, UI/UX Design, AI Integrations, Technology Consulting, and other services **only where credible**.
5. Value proposition: architecture, quality, performance, security-minded engineering, maintainability.
6. Clear 4–5 step engagement/process timeline.
7. Published selected work or alternative “What we can build” illustration if no public projects yet.
8. Industry/application examples without fabricated client endorsements.
9. Featured blog/insights (only published articles).
10. Consultation CTA band.
11. Newsletter subscription with explicit marketing consent.
12. Strong footer with addresses/email only if verified, legal links, and discreet administrator access.

### Services content model

Provide well-written, credible default drafts for:

- Website Design & Development
- Web Application Development
- Custom Software Engineering
- Android Application Development
- UI/UX & Product Design
- AI-Powered Integrations & Workflow Automation
- Maintenance, Optimization & Technical Support (only if actually offered)

Explain specific outcomes, possible stack, delivery process and exclusions clearly. Make it fully editable from the dashboard and ensure draft services never appear publicly.

## 6. Newsletter & subscriber system

- Email input in homepage, blog and footer, all connected to a **single** Firestore subscription service.
- Require intentional, unchecked-by-default marketing consent where appropriate, with a link to Privacy Policy; validate syntax, normalize lowercase addresses and trim whitespace.
- Handle duplicates idempotently; re-subscribing should never erase prior consent or silently change an explicit opt-out without a new affirmative consent event.
- Do not expose subscriber email lists in public Firestore queries or browser bundles.
- Persist subscriber fields: unique doc identity, normalized email, subscription status, consent timestamp/version/source, `createdAt`, `updatedAt`, last notice metadata and unsubscribe metadata. Do not store more personal data than necessary.
- Recognize existing coming-soon subscribers. Plan a non-destructive schema migration/deduplication strategy; do not broadcast promotional messages to addresses lacking appropriate consent.
- Build Admin → Subscribers: list, search, filter, opt-out state, export only for admins, manually add/remove with consent history, statistics and protections against accidental data loss.
- Build Admin → Campaigns: email subject, preview text, rich but safe body, audience filter, recipient estimate, scheduling **as draft metadata only in frontend-only mode**, preview, test-email draft, final review, export. Never falsely claim scheduled automatic sending.
- Newsletter mailing must only be marked delivered upon verifiable dispatch through an approved future trusted gateway.
- Unsubscribe links for automatically sent emails must be implemented by the future gateway. In strict mode, offer a safe opt-out mechanism; if anonymous public opt-out requires a bearer token, ensure it is high-entropy, minimally scoped to opt-out, cannot enumerate subscribers, and is not logged. If robust implementation is not possible under the selected authentication/data model, surface a clear request-to-unsubscribe alternative through `contact@neurojanaai.com` rather than presenting a fake confirmation.

## 7. Appointment booking — public workflow

Public visitors must be able to request a consultation without needing an admin account.

### Booking form fields

- Full name (required)
- Email (required)
- Phone with country code (required, validate sensible format)
- Company/organization (optional)
- Service interested in (required; CMS service list)
- Preferred meeting date (required)
- Preferred start time (required)
- Meeting mode: online / phone / in-person (only offer options actually supported; location details approved by admin)
- Timezone (default `Asia/Kolkata`, explicitly visible and user-changeable if serving other regions)
- Short project requirement/message (required; bounded length)
- Optional budget bracket and desired timeline, if useful
- Privacy/processing consent acknowledgment (required)

### Client-side UX and record handling

1. Load administrator-managed availability settings, blackout dates, duration and minimum notice from Firestore.
2. Display valid selectable dates/times, but clearly label any slot as **requested/not yet confirmed**. The browser must not imply live guaranteed availability without a trusted locking/reservation process.
3. Validate with Zod, including future time, sensible lengths, invalid/blocked slots and timezone conversions.
4. Submit to a protected Firestore collection with server timestamp and immutable owner/session identifier; generate readable reference such as `NJA-APT-XXXXXXXX` using collision-resistant generation and collision-handling. Treat the Firestore document ID as the canonical unique identifier.
5. Always initialize booking status to **`pending_review`**; the public client must never choose `approved`, `rejected`, `completed` or employee assignment.
6. Show a polished success/receipt screen: reference ID, requested date/time, timezone, “Awaiting administrative approval.” Explain that an email cannot be guaranteed in frontend-only mode. Optionally provide a printable/copyable receipt.
7. Disable duplicate submissions, handle intermittent connectivity and meaningful Firestore errors; do not swallow failures.
8. Minimize exposure of customer data. Visitors must never be able to browse appointments or employee contacts.
9. Where no sign-in is desired, use Firebase Anonymous Authentication for a session-bound submission if feasible and correctly configured; implement owner-based Firestore rules. Note that anonymous-session continuity across browsers/devices is not guaranteed. Do not create a public lookup endpoint that reveals an appointment just from a guessable reference number.

### Appointment state machine

- `pending_review` → `approved`, `reschedule_proposed`, `rejected` or `cancelled_by_admin`.
- `reschedule_proposed` → `approved` upon explicit approval policy, or back to `pending_review` if the new proposal needs customer confirmation. Prefer recording proposal separately rather than asserting a changed date was accepted.
- `approved` → `reschedule_proposed`, `completed`, `cancelled_by_admin`, `no_show`.
- Any status transition must be validated; implement a versioned audit trail. Do not silently overwrite approvals or lose history.
- Appointment edits/admin actions must preserve original requested date/time, current confirmed/proposed date/time, timezone, employee assignment history, reason/notes, status timestamps and actor identity.

**Key requirement:** Admin can accept an appointment as requested, change the time/date, propose a new schedule, reject it, cancel it, or assign an employee. If admin changes the date/time, distinguish **proposed** vs **confirmed** so the customer is never falsely told that an unaccepted change is final. In frontend-only mode, record the change and prepare the correct manual email notification.

## 8. Employee directory and assignments

Build a lightweight Admin → Employees module with:

- Full name, work email, mobile number, designation/role (optional), active/inactive status, notes (private), create/update timestamps.
- Add/edit/deactivate employee; search, filtering, validation and duplicate warnings.
- Presave employees and select them from the appointment assignment control.
- Add employee inline from appointment modal using name/email/mobile; option to persist in directory after confirmation.
- Optionally allow one primary employee per appointment, with a clear extension point for multiple employees later.
- Assignment snapshot on appointment (employee ID, name/email/mobile as assigned at that moment), so historical bookings remain coherent if a staff profile changes.
- Calendar-like admin view with assigned staff, filtering and conflict indicators. Conflict checks are advisory unless atomic concurrency handling is implemented and verified.
- Employees do **not** need administrator access or password-based accounts to receive assignment details through the future email system.

### Email templates prepared for each event

1. Booking received → customer acknowledgment (`pending_review`), only if real dispatch is available; otherwise show on-screen receipt and create draft.
2. Booking approved → customer confirmation with verified details.
3. Booking approved with employee → assigned employee receives booking details.
4. Booking rescheduled/proposed → customer notified and, when applicable, employee updated.
5. Appointment rejected/cancelled → customer notification; update employee if previously assigned.
6. Employee reassigned → new employee notice, previous employee cancellation/update as appropriate.
7. Appointment reminders: **not automatically scheduled** in frontend-only mode; leave a future gateway hook.

Every template must use consistent branded HTML/text, sender display name `Neurojana AI`, sender address `updates@neurojanaai.com` **only when a trusted provider is approved**, `Reply-To: contact@neurojanaai.com` where supported, reference ID, timezone, relevant dates, and privacy-conscious language. A booking approval is a transactional notification, distinct from promotional marketing consent.

Add an `email_outbox` model with `type`, `appointmentId`, `recipient`, `templateVersion`, `renderPayload`, `status` (`pending_manual`, `draft_ready`, `manually_completed`, `sent`, `failed`), `createdAt`, attempts (for future adapter), idempotency key and last error where relevant. Never store provider API secrets. Do not set `sent` automatically from a manual button click without truthful confirmation of actual dispatch.

## 9. Contact form and lead handling

- Functional contact form with name, email, phone (optional), company (optional), service, subject and bounded message, plus privacy consent.
- Save to protected Firestore with `new`, `in_progress`, `responded`, `archived` statuses; public can submit but not read inbox.
- Admin inbox: search/filter, details, internal notes, priority, assigned employee (optional), status management and archive/restore.
- `mailto:contact@neurojanaai.com` fallback if data layer is offline; clearly differentiate sending an email from saving an inquiry.
- No fictitious chatbot or 24/7 support claims.

## 10. Admin access — Google only, discreet entry

- Add a **small, subtle “Admin” or lock icon** in the public footer, visually consistent with secondary footer items. It must still be keyboard-accessible and have an accessible label. Do not add a prominent admin CTA to the header.
- Footer entry opens `/admin/login`. Direct route entry remains valid but protected.
- **Authentication provider:** `GoogleAuthProvider` only, using Firebase Authentication popup or redirect fallback on browsers that block popups. No password form, email-link login, sign-up or other login method.
- **Authorized administrator email addresses, exact and case-normalized:** `admin@neurojanaai.com`, `admin@netsyc.com`. Ensure the target identities can actually authenticate through Google. A mailbox existing on a custom domain is not proof it is a Google account.
- After successful sign-in, verify `email`, `email_verified`, Firebase user state and the exact allowlist. Reject all other Google accounts gracefully and sign them out of the admin session.
- **CRITICAL:** UI checking alone is not authorization. Deploy Firestore Security Rules which independently check Firebase Auth identity and approved email addresses for all administrative reads/writes. Public clients must never grant themselves admin roles or alter a role record.
- Prefer allowlist constants in Firestore Rules managed through secure deployment. Do not rely on editable Firestore `site_settings.adminEmails` for authorization. If a formal RBAC/custom-claims mechanism is desired later, it requires trusted administration and is outside strict frontend scope.
- Restrict admin route access, admin data queries and CMS writes; prevent user-interface flashes showing protected content before checks finish.
- Persist sign-in using Firebase Auth SDK supported mechanisms; implement sign-out, clear unauthorized session messaging, and no misleading “secret URL = secure” assumptions.
- Include meaningful permission-denied/access-denied/error states and an admin account switch flow.
- Protect unauthorized reads/writes even when someone bypasses the frontend and uses the Firestore REST API directly.

## 11. Admin dashboard — the entire website is controllable

Create a professional responsive administration application with sidebar, breadcrumbs, quick search, compact analytics, clearly labeled statuses, confirmation dialogs and full mobile/tablet usability.

### Navigation modules

1. **Overview:** total inquiries, pending appointments, approved appointments, upcoming meetings, active subscribers, published blog posts, recent activity. Values derived from real Firestore data; no fabricated dashboard metrics.
2. **Appointments:** table, kanban/status segments and calendar view; filters, detail drawer, approvals, reschedule proposals, employee assignment, rejection reason, notes, history, manual notification drafts/outbox links.
3. **Employees:** saved directory, create/edit/deactivate, per-employee assignment summary.
4. **Inbox/Leads:** real contact form submissions, categories, internal notes and follow-up states.
5. **Content → Pages:** CMS sections for homepage/about/contact and global site copy with draft/publish workflow and previews.
6. **Content → Services:** CRUD, visibility, SEO slug, ordering, featured flag, icon/image, FAQs and CTA configuration.
7. **Content → Blog:** rich editor/structured blocks, slug, cover image, tags, author, status, preview, metadata, canonical URL, publish/unpublish, related articles.
8. **Content → Portfolio:** project CRUD, image gallery, project links, client publication approval flag, ordered fields, status and metadata.
9. **Media Library:** upload, client-side compression/conversion to Base64, thumbnails, alt text, use references, usage tracking, replace/delete protections and storage usage warning.
10. **Subscribers:** membership status, consent records, search/filter, opt-out, counts and CSV export.
11. **Campaigns:** editorial templates, subject/preheader, targeting, audience counts, preview, drafts, manual export; automatic delivery disabled and honestly labeled in strict mode.
12. **Email Outbox:** pending drafts per appointment/campaign, recipients, template preview, manual dispatch controls and transparent audit statuses; future adapter integration status panel.
13. **Site Settings:** brand metadata, navigation links, contact email, social links, footer, SEO defaults, section visibility, theme variants, announcement bar, consultation slots/durations, blackout dates and maintenance/coming-soon mode.
14. **Activity/Audit:** changes to critical records with who/what/when, and action timestamps.
15. **Administration:** Google account profile, connection health, deployment checklist, admin permissions status and sign out.

### CMS behavior

- Mutations really persist in Firestore and appear on the public site according to publication rules.
- Admin can draft, preview, publish, unpublish, reorder, feature and safely delete/archive content.
- Publish dates must use server timestamps; published content is queried separately from drafts.
- Use slugs that are unique, stable or redirectable; preserve SEO when changing a slug.
- Include optimistic UI only where rollbacks and conflict resolution are correct.
- Confirm destructive operations. Prefer soft delete or archive for business records.
- Use paginated queries instead of listening to every Firestore collection forever.
- Provide import/export/backup tools where feasible without claiming full disaster recovery.
- Maintain revision metadata (`updatedBy`, `updatedAt`, `version`) and explain limitations of conflict resolution in browser-only architecture.

## 12. Firestore data modeling

Design collections with exact field types, indexes and query paths. At minimum:

```text
site_settings/{key}
page_content/{pageOrSectionId}
services/{serviceId}
portfolio/{projectId}
blog_posts/{postId}
media_assets/{assetId}
subscribers/{subscriberId}
appointments/{appointmentId}
appointments/{appointmentId}/history/{historyId}
employees/{employeeId}
contact_inquiries/{inquiryId}
campaigns/{campaignId}
email_outbox/{outboxId}
audit_logs/{logId}
```

Where publication/security requires it, use a **public/private split**, e.g. public published documents are readable without exposing internal notes, draft text, employee private contacts, or operational fields. It may be more appropriate to use separate `published_*` collections or public projections than to rely solely on query filters. **Firestore Security Rules are not server-side response filters.** Public clients must not read a document containing internal fields just because the UI hides them.

- Public access: read only explicitly published, sanitized, non-sensitive content; create only tightly validated submissions/opt-ins where allowed.
- Admin access: only authorized Google admins can read private business records and perform management operations.
- Booking submitter access: only their own appointment if anonymous/authorized owner is implemented. Do not expose other appointment data.
- `createdAt`, `updatedAt`: prefer Firestore server timestamps; validate structure, allowed status, types and bounds in rules.
- Use predictable/declared indexes for admin filters and public blog/service queries.
- Prevent client-writable admin role escalation, mass updates and public creation of approvals or outbox `sent` states.
- For transactional workflows, use Firestore transactions/batches **where appropriate**, but be transparent that a malicious admin browser or unreliable network is not equivalent to a trusted notification queue.
- Provide `firestore.rules` and `firestore.indexes.json`; include Firebase emulator tests for public/anonymous/admin/unauthorized-user access and invalid status transitions.
- Include a threat model covering spam, enumeration, privilege escalation, Base64 image abuse, malicious article content, repeated subscriptions, appointment scraping and unauthorized direct Firestore requests.

### Base64 image rule — required

**All user-uploaded images for content/portfolio/blog must live as Base64 directly in Firestore, not Firebase Storage or an external image hosting service.** Implement this carefully:

1. In browser, restrict MIME types to JPEG, PNG, WebP and optionally AVIF if supported; reject SVG and arbitrary/active content unless sanitized with a proven policy.
2. Process using Canvas/Blob/createImageBitmap or a safe image compression library; resize oversized dimensions; strip EXIF; convert to efficient WebP or JPEG if appropriate; preserve transparency where required.
3. Encode compact Base64 with a known MIME type. Create thumbnails separately only when worthwhile.
4. Enforce a practical compressed image **binary target of ~200 KiB or less** and a hard application limit leaving ample room below Firestore's **1 MiB document limit** after Base64's size inflation and metadata overhead; reject with a clear user message if impossible. Never assert a 1 MiB source image is safe in one Firestore doc.
5. Use one `media_assets` document per small asset with `{dataBase64, mimeType, byteSize, width, height, alt, createdAt, updatedAt}`; reference `assetId` from blog/service/project docs to avoid duplicating large strings.
6. Do not load all full-resolution assets into admin tables. Store/use lightweight thumbnails or lazy fetch. Avoid caching giant Base64 strings in localStorage.
7. Limit upload count and warn that storing images in Firestore is bandwidth/reads expensive even within free-tier quotas; track usage and provide deletion safeguards.
8. The **existing `logo.mp4` animation/video remains a static asset**; video is not an image and should not be pushed into Firestore. Existing brand `logo.png` may be served statically for fast first paint while CMS-managed images use Firestore Base64.
9. Never store sensitive documents or confidential personal IDs in Base64 merely because the schema permits it.

## 13. Security, privacy, free-tier viability and abuse prevention

- Use only lawful and truly available free-tier options, but verify current limits before promising a zero-cost production deployment. A free tier can be exhausted or have eligibility restrictions.
- Respect **Vercel plan terms**, including commercial-use restrictions that may apply to the Hobby tier; avoid promising that business traffic is permitted under a free plan. If the existing project is deployed there, audit its applicable plan/terms and explain any commercial-use blocker before launch.
- Confirm Firebase Spark plan quotas/provider eligibility for Auth and Firestore. Do not quietly upgrade to a paid Firebase plan or enable billing-dependent services.
- Firestore rules must validate writes, document sizes, email/phone/message lengths, allowed statuses, ownership and mutable fields. Test rules with emulator cases, including failed attacks.
- Firebase App Check/reCAPTCHA may help reduce abuse where compatible and free within applicable limits, but **App Check is not a guarantee against spam**. Without a trusted backend, strict per-IP rate limiting and secure CAPTCHA verification are limited; clearly disclose residual abuse risk.
- Do not place any Resend key in client-side JS, Firestore, browser-visible env variables, source maps, README examples or repository history.
- Never trust client-controlled email labels, role fields, status, consent or `isAdmin` boolean.
- Sanitize article/content markup to prevent XSS; protect against unsafe remote links, URL injection, malicious rich text and SVG.
- Add security-conscious headers when supported by static host; use CSP without breaking Firebase Auth or app functionality.
- Collect only necessary customer details; render privacy and terms language as editable drafts to receive legal sign-off. Implement safe data retention/deletion where practical.
- Promotional campaigns require affirmative consent and usable unsubscribe handling. Avoid accidentally mailing former/unverified subscribers.
- Use affordable/no-cost analytics such as privacy-friendly aggregate Firestore counts or optional first-party simple tracking; do not invent conversions or expose visitor PII. Avoid excessive Firestore reads and writes from every page view.
- Never grant public Firestore read to entire `subscribers`, `appointments`, `employees`, `contact_inquiries`, `email_outbox`, `campaigns` or `audit_logs` collections.

## 14. SEO, performance and accessibility

- Correct route-specific `<title>`, descriptions, canonical links, Open Graph/Twitter cards, sitemap, robots directives, favicon and logo use.
- Structured data: `Organization`/`ProfessionalService`, appropriate `Service`, `BlogPosting` and `BreadcrumbList` only when data is authentic.
- The project may be a Vite SPA; ensure public article/service metadata is crawlable using prerender/static generation at build time if feasible **without a runtime custom backend**. Explain any limits for dynamically published content after deployment (a rebuild may be required). Do not pretend JS-only meta updates guarantee rich social previews.
- Aim for strong Core Web Vitals and Lighthouse results, especially mobile. Avoid a heavy cinematic intro masking poor LCP.
- Code-split admin bundle from public pages; lazy-load large editors and assets.
- Honor keyboard navigation, reduced-motion preference, focus restoration, aria labels, form errors, high contrast, semantic markup, responsive tables and WCAG 2.2 AA aspirations.
- Provide polished custom loading, empty, error, offline and success states.
- Add error boundaries and meaningful observability using safe client logging without leaking PII or secrets.

## 15. Explicit deployment and environment plan

1. Reuse the existing Vercel deployment/project and original Firebase configuration where verified. Preserve deployment aliases and working coming-soon subscriptions.
2. Check whether `neurojanaai.com` is actually configured; do not infer from email domain or older near-spelling site name.
3. Set the appropriate Firebase Auth authorized domains for the confirmed hostnames and configure Google sign-in.
4. Provide `.env.example` listing **only browser-safe** variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, etc.) as applicable to the actual SDK/project. Treat Firebase Web config as identifiers, **not** authorization substitutes.
5. `RESEND_API_KEY` is **never** needed/allowed in the frontend `.env` for the strict deployment. If an existing `.env` or repo contains it, quarantine/rotate it and do not expose it in builds.
6. Set up and deploy Firestore Security Rules and required indexes, verifying whether the project has permissions and tooling. Do not silently broaden access to bypass permission errors.
7. Use Vercel SPA rewrite only if required for actual routing; never erase existing valid deployment settings without checking.
8. Keep existing coming-soon deployment available until full site passes a preview/staging acceptance gate. Offer a safe rollback procedure.
9. Before any production launch, explicitly verify permitted commercial hosting plan and that chosen Firebase/hosting quotas satisfy expected needs within budget.
10. Document required domain/DNS steps for verifying `updates@neurojanaai.com` **only for future trusted sending**, including SPF/DKIM/DMARC checks as applicable. Never claim sender domain is verified without evidence.

## 16. Deliverables — write working project files, not just suggestions

Deliver:

- Complete public frontend with all above functional routes.
- Complete Google-only authorized admin application with connected Firestore CRUD.
- Reusable design system and animations.
- Booking form, workflow and employee-assignment system.
- Subscriber database, consent handling, campaign editor and honest manual email outbox.
- Content and Base64 media management.
- Firestore security rules, indexes, migration/seed scripts only where safe and necessary.
- TypeScript types/interfaces, validators, error handling and Firebase service modules.
- `.env.example` without secrets; asset-preserving implementation; minimal required deployment configuration.
- `PROJECT_AUDIT.md` for inspected existing code/config, with no secret values.
- `README.md` with exact local setup, required Firebase console actions, environment variable names, instructions for deploying rules/indexes, build, preview, deploy, troubleshooting and rollback.
- `SECURITY.md`/`LIMITATIONS.md` that explicitly documents strict browser-only email limitations, anti-spam weaknesses and future trusted adapter prerequisites.
- Meaningful tests for form validation, admin access, Firestore rules, route behavior, and appointment transitions.
- No invented sample team/client/public content in the live build.

## 17. Acceptance test checklist — complete before declaring finished

### Public experience

- [ ] Existing real brand logo/animation is used when present; no broken branding.
- [ ] All public routes render and navigation works on phone and desktop.
- [ ] Core animations are smooth, unobtrusive and respect reduced motion.
- [ ] Home/services/blog/portfolio show only actual published Firestore data.
- [ ] Contact forms persist real records with correct access boundaries and errors.
- [ ] Subscriptions persist with consent, deduplication and correct opt-out state; existing subscriber records remain intact.
- [ ] Appointment requests persist with `pending_review`; receipt uses real reference and timezone.
- [ ] Public visitors cannot view other customers’ bookings, subscriber data or private content.

### Administration

- [ ] Footer admin link is discreet, discoverable with accessibility tools and routes correctly.
- [ ] Google login is the **only** login option.
- [ ] Both specified admin emails can sign in **if** each has a valid Google identity.
- [ ] Any other Google account is rejected; direct Firestore admin writes/reads are also denied.
- [ ] Admin CMS edits, published states, navigation/settings and Base64 media uploads really persist and reflect on the public site.
- [ ] Admin can approve, reject, reschedule/propose change, assign/reassign saved/new employees, and see complete status history.
- [ ] Appointment and employee details remain private to admins.
- [ ] Contact leads, subscribers, campaigns and activity views use real data and correct permissions.

### Email and honest status

- [ ] No Resend secret appears in browser bundle, `.env.example`, Git history or client Firestore documents.
- [ ] In frontend-only mode, approval prepares the proper customer and employee notifications, but UI **does not claim they were emailed**.
- [ ] Campaigns prepare and preview correct content/consenting audience, but do not claim automated broadcasting or scheduling is running.
- [ ] `updates@neurojanaai.com` is a documented planned sender, not falsely reported as configured/verified.
- [ ] `contact@neurojanaai.com` appears correctly on contact and relevant footer/legal surfaces.

### Quality and rollout

- [ ] Firestore emulator authorization tests pass.
- [ ] `npm run build`, relevant type checks, lint and tests pass (or equivalent for actual stack).
- [ ] No TypeScript errors, dead actions, fake loading states or placeholder records presented as real.
- [ ] Preview deployment is tested before live swap; rollback steps documented.
- [ ] Mobile usability, accessibility and SEO/performance checks performed and major issues fixed.
- [ ] Any missing repository assets, keys, domains or runtime services are honestly disclosed.

## 18. Implementation order and response format for the coding agent

Execute in this order, completing actual code at each stage instead of stopping after an outline:

1. **Audit** repository, assets, Firebase/Vercel config and current subscriber data.
2. **Design system** + app shell, navigation, footers and responsive motion.
3. **Firebase initialization, rules, indexes and Auth** (including exact admin allowlist).
4. **Public pages** with content models and credible defaults/drafts.
5. **Firestore-powered admin CMS** and Base64 media manager.
6. **Appointment + employee system** and status/audit flows.
7. **Contact/subscriber/campaign modules** plus manual outbox email previews.
8. **SEO, accessibility, security and performance** hardening.
9. **Testing, preview deploy, documentation and rollback**.

When work is complete, provide a concise implementation report covering: working features, exact paths/files changed, rules/indexes deployed or still requiring console action, assets/config verified, test/build results, remaining limitations, and exact steps required before production launch.

**Do not give a visually impressive but nonfunctional prototype. Do not fake emails or claim backend-free Resend sending is secure. Do not leak credentials. Build the maximum genuinely functional, secure version that honors frontend-only constraints, and clearly identify the one unavoidable architecture decision required to enable automated email in production.**
