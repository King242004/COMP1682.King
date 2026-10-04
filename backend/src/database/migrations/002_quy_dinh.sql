-- Các con số app dùng để tính, mỗi số kèm nguồn và ngày bắt đầu có hiệu lực.
-- Nguồn đổi số thì thêm dòng mới với ngày hiệu lực mới, không sửa dòng cũ.

-- Một con số đơn lẻ, tra theo mã
CREATE TABLE quy_dinh (
  id SERIAL PRIMARY KEY,
  ma TEXT NOT NULL,
  gia_tri NUMERIC NOT NULL,
  mo_ta TEXT NOT NULL,
  nguon TEXT NOT NULL,
  lien_ket TEXT,
  ngay_hieu_luc DATE NOT NULL,
  UNIQUE (ma, ngay_hieu_luc)
);

-- Chuyển hóa cơ bản (kcal cho mỗi kg cân nặng mỗi ngày) theo giới và nhóm tuổi
CREATE TABLE chuyen_hoa_co_ban (
  id SERIAL PRIMARY KEY,
  gioi_tinh TEXT NOT NULL CHECK (gioi_tinh IN ('nam', 'nu')),
  tuoi_tu INTEGER NOT NULL,
  -- NULL nghĩa là không giới hạn trên (nhóm 70 tuổi trở lên)
  tuoi_den INTEGER,
  kcal_moi_kg NUMERIC NOT NULL CHECK (kcal_moi_kg > 0),
  nguon TEXT NOT NULL,
  lien_ket TEXT,
  ngay_hieu_luc DATE NOT NULL
);

-- Hệ số vận động theo mức vận động và nhóm tuổi
CREATE TABLE he_so_van_dong (
  id SERIAL PRIMARY KEY,
  muc_van_dong TEXT NOT NULL CHECK (muc_van_dong IN ('nhe', 'trung_binh', 'nang')),
  tuoi_tu INTEGER NOT NULL,
  -- NULL nghĩa là không giới hạn trên (nhóm 70 tuổi trở lên)
  tuoi_den INTEGER,
  he_so NUMERIC NOT NULL CHECK (he_so > 0),
  nguon TEXT NOT NULL,
  lien_ket TEXT,
  ngay_hieu_luc DATE NOT NULL
);

-- Bộ Y tế 2016, Bảng 3 (trang 30): chuyển hóa cơ bản kcal/kg/ngày, nhóm từ 15 tuổi trở lên
INSERT INTO chuyen_hoa_co_ban (gioi_tinh, tuoi_tu, tuoi_den, kcal_moi_kg, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nam', 15, 19, 27.0, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nam', 20, 29, 24.0, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nam', 30, 49, 22.3, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nam', 50, 69, 21.5, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nam', 70, NULL, 21.5, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nu', 15, 19, 25.3, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nu', 20, 29, 22.1, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nu', 30, 49, 21.7, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nu', 50, 69, 20.7, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nu', 70, NULL, 20.7, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 3, trang 30. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');

-- Bộ Y tế 2016, Bảng 4 (trang 31): hệ số vận động nhẹ / trung bình / nặng.
-- Đối chiếu ví dụ trong tài liệu: nam 20-29 tuổi, 1470 kcal x 1,75 = 2572 kcal
INSERT INTO he_so_van_dong (muc_van_dong, tuoi_tu, tuoi_den, he_so, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nhe',        15, 19,   1.55, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('trung_binh', 15, 19,   1.75, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nang',       15, 19,   1.95, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nhe',        20, 69,   1.50, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31 (nhóm 20-29, 30-49, 50-69 cùng hệ số). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('trung_binh', 20, 69,   1.75, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31 (nhóm 20-29, 30-49, 50-69 cùng hệ số). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nang',       20, 69,   2.00, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31 (nhóm 20-29, 30-49, 50-69 cùng hệ số). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nhe',        70, NULL, 1.45, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('trung_binh', 70, NULL, 1.70, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nang',       70, NULL, 1.95, 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 4, trang 31. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');

-- Các con số đơn lẻ
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('bmi_thieu_can', 18.5, 'BMI dưới mức này là thiếu cân (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_thua_can', 23, 'BMI từ mức này là thừa cân (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_beo_phi_do_1', 25, 'BMI từ mức này là béo phì độ I (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_beo_phi_do_2', 30, 'BMI từ mức này là béo phì độ II (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_ly_tuong', 22, 'Cân nặng lý tưởng = chiều cao (m) bình phương x số này', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_moi_kg_nhe', 25, 'Giảm cân, lao động nhẹ: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 20-25; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_moi_kg_trung_binh', 30, 'Giảm cân, lao động trung bình: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 25-30; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_moi_kg_nang', 35, 'Giảm cân, lao động nặng: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 30-35; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('phut_van_dong_khuyen_nghi', 150, 'Số phút vận động mức vừa mỗi tuần người lớn nên đạt', 'Bull FC và cộng sự (2020). WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/', '2020-11-25'),
  ('he_so_phut_muc_nang', 2, 'Một phút vận động mức nặng tính bằng số phút mức vừa này (WHO: 75 phút mức nặng tương đương 150 phút mức vừa)', 'Bull FC và cộng sự (2020). WHO 2020 guidelines on physical activity and sedentary behaviour; WHO GPAQ Analysis Guide', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/', '2020-11-25');
