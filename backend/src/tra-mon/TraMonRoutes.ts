import { Router } from 'express';

import { xemTatCaMon } from './TraMonService.ts';

const traMonRoutes = Router();

// Lấy tất cả món Viện Dinh dưỡng đã cân
traMonRoutes.get('/', async (request, response) => {
  const danhSachMon = await xemTatCaMon();
  response.json(danhSachMon);
});

export default traMonRoutes;
