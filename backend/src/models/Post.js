// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng của một bài đăng trong Community.
// Bài có hai loại: bài thường, và bài món ăn. Phân biệt bằng trường dishName.
//
// Ai gọi tới: postController (tạo, sửa, xóa bài), feedController (bốn danh
//             sách bài), socialController (thích và lưu bài)
// Nhận vào:   object bài đăng kèm ảnh đã tải lên Cloudinary
// Trả ra:     một dòng Post đã kiểm hợp lệ
// Khi lỗi:    thiếu người đăng hoặc ảnh sai hình dạng thì Mongoose chặn lại
//
// Ba trường dễ nhầm:
//   dishName là TÊN món, có thể có mà không kèm dinh dưỡng.
//   meal là phần dinh dưỡng, chỉ có khi người dùng chọn món từ nhật ký.
//   image và imagePublicId là ảnh đầu tiên, giữ lại cho các bài cũ chỉ có một ảnh.
// likes và saves lưu thẳng danh sách mã người dùng, nên đếm số tim
// chỉ là đếm độ dài mảng, không cần truy vấn thêm bảng khác.
const mongoose = require("mongoose");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Dùng trần lịch sử, không dùng giới hạn hiện hành. Validator của Mongoose
    // chạy mỗi lần ghi, nên hạ số ở đây sẽ làm bài cũ dài hơn số mới không lưu
    // lại được. Giới hạn mới được áp ở giao diện và ở đường tạo bài.
    caption: { type: String, default: "", maxlength: LEGACY_LIMITS.POST_CAPTION },
    image: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
      },
    ],
    dishName: { type: String, trim: true, maxlength: LEGACY_LIMITS.MEAL_NAME, default: null },
    meal: {
      name: { type: String },
      calories: { type: Number, min: 0 },
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
      portionAmount: { type: Number, default: null, min: 0 },
      portionUnit: { type: String, default: "", trim: true, maxlength: INPUT_LIMITS.PORTION_UNIT },
      portionText: { type: String, default: "", trim: true, maxlength: LEGACY_LIMITS.PORTION_TEXT },
      nutritionSource: {
        type: String,
        enum: ["manual", "ai_estimate", "ai_adjusted", "photo_scan", "barcode", "community", "repeat", "ai_suggestion"],
      },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Các truy vấn feed lọc theo tác giả rồi sắp theo bài mới nhất
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
