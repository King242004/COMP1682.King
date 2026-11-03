import { Router } from 'express';

import { botNuoc, capNhatCaiDatNuoc, themNuoc, xemUongNuocNgay } from './UongNuocService.ts';

const uongNuocRoutes = Router();

// Lấy lượng nước đã uống của một ngày cùng mục tiêu và cài đặt, ví dụ /uong-nuoc/ngay/2026-11-03
uongNuocRoutes.get('/ngay/:ngay', async (request, response) => {
  const uongNuoc = await xemUongNuocNgay(response.locals.userId, request.params.ngay);
  response.json(uongNuoc);
});

// Bấm "+": cộng thêm số ml mỗi lần ghi
uongNuocRoutes.post('/them', async (request, response) => {
  const uongNuoc = await themNuoc(response.locals.userId, request.body);
  response.json(uongNuoc);
});

// Bấm "−": trừ bớt số ml mỗi lần ghi
uongNuocRoutes.post('/bot', async (request, response) => {
  const uongNuoc = await botNuoc(response.locals.userId, request.body);
  response.json(uongNuoc);
});

// Lưu cài đặt: mỗi lần ghi, mục tiêu, bật nhắc, các giờ nhắc
uongNuocRoutes.put('/cai-dat', async (request, response) => {
  const uongNuoc = await capNhatCaiDatNuoc(response.locals.userId, request.body);
  response.json(uongNuoc);
});

export default uongNuocRoutes;
