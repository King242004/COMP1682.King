// ═══ FILE NÀY LÀM GÌ ═══
// Cửa nhận file ảnh. Chạy SAU kiểm tra đăng nhập và TRƯỚC controller.
//
// Ai gọi tới: accountRoutes (ảnh đại diện), communityRoutes (ảnh bài đăng),
//             scanRoutes (ảnh món cần quét)
// Nhận vào:   file ảnh người dùng gửi lên
// Trả ra:     không trả gì, chỉ đặt ảnh vào req.file rồi cho đi tiếp
// Khi lỗi:    file quá nặng hoặc không phải ảnh thì chặn ngay tại đây,
//             controller không bao giờ nhìn thấy file đó
//
// imageUploadLimiter đếm số lần tải lên trong 15 phút để chặn spam.
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function createImageUpload({ maxFileBytes, maxFiles = 1, maxFields = 10 }) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileBytes,
      files: maxFiles,
      fields: maxFields,
      parts: maxFiles + maxFields,
    },
    fileFilter: (req, file, callback) => {
      if (ALLOWED_IMAGE_TYPES.has(file.mimetype.toLowerCase())) {
        callback(null, true);
        return;
      }
      const error = new Error("Only JPEG, PNG, WebP, HEIC or HEIF images are allowed.");
      error.status = 400;
      callback(error);
    },
  });
}

function imageUploadLimiter(limit) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many uploads. Please try again later." },
  });
}

module.exports = { createImageUpload, imageUploadLimiter };
