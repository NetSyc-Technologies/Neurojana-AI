# NEUROJNA-AI | Coming Soon

An elegant, mobile-friendly landing page featuring a luminous modern design, floating interactive chips, and secure email subscriptions via **Resend + Cloud Firestore**.

## 1. Add the brand asset

Copy your files into this exact path:

```
public/assets/logo.png   # Static logo (preferably a transparent PNG)
```

## 2. Configure the environment (required for live subscriptions)

The supplied Firebase **web** settings are pre-filled in `.env` / `.env.example`. They are suitable for frontend app initialization and analytics, but **are not administrative credentials**. Firebase data writes and all Resend requests execute on Vercel's secure server functions.

**Required variables to fill in:**

| Name | Where to find it |
| --- | --- |
| `RESEND_API_KEY` | Generate a **new** API key in [Resend API Keys](https://resend.com/api-keys). Rotate the key that was exposed in chat; it is intentionally **not** embedded in this project. |
| `RESEND_FROM_EMAIL` | An email address on a **verified domain** in Resend, e.g. `updates@neurojnaai.com` (no placeholder allowed). |
| `FIREBASE_ADMIN_PROJECT_ID` | Already set to `neurojna-ai-web`. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Console → Project settings → **Service accounts** → Generate new private key → JSON field `client_email`. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Same service account JSON, field `private_key`; represent line breaks as literal `\n` in the environment value. Keep secret. |
| `SITE_URL` | Your actual deployment URL including `https://`, without a trailing slash, e.g. `https://neurojnaai.com`. Needed for email unsubscribe links and origin checks. |
| `SUBSCRIPTION_SECRET` | Any securely generated random string of **at least 32 characters**; example generation: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep secret and stable so unsubscribe links remain valid. |

**Never put the Resend API key, Firebase Admin email/private key, or subscription secret in variables prefixed `VITE_`.** `VITE_` variables are embedded into publicly downloadable frontend JavaScript. The Firebase web API key can be public, but you should restrict it appropriately in Google Cloud Console.

### Firestore first-time setup

In Firebase Console for project **`neurojna-ai-web`**:

1. Go to **Build → Firestore Database → Create database**, if not yet enabled.
2. Select your preferred data location and start in **Production mode** (no client writes needed).
3. Go to **Project settings → Service accounts → Generate new private key**. Copy `project_id`, `client_email`, `private_key` into the respective secure variables above. The Admin SDK bypasses Firestore rules on the server, so protect the service-account key and your Vercel account.
4. Subscribers will appear in Firestore collection **`launchSubscribers`**, keyed by SHA-256(email). Documents include email, subscription/delivery status and timestamps. Rate-limit records live in **`subscriptionRateLimits`**. You may configure Firestore TTL deletion on their `expiresAt` field to clean up old rate-limit entries.

Optional Firestore rules if this project needs no other client database access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Important:** These deny-all rules apply to the entire Firestore database, so **do not replace your existing rules** with them if other apps use the project. Instead, specifically deny client access to `launchSubscribers` and `subscriptionRateLimits`. The Admin SDK's service account continues to work.

### Resend domain verification

Go to [Resend Domains](https://resend.com/domains), add your sending domain, and configure the DNS records it provides. Your `RESEND_FROM_EMAIL` must belong to that verified domain for confirmations to be delivered to arbitrary subscriber inboxes. Resend's test sender cannot send to general visitors.

## 3. Deploy to Vercel

1. Extract this project, add `logo.mp4` and `logo.png`, and push it to a Git repository (recommended). **Do not commit `.env`**; `.gitignore` excludes it.
2. On Vercel, select **Add New Project**, import the repository, and choose **Vite**. It reads `vercel.json` for build/output settings. No custom rewrite is required for the `/api` serverless functions.
3. In **Project Settings → Environment Variables**, add every variable from `.env` using Vercel's environment-variable editor (fill in the missing secret values). The supplied `.env` is a local template, **not an automatically deployable secret file**.
4. Set the `SITE_URL` to your deployed production domain, redeploy after updating variables, and test with a real email address.
5. Confirm a document appears in Firestore's `launchSubscribers` collection and a Resend email reaches the address. Ensure `deliveryStatus` is `sent`.

### Local use

```bash
npm install
npm run dev             # Visual-only Vite preview (the /api endpoint won't run)
# For working /api functions, use the Vercel CLI:
npm install -g vercel
vercel login
npm run dev:full        # Vercel dev serves both Vite + api functions
npm run build           # Production build
npm test                # Unit tests
```

The Vercel CLI may ask you to link the project. Store secret variables in Vercel and use `vercel env pull .env.local` for local development, or fill `.env` yourself (ignored by Git). Note that Vercel's linked environment may override your local values.

## 4. Subscription behavior

- Frontend validates email; backend revalidates and normalizes it.
- Firebase Admin safely persists the subscriber without exposing a privileged database key to the browser.
- Resend sends a branded HTML + plain-text confirmation: **“Hurray! You're on the list.”**
- Duplicate requests do **not** send another confirmation; temporary failures can be retried after a cooldown.
- Basic hourly per-IP limit plus transaction-level duplicate control helps prevent abuse. For public high-traffic launches, consider Vercel WAF / Turnstile as an additional anti-bot layer.
- Confirmation emails include a signed **unsubscribe link**. Visitors must explicitly confirm unsubscription; GET alone doesn't remove them (important for email security scanners).
- To send a **future launch announcement**, use your compliant mailing solution and filter Firestore records to `subscriptionStatus: 'active'`. This site does not automatically send launch announcements.

## Project structure

```
index.html                  Homepage and intro video
src/main.js                 UI, Firebase analytics, form submission, intro behavior
src/style.css               Responsive styling and animations
api/subscribe.js            Secure Vercel subscription function
api/unsubscribe.js          Signed opt-out confirmation endpoint
lib/firebase-admin.js       Server-side database initialization
lib/subscription.js         Email validation, templates, token signatures
public/assets/             Put logo.png and logo.mp4 here
.env / .env.example         Environment templates (NO SECRET VALUES INCLUDED)
vercel.json                 Vercel settings
```

## Search engine optimization

The production URL is `https://neurojnaai.com/`, matching `SITE_URL`. The homepage includes a canonical link, service-focused metadata, Open Graph and Twitter previews using the official logo, and JSON-LD for the company, website, page, and four services.

- `public/sitemap.xml` lists the homepage, the site's only standalone content page. Vite copies it to `dist/sitemap.xml`.
- `public/robots.txt` allows crawling and advertises the sitemap. API responses receive `X-Robots-Tag: noindex, nofollow, nosnippet` through `vercel.json`. They remain crawlable so search engines can read that header.
- Vercel permanently redirects `/index.html` to `/` to consolidate duplicate homepage URLs.
- Service sections have anchor URLs; these are not separate pages and should not be added as sitemap entries.

After deploying, confirm `/sitemap.xml` and `/robots.txt` return HTTP 200 on the production domain, then submit `https://neurojnaai.com/sitemap.xml` in the verified property's Google Search Console Sitemaps report. Check the homepage with URL Inspection and Google's Rich Results Test. These local changes do not submit the site or guarantee indexing.

When adding standalone pages, add their canonical URLs to the sitemap. Update each `lastmod` only when that page changes meaningfully, not on every build. If the production domain changes, update `SITE_URL`, the canonical/social/JSON-LD URLs in `index.html`, and both crawler files together. Keep Vercel preview deployments private or non-indexable using deployment settings.

## Security reminder

The Resend secret pasted into the original request is **not** in this ZIP. Create a new Resend key and revoke the previously shared one. Do not put server secrets into Git or client-side JavaScript. The website cannot send emails or store subscribers until the server-side environment variables are configured.
