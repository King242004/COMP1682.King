import { Router } from 'express';

import { nhanMonTuAnh, traMaVach, uocTinhTheoMoTa, uocTinhTheoTen } from './QuetMonService.ts';

const quetMonRoutes = Router();

// Ước tính số liệu theo tên món và khẩu phần
quetMonRoutes.post('/ten', async (request, response) => {
  const ketQua = await uocTinhTheoTen(request.body, response.locals.userId);
  response.json(ketQua);
});

// Ước tính số liệu từ câu người dùng tả bữa vừa ăn
quetMonRoutes.post('/mo-ta', async (request, response) => {
  const ketQua = await uocTinhTheoMoTa(request.body, response.locals.userId);
  response.json(ketQua);
});

// Nhận món từ ảnh chụp
quetMonRoutes.post('/anh', async (request, response) => {
  const ketQua = await nhanMonTuAnh(request.body, response.locals.userId);
  response.json(ketQua);
});

// Tra mã vạch sản phẩm đóng gói
quetMonRoutes.get('/ma-vach/:ma', async (request, response) => {
  const sanPham = await traMaVach(request.params.ma, response.locals.userId);
  response.json(sanPham);
});

export default quetMonRoutes;
