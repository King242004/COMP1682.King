const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "coach"], required: true },
    language: { type: String, enum: ["vi", "en"], default: null },
    text: { type: String, required: true },
    // Đường dẫn Cloudinary của ảnh được gửi trong cuộc trò chuyện.
    image: { type: String, default: null },
    // Mã Cloudinary dùng để xóa ảnh cùng với lịch sử trò chuyện.
    imagePublicId: { type: String, default: null },
    meal: {
      type: {
        name: String, calories: Number, protein: Number, carbs: Number, fat: Number, mealType: String,
      },
      default: null,
    },
    // Đánh dấu người dùng đang ăn món được gợi ý để frontend hiện nút thêm.
    mealEating: { type: Boolean, default: false },
    // Lưu mã món sau khi gợi ý đã được thêm vào nhật ký.
    loggedMealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", default: null },
  },
  { timestamps: true }
);

chatMessageSchema.index({ user: 1, language: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
