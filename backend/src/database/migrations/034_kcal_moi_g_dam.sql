-- Thêm lại hệ số kcal mỗi gam đạm (011 đã xóa vì nguồn trước 2021) để Báo cáo dinh dưỡng tính % năng lượng từ đạm (King chốt 03/11/2026); dữ liệu trong code được dùng nguồn cũ hơn 2021
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('kcal_moi_g_dam', 4, 'Mỗi gam đạm cho bao nhiêu kcal (hệ số Atwater chung)', 'FAO (2003). Food energy: methods of analysis and conversion factors. FAO Food and Nutrition Paper 77, mục 3.5.1', 'https://www.fao.org/4/y5022e/y5022e04.htm', '2003-01-01');
