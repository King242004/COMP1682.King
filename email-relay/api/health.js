module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    message: "MealMate email relay running",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "local",
    smtpConfigured: Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ),
    relaySecretConfigured: Boolean(process.env.EMAIL_RELAY_SECRET),
  });
};
