// ═══ FILE NÀY LÀM GÌ ═══
// Khai báo kho ảnh trên mạng, dùng chung cho mọi chỗ có tải ảnh lên.
//
// Ai gọi tới: accountController (ảnh đại diện), postController (ảnh bài đăng),
//             coachController (ảnh gửi cho Coach)
// Nhận vào:   không nhận gì, chỉ đọc cấu hình từ .env
// Trả ra:     một đối tượng đã cấu hình sẵn để tải ảnh lên và xóa ảnh
// Khi lỗi:    thiếu cấu hình trong .env thì mọi lệnh tải ảnh sẽ hỏng
//
// LƯU Ý: quét ảnh món ăn KHÔNG lưu vào đây. Ảnh quét chỉ đi thẳng cho AI rồi bỏ.
//
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
