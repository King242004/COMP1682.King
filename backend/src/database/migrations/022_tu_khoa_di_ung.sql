-- Từ khóa lần 3 (25/10/2026): thêm theo chỗ sót và báo nhầm khi đo trên kho thực phẩm (dữ liệu chưa xem, NguonSoLieu.md mục 12)

-- Lúa mì: bánh làm từ bột mì mà tên không có chữ "bột mì"
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'bích quy', false), ('gluten', 'bích cốt', false), ('gluten', 'bánh quế', false), ('gluten', 'bánh gấu', false),
  ('gluten', 'chocopie', false), ('gluten', 'bánh trứng nhện', false), ('gluten', 'custas', false), ('gluten', 'bánh con cá', false),
  ('gluten', 'bánh chả', false), ('gluten', 'bánh nướng', false), ('gluten', 'đậu phộng da cá', false), ('gluten', 'milo', false),
  ('gluten', 'bánh sô cô la', false);

-- Tôm, cua: rạm, cáy là cua nhỏ; bánh khoái có tôm
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'rạm', false), ('tom_cua', 'cáy', false), ('tom_cua', 'bánh khoái', false);

-- Trứng: bánh có trứng mà tên không có chữ "trứng"; "đậu trứng cuốc", "quả trứng gà" không phải trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'chocopie', false), ('trung', 'bánh khoái', false), ('trung', 'bánh nướng', false),
  ('trung', 'trứng cuốc', true), ('trung', 'quả trứng gà', true);

-- Cá: "bánh con cá", "đậu phộng da cá", "rau giấp cá" không phải cá
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'bánh con cá', true), ('ca', 'đậu phộng da cá', true), ('ca', 'giấp cá', true);

-- Lạc: bún bò Nam Bộ rắc lạc
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'bún bò nam bộ', false);

-- Sữa: cách viết "phó mát", bánh có sữa, chè Thái; sữa mẹ và sữa bột đậu nành không phải sữa động vật
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'phó mát', false), ('sua', 'chocopie', false), ('sua', 'bánh gấu', false), ('sua', 'custas', false), ('sua', 'chè thái', false),
  ('sua', 'bánh sô cô la', false), ('sua', 'sữa mẹ', true), ('sua', 'sữa người', true), ('sua', 'sữa bột đậu nành', true);

-- Vừng: bánh gai rắc vừng; "cá mè" là cá, không phải vừng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'bánh gai', false), ('vung', 'cá mè', true);

-- Mực, ốc, sò: trai trùng trục, tu hài
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'trùng trục', false), ('nhuyen_the', 'tu hài', false);
