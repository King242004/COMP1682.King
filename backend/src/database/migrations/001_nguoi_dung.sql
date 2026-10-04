-- Tài khoản người dùng
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  ten_hien_thi TEXT NOT NULL CHECK (length(trim(ten_hien_thi)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  mat_khau_bam TEXT NOT NULL,
  -- Tăng lên khi đổi mật khẩu, mọi token cũ hết dùng được
  phien_ban_token INTEGER NOT NULL DEFAULT 1,
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now()
);
