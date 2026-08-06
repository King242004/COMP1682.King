// File này khai báo kho ảnh trên mạng, dùng chung cho mọi chỗ có tải ảnh lên.
// Nơi dùng: ảnh đại diện, ảnh bài đăng Community, ảnh gửi cho Coach.
// Xóa ảnh cũng đi qua đây khi đổi ảnh đại diện, sửa bài, xóa bài,
//   xóa lịch sử trò chuyện và xóa tài khoản.
// Lưu ý: quét ảnh món ăn KHÔNG lưu vào đây, ảnh chỉ đi thẳng cho AI rồi bỏ.
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
