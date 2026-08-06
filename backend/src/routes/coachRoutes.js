// Bảng chia việc cho AI Coach, địa chỉ bắt đầu bằng /api/coach.
// Ba địa chỉ dưới tốn lượt gọi AI nên có thêm aiLimiter:
// GET  /insight      mở tab Coach, lấy điểm sức khỏe và nhận xét trong ngày
// POST /chat         gửi một tin nhắn cho Coach
// POST /suggest-meal Trang chủ xin gợi ý món cho bữa kế tiếp
// Bốn địa chỉ dưới chỉ đọc ghi database, không tốn lượt AI:
// GET    /history    tải lại các tin nhắn cũ
// DELETE /history    xóa hết lịch sử trò chuyện
// POST   /log        bấm Thêm để ghi món Coach nhắc tới vào nhật ký
// POST   /unlog      bấm hoàn tác món vừa thêm
const express = require("express");
const { getInsight, chat, getHistory, clearHistory, logFromMessage, unlogFromMessage, suggestMeal } = require("../controllers/coachController");
const protect = require("../middleware/authenticateUser");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(protect);
router.get("/insight", aiLimiter, getInsight);
router.post("/chat", aiLimiter, chat);
router.post("/suggest-meal", aiLimiter, suggestMeal);

router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.post("/log", logFromMessage);
router.post("/unlog", unlogFromMessage);

module.exports = router;
