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
