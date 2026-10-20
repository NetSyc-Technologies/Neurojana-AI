# NEUROJANA-AI | Coming Soon

An elegant, mobile-friendly landing page featuring a **mandatory fullscreen animated-logo intro**, a light-themed homepage, and secure email subscriptions via **Resend + Cloud Firestore**.

## 1. Add the two brand assets

Copy your files into these exact paths:

```
public/assets/logo.mp4   # Fullscreen intro animation (MP4/H.264)
public/assets/logo.png   # Static logo (preferably a transparent PNG)
```

The MP4 plays automatically with **no skip / cancel / close control**. Browsers usually allow muted autoplay. If a browser blocks autoplay, a button to **play** the intro appears; there is still no skip option. If the video is missing or fails to load, the site fails gracefully to the homepage instead of trapping visitors on a blank screen. The full video is displayed using `object-fit: contain` so the logo is not cropped. Audio is muted for autoplay compatibility.

## 2. Configure the environment (required for live subscriptions)

The supplied Firebase **web** settings are pre-filled in `.env` / `.env.example`. They are suitable for frontend app initialization and analytics, but **are not administrative credentials**. Firebase data writes and all Resend requests execute on Vercel's secure server functions.

**Required variables to fill in:**

| Name | Where to find it |
| --- | --- |
| `RESEND_API_KEY` | Generate a **new** API key in [Resend API Keys](https://resend.com/api-keys). Rotate the key that was exposed in chat; it is intentionally **not** embedded in this project. |
| `RESEND_FROM_EMAIL` | An email address on a **verified domain** in Resend, e.g. `updates@your-verified-domain.com` (no placeholder allowed). |
| `FIREBASE_ADMIN_PROJECT_ID` | Already set to `neurojna-ai-web`. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Console → Project settings → **Service accounts** → Generate new private key → JSON field `client_email`. |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Same service account JSON, field `private_key`; represent line breaks as literal `\n` in the environment value. Keep secret. |
| `SITE_URL` | Your actual deployment URL including `https://`, without a trailing slash, e.g. `https://neurojana.example`. Needed for email unsubscribe links and origin checks. |
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

## Security reminder

The Resend secret pasted into the original request is **not** in this ZIP. Create a new Resend key and revoke the previously shared one. Do not put server secrets into Git or client-side JavaScript. The website cannot send emails or store subscribers until the server-side environment variables are configured.
