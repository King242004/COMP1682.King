-- Dị ứng hoặc kiêng ăn người dùng tự gõ (ví dụ "tôm, cua, đậu phộng", "ăn chay"); để trống là không có; chỉ coach dùng
ALTER TABLE nguoi_dung
  ADD COLUMN di_ung_kieng_an TEXT NOT NULL DEFAULT '' CHECK (length(di_ung_kieng_an) <= 200);
