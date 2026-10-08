import { Router } from 'express';

import { ghiCanNang, xemTienDo } from './TienDoService.ts';

const tienDoRoutes = Router();

// Lấy tiến độ tính tới một ngày, ví dụ /tien-do/ngay/2026-10-06
tienDoRoutes.get('/ngay/:ngay', async (request, response) => {
  const tienDo = await xemTienDo(response.locals.userId, request.params.ngay);
  response.json(tienDo);
});

// Ghi cân của một ngày (ghi lại trong ngày thì đè), trả về tiến độ mới
tienDoRoutes.put('/can-nang', async (request, response) => {
  const tienDo = await ghiCanNang(response.locals.userId, request.body);
  response.json(tienDo);
});

export default tienDoRoutes;
