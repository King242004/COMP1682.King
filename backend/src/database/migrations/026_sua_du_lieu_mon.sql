-- Rà dữ liệu món Viện (King chốt 30/10/2026): bỏ món mang tên quán, sửa tên chép sai; không đổi số liệu nào của Viện

-- Xóa 6 món mang tên quán hoặc tên người; món tên thường vẫn còn (Phở bò…, Bún chả, Bún ốc, Bún cá cay, Mỳ vằn thắn, Bánh cuốn chả); bảng thành phần tự xóa theo
DELETE FROM mon_tra_cuu
WHERE ma_so IN ('HAN-112002', 'HAP-211080', 'HAP-211091', 'HAP-211022', 'HAN-112018', 'HAN-112019');

-- Bỏ dòng ghi chú "(ép từ …)" của hai món nước ép: không phải thứ uống vào (0 kcal) mà làm tổng gam của suất sai
DELETE FROM thanh_phan_suat WHERE ma_so = 'SFF-221011' AND ten_thanh_phan = '(ép từ Hạt lựu';
DELETE FROM thanh_phan_suat WHERE ma_so = 'SFF-221013' AND ten_thanh_phan = '(ép từ Lê nguyên miếng';

-- Thành phần: bỏ địa danh nơi Viện mua, bỏ cách chia "loại I, loại II" và chữ "ss" (số kcal đã tính theo đúng loại thịt)
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bánh bèo' WHERE ten_thanh_phan = 'Bánh bèo Hải phòng';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò' WHERE ten_thanh_phan = 'Thịt bò loại I';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò chần' WHERE ten_thanh_phan = 'Thịt bò loại I chần';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò luộc' WHERE ten_thanh_phan = 'Thịt bò loại I luộc';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò hầm' WHERE ten_thanh_phan = 'Thịt bò loại II hầm';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò' WHERE ten_thanh_phan = 'Thịch bò loại l';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt bò' WHERE ten_thanh_phan = 'Thịt bò ss';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Cánh gà' WHERE ten_thanh_phan = 'Cánh gà (ss)';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Chân gà' WHERE ten_thanh_phan = 'Chân gà ss';

-- Thành phần: sửa chữ chép sai (lỗi bảng mã, sai dấu, sai chữ)
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bánh đa đỏ' WHERE ten_thanh_phan = 'B¡nh đa đỏ';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Hành, mùi' WHERE ten_thanh_phan = 'Hành, m¹i';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Xôi xéo' WHERE ten_thanh_phan = 'Xôi x©o';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bánh mỳ' WHERE ten_thanh_phan = 'Bánh mý';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bánh rán bọc đường' WHERE ten_thanh_phan = 'Bánh rán bọc đường (60g';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bột đao' WHERE ten_thanh_phan = 'bột đạo';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Chè đỗ đen' WHERE ten_thanh_phan = 'Chê đỗ đen';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Cùi dừa' WHERE ten_thanh_phan = 'Củi dừa';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Mỳ sợi' WHERE ten_thanh_phan = 'Mỹ sợi';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ngao biển luộc' WHERE ma_so = 'HAP-213046' AND thu_tu = 1;
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ngô chiên' WHERE ten_thanh_phan = 'Ngo chien';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Rau ăn kèm' WHERE ten_thanh_phan = 'Rau rau kèm';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Tào phớ' WHERE ten_thanh_phan = 'Tào phở';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Tương ớt' WHERE ten_thanh_phan = 'Tương ồt';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt chân giò lợn muối' WHERE ten_thanh_phan = 'Thềt chân giò lợn muối';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt gà đùi sốt' WHERE ten_thanh_phan = 'Thịt gì dùi sốt';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Xôi trắng (đồ)' WHERE ten_thanh_phan = 'Xôi trắng (đỗ)';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Lạc đồ' WHERE ten_thanh_phan = 'Lạc đỗ';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Phô mai' WHERE ten_thanh_phan = 'Pho mai';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Nước chấm pha, ớt' WHERE ten_thanh_phan = 'Nước chấm pha +ớt';

-- Thành phần: viết hoa đúng chỗ (chữ đầu viết hoa, phần sau viết thường)
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Hành phi' WHERE ten_thanh_phan = 'hành phi';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Hủ tiếu' WHERE ten_thanh_phan = 'Hủ Tiếu';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Lá đinh lăng' WHERE ten_thanh_phan = 'Lá Đinh lăng';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Nước dùng' WHERE ten_thanh_phan = 'nước dùng';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Nước lê ép' WHERE ten_thanh_phan = 'Nước Lê ép';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ốc mít luộc' WHERE ten_thanh_phan = 'ốc mít luộc';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ốc vặn luộc' WHERE ten_thanh_phan = 'ốc vặn luộc';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ớt đỏ' WHERE ten_thanh_phan = 'ớt đỏ';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Ớt đỏ to' WHERE ten_thanh_phan = 'ớt đỏ to';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Rau cần' WHERE ten_thanh_phan = 'Rau Cần';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Rau sống' WHERE ten_thanh_phan = 'rau sống';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Rau thơm' WHERE ten_thanh_phan = 'rau thơm';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Tương cà' WHERE ten_thanh_phan = 'Tương Cà';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Trân châu' WHERE ten_thanh_phan = 'Trân Châu';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt lợn ba chỉ kho' WHERE ten_thanh_phan = 'Thịt lợn Ba chỉ kho';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Nộm su hào' WHERE ten_thanh_phan = 'Nộm Su hào';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Bột chiên xù, bột mỳ' WHERE ten_thanh_phan = 'Bột chiên xù, Bột mỳ';
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Dưa hấu (phần ruột đỏ để ép)' WHERE ten_thanh_phan = 'Dưa hấu (Phần ruột đỏ để ép)';

-- Tên món: sửa chữ chép sai
UPDATE mon_tra_cuu SET ten_mon = 'Mỳ trộn bò', ten_goc = 'Mỳ trộn bò' WHERE ma_so = 'HAP-213055';
UPDATE mon_tra_cuu SET ten_mon = 'Bún giả cầy', ten_goc = 'Bún giả cầy' WHERE ma_so = 'HAN-112056';
UPDATE mon_tra_cuu SET ten_mon = 'Phô mai que chiên 2 cái', ten_goc = 'Phô mai que chiên' WHERE ma_so = 'HAN-123024';
UPDATE mon_tra_cuu SET ten_mon = 'Bánh rán ngọt có vừng 3 cái', ten_khong_dau = 'banh ran ngot co vung 3 cai' WHERE ma_so = 'HAP-223014';

-- Tên món: sửa chữ chép sai; sửa xong trùng tên một món đang hiện nên ẩn khỏi Khám phá như 015 (kính lúp ở màn thêm món vẫn thấy)
UPDATE mon_tra_cuu
SET ten_mon = 'Sữa chua trân châu', ten_goc = 'Sữa chua trân châu', ten_khong_dau = 'sua chua tran chau', hien_o_kham_pha = FALSE
WHERE ma_so = 'SFF-213009';
UPDATE mon_tra_cuu
SET ten_mon = 'Bánh mỳ pate trứng', ten_goc = 'Bánh mỳ pate trứng', ten_khong_dau = 'banh my pate trung', hien_o_kham_pha = FALSE
WHERE ma_so = 'HAN-123019';

-- Tên món: viết hoa đúng chỗ (địa danh viết hoa, còn lại viết thường)
UPDATE mon_tra_cuu SET ten_mon = 'Chả cá Lã Vọng', ten_goc = 'Chả cá Lã Vọng' WHERE ma_so = 'HAN-111017';
UPDATE mon_tra_cuu SET ten_mon = 'Chả cá Thăng Long chảo', ten_goc = 'Chả cá Thăng Long chảo' WHERE ma_so = 'HAN-113012';
UPDATE mon_tra_cuu SET ten_mon = 'Bún trộn Nam Bộ', ten_goc = 'Bún trộn Nam Bộ' WHERE ma_so = 'HAN-113038';
UPDATE mon_tra_cuu SET ten_mon = 'Hủ tiếu Nam Vang nước', ten_goc = 'Hủ tiếu Nam Vang nước' WHERE ma_so = 'HAN-112014';
UPDATE mon_tra_cuu SET ten_mon = 'Bánh mỳ pate thập cẩm', ten_goc = 'Bánh mỳ pate thập cẩm' WHERE ma_so = 'HAN-113027';
UPDATE mon_tra_cuu SET ten_mon = 'Nem lụi', ten_goc = 'Nem lụi' WHERE ma_so = 'HAP-211086';
UPDATE mon_tra_cuu SET ten_mon = 'Nem thính', ten_goc = 'Nem thính' WHERE ma_so = 'SFF-211039';
UPDATE mon_tra_cuu SET ten_mon = 'Hamburger bò', ten_goc = 'Hamburger bò' WHERE ma_so = 'HAN-113072';
UPDATE mon_tra_cuu SET ten_mon = 'Hamburger gà', ten_goc = 'Hamburger gà' WHERE ma_so = 'HAN-113071';
UPDATE mon_tra_cuu SET ten_mon = 'Burger tôm', ten_goc = 'Burger tôm' WHERE ma_so = 'HAN-112009';
UPDATE mon_tra_cuu SET ten_mon = 'Cơm bình dân 35k' WHERE ma_so = 'HAN-123006';
UPDATE mon_tra_cuu SET ten_mon = 'Cơm suất 35k', ten_goc = 'Cơm suất 35k' WHERE ma_so = 'HAN-121066';
