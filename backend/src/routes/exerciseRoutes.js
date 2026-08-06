// ═══ FILE NÀY LÀM GÌ ═══
// Bảng chia việc: nhận địa chỉ nào thì giao cho hàm nào trong controller.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/exercise
// Nhận vào:   request từ màn Ghi buổi tập và màn Bài tập có hướng dẫn
// Trả ra:     không tự trả gì, chuyển thẳng cho exerciseController
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay, cả file đều cần thẻ
//
// Bảng chia việc cho nhật ký tập luyện, địa chỉ bắt đầu bằng /api/exercise.
// POST   /        ghi một buổi tập, từ màn Ghi buổi tập hoặc khi tập xong bài hướng dẫn
// GET    /?date=  lấy buổi tập của một ngày
// GET    /history lấy lịch sử tập, màn Tiến trình dùng
// DELETE /:id     xóa một buổi tập
const express = require("express");
const { addExercise, getExercisesByDate, getExerciseHistory, deleteExercise } = require("../controllers/exerciseController");
const protect = require("../middleware/authenticateUser");

const router = express.Router();

router.use(protect);
router.post("/", addExercise);
router.get("/", getExercisesByDate);
router.get("/history", getExerciseHistory);
router.delete("/:id", deleteExercise);

module.exports = router;
