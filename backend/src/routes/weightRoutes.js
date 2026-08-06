// Bảng chia việc cho nhật ký cân nặng, địa chỉ bắt đầu bằng /api/weight.
// POST   /    ghi cân nặng hôm nay
// GET    /    lấy danh sách cân nặng để vẽ biểu đồ
// DELETE /:id xóa một lần ghi cân
const express = require("express");
const protect = require("../middleware/authenticateUser");
const { logWeight, getWeights, deleteWeight } = require("../controllers/weightController");

const router = express.Router();

router.use(protect);
router.post("/", logWeight);
router.get("/", getWeights);
router.delete("/:id", deleteWeight);

module.exports = router;
