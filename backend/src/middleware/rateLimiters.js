const rateLimit = require("express-rate-limit");

function createLimiter(limit, message, options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message },
    ...options,
  });
}

const authLimiter = createLimiter(30, "Too many attempts. Please try again later.");
const registrationOtpLimiter = createLimiter(5, "Too many verification requests. Please try again later.");
const passwordOtpLimiter = createLimiter(10, "Too many attempts. Please try again later.");
const aiLimiter = createLimiter(30, "Too many AI requests. Please try again later.", {
  keyGenerator: (req) => `user:${req.user.id}`,
});

module.exports = { aiLimiter, authLimiter, passwordOtpLimiter, registrationOtpLimiter };
