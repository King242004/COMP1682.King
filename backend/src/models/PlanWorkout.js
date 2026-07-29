const mongoose = require("mongoose");

const planWorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    text: { type: String, required: true },
    // Tên ngắn của hoạt động, ví dụ "Đi bộ nhanh".
    name: { type: String, default: null },
    // Chỉ số MET dùng để ước tính lượng calo tiêu hao.
    met: { type: Number, default: null },
    // Thời lượng tập được gợi ý, tính theo phút.
    durationMin: { type: Number, default: null },
    // Chuyển thành true khi người dùng đánh dấu đã hoàn thành.
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

planWorkoutSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("PlanWorkout", planWorkoutSchema);
