-- Bỏ việc tự tính lại mục tiêu calo khi qua sinh nhật (King chốt 09/11/2026): mục tiêu tính lại mỗi lần lưu hồ sơ hoặc ghi cân, nên không cần nhớ tuổi đã dùng
ALTER TABLE nguoi_dung DROP COLUMN tuoi_tinh_muc_tieu;
