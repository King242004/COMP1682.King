-- Đơn vị người dùng chọn (Mét hoặc Anh-Mỹ) và 4 số đổi; database vẫn lưu kg, cm, g, chỉ đổi lúc hiện và lúc gõ
ALTER TABLE nguoi_dung
  ADD COLUMN don_vi TEXT NOT NULL DEFAULT 'met' CHECK (don_vi IN ('met', 'anh_my'));

-- Cân nặng lưu 2 số lẻ để gõ lb rồi hiện lại không lệch (150 lb = 68,04 kg; lưu 68,0 thì hiện lại 149,9 lb)
ALTER TABLE nguoi_dung ALTER COLUMN can_nang_kg TYPE NUMERIC(5, 2);
ALTER TABLE can_nang ALTER COLUMN can_nang_kg TYPE NUMERIC(5, 2);

-- Số đổi đơn vị, theo bảng đổi của NIST (Mỹ)
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('kg_moi_pound', 0.45359237, '1 pound (lb) = bao nhiêu kg (chính xác)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('cm_moi_inch', 2.54, '1 inch (in) = bao nhiêu cm (chính xác)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('inch_moi_foot', 12, '1 foot (ft) = bao nhiêu inch', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('gam_moi_ounce', 28.349523125, '1 ounce (oz, avoirdupois) = bao nhiêu g (chính xác, bằng 1/16 pound)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01');
