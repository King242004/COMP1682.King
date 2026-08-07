// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/profile/* tới hàm trong controllers/profileController.js.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/profile
// Nhận vào:   request từ màn Hồ sơ, màn Mục tiêu, và bước thiết lập lần đầu
// Trả ra:     không tự trả gì, chuyển thẳng cho profileController
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay, cả file đều cần thẻ
//
// Bảng chia việc cho hồ sơ cá nhân, địa chỉ bắt đầu bằng /api/profile.
// GET /  lấy hồ sơ kèm chỉ số BMI và TDEE
// PUT /  lưu hồ sơ sau khi sửa, hoặc lưu bước thiết lập lần đầu
const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const protect = require("../middleware/authenticateUser");

const router = express.Router();

router.use(protect);
router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
