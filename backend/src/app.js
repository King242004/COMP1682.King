// ═══ FILE NÀY LÀM GÌ ═══
// Cửa vào của MỌI request từ app điện thoại. Dựng cả bộ khung Express
// rồi gắn từng bảng chia việc vào đúng địa chỉ.
//
// Ai gọi tới: server.js, sau khi đã nối được database
// Nhận vào:   không nhận gì, tự dựng từ cấu hình trong .env
// Trả ra:     một app Express đã gắn đủ 10 nhóm địa chỉ
// Khi lỗi:    mọi lỗi rơi xuống errorHandler ở cuối file, xem middleware/errorHandler
//
// Thứ tự gắn ở đây quan trọng. Request đi từ trên xuống:
//   1. helmet và cors, chặn các lời gọi từ nơi không được phép
//   2. đọc phần thân request thành dữ liệu dùng được
//   3. các bảng chia việc /api/...
//   4. errorHandler, gắn CUỐI CÙNG nên nó hứng được mọi lỗi phía trên
//
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getEmailStatus } = require("./services/emailRelayClient");
const errorHandler = require("./middleware/errorHandler");
const { authLimiter } = require("./middleware/rateLimiters");

// Chỉ cho phép các địa chỉ web đã khai báo gọi vào.
// Để trống danh sách nghĩa là cho tất cả, dùng khi chạy máy nhà.
function corsOptions() {
  const allowedOrigins = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      const error = new Error("Origin is not allowed.");
      error.status = 403;
      callback(error);
    },
  };
}

// Dựng app Express. server.js gọi hàm này sau khi đã nối được database.
function createApp() {
  const app = express();

  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors(corsOptions()));

  // Coach cho phép dữ liệu tới 8mb vì ảnh món ăn được gửi kèm trong JSON.
  app.use("/api/coach", express.json({ limit: "8mb" }), require("./routes/coachRoutes"));
  // Các nhóm còn lại chỉ gửi chữ và số nên 1mb là đủ.
  app.use(express.json({ limit: "1mb" }));

  // Bảng chia việc. Địa chỉ bắt đầu bằng gì thì giao cho file route đó.
  app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
  app.use("/api/meals", require("./routes/mealRoutes"));
  app.use("/api/plan", require("./routes/planRoutes"));
  app.use("/api/exercise", require("./routes/exerciseRoutes"));
  app.use("/api/weight", require("./routes/weightRoutes"));
  app.use("/api/profile", require("./routes/profileRoutes"));
  app.use("/api/user", require("./routes/accountRoutes"));
  app.use("/api/scan", require("./routes/scanRoutes"));
  app.use("/api/community", require("./routes/communityRoutes"));
  // Địa chỉ duy nhất không cần đăng nhập. Dùng để đánh thức server và xem
  // phần gửi email đã cấu hình chưa.
  app.get("/", (req, res) => {
    const emailStatus = getEmailStatus();
    res.json({
      message: "MealMate API running",
      version: process.env.RENDER_GIT_COMMIT?.slice(0, 8) || "local",
      emailProvider: emailStatus.provider,
      emailConfigured: emailStatus.configured,
    });
  });

  // Phải đặt sau tất cả route thì mới bắt được lỗi của chúng.
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
