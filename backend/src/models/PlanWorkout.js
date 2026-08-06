// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một gợi ý tập trong kế hoạch tuần. Mỗi ngày tối đa một gợi ý.
//
// Ai gọi tới: planController, cả lúc AI dựng kế hoạch lẫn lúc bấm nút "Xong"
// Nhận vào:   tên bài tập, thời lượng, và ngày
// Trả ra:     một dòng PlanWorkout đã kiểm hợp lệ
// Khi lỗi:    thiếu ngày thì Mongoose chặn lại
//
// Trường done chuyển sang true khi bấm "Xong", và lúc đó một Exercise thật
// được tạo ra, giống hệt cách PlanMeal biến thành Meal.
const mongoose = require("mongoose");

// Bảng gợi ý tập cho từng ngày trong kế hoạch tuần. Mỗi ngày tối đa một gợi ý.
// Nơi ghi vào: AI tạo kế hoạch tuần.
// Nơi đọc ra: màn Kế hoạch tuần.
// Hai kiểu dòng:
//   Có đủ name, met, durationMin thì bấm "Xong" được, và sẽ tạo một Exercise thật.
//   Chỉ có text thì là ngày nghỉ hoặc dữ liệu AI trả thiếu, chỉ đọc cho biết.
const planWorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
    text: { type: String, default: "" },
    // AI chỉ được chọn một nhóm mà màn bài tập tại nhà hỗ trợ.
    category: {
      type: String,
      enum: ["everyday", "recovery", "strength", "cardio"],
      default: null,
    },
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
