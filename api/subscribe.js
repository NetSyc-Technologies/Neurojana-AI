import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getDatabase } from "../lib/firebase-admin.js";
import { normalizeEmail, hashText } from "../lib/subscription.js";
import { deliverSubscriptionConfirmation } from "../lib/subscription-delivery.js";

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

// A bounded local fallback protects development when Admin credentials are absent.
const recentAttempts = new Map();
export function createSubscribeHandler({
  getDb = getDatabase,
  env = process.env,
  sendEmail,
  now = Date.now,
} = {}) {
  return async function handler(req, res) {
    res.setHeader("Allow", "POST");
    if (req.method !== "POST")
      return json(res, 405, { message: "Method not allowed." });
    if (Number(req.headers["content-length"] || 0) > 2048)
      return json(res, 413, { message: "Request too large." });
    if (req.headers.origin) {
      let permitted = false;
      try {
        const origin = new URL(req.headers.origin);
        permitted =
          origin.host === req.headers.host ||
          origin.origin === new URL(env.SITE_URL).origin;
      } catch {
        /* Reject malformed origins. */
      }
      if (!permitted)
        return json(res, 403, { message: "Request origin not permitted." });
    }
    let input = req.body;
    try {
      if (!input && req[Symbol.asyncIterator]) {
        const buffers = [];
        let size = 0;
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk);
          if (size > 2048)
            return json(res, 413, { message: "Request too large." });
          buffers.push(Buffer.from(chunk));
        }
        input = Buffer.concat(buffers).toString("utf8");
      }
      if (typeof input === "string") input = JSON.parse(input);
    } catch {
      return json(res, 400, { message: "Invalid request." });
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      return json(res, 400, { message: "Invalid request." });
    if (input.company)
      return json(res, 200, { message: "Thank you for subscribing." });
    const email = normalizeEmail(input.email);
    if (!email)
      return json(res, 400, { message: "Please enter a valid email address." });
    if (input.consentMarketing === false)
      return json(res, 400, {
        message: "Please agree to receive updates before subscribing.",
      });
    const {
      RESEND_API_KEY: apiKey,
      RESEND_FROM_EMAIL: from,
      SUBSCRIPTION_SECRET: secret,
      SITE_URL: siteUrl,
    } = env;
    let validSite = false;
    try {
      validSite = ["https:", "http:"].includes(new URL(siteUrl).protocol);
    } catch {
      /* Configuration is checked below. */
    }
    if (!apiKey || !from || !secret || secret.length < 32 || !validSite) {
      console.error(
        "Subscription server configuration is incomplete. Check the server environment setup.",
      );
      return json(res, 503, {
        message:
          "Subscriptions are temporarily unavailable. Please try again later.",
      });
    }
    const timestamp = now();
    const ip = String(
      req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim()
      .slice(0, 100);
    const hour = Math.floor(timestamp / 3600000);
    let subscriberRef = null;
    let stored = false;
    let attemptKey = Math.floor(timestamp / 300000);
    try {
      const db = getDb();
      subscriberRef = db.collection("subscribers").doc(hashText(email));
      const rateRef = db
        .collection("subscriptionRateLimits")
        .doc(hashText(secret + ":" + ip + ":" + hour));
      const decision = await db.runTransaction(async (tx) => {
        const [rateSnap, subSnap] = await Promise.all([
          tx.get(rateRef),
          tx.get(subscriberRef),
        ]);
        const attempts = rateSnap.exists
          ? Number(rateSnap.data().attempts || 0)
          : 0;
        if (attempts >= 15) return { type: "rate_limit" };
        const existing = subSnap.exists ? subSnap.data() : {};
        tx.set(
          rateRef,
          { attempts: attempts + 1, expiresAt: new Date((hour + 2) * 3600000) },
          { merge: true },
        );
        if (
          existing.subscriptionStatus === "active" &&
          existing.confirmationEmailId &&
          timestamp - (existing.lastAttemptMs || 0) < 300000
        )
          return { type: "recent", emailId: existing.confirmationEmailId };
        if (
          existing.deliveryStatus === "pending" &&
          timestamp - (existing.lastAttemptMs || 0) < 60000
        )
          return { type: "pending" };
        // Failed attempts reuse their provider key so a timeout cannot send duplicates.
        const key =
          existing.deliveryStatus === "failed" &&
          timestamp - (existing.lastAttemptMs || 0) < 86400000
            ? (existing.attemptKey ?? attemptKey)
            : attemptKey;
        tx.set(
          subscriberRef,
          {
            email,
            subscriptionStatus: "active",
            deliveryStatus: "pending",
            source:
              typeof input.source === "string"
                ? input.source.slice(0, 80)
                : "website",
            consentMarketing: true,
            consentTimestamp: FieldValue.serverTimestamp(),
            createdAt: existing.createdAt || FieldValue.serverTimestamp(),
            lastAttemptMs: timestamp,
            attemptKey: key,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return { type: "send", attemptKey: key };
      });
      if (decision.type === "rate_limit")
        return json(res, 429, {
          message: "Too many attempts. Please try again later.",
        });
      if (decision.type === "pending")
        return json(res, 409, {
          message:
            "Your subscription is being processed. Please wait a minute before trying again.",
        });
      if (decision.type === "recent")
        return json(res, 200, {
          message:
            "Your confirmation was sent recently. Check your inbox and spam folder. You can request another after five minutes.",
          emailId: decision.emailId,
          persisted: true,
        });
      attemptKey = decision.attemptKey;
      stored = true;
    } catch {
      subscriberRef = null;
      console.warn(
        "Subscription storage unavailable; the client must save the subscriber record. Configure Firebase Admin for reliable server persistence and unsubscribe.",
      );
      for (const [key, entry] of recentAttempts)
        if (entry.hour !== hour) recentAttempts.delete(key);
      const key = hashText(secret + ":" + ip);
      const attempts = recentAttempts.get(key)?.count || 0;
      if (attempts >= 15 || recentAttempts.size >= 10000)
        return json(res, 429, {
          message: "Too many attempts. Please try again later.",
        });
      recentAttempts.set(key, { hour, count: attempts + 1 });
    }
    try {
      const resend = sendEmail ? null : new Resend(apiKey);
      const emailId = await deliverSubscriptionConfirmation({
        send: sendEmail || resend.emails.send.bind(resend.emails),
        email,
        from,
        secret,
        siteUrl,
        attemptKey,
      });
      if (subscriberRef)
        await subscriberRef
          .update({
            deliveryStatus: "sent",
            confirmationEmailId: emailId,
            confirmationSentAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          .catch(() =>
            console.warn(
              "Confirmation accepted; delivery status update failed.",
            ),
          );
      return json(res, 200, {
        message:
          "You’re subscribed. Your confirmation email is on its way — please check your inbox and spam folder.",
        emailId,
        persisted: stored,
      });
    } catch (error) {
      console.error(
        "Confirmation delivery failed:",
        error.providerCode || "network_error",
      );
      if (subscriberRef)
        await subscriberRef
          .update({
            deliveryStatus: "failed",
            updatedAt: FieldValue.serverTimestamp(),
          })
          .catch(() => {});
      return json(res, 502, {
        message:
          "We couldn’t send your confirmation email. Please try again shortly.",
      });
    }
  };
}
export default createSubscribeHandler();
