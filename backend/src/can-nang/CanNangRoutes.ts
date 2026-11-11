import { Router } from 'express';

import { ghiCanNang, xemBaoCaoCanNang } from './CanNangService.ts';

const canNangRoutes = Router();

// Lấy báo cáo cân nặng tính tới một ngày, ví dụ /can-nang/ngay/2026-10-06
canNangRoutes.get('/ngay/:ngay', async (request, response) => {
  const baoCaoCanNang = await xemBaoCaoCanNang(response.locals.userId, request.params.ngay);
  response.json(baoCaoCanNang);
});

// Ghi cân của một ngày (ghi lại trong ngày thì đè), trả về báo cáo cân nặng mới
canNangRoutes.put('/', async (request, response) => {
  const baoCaoCanNang = await ghiCanNang(response.locals.userId, request.body);
  response.json(baoCaoCanNang);
});

export default canNangRoutes;
