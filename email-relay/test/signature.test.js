const test = require("node:test");
const assert = require("node:assert/strict");
const { createSignature, verifySignature } = require("../src/signature");

const payload = {
  to: "person@example.com",
  otp: "123456",
  purpose: "password_reset",
};
const secret = "a-secure-relay-secret-with-at-least-32-characters";

test("accepts a fresh signature", () => {
  const now = Date.now();
  const timestamp = now.toString();
  const signature = createSignature(payload, timestamp, secret);

  assert.equal(verifySignature(payload, timestamp, signature, secret, now), true);
});

test("rejects modified payloads", () => {
  const now = Date.now();
  const timestamp = now.toString();
  const signature = createSignature(payload, timestamp, secret);

  assert.equal(
    verifySignature({ ...payload, to: "attacker@example.com" }, timestamp, signature, secret, now),
    false
  );
});

test("rejects expired and malformed signatures", () => {
  const now = Date.now();
  const expiredTimestamp = (now - 6 * 60 * 1000).toString();
  const expiredSignature = createSignature(payload, expiredTimestamp, secret);

  assert.equal(
    verifySignature(payload, expiredTimestamp, expiredSignature, secret, now),
    false
  );
  assert.equal(verifySignature(payload, now.toString(), "invalid", secret, now), false);
});
