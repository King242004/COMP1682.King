import express from 'express';

import authRoutes from './auth/AuthRoutes.ts';
import { requireAuth } from './auth/requireAuth.ts';
import buaAnRoutes from './bua-an/BuaAnRoutes.ts';
import database from './database/database.ts';
import environment from './environment.ts';
import hoSoRoutes from './ho-so/HoSoRoutes.ts';
import { errorHandler } from './shared/errorHandler.ts';

// Tạo ứng dụng Express
const app = express();

// Cho server đọc được dữ liệu JSON mà app gửi lên
app.use(express.json());

// Kiểm tra server và database còn hoạt động
app.get('/health', async (request, response) => {
  await database.query('SELECT 1');
  response.json({ server: 'ok', database: 'ok' });
});

// Đăng ký, đăng nhập, lấy thông tin người đang đăng nhập
app.use('/auth', authRoutes);

// Hồ sơ và mục tiêu calo (cần đăng nhập)
app.use('/ho-so', requireAuth, hoSoRoutes);

// Nhật ký bữa ăn (cần đăng nhập)
app.use('/bua-an', requireAuth, buaAnRoutes);

// Đường dẫn không có ở trên thì báo không tìm thấy
app.use((request, response) => {
  response.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

// Bắt mọi lỗi ném ra từ các đường dẫn phía trên
app.use(errorHandler);

// Mở cổng để app điện thoại gọi tới
app.listen(environment.port, () => {
  console.log(`MealMate API đang chạy ở cổng ${environment.port}`);
});
