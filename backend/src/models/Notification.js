// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một thông báo trong Community.
//
// Ai gọi tới: socialController (khi có người theo dõi), postController (khi có
//             người tim bài), notificationController (đọc và đánh dấu đã đọc)
// Nhận vào:   người nhận, người gây ra, và loại thông báo
// Trả ra:     một dòng Notification đã kiểm hợp lệ
// Khi lỗi:    thiếu người nhận hoặc thiếu loại thì Mongoose chặn lại
const mongoose = require("mongoose");

// Bảng thông báo. Chỉ có hai loại: có người tim bài, và có người theo dõi mình.
// Nơi ghi vào: bấm tim và bấm theo dõi.
// Nơi xóa đi: bỏ tim, bỏ theo dõi, xóa bài, và xóa tài khoản.
// Nơi đọc ra: màn Thông báo và chấm đỏ trên biểu tượng chuông.
// user là người NHẬN thông báo, actor là người GÂY RA thông báo.
// post rỗng với thông báo theo dõi, vì theo dõi không gắn với bài nào.
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Người gây ra thông báo này
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "follow"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
// Chỉ mục duy nhất theo bốn trường, nên tim rồi bỏ tim rồi tim lại
// cũng chỉ có MỘT thông báo, không làm phiền chủ bài nhiều lần.
notificationSchema.index({ user: 1, actor: 1, type: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Notification", notificationSchema);
