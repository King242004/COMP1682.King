const express = require("express");
const { scanPhoto, scanBarcode } = require("../controllers/scanController");
const protect = require("../middleware/auth");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Memory storage so we get req.file.buffer directly (no disk write)
// Limit 8MB - large enough for high-quality phone photos
const upload = createImageUpload({ maxFileBytes: 8 * 1024 * 1024 });
const scanUploadLimiter = imageUploadLimiter(30);

router.use(protect);
router.post("/photo", aiLimiter, scanUploadLimiter, upload.single("image"), scanPhoto);
router.post("/barcode", scanBarcode);

module.exports = router;
