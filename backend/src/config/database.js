// ═══ FILE NÀY LÀM GÌ ═══
// Mở kết nối tới database MongoDB khi server khởi động.
//
// Ai gọi tới: server.js, gọi TRƯỚC khi mở cổng nhận request
// Nhận vào:   chuỗi kết nối MONGODB_URI trong .env
// Trả ra:     không trả gì, chỉ mở kết nối để Mongoose dùng chung
// Khi lỗi:    thiếu chuỗi kết nối hoặc nối không được thì dừng luôn server,
//             thà không chạy còn hơn chạy mà mọi request đều hỏng
const mongoose = require("mongoose");

// ══════════════════════════════════════════════════════════
// NỐI DATABASE
//
// Đến từ server.js, chạy TRƯỚC khi mở cổng nhận request.
// Hai bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì mọi model dùng chung kết nối này, không ai phải nối lại.
// ══════════════════════════════════════════════════════════

// NỐI DATABASE BƯỚC 1. Thiếu chuỗi kết nối thì ném lỗi NGAY, chưa thử nối.
// Cố ý để server chết luôn, thà không chạy còn hơn chạy mà mọi request đều hỏng.
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }
  // NỐI DATABASE BƯỚC 2. Nối rồi ĐỨNG ĐÂY CHỜ. Không bắt lỗi ở đây,
  // để lỗi ném ngược lên server.js, bên đó mới quyết định có dừng server hay không.
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
