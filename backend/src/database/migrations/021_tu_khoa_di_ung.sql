-- Từ khóa lần 2 (25/10/2026): thêm theo đúng chỗ sót và báo nhầm của Đo 1 lần 1 (NguonSoLieu.md mục 12)

-- Lúa mì: tên viết nhầm "bánh mý", đồ tẩm bột chiên, vỏ ốc quế, nước tương Maggi, bánh gối, bánh tiêu
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'bánh mý', false), ('gluten', 'tẩm bột', false), ('gluten', 'chiên xù', false), ('gluten', 'bột chiên', false),
  ('gluten', 'ốc quế', false), ('gluten', 'magi', false), ('gluten', 'maggi', false), ('gluten', 'bánh gối', false),
  ('gluten', 'bánh tiêu', false);

-- Tôm, cua và mực, ốc: món "hải sản" thường có tôm và mực
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'hải sản', false), ('nhuyen_the', 'hải sản', false);

-- Trứng: chả rươi trộn trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'chả rươi', false);

-- Cá: lươn là cá; "mắm" một mình (ví dụ "muối mắm") thường là nước mắm, trừ mắm tôm, mắm ruốc, mắm tép (làm từ tôm, tép)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'lươn', false), ('ca', 'mắm', false), ('ca', 'mắm tôm', true), ('ca', 'mắm ruốc', true), ('ca', 'mắm tép', true);

-- Sữa: cách viết "pho mai"; "kem trứng" không có sữa
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'pho mai', false), ('sua', 'kem trứng', true);

-- Vừng: bánh tiêu rắc vừng; tên "không vừng" không có vừng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'bánh tiêu', false), ('vung', 'không vừng', true);
