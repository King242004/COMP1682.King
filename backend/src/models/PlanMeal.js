const mongoose = require("mongoose");
const nutritionFields = require("./nutritionFields");

// Bảng món DỰ ĐỊNH ăn trong kế hoạch tuần. Khác hẳn bảng Meal là món ĐÃ ăn.
// Nơi ghi vào: AI tạo kế hoạch tuần, hoặc người dùng tự thêm món vào kế hoạch.
// Nơi đọc ra: màn Kế hoạch tuần, và danh sách đi chợ.
// Trường done chuyển sang true khi bấm "Đã ăn". Lúc đó một bản Meal thật
// được tạo ra, còn dòng này vẫn nằm lại trong kế hoạch để biết đã hoàn thành.
// Ngày ở tương lai là hợp lệ, vì đây là kế hoạch.
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
