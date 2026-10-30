-- Từ khóa tiếng Anh (26/10/2026): tên sản phẩm trên Open Food Facts hay viết tiếng Anh, mà phần lớn hàng Việt không có dữ liệu dị ứng trên nhãn nên mã vạch chỉ dò được theo tên (học từ bảng tên tiếng Anh của bản cũ)

-- Lúa mì; trừ bột gạo, bột năng, bột ngô
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('gluten', 'wheat', false), ('gluten', 'flour', false), ('gluten', 'bread', false), ('gluten', 'biscuit', false), ('gluten', 'biscuits', false),
  ('gluten', 'cookie', false), ('gluten', 'cookies', false), ('gluten', 'wafer', false), ('gluten', 'wafers', false), ('gluten', 'pasta', false),
  ('gluten', 'spaghetti', false), ('gluten', 'macaroni', false), ('gluten', 'malt', false), ('gluten', 'barley', false), ('gluten', 'rye', false),
  ('gluten', 'cream cracker', false),
  ('gluten', 'rice flour', true), ('gluten', 'tapioca flour', true), ('gluten', 'corn flour', true), ('gluten', 'rice macaroni', true),
  ('gluten', 'rice pasta', true);

-- Tôm, cua
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('tom_cua', 'shrimp', false), ('tom_cua', 'prawn', false), ('tom_cua', 'prawns', false), ('tom_cua', 'crab', false),
  ('tom_cua', 'lobster', false), ('tom_cua', 'crustacean', false), ('tom_cua', 'crustaceans', false);

-- Trứng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('trung', 'egg', false), ('trung', 'eggs', false), ('trung', 'custard', false);

-- Cá
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('ca', 'fish', false), ('ca', 'anchovy', false), ('ca', 'tuna', false), ('ca', 'salmon', false), ('ca', 'sardine', false),
  ('ca', 'sardines', false), ('ca', 'mackerel', false);

-- Lạc
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('lac', 'peanut', false), ('lac', 'peanuts', false), ('lac', 'groundnut', false);

-- Sữa; trừ sữa và bơ làm từ hạt, dừa, đậu; bánh "cream cracker"; cây "milk thistle"
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('sua', 'milk', false), ('sua', 'cheese', false), ('sua', 'butter', false), ('sua', 'cream', false), ('sua', 'yogurt', false),
  ('sua', 'yoghurt', false), ('sua', 'dairy', false), ('sua', 'lactose', false),
  ('sua', 'coconut milk', true), ('sua', 'soy milk', true), ('sua', 'soya milk', true), ('sua', 'almond milk', true), ('sua', 'oat milk', true),
  ('sua', 'rice milk', true), ('sua', 'peanut butter', true), ('sua', 'cocoa butter', true), ('sua', 'walnut milk', true),
  ('sua', 'cashew milk', true), ('sua', 'cashew butter', true), ('sua', 'almond butter', true), ('sua', 'coconut cream', true),
  ('sua', 'cream cracker', true), ('sua', 'milk thistle', true);

-- Vừng
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('vung', 'sesame', false);

-- Hạt cây
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('hat_cay', 'almond', false), ('hat_cay', 'almonds', false), ('hat_cay', 'cashew', false), ('hat_cay', 'cashews', false),
  ('hat_cay', 'hazelnut', false), ('hat_cay', 'hazelnuts', false), ('hat_cay', 'walnut', false), ('hat_cay', 'walnuts', false),
  ('hat_cay', 'pecan', false), ('hat_cay', 'pecans', false), ('hat_cay', 'pistachio', false), ('hat_cay', 'pistachios', false);

-- Mực, ốc, sò
INSERT INTO tu_khoa_di_ung (nhom_di_ung_ma, tu_khoa, loai_tru) VALUES
  ('nhuyen_the', 'squid', false), ('nhuyen_the', 'octopus', false), ('nhuyen_the', 'oyster', false), ('nhuyen_the', 'oysters', false),
  ('nhuyen_the', 'clam', false), ('nhuyen_the', 'clams', false), ('nhuyen_the', 'mussel', false), ('nhuyen_the', 'mussels', false),
  ('nhuyen_the', 'scallop', false), ('nhuyen_the', 'scallops', false), ('nhuyen_the', 'snail', false), ('nhuyen_the', 'mollusc', false),
  ('nhuyen_the', 'molluscs', false),
  ('nhuyen_the', 'trai cay', true);
