// ═══ FILE NÀY LÀM GÌ ═══
// Mở kết nối tới database MongoDB khi server khởi động.
//
// Ai gọi tới: server.js, gọi TRƯỚC khi mở cổng nhận request
// Nhận vào:   chuỗi kết nối MONGODB_URI trong .env
// Trả ra:     không trả gì, chỉ mở kết nối để Mongoose dùng chung
// Khi lỗi:    thiếu chuỗi kết nối hoặc nối không được thì dừng luôn server,
//             thà không chạy còn hơn chạy mà mọi request đều hỏng
//
// Kết nối MongoDB khi server khởi động; server.js gọi hàm này trước khi mở cổng HTTP.
// Kết nối thành công được Mongoose dùng chung cho toàn bộ model phía sau.
const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
