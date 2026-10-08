-- Làm lại cách tính calo theo tai-lieu/ThuatToan.md (chốt 08/10/2026). Luật mới: mọi nguồn từ năm 2021.
-- Các dòng có nguồn trước 2021 bị xóa hẳn, không giữ làm lịch sử, vì luật nguồn không cho dùng.

-- Hồ sơ: bỏ bốn câu hỏi vận động cũ; giờ người dùng chọn thẳng mức vận động (cột muc_van_dong đã có)
ALTER TABLE nguoi_dung
  DROP COLUMN cong_viec,
  DROP COLUMN so_buoi_tap,
  DROP COLUMN so_phut_moi_buoi,
  DROP COLUMN cam_nhan_khi_tap;

-- Bỏ bảng chuyển hóa cơ bản kcal/kg (Bộ Y tế 2016); thay bằng công thức Ganpule ở dưới
DROP TABLE chuyen_hoa_co_ban;

-- Hệ số vận động theo tuổi: suy ra từ công cụ tra cứu của Viện Dinh dưỡng (bản 2026), lấy năng lượng các mức chia cho nhau.
-- Ví dụ nam 18-29: 2205 / 2570 / 2940 kcal = 1470 x 1,50 / 1,75 / 2,00. Từ 75 tuổi công cụ không có mức nặng.
DELETE FROM he_so_van_dong;
INSERT INTO he_so_van_dong (muc_van_dong, tuoi_tu, tuoi_den, he_so, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('nhe',        18, 64,   1.50, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 18, 64,   1.75, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nang',       18, 64,   2.00, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 18-29, 30-49, 50-64 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nhe',        65, 74,   1.45, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 65, 74,   1.70, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nang',       65, 74,   1.95, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm 65-74 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('nhe',        75, NULL, 1.40, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm từ 75 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('trung_binh', 75, NULL, 1.65, 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026), nhóm từ 75 tuổi; hệ số suy ra từ tỷ lệ năng lượng giữa các mức, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Xóa các con số có nguồn trước 2021 (WHO 2020, FAO 2003, Bộ Y tế 2016); số nào còn dùng được thêm lại bên dưới với nguồn mới
DELETE FROM quy_dinh WHERE ma IN (
  'phut_van_dong_khuyen_nghi', 'he_so_phut_muc_nang',
  'kcal_moi_g_dam', 'kcal_moi_g_tinh_bot', 'kcal_moi_g_beo',
  'ty_le_nang_luong_dam_thap', 'ty_le_nang_luong_dam_cao',
  'ty_le_nang_luong_beo_thap', 'ty_le_nang_luong_beo_cao',
  'muoi_toi_da_g', 'ty_le_nang_luong_duong_toi_da', 'ty_le_nang_luong_beo_no_toi_da'
);

-- Công thức Ganpule: chuyển hóa cơ bản (kcal/ngày) = (0,0481 x cân + 0,0234 x chiều cao - 0,0138 x tuổi - hằng số theo giới) x 1000 / 4,186
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('ganpule_he_so_can', 0.0481, 'Công thức Ganpule: hệ số nhân với cân nặng (kg)', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_he_so_chieu_cao', 0.0234, 'Công thức Ganpule: hệ số nhân với chiều cao (cm)', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_he_so_tuoi', 0.0138, 'Công thức Ganpule: hệ số nhân với tuổi, đem trừ đi', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_hang_so_nam', 0.4235, 'Công thức Ganpule: hằng số đem trừ đi, với nam', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('ganpule_hang_so_nu', 0.9708, 'Công thức Ganpule: hằng số đem trừ đi, với nữ', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2; cùng công thức trong Matsuura H, Deguchi K, Iizuka K (2026), Nutrients 18(16):2743', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01'),
  ('kj_moi_kcal', 4.186, 'Công thức Ganpule ra MJ; nhân 1000 ra kJ rồi chia số này để ra kcal', 'Bộ Y tế, Lao động và Phúc lợi Nhật (2024). Chuẩn dinh dưỡng người Nhật 2025 (日本人の食事摂取基準 2025年版), Bảng 2', 'https://h-crisis.niph.go.jp/wp-content/uploads/2024/10/001316126.pdf', '2025-04-01');

-- Giảm cân: không cắt quá 500 kcal mỗi ngày so với mức giữ cân (cận dưới của khoảng 500-1000)
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('giam_can_kcal_cat_toi_da', 500, 'Giảm cân: cắt nhiều nhất bao nhiêu kcal mỗi ngày so với mức giữ cân', 'Kim KK và cộng sự (2023). Evaluation and Treatment of Obesity and Its Comorbidities: 2022 Update of Clinical Practice Guidelines for Obesity by the Korean Society for the Study of Obesity. J Obes Metab Syndr 32(1):1-24, Bảng 5', 'https://doi.org/10.7570/jomes23016', '2023-03-22');

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
  ('kcal_moi_g_tinh_bot', 4, 'Mỗi gam bột đường (kể cả đường) cho bao nhiêu kcal', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: số gam bột đường = năng lượng x tỷ lệ / 4, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('kcal_moi_g_beo', 9, 'Mỗi gam chất béo (kể cả béo no) cho bao nhiêu kcal', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: số gam chất béo = năng lượng x tỷ lệ / 9, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Ba chất nên hạn chế
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('muoi_toi_da_g', 5, 'Muối tối đa mỗi ngày (g), tương đương natri dưới 2000 mg', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng: natri < 2000 mg/ngày, tương đương muối < 5 g/ngày, tra ngày 08/10/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03'),
  ('ty_le_nang_luong_duong_toi_da', 10, 'Đường tự do tối đa bao nhiêu % tổng năng lượng', 'Viện Dinh dưỡng (2026). Những điểm cập nhật về nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, PGS.TS Vũ Thị Thu Hiền, 03/08/2026', 'https://viendinhduong.vn/vi/article/tin-tuc/6a70094d06fb0c475f0ac123', '2026-08-03'),
  ('ty_le_nang_luong_beo_no_toi_da', 10, 'Chất béo no tối đa bao nhiêu % tổng năng lượng', 'WHO (2023). Saturated fatty acid and trans-fatty acid intake for adults and children: WHO guideline, khuyến nghị 1', 'https://www.who.int/publications/i/item/9789240073630', '2023-07-17');
