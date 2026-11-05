-- Lộ trình (lát 15, King chốt 04/11/2026): mốc vòng eo / chiều cao và BMI tối đa còn dùng vòng eo theo NICE; số phút vận động mỗi ngày theo Viện Dinh dưỡng
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('eo_chieu_cao_cao', 0.5, 'Tỉ lệ vòng eo / chiều cao từ mức này là mỡ bụng cao hơn khuyến nghị', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.14 (và 1.9.15: giữ vòng eo dưới nửa chiều cao)', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('eo_chieu_cao_rat_cao', 0.6, 'Tỉ lệ vòng eo / chiều cao từ mức này là mỡ bụng rất cao', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.14', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('bmi_toi_da_dung_eo', 35, 'Chỉ dùng tỉ lệ vòng eo / chiều cao khi BMI dưới mức này', 'NICE (2025). Overweight and obesity management, NG246, khuyến nghị 1.9.8 và 1.9.14', 'https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity', '2025-01-14'),
  ('phut_van_dong_moi_ngay', 30, 'Vận động ít nhất bao nhiêu phút mỗi ngày', 'Viện Dinh dưỡng (2026). Công cụ Tra cứu nhu cầu dinh dưỡng (bản 2026): Hoạt động thể lực ít nhất 30 phút mỗi ngày, tra ngày 02/11/2026', 'https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong', '2026-08-03');

-- Vòng eo (không bắt buộc), cân mục tiêu và cân lúc bắt đầu lộ trình; giới hạn vòng eo là lựa chọn giao diện để chặn gõ nhầm
ALTER TABLE nguoi_dung
  ADD COLUMN vong_eo_cm NUMERIC(4, 1) CHECK (vong_eo_cm BETWEEN 40 AND 200),
  ADD COLUMN can_muc_tieu_kg NUMERIC(5, 2) CHECK (can_muc_tieu_kg BETWEEN 30 AND 300),
  ADD COLUMN can_bat_dau_kg NUMERIC(5, 2) CHECK (can_bat_dau_kg BETWEEN 30 AND 300),
  ADD CHECK ((can_muc_tieu_kg IS NULL) = (can_bat_dau_kg IS NULL)),
  ADD CHECK (muc_tieu <> 'giu' OR can_muc_tieu_kg IS NULL);
