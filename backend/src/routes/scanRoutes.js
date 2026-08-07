// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/scan/* tới hàm trong controllers/scanController.js.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/scan
// Nhận vào:   request từ màn Quét và nút Ước tính ở màn Thêm món
// Trả ra:     không tự trả gì, chuyển thẳng cho scanController
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay. Ảnh quá nặng thì
//             imageUpload.js trả lỗi trước scanController.scanPhoto
//
// Bảng chia việc cho quét món, địa chỉ bắt đầu bằng /api/scan.
// POST /photo   chụp hoặc chọn ảnh món, gửi kèm ngôn ngữ đang dùng.
//               Ảnh chỉ nằm trong bộ nhớ rồi gửi cho AI, KHÔNG lưu lên kho ảnh.
// POST /barcode quét được mã vạch hoặc gõ tay mã vạch.
//               Chỉ tra cứu dữ liệu công khai nên không tốn lượt AI.
const express = require("express");
const { scanPhoto, scanBarcode, estimateNutrition } = require("../controllers/scanController");
const protect = require("../middleware/authenticateUser");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Giữ ảnh trong bộ nhớ để lấy thẳng req.file.buffer, không ghi ra ổ đĩa
// Limit 8MB - large enough for high-quality phone photos
const upload = createImageUpload({ maxFileBytes: 8 * 1024 * 1024 });
const scanUploadLimiter = imageUploadLimiter(30);

router.use(protect);
router.post("/photo", aiLimiter, scanUploadLimiter, upload.single("image"), scanPhoto);
router.post("/barcode", scanBarcode);
router.post("/estimate", aiLimiter, estimateNutrition);

module.exports = router;
