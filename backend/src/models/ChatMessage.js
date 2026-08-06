// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một tin nhắn trong cuộc trò chuyện với Coach.
//
// Ai gọi tới: coachController, cả lúc lưu tin mới lẫn lúc tải lịch sử
// Nhận vào:   nội dung tin, ai gửi, và ngôn ngữ lúc gửi
// Trả ra:     một dòng ChatMessage đã kiểm hợp lệ
// Khi lỗi:    thiếu nội dung hoặc thiếu người gửi thì Mongoose chặn lại
const mongoose = require("mongoose");

// Bảng tin nhắn trò chuyện với Coach. Mỗi lượt hỏi đáp lưu HAI dòng,
// một dòng của người dùng và một dòng của Coach.
// Nơi ghi vào: coachController.chat.
// Nơi đọc ra: màn Coach khi mở lại, và bị xóa hết khi bấm xóa lịch sử.
// Trường language để lọc tin theo ngôn ngữ, nhờ vậy đổi sang tiếng Anh
// thì màn hình không lẫn tin tiếng Việt cũ.
const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "coach"], required: true },
    language: { type: String, enum: ["vi", "en"], default: null },
    responseLanguage: { type: String, enum: ["vi", "en"], default: null },
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
