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

-- 9 nhóm, xếp theo thứ tự hiện ở hồ sơ
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

-- Từ khóa của từng nhóm (MealMate tự lập, thêm dần theo kết quả đo ở NguonSoLieu.md mục 12); loai_tru = true là xóa từ đó khỏi tên trước khi dò
CREATE TABLE tu_khoa_di_ung (
  nhom_di_ung_ma TEXT NOT NULL REFERENCES nhom_di_ung (ma),
  tu_khoa TEXT NOT NULL CHECK (tu_khoa = lower(tu_khoa) AND tu_khoa = trim(tu_khoa) AND tu_khoa <> ''),
  loai_tru BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (nhom_di_ung_ma, tu_khoa)
);

-- Lúa mì, bột mì (gluten)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'lúa mì', false), ('gluten', 'lúa mạch', false), ('gluten', 'đại mạch', false), ('gluten', 'bột mì', false),
  ('gluten', 'bột mỳ', false), ('gluten', 'mì', false), ('gluten', 'mỳ', false), ('gluten', 'bánh mì', false),
  ('gluten', 'bánh mỳ', false), ('gluten', 'bánh bao', false), ('gluten', 'quẩy', false), ('gluten', 'bánh quy', false),
  ('gluten', 'bánh bông lan', false), ('gluten', 'bánh gato', false), ('gluten', 'bánh kem', false), ('gluten', 'bánh su', false),
  ('gluten', 'pizza', false), ('gluten', 'hamburger', false), ('gluten', 'sandwich', false), ('gluten', 'crepe', false),
  ('gluten', 'nui', false), ('gluten', 'mì ống', false), ('gluten', 'mì ý', false), ('gluten', 'xì dầu', false),
  ('gluten', 'nước tương', false), ('gluten', 'dầu hào', false), ('gluten', 'bột chiên xù', false), ('gluten', 'bột chiên giòn', false),
  ('gluten', 'mì chính', true), ('gluten', 'mỳ chính', true), ('gluten', 'mì gạo', true);

-- Lúa mì: tên viết nhầm "bánh mý", đồ tẩm bột chiên, vỏ ốc quế, nước tương Maggi, bánh gối, bánh tiêu
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'bánh mý', false), ('gluten', 'tẩm bột', false), ('gluten', 'chiên xù', false), ('gluten', 'bột chiên', false),
  ('gluten', 'ốc quế', false), ('gluten', 'magi', false), ('gluten', 'maggi', false), ('gluten', 'bánh gối', false),
  ('gluten', 'bánh tiêu', false);

-- Lúa mì: bánh làm từ bột mì mà tên không có chữ "bột mì"
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'bích quy', false), ('gluten', 'bích cốt', false), ('gluten', 'bánh quế', false), ('gluten', 'bánh gấu', false),
  ('gluten', 'chocopie', false), ('gluten', 'bánh trứng nhện', false), ('gluten', 'custas', false), ('gluten', 'bánh con cá', false),
  ('gluten', 'bánh chả', false), ('gluten', 'bánh nướng', false), ('gluten', 'đậu phộng da cá', false), ('gluten', 'milo', false),
  ('gluten', 'bánh sô cô la', false);

-- Lúa mì (tên tiếng Anh, cho tên sản phẩm mã vạch); trừ bột gạo, bột năng, bột ngô
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'wheat', false), ('gluten', 'flour', false), ('gluten', 'bread', false), ('gluten', 'biscuit', false),
  ('gluten', 'biscuits', false), ('gluten', 'cookie', false), ('gluten', 'cookies', false), ('gluten', 'wafer', false),
  ('gluten', 'wafers', false), ('gluten', 'pasta', false), ('gluten', 'spaghetti', false), ('gluten', 'macaroni', false),
  ('gluten', 'malt', false), ('gluten', 'barley', false), ('gluten', 'rye', false), ('gluten', 'cream cracker', false),
  ('gluten', 'rice flour', true), ('gluten', 'tapioca flour', true), ('gluten', 'corn flour', true), ('gluten', 'rice macaroni', true),
  ('gluten', 'rice pasta', true);

-- Tôm, cua
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'tôm', false), ('tom_cua', 'tép', false), ('tom_cua', 'cua', false), ('tom_cua', 'ghẹ', false),
  ('tom_cua', 'tôm hùm', false), ('tom_cua', 'bề bề', false), ('tom_cua', 'mắm ruốc', false), ('tom_cua', 'thanh cua', true);

-- Tôm, cua và mực, ốc: món "hải sản" thường có tôm và mực
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'hải sản', false);

-- Tôm, cua: rạm, cáy là cua nhỏ; bánh khoái có tôm
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'rạm', false), ('tom_cua', 'cáy', false), ('tom_cua', 'bánh khoái', false);

-- Tôm, cua (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'shrimp', false), ('tom_cua', 'prawn', false), ('tom_cua', 'prawns', false), ('tom_cua', 'crab', false),
  ('tom_cua', 'lobster', false), ('tom_cua', 'crustacean', false), ('tom_cua', 'crustaceans', false);

-- Trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'trứng', false), ('trung', 'mayonnaise', false), ('trung', 'bánh flan', false), ('trung', 'caramen', false),
  ('trung', 'bánh bông lan', false), ('trung', 'trứng cá', true);

-- Trứng: chả rươi trộn trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'chả rươi', false);

-- Trứng: bánh có trứng mà tên không có chữ "trứng"; "đậu trứng cuốc", "quả trứng gà" không phải trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'chocopie', false), ('trung', 'bánh khoái', false), ('trung', 'bánh nướng', false), ('trung', 'trứng cuốc', true),
  ('trung', 'quả trứng gà', true);

-- Trứng (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'egg', false), ('trung', 'eggs', false), ('trung', 'custard', false);

-- Cá
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'cá', false), ('ca', 'nước mắm', false), ('ca', 'mắm nêm', false), ('ca', 'mắm cá', false),
  ('ca', 'trứng cá', false), ('ca', 'thanh cua', false), ('ca', 'dầu cá', false), ('ca', 'diếp cá', true);

-- Cá: lươn là cá; "mắm" một mình (ví dụ "muối mắm") thường là nước mắm, trừ mắm tôm, mắm ruốc, mắm tép (làm từ tôm, tép)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'lươn', false), ('ca', 'mắm', false), ('ca', 'mắm tôm', true), ('ca', 'mắm ruốc', true),
  ('ca', 'mắm tép', true);

-- Cá: "bánh con cá", "đậu phộng da cá", "rau giấp cá" không phải cá
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'bánh con cá', true), ('ca', 'đậu phộng da cá', true), ('ca', 'giấp cá', true);

-- Cá (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'fish', false), ('ca', 'anchovy', false), ('ca', 'tuna', false), ('ca', 'salmon', false),
  ('ca', 'sardine', false), ('ca', 'sardines', false), ('ca', 'mackerel', false);

-- Cá: "nước chấm" tính là có cá, cảnh báo thừa còn hơn bỏ sót
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'nước chấm', false);

-- Lạc (đậu phộng)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'lạc', false), ('lac', 'đậu phộng', false), ('lac', 'dầu lạc', false);

-- Lạc: bún bò Nam Bộ rắc lạc
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'bún bò nam bộ', false);

-- Lạc (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'peanut', false), ('lac', 'peanuts', false), ('lac', 'groundnut', false);

-- Sữa
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'sữa', false), ('sua', 'bơ', false), ('sua', 'phô mai', false), ('sua', 'pho mát', false),
  ('sua', 'phomai', false), ('sua', 'kem', false), ('sua', 'váng sữa', false), ('sua', 'whey', false),
  ('sua', 'bánh flan', false), ('sua', 'caramen', false), ('sua', 'quả bơ', true), ('sua', 'trái bơ', true),
  ('sua', 'sinh tố bơ', true), ('sua', 'vú sữa', true), ('sua', 'sữa đậu nành', true), ('sua', 'sữa đậu', true),
  ('sua', 'sữa hạt', true), ('sua', 'sữa gạo', true), ('sua', 'sữa dừa', true), ('sua', 'bơ lạc', true),
  ('sua', 'bơ đậu phộng', true);

-- Sữa: cách viết "pho mai"; "kem trứng" không có sữa
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'pho mai', false), ('sua', 'kem trứng', true);

-- Sữa: cách viết "phó mát", bánh có sữa, chè Thái; sữa mẹ và sữa bột đậu nành không phải sữa động vật
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'phó mát', false), ('sua', 'chocopie', false), ('sua', 'bánh gấu', false), ('sua', 'custas', false),
  ('sua', 'chè thái', false), ('sua', 'bánh sô cô la', false), ('sua', 'sữa mẹ', true), ('sua', 'sữa người', true),
  ('sua', 'sữa bột đậu nành', true);

-- Sữa (tên tiếng Anh, cho tên sản phẩm mã vạch); trừ sữa và bơ làm từ hạt, dừa, đậu; bánh "cream cracker"; cây "milk thistle"
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'milk', false), ('sua', 'cheese', false), ('sua', 'butter', false), ('sua', 'cream', false),
  ('sua', 'yogurt', false), ('sua', 'yoghurt', false), ('sua', 'dairy', false), ('sua', 'lactose', false),
  ('sua', 'coconut milk', true), ('sua', 'soy milk', true), ('sua', 'soya milk', true), ('sua', 'almond milk', true),
  ('sua', 'oat milk', true), ('sua', 'rice milk', true), ('sua', 'peanut butter', true), ('sua', 'cocoa butter', true),
  ('sua', 'walnut milk', true), ('sua', 'cashew milk', true), ('sua', 'cashew butter', true), ('sua', 'almond butter', true),
  ('sua', 'coconut cream', true), ('sua', 'cream cracker', true), ('sua', 'milk thistle', true);

-- Vừng (mè)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'vừng', false), ('vung', 'mè', false);

-- Vừng: bánh tiêu rắc vừng; tên "không vừng" không có vừng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'bánh tiêu', false), ('vung', 'không vừng', true);

-- Vừng: bánh gai rắc vừng; "cá mè" là cá, không phải vừng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'bánh gai', false), ('vung', 'cá mè', true);

-- Vừng (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'sesame', false);

-- Hạt điều, óc chó, hạnh nhân…
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('hat_cay', 'hạnh nhân', false), ('hat_cay', 'hạt điều', false), ('hat_cay', 'hạt phỉ', false), ('hat_cay', 'hồ đào', false),
  ('hat_cay', 'dẻ cười', false), ('hat_cay', 'hồ trăn', false), ('hat_cay', 'óc chó', false);

-- Hạt cây (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('hat_cay', 'almond', false), ('hat_cay', 'almonds', false), ('hat_cay', 'cashew', false), ('hat_cay', 'cashews', false),
  ('hat_cay', 'hazelnut', false), ('hat_cay', 'hazelnuts', false), ('hat_cay', 'walnut', false), ('hat_cay', 'walnuts', false),
  ('hat_cay', 'pecan', false), ('hat_cay', 'pecans', false), ('hat_cay', 'pistachio', false), ('hat_cay', 'pistachios', false);

-- Mực, ốc, sò, hến
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'mực', false), ('nhuyen_the', 'ốc', false), ('nhuyen_the', 'sò', false), ('nhuyen_the', 'hến', false),
  ('nhuyen_the', 'trai', false), ('nhuyen_the', 'ngao', false), ('nhuyen_the', 'nghêu', false), ('nhuyen_the', 'sò điệp', false),
  ('nhuyen_the', 'hàu', false), ('nhuyen_the', 'bạch tuộc', false), ('nhuyen_the', 'bào ngư', false), ('nhuyen_the', 'dầu hào', false),
  ('nhuyen_the', 'ốc quế', true);

-- Tôm, cua và mực, ốc: món "hải sản" thường có tôm và mực
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'hải sản', false);

-- Mực, ốc, sò: trai trùng trục, tu hài
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'trùng trục', false), ('nhuyen_the', 'tu hài', false);

-- Mực, ốc, sò (tên tiếng Anh, cho tên sản phẩm mã vạch)
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'squid', false), ('nhuyen_the', 'octopus', false), ('nhuyen_the', 'oyster', false), ('nhuyen_the', 'oysters', false),
  ('nhuyen_the', 'clam', false), ('nhuyen_the', 'clams', false), ('nhuyen_the', 'mussel', false), ('nhuyen_the', 'mussels', false),
  ('nhuyen_the', 'scallop', false), ('nhuyen_the', 'scallops', false), ('nhuyen_the', 'snail', false), ('nhuyen_the', 'mollusc', false),
  ('nhuyen_the', 'molluscs', false), ('nhuyen_the', 'trai cay', true);

-- Mỗi người chọn được nhiều nhóm; xóa tài khoản thì xóa luôn các dòng này
CREATE TABLE nguoi_dung_nhom_di_ung (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  nhom_di_ung_ma TEXT NOT NULL REFERENCES nhom_di_ung (ma),
  PRIMARY KEY (nguoi_dung_id, nhom_di_ung_ma)
);
