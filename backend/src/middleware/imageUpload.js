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
