const mongoose = require("mongoose");

// Bảng nhớ tạm kết quả ước tính dinh dưỡng của AI.
// Nơi ghi vào: scanController, sau mỗi lần Gemini trả kết quả.
// Nơi đọc ra: chính scanController, TRƯỚC khi gọi Gemini.
// Mục đích là không hỏi AI hai lần cho cùng một món của cùng một người.
// Khóa key dựng từ tên món, khẩu phần, nguyên liệu và ngôn ngữ, nên chỉ cần
// đổi một chữ trong tên món là thành một khóa khác và AI được hỏi lại.
// expiresAt kèm expireAfterSeconds bằng 0 nghĩa là MongoDB tự xóa bản ghi khi
// tới hạn, không cần dọn dẹp bằng tay và không cần chạy cron.
const nutritionEstimateCacheSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true },
    items: [{
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      portionDescription: { type: String, default: "" },
      _id: false,
    }],
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

nutritionEstimateCacheSchema.index({ user: 1, key: 1 }, { unique: true });
nutritionEstimateCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("NutritionEstimateCache", nutritionEstimateCacheSchema);
