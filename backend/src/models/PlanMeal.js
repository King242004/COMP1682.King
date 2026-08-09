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
// Nơi ghi vào: AI dựng thực đơn tuần, và người dùng tự thêm hoặc sửa món.
// Nơi đọc ra:  màn Kế hoạch tuần, và ngữ cảnh đưa cho Coach.
//
// Trường done chuyển sang true khi bấm "Đã ăn". Lúc đó một bản Meal thật
// được tạo ra, còn dòng này vẫn nằm lại trong kế hoạch để biết đã hoàn thành.
// Ngày ở tương lai là hợp lệ, vì đây là kế hoạch.
const mongoose = require("mongoose");
const { nutritionFields } = require("./nutritionFields");
const { LEGACY_LIMITS } = require("../config/inputLimits");
const { MEAL_TYPES } = require("../config/mealEnums");
const planMealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Dùng chung trần lịch sử với bảng Meal, vì bấm "Đã ăn" là chép thẳng
    // dòng này sang bên đó. Bên lỏng hơn bên chặt thì món chép sang bị chặn.
    name: { type: String, required: true, maxlength: LEGACY_LIMITS.MEAL_NAME },
    mealType: {
      type: String,
      enum: MEAL_TYPES,
      required: true,
    },
    ...nutritionFields,
    note: { type: String, default: "", maxlength: LEGACY_LIMITS.MEAL_DETAILS },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

planMealSchema.index({ user: 1, date: 1, createdAt: 1 });

module.exports = mongoose.model("PlanMeal", planMealSchema);
