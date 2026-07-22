const express = require("express");
const router = express.Router();
const { scanPhoto, scanBarcode } = require("../controllers/scanController");
const protect = require("../middleware/auth");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { aiLimiter } = require("../middleware/rateLimiters");

// Memory storage so we get req.file.buffer directly (no disk write)
// Limit 8MB - large enough for high-quality phone photos
const upload = createImageUpload({ maxFileBytes: 8 * 1024 * 1024 });
const scanUploadLimiter = imageUploadLimiter(30);

router.use(protect);

/**
 * @swagger
 * /scan/photo:
 *   post:
 *     summary: Identify food from a photo using AI (Gemini Vision)
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Returns top 3 food candidates with nutrition estimates
 *       400:
 *         description: No image provided
 *       422:
 *         description: No food detected in image
 *       500:
 *         description: AI scan failed
 */
router.post("/photo", aiLimiter, scanUploadLimiter, upload.single("image"), scanPhoto);

/**
 * @swagger
 * /scan/barcode:
 *   post:
 *     summary: Look up packaged product by barcode (Open Food Facts)
 *     tags: [Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [barcode]
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: "8934563138189"
 *     responses:
 *       200:
 *         description: Returns product info with nutrition
 *       400:
 *         description: Invalid barcode format
 *       404:
 *         description: Product not found
 */
router.post("/barcode", scanBarcode);

module.exports = router;
