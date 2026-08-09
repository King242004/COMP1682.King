// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một tin nhắn trong cuộc trò chuyện với Coach.
//
// Ai gọi tới: coachController, cả lúc lưu tin mới lẫn lúc tải lịch sử
// Nhận vào:   nội dung tin, ai gửi, và ngôn ngữ lúc gửi
// Trả ra:     một dòng ChatMessage đã kiểm hợp lệ
// Khi lỗi:    thiếu nội dung hoặc thiếu người gửi thì Mongoose chặn lại
//
// Mỗi lượt hỏi đáp lưu HAI dòng, một của người dùng và một của Coach.
// Nơi ghi vào: coachController.chat.
// Nơi đọc ra:  màn Coach khi mở lại, và bị xóa hết khi bấm xóa lịch sử.
//
// Nhớ: hai trường ngôn ngữ KHÁC nhau và rất dễ nhầm.
//      language là ngôn ngữ app đang đặt lúc gửi, dùng để LỌC lịch sử.
//      responseLanguage là ngôn ngữ Coach thật sự trả lời lượt đó, vì người dùng
//      xin đổi tiếng giữa chừng được, lúc đó hai trường lệch nhau ngay trong
//      cùng một lượt.
const mongoose = require("mongoose");
const { nutritionSnapshotFields } = require("./nutritionFields");
const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "coach"], required: true },
    // Ngôn ngữ app lúc gửi. API lịch sử lọc theo trường này.
    language: { type: String, enum: ["vi", "en"], default: null },
    // Ngôn ngữ Coach thật sự dùng để trả lời lượt này.
    responseLanguage: { type: String, enum: ["vi", "en"], default: null },
    text: { type: String, required: true },
    // Đường dẫn Cloudinary của ảnh được gửi trong cuộc trò chuyện.
    image: { type: String, default: null },
    // Mã Cloudinary dùng để xóa ảnh cùng với lịch sử trò chuyện.
    imagePublicId: { type: String, default: null },
    // Món Coach gợi ý, chụp lại để tin nhắn cũ vẫn hiện đúng số.
    meal: {
      type: {
        name: String,
        ...nutritionSnapshotFields,
        mealType: String,
      },
      default: null,
    },
    // Đánh dấu người dùng đang ăn món được gợi ý để frontend hiện nút thêm.
    mealEating: { type: Boolean, default: false },
    // KHÔNG CÒN CODE NÀO ĐỌC HAY GHI TRƯỜNG NÀY. Trước đây Coach ghi thẳng món
    // vào nhật ký rồi lưu mã món ở đây; nay Coach chỉ mở màn Thêm món cho người
    // dùng tự bấm Lưu. Giữ lại trường vì xóa khỏi schema không xóa dữ liệu đã có
    // trong MongoDB mà chỉ thêm rủi ro cho các bản ghi cũ.
    loggedMealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", default: null },
  },
  { timestamps: true }
);

chatMessageSchema.index({ user: 1, language: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
