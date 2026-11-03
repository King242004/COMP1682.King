import { Router } from 'express';

import { xemBaoCaoDinhDuong, xemBaoCaoUongNuoc } from './BaoCaoService.ts';

const baoCaoRoutes = Router();

// Lấy báo cáo dinh dưỡng của một khoảng ngày, ví dụ /bao-cao/tu/2026-10-27/den/2026-11-02
baoCaoRoutes.get('/tu/:tuNgay/den/:denNgay', async (request, response) => {
  const baoCao = await xemBaoCaoDinhDuong(response.locals.userId, request.params.tuNgay, request.params.denNgay);
  response.json(baoCao);
});

// Lấy báo cáo uống nước của một khoảng ngày, ví dụ /bao-cao/uong-nuoc/tu/2026-10-26/den/2026-11-01
baoCaoRoutes.get('/uong-nuoc/tu/:tuNgay/den/:denNgay', async (request, response) => {
  const baoCao = await xemBaoCaoUongNuoc(response.locals.userId, request.params.tuNgay, request.params.denNgay);
  response.json(baoCao);
});

export default baoCaoRoutes;
