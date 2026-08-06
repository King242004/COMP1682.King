// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng một quan hệ theo dõi giữa hai người dùng.
//
// Ai gọi tới: socialController (theo dõi, bỏ theo dõi, đếm người theo dõi),
//             feedController (lấy bài của những người mình theo dõi)
// Nhận vào:   mã người theo dõi và mã người được theo dõi
// Trả ra:     một dòng Follow đã kiểm hợp lệ
// Khi lỗi:    theo dõi trùng thì bị chỉ mục duy nhất chặn lại
const mongoose = require("mongoose");

// Bảng quan hệ theo dõi. Mỗi dòng là một chiều: follower theo dõi following.
// A theo dõi B và B theo dõi A là HAI dòng riêng biệt.
// Nơi ghi vào: nút Theo dõi và nút Bỏ theo dõi.
// Nơi đọc ra: tab Đang theo dõi, danh sách người theo dõi, và phần gợi ý người.
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Chỉ mục duy nhất nên bấm Theo dõi nhiều lần cũng chỉ có một dòng.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Chỉ mục riêng cho chiều ngược lại, để đếm số người theo dõi cho nhanh.
followSchema.index({ following: 1 });

module.exports = mongoose.model("Follow", followSchema);
