import { Router } from 'express';

import { changePassword, deleteAccount, getMe, login, register } from './AuthService.ts';
import { requireAuth } from './requireAuth.ts';

const authRoutes = Router();

// Đăng ký tài khoản mới
authRoutes.post('/register', async (request, response) => {
  const result = await register(request.body.ten_hien_thi, request.body.email, request.body.mat_khau);
  response.status(201).json(result);
});

// Đăng nhập
authRoutes.post('/login', async (request, response) => {
  const result = await login(request.body.email, request.body.mat_khau);
  response.json(result);
});

// Lấy thông tin người đang đăng nhập (cần token)
authRoutes.get('/me', requireAuth, async (request, response) => {
  const user = await getMe(response.locals.userId);
  response.json(user);
});

// Đổi mật khẩu (cần token)
authRoutes.put('/password', requireAuth, async (request, response) => {
  const result = await changePassword(response.locals.userId, request.body.mat_khau_hien_tai, request.body.mat_khau_moi);
  response.json(result);
});

// Xóa tài khoản (cần token)
authRoutes.delete('/me', requireAuth, async (request, response) => {
  await deleteAccount(response.locals.userId);
  response.status(204).end();
});

export default authRoutes;
