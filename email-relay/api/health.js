// ═══ FILE NÀY LÀM GÌ ═══
// Handler GET /api/health của dịch vụ email trên Vercel.
// Nó báo phiên bản và trạng thái cấu hình để kiểm tra triển khai, không gửi email.
// Chỉ trả CÓ hoặc KHÔNG, không bao giờ trả giá trị thật của khóa bí mật.
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
