-- Nhóm dị ứng người dùng tick được ở hồ sơ; 8 nhóm theo Codex 2024, nhóm mực ốc theo EU (King chốt 25/10/2026)
CREATE TABLE nhom_di_ung (
  ma TEXT PRIMARY KEY,
  ten TEXT NOT NULL,
  thu_tu INTEGER NOT NULL UNIQUE,
  ma_open_food_facts TEXT NOT NULL UNIQUE,
  nguon TEXT NOT NULL,
  lien_ket TEXT NOT NULL,
  ngay_hieu_luc DATE NOT NULL
);

INSERT INTO nhom_di_ung (ma, ten, thu_tu, ma_open_food_facts, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('gluten', 'Lúa mì, bột mì (gluten)', 1, 'en:gluten', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('tom_cua', 'Tôm, cua', 2, 'en:crustaceans', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('trung', 'Trứng', 3, 'en:eggs', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('ca', 'Cá', 4, 'en:fish', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('lac', 'Lạc (đậu phộng)', 5, 'en:peanuts', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('sua', 'Sữa', 6, 'en:milk', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('vung', 'Vừng (mè)', 7, 'en:sesame-seeds', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('hat_cay', 'Hạt điều, óc chó, hạnh nhân…', 8, 'en:nuts', 'Codex Alimentarius, CXS 1-1985 General Standard for the Labelling of Prepackaged Foods, mục 4.2.1.4, bản sửa thông qua tại CAC47 (25-30/11/2024). Đọc qua bài tóm tắt của ChemLinked, chưa đọc bản gốc; ngày hiệu lực là ngày cuối khóa họp', 'https://food.chemlinked.com/news/food-news/cac-proposes-to-revise-the-general-standard-for-the-labeling-of-prepackaged-food-involving-allergen-labeling', '2024-11-30'),
  ('nhuyen_the', 'Mực, ốc, sò, hến', 9, 'en:molluscs', 'Regulation (EU) No 1169/2011 ngày 25/10/2011 về thông tin thực phẩm cho người tiêu dùng, Phụ lục II mục 14 "Molluscs and products thereof"; áp dụng từ 13/12/2014 (Điều 55)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011R1169', '2014-12-13');

-- Từ khóa của từng nhóm (MealMate tự lập, lần 1 viết ngày 25/10/2026 khi chưa đọc dữ liệu món); loai_tru = true là xóa từ đó khỏi tên trước khi dò
CREATE TABLE tu_khoa_di_ung (
  nhom_di_ung_ma TEXT NOT NULL REFERENCES nhom_di_ung (ma),
  tu_khoa TEXT NOT NULL CHECK (tu_khoa = lower(tu_khoa) AND tu_khoa = trim(tu_khoa) AND tu_khoa <> ''),
  loai_tru BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (nhom_di_ung_ma, tu_khoa)
);

-- Lúa mì, bột mì (gluten)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'lúa mì', false), ('gluten', 'lúa mạch', false), ('gluten', 'đại mạch', false),
  ('gluten', 'bột mì', false), ('gluten', 'bột mỳ', false), ('gluten', 'mì', false), ('gluten', 'mỳ', false),
  ('gluten', 'bánh mì', false), ('gluten', 'bánh mỳ', false), ('gluten', 'bánh bao', false), ('gluten', 'quẩy', false),
  ('gluten', 'bánh quy', false), ('gluten', 'bánh bông lan', false), ('gluten', 'bánh gato', false), ('gluten', 'bánh kem', false),
  ('gluten', 'bánh su', false), ('gluten', 'pizza', false), ('gluten', 'hamburger', false), ('gluten', 'sandwich', false),
  ('gluten', 'crepe', false), ('gluten', 'nui', false), ('gluten', 'mì ống', false), ('gluten', 'mì ý', false),
  ('gluten', 'xì dầu', false), ('gluten', 'nước tương', false), ('gluten', 'dầu hào', false),
  ('gluten', 'bột chiên xù', false), ('gluten', 'bột chiên giòn', false),
  ('gluten', 'mì chính', true), ('gluten', 'mỳ chính', true), ('gluten', 'mì gạo', true);

-- Tôm, cua
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'tôm', false), ('tom_cua', 'tép', false), ('tom_cua', 'cua', false), ('tom_cua', 'ghẹ', false),
  ('tom_cua', 'tôm hùm', false), ('tom_cua', 'bề bề', false), ('tom_cua', 'mắm ruốc', false),
  ('tom_cua', 'thanh cua', true);

-- Trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'trứng', false), ('trung', 'mayonnaise', false), ('trung', 'bánh flan', false), ('trung', 'caramen', false),
  ('trung', 'bánh bông lan', false),
  ('trung', 'trứng cá', true);

-- Cá
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'cá', false), ('ca', 'nước mắm', false), ('ca', 'mắm nêm', false), ('ca', 'mắm cá', false),
  ('ca', 'trứng cá', false), ('ca', 'thanh cua', false), ('ca', 'dầu cá', false),
  ('ca', 'diếp cá', true);

-- Lạc (đậu phộng)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'lạc', false), ('lac', 'đậu phộng', false), ('lac', 'dầu lạc', false);

-- Sữa
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'sữa', false), ('sua', 'bơ', false), ('sua', 'phô mai', false), ('sua', 'pho mát', false),
  ('sua', 'phomai', false), ('sua', 'kem', false), ('sua', 'váng sữa', false), ('sua', 'whey', false),
  ('sua', 'bánh flan', false), ('sua', 'caramen', false),
  ('sua', 'quả bơ', true), ('sua', 'trái bơ', true), ('sua', 'sinh tố bơ', true), ('sua', 'vú sữa', true),
  ('sua', 'sữa đậu nành', true), ('sua', 'sữa đậu', true), ('sua', 'sữa hạt', true), ('sua', 'sữa gạo', true),
  ('sua', 'sữa dừa', true), ('sua', 'bơ lạc', true), ('sua', 'bơ đậu phộng', true);

-- Vừng (mè)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'vừng', false), ('vung', 'mè', false);

-- Hạt điều, óc chó, hạnh nhân…
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('hat_cay', 'hạnh nhân', false), ('hat_cay', 'hạt điều', false), ('hat_cay', 'hạt phỉ', false), ('hat_cay', 'hồ đào', false),
  ('hat_cay', 'dẻ cười', false), ('hat_cay', 'hồ trăn', false), ('hat_cay', 'óc chó', false);

-- Mực, ốc, sò, hến
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'mực', false), ('nhuyen_the', 'ốc', false), ('nhuyen_the', 'sò', false), ('nhuyen_the', 'hến', false),
  ('nhuyen_the', 'trai', false), ('nhuyen_the', 'ngao', false), ('nhuyen_the', 'nghêu', false), ('nhuyen_the', 'sò điệp', false),
  ('nhuyen_the', 'hàu', false), ('nhuyen_the', 'bạch tuộc', false), ('nhuyen_the', 'bào ngư', false), ('nhuyen_the', 'dầu hào', false),
  ('nhuyen_the', 'ốc quế', true);

-- Mỗi người chọn được nhiều nhóm; xóa tài khoản thì xóa luôn các dòng này
CREATE TABLE nguoi_dung_nhom_di_ung (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  nhom_di_ung_ma TEXT NOT NULL REFERENCES nhom_di_ung (ma),
  PRIMARY KEY (nguoi_dung_id, nhom_di_ung_ma)
);
