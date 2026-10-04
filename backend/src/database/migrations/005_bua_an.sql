-- Mỗi dòng là một món đã ăn; số liệu là tổng của khẩu phần đã ăn
CREATE TABLE bua_an (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  loai_bua TEXT NOT NULL CHECK (loai_bua IN ('sang', 'trua', 'toi', 'phu')),
  ten_mon TEXT NOT NULL CHECK (length(trim(ten_mon)) > 0),
  -- Khẩu phần mô tả bằng chữ, ví dụ "2 chén", "1 tô nhỏ", "150 g"; để trống được
  khau_phan TEXT NOT NULL DEFAULT '',
  -- Giới hạn trên 10000 kcal là để chặn gõ nhầm, không phải luật dinh dưỡng
  so_calo INTEGER NOT NULL CHECK (so_calo BETWEEN 0 AND 10000),
  -- Đạm, tinh bột, béo không bắt buộc: NULL là chưa có số liệu
  dam_g NUMERIC(6, 1) CHECK (dam_g >= 0),
  tinh_bot_g NUMERIC(6, 1) CHECK (tinh_bot_g >= 0),
  beo_g NUMERIC(6, 1) CHECK (beo_g >= 0),
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trang chủ luôn lấy món theo người dùng và ngày, nên đánh chỉ mục cho nhanh
CREATE INDEX bua_an_nguoi_dung_ngay ON bua_an (nguoi_dung_id, ngay);
