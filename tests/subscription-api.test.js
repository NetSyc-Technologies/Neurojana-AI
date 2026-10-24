import test from "node:test";
import assert from "node:assert/strict";
import { createSubscribeHandler } from "../api/subscribe.js";
import { decodeUnsubscribeToken, hashText } from "../lib/subscription.js";
const env = {
  RESEND_API_KEY: "fake-key",
  RESEND_FROM_EMAIL: "updates@example.com",
  SUBSCRIPTION_SECRET: "test-only-subscription-secret-at-least-32-characters",
  SITE_URL: "https://example.com",
};
const now = 1800000000000;
function fakeDatabase(initial = {}) {
  const records = new Map(Object.entries(initial));
  const ref = (path) => ({
    path,
    update: async (data) =>
      records.set(path, { ...records.get(path), ...data }),
  });
  return {
    records,
    collection: (name) => ({ doc: (id) => ref(name + "/" + id) }),
    runTransaction: async (callback) =>
      callback({
        get: async (r) => ({
          exists: records.has(r.path),
          data: () => records.get(r.path),
        }),
        set: (r, data) =>
          records.set(r.path, { ...records.get(r.path), ...data }),
      }),
  };
}
async function request({
  result = { data: { id: "email-id" } },
  body = { email: "NAME@example.com", source: "blog", consentMarketing: true },
  environment = env,
  initial,
  origin = env.SITE_URL,
  clock = now,
  database,
  throws = false,
} = {}) {
  const db = database || fakeDatabase(initial);
  const calls = [];
  const handler = createSubscribeHandler({
    env: environment,
    getDb: () => db,
    now: () => clock,
    sendEmail: async (...args) => {
      calls.push(args);
      if (throws) throw new Error("timeout");
      return result;
    },
  });
  const res = {
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  await handler(
    { method: "POST", headers: { origin, host: "example.com" }, body },
    res,
  );
  return { res, db, calls };
}
test("successful subscription records provider ID and sends a valid signed opt-out link", async () => {
  const { res, calls, db } = await request();
  assert.equal(res.code, 200);
  assert.equal(res.body.emailId, "email-id");
  assert.equal(res.body.persisted, true);
  const email = calls[0][0];
  assert.deepEqual(email.to, ["name@example.com"]);
  assert.equal(email.from, "Neurojana AI <updates@example.com>");
  const url = new URL(email.text.match(/Unsubscribe: (.+)/)[1]);
  assert.equal(
    decodeUnsubscribeToken(
      url.searchParams.get("token"),
      env.SUBSCRIPTION_SECRET,
    ),
    "name@example.com",
  );
  assert.equal(
    db.records.get("subscribers/" + hashText("name@example.com"))
      .deliveryStatus,
    "sent",
  );
  assert.ok(calls[0][1].idempotencyKey.startsWith("subscription/"));
});
test("provider rejection, missing ID, and network failure never return success", async () => {
  for (const options of [
    { result: { error: { name: "validation_error" } } },
    { result: { data: {} } },
    { throws: true },
  ]) {
    const { res, db } = await request(options);
    assert.equal(res.code, 502);
    assert.equal(res.body.emailId, undefined);
    assert.equal(
      db.records.get("subscribers/" + hashText("name@example.com"))
        .deliveryStatus,
      "failed",
    );
  }
});
test("missing configuration and invalid emails fail before sending", async () => {
  for (const options of [
    { environment: { ...env, RESEND_API_KEY: "" } },
    { environment: { ...env, SUBSCRIPTION_SECRET: "" } },
    { body: { email: "not-an-email" } },
    { body: { email: "name@example.com", consentMarketing: false } },
  ]) {
    const { res, calls } = await request(options);
    assert.ok(res.code >= 400);
    assert.equal(calls.length, 0);
  }
});
test("unrelated Vercel origins cannot send confirmations", async () => {
  const { res, calls } = await request({
    origin: "https://unrelated.vercel.app",
  });
  assert.equal(res.code, 403);
  assert.equal(calls.length, 0);
});
test("recent confirmations do not duplicate; later requests can resend", async () => {
  const path = "subscribers/" + hashText("name@example.com");
  const initial = {
    [path]: {
      subscriptionStatus: "active",
      deliveryStatus: "sent",
      confirmationEmailId: "prior-id",
      lastAttemptMs: now - 1000,
    },
  };
  const recent = await request({ initial });
  assert.equal(recent.res.body.emailId, "prior-id");
  assert.equal(recent.calls.length, 0);
  const later = await request({ initial, clock: now + 301000 });
  assert.equal(later.res.code, 200);
  assert.equal(later.calls.length, 1);
});
test("failed delivery retries use the same idempotency key", async () => {
  const first = await request({ throws: true });
  const retry = await request({ database: first.db, clock: now + 301000 });
  assert.equal(retry.res.code, 200);
  assert.equal(
    first.calls[0][1].idempotencyKey,
    retry.calls[0][1].idempotencyKey,
  );
});
test("legacy sent state without provider ID is not treated as a confirmed email", async () => {
  const initial = {
    ["subscribers/" + hashText("name@example.com")]: {
      subscriptionStatus: "active",
      deliveryStatus: "sent",
      lastAttemptMs: now,
    },
  };
  const { calls } = await request({ initial });
  assert.equal(calls.length, 1);
});
