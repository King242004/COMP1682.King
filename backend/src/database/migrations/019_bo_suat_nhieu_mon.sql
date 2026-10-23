-- Ẩn khỏi Khám phá các suất gồm nhiều món (cơm suất, cơm bình dân, cơm bụi, set): Khám phá là nơi xem từng món; kính lúp ở màn thêm món vẫn có đủ để ghi nhật ký
UPDATE mon_tra_cuu
SET hien_o_kham_pha = FALSE
WHERE ten_khong_dau LIKE 'com suat%'
   OR ten_khong_dau LIKE 'com binh dan%'
   OR ten_khong_dau LIKE 'com bui%'
   OR ten_khong_dau LIKE 'set %';

-- Ẩn bản mã mới "Sữa chua uống lá nếp" (SFF-211035) trùng hẳn bản mã cũ "Sữa chua lá nếp" (HAP-211035): cùng số mã, cùng số liệu; Viện đổi cả tên nên lần lọc theo tên ở 018 không bắt được
UPDATE mon_tra_cuu
SET hien_o_kham_pha = FALSE
WHERE ma_so = 'SFF-211035';
