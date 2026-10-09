import { Router } from 'express';

import { taoThucDon, xemThucDon } from './ThucDonService.ts';

const thucDonRoutes = Router();

// Thực đơn của một ngày, ví dụ GET /thuc-don/ngay/2026-10-09
thucDonRoutes.get('/ngay/:ngay', async (request, response) => {
  const thucDon = await xemThucDon(response.locals.userId, request.params.ngay);
  response.json(thucDon);
});

// Tạo (hoặc tạo lại) thực đơn cho một ngày
thucDonRoutes.post('/', async (request, response) => {
  const thucDon = await taoThucDon(response.locals.userId, request.body);
  response.status(201).json(thucDon);
});

export default thucDonRoutes;
