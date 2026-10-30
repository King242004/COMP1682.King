import { Router } from 'express';

import { xemTatCaMon, xemTatCaThucPham, xemThanhPhanSuat } from './TraMonService.ts';

const traMonRoutes = Router();

// Lấy tất cả món Viện Dinh dưỡng đã cân
traMonRoutes.get('/', async (request, response) => {
  const danhSachMon = await xemTatCaMon(response.locals.userId);
  response.json(danhSachMon);
});

// Lấy cả kho thực phẩm Viện Dinh dưỡng 2025
traMonRoutes.get('/thuc-pham', async (request, response) => {
  const danhSachThucPham = await xemTatCaThucPham(response.locals.userId);
  response.json(danhSachThucPham);
});

// Lấy bảng "Trong 1 suất có" của một món, kèm nhóm dị ứng trùng ở từng dòng
traMonRoutes.get('/:maSo/thanh-phan', async (request, response) => {
  const bangThanhPhan = await xemThanhPhanSuat(request.params.maSo, response.locals.userId);
  response.json(bangThanhPhan);
});

export default traMonRoutes;
