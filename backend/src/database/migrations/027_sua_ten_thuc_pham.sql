-- Rà tên kho thực phẩm (King chốt 30/10/2026): chỉ sửa chữ sai; không đổi số nào của Viện

-- Chữ tiếng Anh "raw" lẫn trong tên: đổi thành "tươi" như các dòng khác; sửa luôn tên không dấu để tìm được
UPDATE thuc_pham SET ten_thuc_pham = 'Ốc vặn, tươi', ten_khong_dau = 'oc van tuoi' WHERE ma_so = '8044';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà công nghiệp, lườn, tươi', ten_khong_dau = 'thit ga cong nghiep luon tuoi' WHERE ma_so = '7089';

-- Cách viết "sà lách" khác hẳn chữ người dùng hay gõ ("xà lách") nên tìm không ra
UPDATE thuc_pham SET ten_thuc_pham = 'Rau xà lách, tươi', ten_khong_dau = 'rau xa lach tuoi' WHERE ma_so = '4090';

-- Viết hoa và dấu cách đúng chỗ (tên không dấu không đổi)
UPDATE thuc_pham SET ten_thuc_pham = 'Ớt khô bột' WHERE ma_so = '13008';
UPDATE thuc_pham SET ten_thuc_pham = 'Mít mật, tươi' WHERE ma_so = '5030';
UPDATE thuc_pham SET ten_thuc_pham = 'Đậu Hà Lan, hạt, khô' WHERE ma_so = '3006';
UPDATE thuc_pham SET ten_thuc_pham = 'Mướp Nhật Bản, tươi' WHERE ma_so = '4056';
UPDATE thuc_pham SET ten_thuc_pham = 'Bún bò Nam Bộ' WHERE ma_so = '15033';
UPDATE thuc_pham SET ten_thuc_pham = 'Nấm mỡ (nấm tây), tươi' WHERE ma_so = '4128';

-- Bảng thành phần món: "sắn" là chép sai của "sấn" (phần thịt nhiều mỡ, như "Thịt chó, sấn" trong kho thực phẩm; dòng này 329 kcal/100 g)
UPDATE thanh_phan_suat SET ten_thanh_phan = 'Thịt lợn sấn băm' WHERE ten_thanh_phan = 'Thịt lợn sắn băm';
