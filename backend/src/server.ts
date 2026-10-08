import express from 'express';

import authRoutes from './auth/AuthRoutes.ts';
import { requireAuth } from './auth/requireAuth.ts';
import buaAnRoutes from './bua-an/BuaAnRoutes.ts';
import database from './database/database.ts';
import environment from './environment.ts';
import hoSoRoutes from './ho-so/HoSoRoutes.ts';
import quetMonRoutes from './quet-mon/QuetMonRoutes.ts';
import { errorHandler } from './shared/errorHandler.ts';
import tienDoRoutes from './tien-do/TienDoRoutes.ts';
import tuVanRoutes from './tu-van/TuVanRoutes.ts';

// Ảnh chụp món gửi lên dạng base64 nên cần cho phép dữ liệu lớn hơn mặc định (100 KB)
const JSON_BODY_LIMIT = '10mb';

// Tạo ứng dụng Express
const app = express();

// Cho server đọc được dữ liệu JSON mà app gửi lên
app.use(express.json({ limit: JSON_BODY_LIMIT }));

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

// Ước tính bằng AI, nhận món từ ảnh, tra mã vạch (cần đăng nhập)
app.use('/quet-mon', requireAuth, quetMonRoutes);

// Trò chuyện với coach (cần đăng nhập)
app.use('/tu-van', requireAuth, tuVanRoutes);

// Cân nặng và tiến độ (cần đăng nhập)
app.use('/tien-do', requireAuth, tienDoRoutes);

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
