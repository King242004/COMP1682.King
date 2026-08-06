// Bảng chia việc cho nhật ký món ăn, địa chỉ bắt đầu bằng /api/meals.
// POST   /        thêm món, từ màn Thêm món hoặc sau khi quét ảnh
// GET    /?date=  lấy món của một ngày, màn Trang chủ dùng
// GET    /history lấy toàn bộ lịch sử, màn Tiến trình dùng
// PUT    /:id     sửa món
// DELETE /:id     xóa món
const express = require("express");
const { addMeal, addMeals, getMealsByDate, getMealHistory, updateMeal, deleteMeal } = require("../controllers/mealController");
const protect = require("../middleware/authenticateUser");

const router = express.Router();

router.use(protect);
router.post("/", addMeal);
router.post("/batch", addMeals);
router.get("/", getMealsByDate);
router.get("/history", getMealHistory);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);

module.exports = router;
