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
