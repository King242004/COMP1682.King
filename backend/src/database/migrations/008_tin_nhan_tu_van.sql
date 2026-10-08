-- Tin nhắn giữa người dùng và coach; xóa tài khoản thì xóa luôn
CREATE TABLE tin_nhan_tu_van (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  vai_tro TEXT NOT NULL CHECK (vai_tro IN ('nguoi_dung', 'coach')),
  -- Câu hỏi tối đa 500 ký tự (kiểm ở Service); 2000 là giới hạn chung để chặn câu trả lời quá dài
  noi_dung TEXT NOT NULL CHECK (length(trim(noi_dung)) > 0 AND length(noi_dung) <= 2000),
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Màn Coach luôn lấy tin nhắn theo người dùng, mới nhất trước
CREATE INDEX tin_nhan_tu_van_nguoi_dung ON tin_nhan_tu_van (nguoi_dung_id, id);
