-- Uống nước (lát 14, King chốt 03/11/2026): mục tiêu gợi ý theo cân nặng; dữ liệu trong code được dùng nguồn cũ hơn 2021
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nuoc_ml_moi_kg', 35, 'Mỗi kg cân nặng cần bao nhiêu ml nước mỗi ngày (người tới 55 tuổi, lao động trung bình)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nuoc_ml_moi_kg_tren_moc_tuoi', 30, 'Mỗi kg cân nặng cần bao nhiêu ml nước mỗi ngày (người trên 55 tuổi)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nuoc_moc_tuoi', 55, 'Trên tuổi này thì nhu cầu nước tính theo mức của người trên 55 tuổi', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');

-- Cài đặt uống nước của từng người: mỗi lần ghi bao nhiêu ml, mục tiêu tự đặt (trống là dùng gợi ý), có bật nhắc không; giới hạn là lựa chọn giao diện để chặn gõ nhầm
ALTER TABLE nguoi_dung
  ADD COLUMN nuoc_ml_moi_lan INTEGER NOT NULL DEFAULT 250 CHECK (nuoc_ml_moi_lan BETWEEN 50 AND 1000),
  ADD COLUMN muc_tieu_nuoc_ml INTEGER CHECK (muc_tieu_nuoc_ml BETWEEN 500 AND 5000),
  ADD COLUMN nhac_uong_nuoc BOOLEAN NOT NULL DEFAULT false;

-- Tổng ml nước đã uống của mỗi người mỗi ngày
CREATE TABLE uong_nuoc (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  so_ml INTEGER NOT NULL CHECK (so_ml >= 0),
  PRIMARY KEY (nguoi_dung_id, ngay)
);

-- Các giờ nhắc uống nước của mỗi người, mỗi giờ nhắc lặp lại hằng ngày
CREATE TABLE gio_nhac_uong_nuoc (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  gio TIME NOT NULL,
  PRIMARY KEY (nguoi_dung_id, gio)
);
