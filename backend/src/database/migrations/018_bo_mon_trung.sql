-- Ẩn khỏi Khám phá 5 dòng mã mới của Viện trùng hẳn với dòng mã cũ (cùng số, cùng ảnh); tên dòng mã mới lưu dấu tách nên lần lọc ở 015 bị sót
UPDATE mon_tra_cuu
SET hien_o_kham_pha = FALSE
WHERE ma_so IN ('SFF-221022', 'SFF-112057', 'SFF-223019', 'SFF-223025', 'SFF-223010');
