import { Router } from 'express';

import { timMon } from './TraMonService.ts';

const traMonRoutes = Router();

// Tìm món theo từ khóa, ví dụ GET /tra-mon?tu-khoa=pho bo
traMonRoutes.get('/', async (request, response) => {
  const danhSachMon = await timMon(request.query['tu-khoa']);
  response.json(danhSachMon);
});

export default traMonRoutes;
