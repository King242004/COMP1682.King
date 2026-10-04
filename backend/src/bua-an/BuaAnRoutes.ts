import { Router } from 'express';

import { boBuaAn, capNhatBuaAn, ghiBuaAn, xemMonHayAn, xemMotBuaAn, xemNhatKyNgay } from './BuaAnService.ts';

const buaAnRoutes = Router();

// Nhật ký một ngày cho trang chủ, ví dụ GET /bua-an/ngay/2026-10-04
buaAnRoutes.get('/ngay/:ngay', async (request, response) => {
  const nhatKy = await xemNhatKyNgay(response.locals.userId, request.params.ngay);
  response.json(nhatKy);
});

// Các món người dùng hay ăn
buaAnRoutes.get('/hay-an', async (request, response) => {
  const danhSach = await xemMonHayAn(response.locals.userId);
  response.json(danhSach);
});

// Một món, để mở màn sửa
buaAnRoutes.get('/:id', async (request, response) => {
  const buaAn = await xemMotBuaAn(response.locals.userId, request.params.id);
  response.json(buaAn);
});

// Thêm một món
buaAnRoutes.post('/', async (request, response) => {
  const buaAn = await ghiBuaAn(response.locals.userId, request.body);
  response.status(201).json(buaAn);
});

// Sửa một món
buaAnRoutes.put('/:id', async (request, response) => {
  const buaAn = await capNhatBuaAn(response.locals.userId, request.params.id, request.body);
  response.json(buaAn);
});

// Xóa một món
buaAnRoutes.delete('/:id', async (request, response) => {
  await boBuaAn(response.locals.userId, request.params.id);
  response.status(204).end();
});

export default buaAnRoutes;
