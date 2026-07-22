const { afterEach, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const nodemailer = require("nodemailer");
const handler = require("../api/send-email");
const { createSignature } = require("../src/signature");

const originalCreateTransport = nodemailer.createTransport;
const secret = "a-secure-relay-secret-with-at-least-32-characters";
const payload = {
  to: "person@example.com",
  otp: "123456",
  purpose: "registration",
};

const createResponse = () => ({
  headers: {},
  statusCode: 200,
  body: null,
  setHeader(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

beforeEach(() => {
  process.env.EMAIL_RELAY_SECRET = secret;
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "mealmatecare@gmail.com";
  process.env.SMTP_PASSWORD = "app-password";
});

afterEach(() => {
  nodemailer.createTransport = originalCreateTransport;
  [
    "EMAIL_RELAY_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
  ].forEach((key) => delete process.env[key]);
});

test("delivers an authenticated request", async () => {
  let deliveredMessage;
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      deliveredMessage = message;
    },
  });
  const timestamp = Date.now().toString();
  const req = {
    method: "POST",
    body: payload,
    headers: {
      "x-mealmate-timestamp": timestamp,
      "x-mealmate-signature": createSignature(payload, timestamp, secret),
    },
  };
  const res = createResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { delivered: true });
  assert.equal(deliveredMessage.to, "person@example.com");
  assert.equal(deliveredMessage.subject, "MealMate - Verify your email");
  assert.match(deliveredMessage.html, /EMAIL VERIFICATION/);
  assert.match(deliveredMessage.html, /123456/);
});

test("rejects a request with an invalid signature before sending", async () => {
  let sendAttempts = 0;
  nodemailer.createTransport = () => ({
    sendMail: async () => {
      sendAttempts += 1;
    },
  });
  const req = {
    method: "POST",
    body: payload,
    headers: {
      "x-mealmate-timestamp": Date.now().toString(),
      "x-mealmate-signature": "0".repeat(64),
    },
  };
  const res = createResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
  assert.equal(sendAttempts, 0);
});
