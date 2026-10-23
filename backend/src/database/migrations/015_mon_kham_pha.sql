-- Khám phá là nơi xem công thức nên mỗi món chỉ hiện 1 lần (King chốt 23/10/2026); không đổi số liệu của Viện
ALTER TABLE mon_tra_cuu ADD COLUMN ten_goc TEXT;
-- Số lượng hoặc giá cắt ra từ cuối tên, ví dụ "3 cái", "giá 35k"; null là tên không có
ALTER TABLE mon_tra_cuu ADD COLUMN ghi_chu_suat TEXT;
ALTER TABLE mon_tra_cuu ADD COLUMN hien_o_kham_pha BOOLEAN NOT NULL DEFAULT TRUE;

-- Mặc định tên gốc là tên món
UPDATE mon_tra_cuu SET ten_goc = ten_mon;

-- Ẩn ở Khám phá các bản trùng tên gốc (27 dòng); kính lúp ở màn thêm món vẫn thấy
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-213077'; -- Bánh bèo 2 cái (đã có Bánh bèo)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-211065'; -- Bánh bột lọc (5 cái) (đã có Bánh bột lọc)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-213049'; -- Bánh bột lọc 6 cái (đã có Bánh bột lọc)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-223011'; -- Bánh cuốn chả 5 cái (đã có Bánh cuốn chả)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-223038'; -- Bánh chay (10 viên) (đã có Bánh chay)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-221003'; -- Bánh dày ngọt 3 cái (đã có Bánh dày ngọt)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-211058'; -- Bánh mỳ cay 5 cái (đã có Bánh mỳ cay)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-213005'; -- Bánh mỳ que 1 cái (đã có Bánh mỳ que)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121055'; -- Bánh rán đường (5 cái) (đã có Bánh rán đường)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121054'; -- Bánh rán mật (5 cái) (đã có Bánh rán mật)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-221002'; -- Bánh rán vừng 3 cái (đã có Bánh rán vừng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121056'; -- Bánh rán vừng (5 cái) (đã có Bánh rán vừng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-211040'; -- Bánh rán vừng (5 chiếc) (đã có Bánh rán vừng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-111028'; -- Bánh tôm (5 cái) (đã có Bánh tôm)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-112030'; -- Cánh gà nướng (5 cái) (đã có Cánh gà nướng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121066'; -- cơm suất 35k (đã có Cơm suất 30k)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121068'; -- Cơm suất 40k (đã có Cơm suất 30k)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121070'; -- Cơm suất 45k (đã có Cơm suất 30k)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-112029'; -- Chân gà nướng (5 cái) (đã có Chân gà nướng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-213022'; -- Nem chua rán 10 cái (đã có Nem chua rán)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-123038'; -- Nem chua rán 5 cái (đã có Nem chua rán)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-121058'; -- Nem rán (4 cái) (đã có Nem rán)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-211099'; -- Nem rán (5 cái) (đã có Nem rán)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAN-112005'; -- Phô mai chiên (2 viên) (đã có Phô mai chiên)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-211108'; -- Thịt xiên nướng (5 cái) (đã có Thịt xiên nướng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-223018'; -- Thịt xiên nướng 6 cái (đã có Thịt xiên nướng)
UPDATE mon_tra_cuu SET hien_o_kham_pha = FALSE WHERE ma_so = 'HAP-223016'; -- Trứng vịt lộn 2 quả (đã có Trứng vịt lộn)

-- Món được giữ mà tên có số lượng hoặc giá: hiện tên gốc, số lượng ghi ở dòng phụ (16 dòng)
UPDATE mon_tra_cuu SET ten_goc = 'Bánh gối', ghi_chu_suat = '3 cái' WHERE ma_so = 'HAN-121042'; -- Bánh gối 3 cái
UPDATE mon_tra_cuu SET ten_goc = 'Bánh gối rán', ghi_chu_suat = '2 cái' WHERE ma_so = 'HAP-223005'; -- Bánh gối rán 2 cái
UPDATE mon_tra_cuu SET ten_goc = 'Bánh rán ngọt có vừng', ghi_chu_suat = '3 cái' WHERE ma_so = 'HAP-223014'; -- Bánh rán ngọt có vừng (3c)
UPDATE mon_tra_cuu SET ten_goc = 'Bánh rán ngọt không vừng', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAP-223015'; -- Bánh rán ngọt không vừng 5 cái
UPDATE mon_tra_cuu SET ten_goc = 'Cá viên chiên đường phố', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAN-121083'; -- Cá viên chiên đường phố (5 cái)
UPDATE mon_tra_cuu SET ten_goc = 'Cơm bình dân', ghi_chu_suat = 'giá 35k' WHERE ma_so = 'HAN-123006'; -- cơm bình dân 35k
UPDATE mon_tra_cuu SET ten_goc = 'Cơm suất', ghi_chu_suat = 'giá 30k' WHERE ma_so = 'HAN-121062'; -- Cơm suất 30k
UPDATE mon_tra_cuu SET ten_goc = 'Cuốn bỗng', ghi_chu_suat = '8 cái' WHERE ma_so = 'SFF-213053'; -- Cuốn bỗng 8 cái
UPDATE mon_tra_cuu SET ten_goc = 'Chân gà nướng mắm', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAN-112025'; -- Chân gà nướng mắm (5 cái)
UPDATE mon_tra_cuu SET ten_goc = 'Chim cút quay lá mắc mật', ghi_chu_suat = '4 con' WHERE ma_so = 'SFF-211068'; -- Chim cút quay lá mắc mật (4 con)
UPDATE mon_tra_cuu SET ten_goc = 'Hàu nướng mọi', ghi_chu_suat = '10 con' WHERE ma_so = 'HAP-211016'; -- Hàu nướng mọi (10 con)
UPDATE mon_tra_cuu SET ten_goc = 'Mực viên chiên đường phố', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAN-121084'; -- Mực viên chiên đường phố (5 cái)
UPDATE mon_tra_cuu SET ten_goc = 'Nem nướng', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAN-112023'; -- Nem nướng (5 cái)
UPDATE mon_tra_cuu SET ten_goc = 'Phở cuốn', ghi_chu_suat = '10 cái' WHERE ma_so = 'HAN-111010'; -- Phở cuốn (10 cái)
UPDATE mon_tra_cuu SET ten_goc = 'Pho mai que chiên', ghi_chu_suat = '2 cái' WHERE ma_so = 'HAN-123024'; -- Pho mai que chiên 2 cái
UPDATE mon_tra_cuu SET ten_goc = 'Xúc xích rán', ghi_chu_suat = '5 cái' WHERE ma_so = 'HAN-121082'; -- Xúc xích rán (5 cái)

ALTER TABLE mon_tra_cuu ALTER COLUMN ten_goc SET NOT NULL;
