import { Router } from 'express';

import { capNhatHoSo, xemHoSo, xemLuaChonHoSo } from './HoSoService.ts';

const hoSoRoutes = Router();

// Xem hồ sơ của người đang đăng nhập
hoSoRoutes.get('/', async (request, response) => {
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
