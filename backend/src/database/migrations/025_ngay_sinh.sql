-- Ngày sinh thay năm sinh để tính tuổi đúng tới từng ngày; nhớ tuổi đã dùng để tính mục tiêu calo, qua sinh nhật thì tính lại
ALTER TABLE nguoi_dung
  ADD COLUMN ngay_sinh DATE,
  ADD COLUMN tuoi_tinh_muc_tieu INTEGER;

-- Người dùng cũ chỉ có năm sinh: tạm đặt ngày 1/1 của năm đó; tuoi_tinh_muc_tieu để trống nên lần đọc đầu tự tính lại mục tiêu
UPDATE nguoi_dung SET ngay_sinh = make_date(nam_sinh, 1, 1) WHERE nam_sinh IS NOT NULL;

ALTER TABLE nguoi_dung DROP COLUMN nam_sinh;
