import { Router } from 'express';

import { xemTatCaMon, xemTatCaThucPham, xemThanhPhanSuat } from './TraMonService.ts';

const traMonRoutes = Router();

// Lấy tất cả món Viện Dinh dưỡng đã cân
traMonRoutes.get('/', async (request, response) => {
  const danhSachMon = await xemTatCaMon();
  response.json(danhSachMon);
});

// Lấy cả kho thực phẩm Viện Dinh dưỡng 2025
traMonRoutes.get('/thuc-pham', async (request, response) => {
  const danhSachThucPham = await xemTatCaThucPham();
  response.json(danhSachThucPham);
});

// Lấy bảng "Trong 1 suất có" của một món
traMonRoutes.get('/:maSo/thanh-phan', async (request, response) => {
  const danhSachThanhPhan = await xemThanhPhanSuat(request.params.maSo);
  response.json(danhSachThanhPhan);
});

export default traMonRoutes;
