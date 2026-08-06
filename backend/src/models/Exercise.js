const mongoose = require("mongoose");

// Bảng nhật ký buổi tập.
// Nơi ghi vào: màn Ghi buổi tập, khi tập xong một bài hướng dẫn,
//   và khi bấm "Xong" ở gợi ý tập trong kế hoạch tuần.
// Nơi đọc ra: màn Trang chủ, màn Tiến trình, và phần dữ liệu đưa cho Coach.
// caloriesBurned được server tính rồi mới lưu, app không gửi con số này lên.
// sourceKey, mã MET và cân nặng là snapshot để phép tính cũ vẫn giải thích được
// sau khi người dùng đổi cân nặng hoặc catalog được cập nhật.
const exerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    // Snapshot nguồn phép tính. Dữ liệu cũ để null, không suy đoán ngược.
    sourceType: { type: String, enum: ["external", "guided"], default: null },
    sourceKey: { type: String, default: null },
    met: { type: Number, required: true, min: 0 },
    metCode: { type: String, default: null },
    metSource: { type: String, default: null },
    weightKgAtLog: { type: Number, min: 0, default: null },
    durationMin: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
  },
  { timestamps: true }
);

exerciseSchema.index({ user: 1, date: -1, createdAt: -1 });

module.exports = mongoose.model("Exercise", exerciseSchema);
