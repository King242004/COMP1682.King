const test = require("node:test");
const assert = require("node:assert/strict");
const { buildOtpEmail } = require("../src/template");

test("builds isolated registration content", () => {
  const email = buildOtpEmail("123456", "registration");

  assert.equal(email.subject, "MealMate - Verify your email");
  assert.match(email.html, /EMAIL VERIFICATION/);
  assert.doesNotMatch(email.html, /PASSWORD RESET/);
  assert.match(email.text, /123456/);
});

test("builds isolated password-reset content", () => {
  const email = buildOtpEmail("654321", "password_reset");

  assert.equal(email.subject, "MealMate - Reset your password");
  assert.match(email.html, /PASSWORD RESET/);
  assert.doesNotMatch(email.html, /EMAIL VERIFICATION/);
  assert.match(email.text, /654321/);
});
