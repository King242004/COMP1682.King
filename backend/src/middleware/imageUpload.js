// ═══ FILE NÀY LÀM GÌ ═══
// Cửa nhận file ảnh; route đặt nó sau protect và trước hàm controller nhận ảnh.
//
// Ai gọi tới: accountRoutes (ảnh đại diện), communityRoutes (ảnh bài đăng),
//             scanRoutes (ảnh món cần quét)
// Nhận vào:   file ảnh người dùng gửi lên
// Trả ra:     không trả gì, chỉ đặt ảnh vào req.file rồi cho đi tiếp
// Khi lỗi:    file quá nặng hoặc không phải ảnh thì chặn ngay tại đây,
//             multer ném lỗi trước khi scanController/postController/accountController chạy
//
// imageUploadLimiter đếm số lần tải lên trong 15 phút để chặn spam.
const multer = require("multer");
const rateLimit = require("express-rate-limit");

// ══════════════════════════════════════════════════════════
// CỬA NHẬN ẢNH
//
// Không phải luồng. Một khuôn dựng bộ nhận ảnh, cộng một bộ đếm lượt.
// Đến từ mấy route có tải ảnh: ảnh đại diện, ảnh bài đăng, ảnh quét món.
// 
// Nhớ: ảnh giữ trong BỘ NHỚ chứ không ghi ra đĩa, vì đẩy thẳng lên Cloudinary.
// ══════════════════════════════════════════════════════════

// Chỉ nhận mấy định dạng ảnh này. Chặn ở đây để file lạ không lên tới Cloudinary.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Dựng một bộ nhận ảnh với trần dung lượng và trần số file truyền vào.
// Giữ ảnh trong bộ nhớ chứ không ghi ra đĩa, vì ảnh đẩy thẳng lên Cloudinary.
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

// Bộ đếm lượt riêng cho việc tải ảnh, chặt hơn bộ đếm chung,
// vì mỗi lượt tải ảnh tốn băng thông và tốn lượt Cloudinary.
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
