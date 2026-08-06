// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một lần ghi cân nặng.
//
// Ai gọi tới: weightController (ghi và đọc), coachContext (đọc để đưa cho AI)
// Nhận vào:   số cân nặng và ngày
// Trả ra:     một dòng WeightLog đã kiểm hợp lệ
// Khi lỗi:    thiếu cân nặng hoặc thiếu ngày thì Mongoose chặn lại
//
// Cân nặng mới nhất ở đây luôn được đồng bộ ngược vào trường weight của User,
// để chỗ nào cần cân nặng hiện tại thì đọc một chỗ là đủ.
const mongoose = require("mongoose");

// Bảng nhật ký cân nặng.
// Nơi ghi vào: phần Cân nặng trong màn Tiến trình.
// Nơi đọc ra: biểu đồ cân nặng, và phần dữ liệu đưa cho Coach.
const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    weightKg: { type: Number, required: true, min: 20, max: 300 },
  },
  { timestamps: true }
);

// Chỉ mục duy nhất theo người dùng và ngày, nên mỗi người mỗi ngày
// chỉ có ĐÚNG một lần cân. Cân lại trong ngày thì ghi đè chứ không thêm dòng mới.
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightLog", weightLogSchema);
