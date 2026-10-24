# Subscription confirmations

The local Vite server and Vercel both run `api/subscribe.js`. Never put server credentials in a `VITE_` variable.

Set these in a gitignored local environment file and in Vercel's server environment:

- `RESEND_API_KEY`: Resend sending key.
- `RESEND_FROM_EMAIL`: an address on the verified Resend sending domain. Do not change this to an unverified domain merely to match the brand spelling.
- `SITE_URL`: the public website origin used for the logo and signed unsubscribe link.
- `SUBSCRIPTION_SECRET`: a private random secret of at least 32 characters. Keep it stable so existing unsubscribe links remain valid.
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`: server service-account credentials for the site's Firestore project.

Restart Vite after changing environment variables. Redeploy after changing production environment variables.

## What was checked

On 2026-10-24 the configured Resend domain was verified. The five latest provider email records had a delivered status. These checks were read-only; no email was sent to a visitor or test address.

The local Firebase Admin client email and private key were absent. Without them, the API can send a confirmation and the browser attempts the existing public subscriber-create operation. Existing-record updates, server-wide rate limits, and signed unsubscribe processing require Firebase Admin. A failed browser save is now shown explicitly, rather than reporting a successful subscription.

## Delivery behaviour

A success response requires a Resend email ID. Provider rejection, exceptions, and missing IDs produce a retryable failure. Provider errors are logged by code without exposing credentials or recipient addresses.

Records use the same `subscribers` collection as the admin dashboard. Unsubscribe updates both current and legacy collections. A recently accepted confirmation is not resent for five minutes. A later subscription attempt can send another confirmation. Provider idempotency protects retries after network errors.

Resend acceptance is not proof of inbox placement. To diagnose a specific missing email, inspect that email's provider event history (delivered, delayed, bounced, suppressed) and ask the recipient to check spam. Do not mark an email delivered merely because the sending API accepted it.

For an end-to-end inbox check, use an address owned by the tester with their permission. Confirm the email arrives, the signed unsubscribe page opens, confirmation updates both records, and a subsequent subscription restores the active record.

