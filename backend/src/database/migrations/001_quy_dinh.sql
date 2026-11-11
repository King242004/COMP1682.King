-- Các con số app dùng để tính, mỗi số kèm nguồn và ngày bắt đầu có hiệu lực; nguồn đổi số thì thêm dòng mới với ngày hiệu lực mới, không sửa dòng cũ
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

-- Phân loại BMI theo chuẩn WHO cho người châu Á và cân nặng lý tưởng
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('bmi_thieu_can', 18.5, 'BMI dưới mức này là thiếu cân (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_thua_can', 23, 'BMI từ mức này là thừa cân (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_beo_phi_do_1', 25, 'BMI từ mức này là béo phì độ I (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_beo_phi_do_2', 30, 'BMI từ mức này là béo phì độ II (chuẩn WHO cho người châu Á)', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, Hướng dẫn chẩn đoán và điều trị bệnh béo phì, Bảng 4.1', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('bmi_ly_tuong', 22, 'Cân nặng lý tưởng = chiều cao (m) bình phương x số này', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22');

-- Công thức Ganpule: chuyển hóa cơ bản (kcal/ngày) = (0,0481 x cân + 0,0234 x chiều cao - 0,0138 x tuổi - hằng số theo giới) x 1000 / 4,186
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('ganpule_he_so_can', 0.0481, 'Công thức Ganpule: hệ số nhân với cân nặng (kg)', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_he_so_chieu_cao', 0.0234, 'Công thức Ganpule: hệ số nhân với chiều cao (cm)', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_he_so_tuoi', 0.0138, 'Công thức Ganpule: hệ số nhân với tuổi, đem trừ đi', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_hang_so_nam', 0.4235, 'Công thức Ganpule: hằng số đem trừ đi, với nam', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_hang_so_nu', 0.9708, 'Công thức Ganpule: hằng số đem trừ đi, với nữ', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('kj_moi_kcal', 4.186, 'Công thức Ganpule ra MJ; nhân 1000 ra kJ rồi chia số này để ra kcal', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01');

-- Mục tiêu calo khi giảm cân
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giam_can_kcal_moi_kg_nhe', 25, 'Giảm cân, lao động nhẹ: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 20-25; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_moi_kg_trung_binh', 30, 'Giảm cân, lao động trung bình: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 25-30; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_moi_kg_nang', 35, 'Giảm cân, lao động nặng: kcal cho mỗi kg cân nặng lý tưởng. Văn bản cho khoảng 30-35; dự án chọn cận trên vì app không có bác sĩ theo dõi', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kcal_cat_toi_da', 500, 'Giảm cân: cắt nhiều nhất bao nhiêu kcal mỗi ngày so với mức giữ cân', 'Kim KK và cộng sự (2023). Evaluation and Treatment of Obesity and Its Comorbidities: 2022 Update of Clinical Practice Guidelines for Obesity by the Korean Society for the Study of Obesity. J Obes Metab Syndr 32(1):1-24, Bảng 5', 'https://doi.org/10.7570/jomes23016', '2023-03-22');

-- Tốc độ giảm cân nên có và khoảng giữ cân
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giam_can_kg_moi_thang_thap', 2, 'Giảm cân nên được ít nhất bao nhiêu kg mỗi tháng', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân: "Mục tiêu là giảm cân từ từ khoảng 2 - 3 kg/tháng"', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giam_can_kg_moi_thang_cao', 3, 'Giảm cân không nên nhanh hơn bao nhiêu kg mỗi tháng', 'Bộ Y tế (2022). QĐ 2892/QĐ-BYT, mục chế độ ăn giảm cân: "Mục tiêu là giảm cân từ từ khoảng 2 - 3 kg/tháng"', 'https://hoatieu.vn/phap-luat/quyet-dinh-2892-qd-byt-2022-tai-lieu-chuyen-mon-huong-dan-chan-doan-dieu-tri-benh-beo-phi-217088', '2022-10-22'),
  ('giu_can_ty_le_dao_dong', 0.03, 'Cân thay đổi không quá tỉ lệ này so với cân giữ quanh thì vẫn tính là đang giữ cân', 'Stevens J, Truesdale KP, McClain JE, Cai J (2006). The definition of weight maintenance. International Journal of Obesity 30(3): 391–399', 'https://doi.org/10.1038/sj.ijo.0803175', '2005-11-22');

-- Rào cho người cao tuổi
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('tuoi_cao_tuoi', 65, 'Từ tuổi này dùng ngưỡng BMI giảm cân của người cao tuổi', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), BMI mục tiêu theo tuổi: 65-74 và từ 75 tuổi là 21,5-24,9', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('bmi_thieu_can_cao_tuoi', 21.5, 'Người từ tuổi cao tuổi: BMI dưới mức này không được chọn giảm cân (cận dưới BMI mục tiêu)', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), BMI mục tiêu theo tuổi: 65-74 và từ 75 tuổi là 21,5-24,9', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('tuoi_khong_co_muc_nang', 75, 'Từ tuổi này không có mức vận động nặng', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026): nhóm từ 75 tuổi không có số cho mức lao động nặng, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Đạm theo cân nặng; béo và bột đường theo tỷ lệ năng lượng; số kcal mỗi gam để đổi ra gam
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('dam_g_moi_kg', 0.93, 'Đạm nên ăn ít nhất bao nhiêu gam cho mỗi kg cân nặng mỗi ngày', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, PGS.TS Vũ Thị Thu Hiền, 03/08/2026', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_beo_thap', 20, 'Chất béo nên chiếm ít nhất bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, 03/08/2026; khớp công cụ Tra cứu nhu cầu dinh dưỡng', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_beo_cao', 25, 'Chất béo nên chiếm nhiều nhất bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, 03/08/2026; khớp công cụ Tra cứu nhu cầu dinh dưỡng', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_tinh_bot_thap', 50, 'Bột đường nên chiếm ít nhất bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, 03/08/2026; khớp công cụ Tra cứu nhu cầu dinh dưỡng', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_tinh_bot_cao', 65, 'Bột đường nên chiếm nhiều nhất bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, 03/08/2026; khớp công cụ Tra cứu nhu cầu dinh dưỡng', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('kcal_moi_g_dam', 4, 'Mỗi gam đạm cho bao nhiêu kcal (hệ số Atwater chung)', 'FAO (2003). Food energy: methods of analysis and conversion factors. FAO Food and Nutrition Paper 77, mục 3.5.1', 'https://www.fao.org/4/y5022e/y5022e04.htm', '2003-01-01'),
  ('kcal_moi_g_tinh_bot', 4, 'Mỗi gam bột đường (kể cả đường) cho bao nhiêu kcal', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: số gam bột đường = năng lượng x tỷ lệ / 4, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('kcal_moi_g_beo', 9, 'Mỗi gam chất béo (kể cả béo no) cho bao nhiêu kcal', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: số gam chất béo = năng lượng x tỷ lệ / 9, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Ba chất nên hạn chế
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('muoi_toi_da_g', 5, 'Muối tối đa mỗi ngày (g), tương đương natri dưới 2000 mg', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: natri < 2000 mg/ngày, tương đương muối < 5 g/ngày, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('ty_le_nang_luong_duong_toi_da', 10, 'Đường tự do tối đa bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, PGS.TS Vũ Thị Thu Hiền, 03/08/2026', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_beo_no_toi_da', 10, 'Chất béo no tối đa bao nhiêu % tổng năng lượng', 'WHO (2023). Saturated fatty acid and trans-fatty acid intake for adults and children: WHO guideline, khuyến nghị 1', 'https://www.who.int/publications/i/item/9789240073630', '2023-07-17');

-- Số đổi đơn vị, theo bảng đổi của NIST (Mỹ)
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('kg_moi_pound', 0.45359237, '1 pound (lb) = bao nhiêu kg (chính xác)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('cm_moi_inch', 2.54, '1 inch (in) = bao nhiêu cm (chính xác)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('inch_moi_foot', 12, '1 foot (ft) = bao nhiêu inch', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01'),
  ('gam_moi_ounce', 28.349523125, '1 ounce (oz, avoirdupois) = bao nhiêu g (chính xác, bằng 1/16 pound)', 'NIST (2026). NIST Handbook 44, Appendix C: General Tables of Units of Measurement', 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c', '2026-01-01');

-- Uống nước: mục tiêu gợi ý theo cân nặng
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nuoc_ml_moi_kg', 35, 'Mỗi kg cân nặng cần bao nhiêu ml nước mỗi ngày (người tới 55 tuổi, lao động trung bình)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nuoc_ml_moi_kg_tren_moc_tuoi', 30, 'Mỗi kg cân nặng cần bao nhiêu ml nước mỗi ngày (người trên 55 tuổi)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('nuoc_moc_tuoi', 55, 'Trên tuổi này thì nhu cầu nước tính theo mức của người trên 55 tuổi', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 44 (trang 141). QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');

-- Lộ trình: tỉ lệ vòng eo / chiều cao và số phút vận động mỗi ngày
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('eo_chieu_cao_cao', 0.5, 'Tỉ lệ vòng eo / chiều cao từ mức này là mỡ bụng cao hơn khuyến nghị', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.14 (và 1.9.15: giữ vòng eo dưới nửa chiều cao)', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('eo_chieu_cao_rat_cao', 0.6, 'Tỉ lệ vòng eo / chiều cao từ mức này là mỡ bụng rất cao', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.14', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('bmi_toi_da_dung_eo', 35, 'Chỉ dùng tỉ lệ vòng eo / chiều cao khi BMI dưới mức này', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.8 và 1.9.14', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('phut_van_dong_moi_ngay', 30, 'Vận động ít nhất bao nhiêu phút mỗi ngày', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026): Hoạt động thể lực ít nhất 30 phút mỗi ngày, tra ngày 02/11/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Hệ số vận động theo mức vận động và nhóm tuổi
CREATE TABLE he_so_van_dong (
  id SERIAL PRIMARY KEY,
  muc_van_dong TEXT NOT NULL CHECK (muc_van_dong IN ('nhe', 'trung_binh', 'nang')),
  tuoi_tu INTEGER NOT NULL,
  -- NULL nghĩa là không giới hạn trên (nhóm từ 75 tuổi)
  tuoi_den INTEGER,
  he_so NUMERIC NOT NULL CHECK (he_so > 0),
  nguon TEXT NOT NULL,
  lien_ket TEXT,
  ngay_hieu_luc DATE NOT NULL
);

-- Suy ra từ công cụ Tra cứu nhu cầu dinh dưỡng của Viện Dinh dưỡng (bản 2026): lấy năng lượng các mức chia cho nhau, ví dụ nam 18-29 tuổi: 2205 / 2570 / 2940 kcal = 1470 x 1,50 / 1,75 / 2,00; từ 75 tuổi công cụ không có mức nặng
INSERT INTO he_so_van_dong (muc_van_dong, tuoi_tu, tuoi_den, he_so, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nhe', 18, 64, 1.50, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 18, 64, 1.75, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nang', 18, 64, 2.00, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nhe', 65, 74, 1.45, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 65, 74, 1.70, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nang', 65, 74, 1.95, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nhe', 75, NULL, 1.40, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm từ 75 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 75, NULL, 1.65, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm từ 75 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');
