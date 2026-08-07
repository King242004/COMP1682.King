// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/plan/* tới hàm trong controllers/planController.js.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/plan
// Nhận vào:   request từ màn Kế hoạch tuần
// Trả ra:     không tự trả gì, chuyển thẳng cho planController
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay, cả file đều cần thẻ
//
// Bảng chia việc cho kế hoạch tuần, địa chỉ bắt đầu bằng /api/plan.
// POST   /                 thêm một món vào kế hoạch
// GET    /?startDate&endDate  lấy cả tuần, màn Kế hoạch tuần dùng
// PUT    /:id              sửa món trong kế hoạch
// DELETE /:id              xóa món khỏi kế hoạch
// POST   /:id/eaten        bấm Đã ăn, món được chép luôn sang nhật ký thật
// POST   /workout/:id/done bấm Xong ở gợi ý tập, tạo luôn một buổi tập thật
// Hai địa chỉ dưới tốn lượt gọi AI:
// POST   /generate         bấm tạo kế hoạch bằng AI
// POST   /grocery          mở danh sách đi chợ
const express = require("express");
const { addPlanMeal, getPlanMeals, updatePlanMeal, deletePlanMeal, markEaten, markWorkoutDone, generatePlan, groceryList } = require("../controllers/planController");
const protect = require("../middleware/authenticateUser");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(protect);
router.post("/", addPlanMeal);
router.get("/", getPlanMeals);
router.put("/:id", updatePlanMeal);
router.delete("/:id", deletePlanMeal);
router.post("/:id/eaten", markEaten);
router.post("/workout/:id/done", markWorkoutDone);

router.post("/generate", aiLimiter, generatePlan);
router.post("/grocery", aiLimiter, groceryList);

module.exports = router;
