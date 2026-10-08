-- Cân nặng người dùng ghi theo ngày; mỗi ngày một dòng, ghi lại trong ngày thì đè; giới hạn giống hồ sơ (004_ho_so.sql)
CREATE TABLE can_nang (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  can_nang_kg NUMERIC(4, 1) NOT NULL CHECK (can_nang_kg BETWEEN 30 AND 300),
  UNIQUE (nguoi_dung_id, ngay)
);

-- Tốc độ giảm cân nên có, để so với tốc độ thật của người đang giảm cân
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giam_can_kg_moi_thang_thap', 2, 'Giảm cân nên được ít nhất bao nhiêu kg mỗi tháng', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân: "Mục tiêu là giảm cân từ từ khoảng 2 - 3 kg/tháng"', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kg_moi_thang_cao', 3, 'Giảm cân không nên nhanh hơn bao nhiêu kg mỗi tháng', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân: "Mục tiêu là giảm cân từ từ khoảng 2 - 3 kg/tháng"', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22');
