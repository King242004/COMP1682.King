-- Danh sách bệnh nền người dùng chọn được. Ngưỡng cảnh báo món ăn thêm ở lát 4
CREATE TABLE benh_nen (
  ma TEXT PRIMARY KEY,
  ten TEXT NOT NULL
);

INSERT INTO benh_nen (ma, ten) VALUES
  ('tieu_duong', 'Tiểu đường'),
  ('cao_huyet_ap', 'Cao huyết áp'),
  ('gout', 'Gout'),
  ('mo_mau_cao', 'Mỡ máu cao');

-- Mỗi người có thể có nhiều bệnh nền; xóa tài khoản thì xóa luôn các dòng này
CREATE TABLE nguoi_dung_benh_nen (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  benh_nen_ma TEXT NOT NULL REFERENCES benh_nen (ma),
  PRIMARY KEY (nguoi_dung_id, benh_nen_ma)
);
