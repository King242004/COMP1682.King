import { Router } from 'express';

import { capNhatHoSo, lamMoiMucTieuNeuQuaSinhNhat, xemHoSo, xemLuaChonHoSo } from './HoSoService.ts';

const hoSoRoutes = Router();

// Xem hồ sơ của người đang đăng nhập (qua sinh nhật thì tính lại mục tiêu trước)
hoSoRoutes.get('/', async (request, response) => {
  await lamMoiMucTieuNeuQuaSinhNhat(response.locals.userId);
  const hoSo = await xemHoSo(response.locals.userId);
  response.json(hoSo);
});

// Lấy các lựa chọn cho màn hồ sơ (ngưỡng BMI)
hoSoRoutes.get('/lua-chon', async (request, response) => {
  const luaChon = await xemLuaChonHoSo();
  response.json(luaChon);
});

// Thiết lập lần đầu hoặc sửa hồ sơ
hoSoRoutes.put('/', async (request, response) => {
  const hoSo = await capNhatHoSo(response.locals.userId, request.body);
  response.json(hoSo);
});

export default hoSoRoutes;
