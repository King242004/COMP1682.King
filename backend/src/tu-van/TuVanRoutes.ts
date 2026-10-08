import { Router } from 'express';

import { hoiCoach, xemTinNhan, xoaTroChuyen } from './TuVanService.ts';

const tuVanRoutes = Router();

// Lấy các tin nhắn gần nhất với coach
tuVanRoutes.get('/', async (request, response) => {
  const danhSachTinNhan = await xemTinNhan(response.locals.userId);
  response.json(danhSachTinNhan);
});

// Gửi một câu hỏi cho coach, nhận lại câu hỏi và câu trả lời vừa lưu
tuVanRoutes.post('/', async (request, response) => {
  const tinNhanMoi = await hoiCoach(response.locals.userId, request.body);
  response.status(201).json(tinNhanMoi);
});

// Xóa cả cuộc trò chuyện
tuVanRoutes.delete('/', async (request, response) => {
  await xoaTroChuyen(response.locals.userId);
  response.status(204).end();
});

export default tuVanRoutes;
