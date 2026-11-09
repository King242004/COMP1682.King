import { Router } from 'express';

import { xemLoTrinh } from './LoTrinhService.ts';

const loTrinhRoutes = Router();

// Xem lộ trình của người đang đăng nhập
loTrinhRoutes.get('/', async (request, response) => {
  const loTrinh = await xemLoTrinh(response.locals.userId);
  response.json(loTrinh);
});

export default loTrinhRoutes;
