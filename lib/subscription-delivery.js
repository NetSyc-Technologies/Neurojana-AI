import {
  emailHtml,
  emailText,
  makeUnsubscribeToken,
  hashText,
} from "./subscription.js";

export async function deliverSubscriptionConfirmation({
  send,
  email,
  from,
  secret,
  siteUrl,
  attemptKey,
}) {
  const baseUrl = new URL(siteUrl);
  const unsubscribeUrl = new URL("/api/unsubscribe", baseUrl);
  unsubscribeUrl.searchParams.set("token", makeUnsubscribeToken(email, secret));
  const result = await send(
    {
      from: from.includes("<") ? from : "Neurojana AI <" + from + ">",
      to: [email],
      subject: "You’re subscribed to Neurojana AI",
      html: emailHtml({
        unsubscribeUrl: unsubscribeUrl.href,
        logoUrl: new URL("/assets/logo.png", baseUrl).href,
      }),
      text: emailText({ unsubscribeUrl: unsubscribeUrl.href }),
    },
    { idempotencyKey: "subscription/" + hashText(email + ":" + attemptKey) },
  );
  if (result?.error || !result?.data?.id) {
    const error = new Error(
      "The confirmation email could not be sent. Please try again shortly.",
    );
    error.providerCode = result?.error?.name || "missing_email_id";
    throw error;
  }
  return result.data.id;
}
