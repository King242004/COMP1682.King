// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng của một món DỰ ĐỊNH ăn trong kế hoạch tuần.
// Khác hẳn bảng Meal, bảng đó là món ĐÃ ăn thật.
//
// Ai gọi tới: planController, cả lúc AI dựng thực đơn lẫn lúc người dùng
//             tự thêm món, sửa, xóa, và bấm "Đã ăn"
// Nhận vào:   object món dự định, kèm ngày dạng YYYY-MM-DD
// Trả ra:     một dòng PlanMeal đã kiểm hợp lệ
// Khi lỗi:    thiếu tên, thiếu buổi ăn hoặc thiếu ngày thì Mongoose chặn lại
//
// Trường done chuyển sang true khi bấm "Đã ăn". Lúc đó một bản Meal thật
// được tạo ra, còn dòng này vẫn nằm lại trong kế hoạch để biết đã hoàn thành.
// Ngày ở tương lai là hợp lệ, vì đây là kế hoạch.
const mongoose = require("mongoose");
const nutritionFields = require("./nutritionFields");
const planMealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    ...nutritionFields,
    note: { type: String, default: "" },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

planMealSchema.index({ user: 1, date: 1, createdAt: 1 });

module.exports = mongoose.model("PlanMeal", planMealSchema);
