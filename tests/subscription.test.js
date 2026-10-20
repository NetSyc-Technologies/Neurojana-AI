import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, hashText, makeUnsubscribeToken, decodeUnsubscribeToken, emailHtml, emailText } from '../lib/subscription.js';

test('normalizes standard email input', () => {
  assert.equal(normalizeEmail('  Person@Example.COM  '),'person@example.com');
  assert.equal(normalizeEmail('not-an-email'),null);
  assert.equal(normalizeEmail('first@example.com\r\nBcc:other@example.com'),null);
});
test('hash uses consistent IDs', () => {
  assert.equal(hashText('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('unsubscribe signatures are verified and cannot be tampered with', () => {
  const secret = 'this-is-a-long-test-secret-for-hmac-signing';
  const email = 'person@example.com';
  const token = makeUnsubscribeToken(email,secret);
  assert.equal(decodeUnsubscribeToken(token,secret), email);
  assert.equal(decodeUnsubscribeToken(token.slice(0,-1)+'x',secret),null);
  assert.equal(decodeUnsubscribeToken(token,'wrong-but-long-long-long-secret-key'),null);
});
test('confirmation email contains required copy and opt-out link', () => {
  const url = 'https://example.com/api/unsubscribe?token=test';
  assert.match(emailHtml({unsubscribeUrl:url}),/Hurray!/);
  assert.match(emailHtml({unsubscribeUrl:url}),/Unsubscribe/);
  assert.match(emailHtml({unsubscribeUrl:url}),/logo\.png/);
  assert.match(emailText({unsubscribeUrl:url}),/launching soon/);
});
