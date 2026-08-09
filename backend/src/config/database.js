// ═══ FILE NÀY LÀM GÌ ═══
// Mở kết nối tới database MongoDB khi server khởi động.
//
// Ai gọi tới: server.js, gọi TRƯỚC khi mở cổng nhận request
// Nhận vào:   chuỗi kết nối MONGODB_URI trong .env
// Trả ra:     không trả gì, chỉ mở kết nối để Mongoose dùng chung
// Khi lỗi:    thiếu chuỗi kết nối hoặc nối không được thì ném lỗi lên server.js;
//             bên đó bắt trong startServer rồi gọi process.exit(1), tức server
//             dừng hẳn. Thà không chạy còn hơn chạy mà mọi request đều hỏng.
// Nối xong thì mọi model dùng chung kết nối này, không ai phải nối lại.
const mongoose = require("mongoose");

// Thiếu chuỗi kết nối thì ném lỗi NGAY, chưa thử nối.
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }
  // Nối rồi ĐỨNG ĐÂY CHỜ. Cố ý không bắt lỗi ở đây, để lỗi ném ngược lên server.js.
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
