import { Router } from 'express';

import { lamMoiMucTieuNeuQuaSinhNhat } from '../ho-so/HoSoService.ts';
import { xemLoTrinh } from './LoTrinhService.ts';

const loTrinhRoutes = Router();

// Xem lộ trình của người đang đăng nhập (qua sinh nhật thì tính lại mục tiêu trước, như xem hồ sơ)
loTrinhRoutes.get('/', async (request, response) => {
  await lamMoiMucTieuNeuQuaSinhNhat(response.locals.userId);
  const loTrinh = await xemLoTrinh(response.locals.userId);
  response.json(loTrinh);
});

export default loTrinhRoutes;
