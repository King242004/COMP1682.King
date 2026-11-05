-- Giữ cân (King chốt 06/11/2026): khoảng giữ cân ±3% theo định nghĩa giữ cân của Stevens và cộng sự (2006); số trong code được lấy từ tư liệu trước 2021
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giu_can_ty_le_dao_dong', 0.03, 'Cân thay đổi không quá tỉ lệ này so với cân giữ quanh thì vẫn tính là đang giữ cân', 'Stevens J, Truesdale KP, McClain JE, Cai J (2006). The definition of weight maintenance. International Journal of Obesity 30(3): 391–399', 'https://doi.org/10.1038/sj.ijo.0803175', '2005-11-22');

-- Cân giữ quanh: cân theo xu hướng lúc chuyển sang giữ cân
ALTER TABLE nguoi_dung
  ADD COLUMN can_giu_quanh_kg NUMERIC(5, 2) CHECK (can_giu_quanh_kg BETWEEN 30 AND 300);

-- Người đang giữ cân từ trước: lấy cân trong hồ sơ làm cân giữ quanh
UPDATE nguoi_dung SET can_giu_quanh_kg = can_nang_kg WHERE muc_tieu = 'giu';

-- Có cân giữ quanh khi và chỉ khi mục tiêu là giữ cân (chưa thiết lập hồ sơ thì muc_tieu là null, không bị kiểm)
ALTER TABLE nguoi_dung
  ADD CHECK ((muc_tieu = 'giu') = (can_giu_quanh_kg IS NOT NULL));
