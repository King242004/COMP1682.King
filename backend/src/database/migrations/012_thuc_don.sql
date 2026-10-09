-- Thực đơn một ngày do AI gợi ý; mỗi người mỗi ngày một dòng, tạo lại thì ghi đè
CREATE TABLE thuc_don (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  -- Danh sách món đã kiểm (bữa, cách ăn, tên, khẩu phần, số liệu, nguyên liệu, cách nấu), lưu nguyên dạng JSON
  mon JSONB NOT NULL,
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nguoi_dung_id, ngay)
);
