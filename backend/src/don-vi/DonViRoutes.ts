import { Router } from 'express';

import { capNhatDonVi, xemDonVi } from './DonViService.ts';

const donViRoutes = Router();

// Xem đơn vị đang chọn và 4 số đổi
donViRoutes.get('/', async (request, response) => {
  const donVi = await xemDonVi(response.locals.userId);
  response.json(donVi);
});

// Đổi đơn vị
donViRoutes.put('/', async (request, response) => {
  const donVi = await capNhatDonVi(response.locals.userId, request.body);
  response.json(donVi);
});

export default donViRoutes;
