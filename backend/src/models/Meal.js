const mongoose = require("mongoose");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");
const nutritionFields = require("./nutritionFields");

// Bảng nhật ký món đã ăn.
// Nơi ghi vào: màn Thêm món, sau khi quét ảnh hoặc mã vạch,
//   bấm "Đã ăn" ở kế hoạch tuần, và bấm "Thêm" trên tin nhắn Coach.
// Nơi đọc ra: màn Trang chủ, màn Tiến trình, và phần dữ liệu đưa cho Coach.
// Ngày lưu dạng chuỗi "2026-08-03" chứ không lưu kiểu ngày tháng,
// để so sánh và lọc theo ngày địa phương mà không lo lệch múi giờ.
const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Các trần dưới đây là trần LỊCH SỬ. Giới hạn mới nhỏ hơn và được áp ở
    // giao diện, vì validator Mongoose chạy mỗi lần ghi nên hạ số ở đây sẽ làm
    // bản ghi cũ dài hơn số mới không sửa và lưu lại được.
    name: { type: String, required: true, maxlength: LEGACY_LIMITS.MEAL_NAME },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    ...nutritionFields,
    portionAmount: { type: Number, default: null, min: 0 },
    portionUnit: { type: String, default: "", trim: true, maxlength: INPUT_LIMITS.PORTION_UNIT },
    portionText: { type: String, default: "", trim: true, maxlength: LEGACY_LIMITS.PORTION_TEXT },
    nutritionSource: {
      type: String,
      enum: ["manual", "ai_estimate", "ai_adjusted", "photo_scan", "barcode", "community", "repeat", "ai_suggestion"],
      default: "manual",
    },
    image: { type: String, default: null },
    note: { type: String, default: "", maxlength: LEGACY_LIMITS.MEAL_DETAILS },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
  },
  { timestamps: true }
);

// Chỉ mục theo người dùng và ngày, để lấy món của một ngày chạy nhanh.
mealSchema.index({ user: 1, date: -1, createdAt: -1 });

module.exports = mongoose.model("Meal", mealSchema);
