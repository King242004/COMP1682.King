-- Tốc độ giảm cân người dùng chọn (King chốt 11/11/2026): Vừa 2 kg/tháng hoặc Nhanh 3 kg/tháng, đúng khoảng "2 - 3 kg/tháng" của QĐ 2892
ALTER TABLE nguoi_dung
  ADD COLUMN toc_do_giam_can TEXT CHECK (toc_do_giam_can IN ('vua', 'nhanh'));

-- Người đang giảm cân lấy tốc độ Vừa, nên mục tiêu calo không đổi (Vừa cắt 500 kcal như trước)
UPDATE nguoi_dung SET toc_do_giam_can = 'vua' WHERE muc_tieu = 'giam';

-- Có tốc độ khi và chỉ khi mục tiêu là giảm cân (chưa thiết lập hồ sơ thì muc_tieu là null, không bị kiểm)
ALTER TABLE nguoi_dung
  ADD CHECK ((muc_tieu = 'giam') = (toc_do_giam_can IS NOT NULL));

-- Đổi số kg giảm mỗi tháng ra số kcal bớt mỗi ngày; thay cho mức cắt cố định 500 kcal
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giam_can_kcal_bot_cho_moi_kg', 250, 'Giảm cân: mỗi 1 kg giảm trong một tháng ứng với bớt bao nhiêu kcal mỗi ngày. Suy theo tỉ lệ từ Bảng 5: bớt 500 kcal mỗi ngày giảm khoảng 0,5 kg mỗi tuần, tức khoảng 2 kg mỗi tháng; đây là giả định, cơ thể giảm tiêu hao khi sụt cân', 'Kim KK và cộng sự (2023). Evaluation and Treatment of Obesity and Its Comorbidities: 2022 Update of Clinical Practice Guidelines for Obesity by the Korean Society for the Study of Obesity. J Obes Metab Syndr 32(1):1-24, Bảng 5', 'https://doi.org/10.7570/jomes23016', '2023-03-22');

DELETE FROM quy_dinh WHERE ma = 'giam_can_kcal_cat_toi_da';
