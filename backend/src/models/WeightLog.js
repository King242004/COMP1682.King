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
//
// Nơi ghi vào: phần Cân nặng trong màn Tiến trình.
// Nơi đọc ra:  biểu đồ cân nặng, và phần dữ liệu đưa cho Coach.
// Mỗi người mỗi ngày chỉ có ĐÚNG một lần cân, cân lại trong ngày thì ghi đè.
const mongoose = require("mongoose");
const { PROFILE_LIMITS } = require("../config/nutritionConstants");
const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    // Khoảng cân nặng hợp lệ lấy từ nutritionConstants, đúng bộ số mà
    // weightController đang kiểm. Gõ tay ở đây là hai nơi có thể lệch nhau.
    weightKg: {
      type: Number,
      required: true,
      min: PROFILE_LIMITS.weightKg.min,
      max: PROFILE_LIMITS.weightKg.max,
    },
  },
  { timestamps: true }
);

// Chỉ mục duy nhất theo người dùng và ngày, nên mỗi người mỗi ngày
// chỉ có ĐÚNG một lần cân. Cân lại trong ngày thì ghi đè chứ không thêm dòng mới.
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightLog", weightLogSchema);
