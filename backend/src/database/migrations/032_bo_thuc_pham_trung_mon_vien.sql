-- Bỏ thực phẩm trùng với "Món của Viện" (King chốt 02/11/2026): cùng một thứ mà một bên tính trên 100 g, một bên theo suất đã cân, số khác hẳn nên dễ bấm nhầm; giữ bản theo suất vì ngoài đời đếm theo cái, cốc, quả, bắp chứ không cân; còn 477, không đổi số nào

-- 9 tên trùng hẳn và 2 dòng ngô nướng (Món của Viện có "Ngô nướng") (11 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bánh gối', 'Bánh tiêu', 'Bỏng ngô', 'Kem đậu xanh',
  'Khoai lang, luộc', 'Nem chua', 'Nước ép dưa hấu', 'Tào phớ',
  'Trứng vịt lộn', 'Ngô tươi, nếp, nướng', 'Ngô tươi, tẻ, nướng'
);
