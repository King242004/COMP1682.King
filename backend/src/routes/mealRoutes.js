// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/meals/* tới hàm trong controllers/mealController.js.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/meals
// Nhận vào:   request từ màn Thêm món, Sửa món, Trang chủ, Lịch sử món
// Trả ra:     không tự trả gì, chuyển thẳng cho mealController
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay, cả file đều cần thẻ
//
// apiClient gửi request /meals vào đây; mỗi route chuyển tiếp tới hàm cùng tên
// trong backend/src/controllers/mealController.js.
// Đến từ apiClient bên frontend. Đi tiếp: authenticateUser rồi mealController.
//
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

// Mọi địa chỉ dưới đây đều phải qua protect trước, tức phải có thẻ đăng nhập.
router.use(protect);
// LUỒNG LƯU MÓN, đường một món. Đi tiếp mealController.addMeal.
router.post("/", addMeal);
// LUỒNG LƯU MÓN, đường nhiều món. Nút Lưu ở AddMealScreen đi vào ĐÂY,
// vì một lần lưu ghi được tối đa 8 món. Đi tiếp mealController.addMeals.
router.post("/batch", addMeals);
router.get("/", getMealsByDate);
router.get("/history", getMealHistory);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);

module.exports = router;
