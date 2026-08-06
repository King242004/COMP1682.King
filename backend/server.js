// File này là nơi backend bắt đầu chạy.
// Nhận: các biến cấu hình trong file .env.
// Làm: kiểm tra cấu hình, nối database, dựng app, mở cổng nghe request.
// Ra: một server đang chạy, sẵn sàng nhận request từ app điện thoại.
// Hỏng: thiếu cấu hình hoặc không nối được database thì in lỗi và tắt luôn.
require("dotenv").config();
const connectDB = require("./src/config/database");
const { validateEnvironment } = require("./src/config/environment");
const { createApp } = require("./src/app");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Bốn bước khởi động, sai bước nào là dừng luôn ở bước đó.
    // Cảnh báo thì chỉ in ra, vẫn cho chạy tiếp.
    const { warnings } = validateEnvironment();
    warnings.forEach((warning) => console.warn(`Environment warning: ${warning}`));
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
