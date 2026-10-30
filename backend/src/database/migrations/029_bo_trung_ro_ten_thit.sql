-- Kho thực phẩm (King chốt 30/10/2026, trang soát tai-lieu/SoatKhoThucPham.html): bỏ 4 dòng trùng, ghi lại tên thịt theo một kiểu; không đổi số nào của Viện

-- Bỏ 4 dòng trùng: mỗi dòng còn một dòng cùng thứ ở lại (Sữa đặc có đường Việt Nam, Sữa chua đặc không đường, Cua bể tươi, Bột canh)
DELETE FROM thuc_pham WHERE ma_so IN ('10047', '10004', '8069', '13028');

-- Tên thịt theo kiểu "Thịt + con, phần, cách nấu"; "loại I" béo 3,8 g giống "lưng, nạc", "loại II" béo 10,5 g giống "lưng, nạc và mỡ"; sửa luôn tên không dấu để tìm được
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt bò, nạc, tươi', ten_khong_dau = 'thit bo nac tuoi' WHERE ma_so = '7003';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt bò, nạc và mỡ, tươi', ten_khong_dau = 'thit bo nac va mo tuoi' WHERE ma_so = '7004';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt bò, bắp, tươi', ten_khong_dau = 'thit bo bap tuoi' WHERE ma_so = '7094';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, mông, tươi', ten_khong_dau = 'thit lon mong tuoi' WHERE ma_so = '7112';
UPDATE thuc_pham SET ten_thuc_pham = 'Châu chấu, tươi', ten_khong_dau = 'chau chau tuoi' WHERE ma_so = '7079';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nạc mông, luộc', ten_khong_dau = 'thit lon nac mong luoc' WHERE ma_so = '7084002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nạc thăn, luộc', ten_khong_dau = 'thit lon nac than luoc' WHERE ma_so = '7085002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nạc vai, luộc', ten_khong_dau = 'thit lon nac vai luoc' WHERE ma_so = '7083002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nửa nạc nửa mỡ, tươi', ten_khong_dau = 'thit lon nua nac nua mo tuoi' WHERE ma_so = '7018';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nửa nạc nửa mỡ, luộc', ten_khong_dau = 'thit lon nua nac nua mo luoc' WHERE ma_so = '7018002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, nửa nạc nửa mỡ, nướng', ten_khong_dau = 'thit lon nua nac nua mo nuong' WHERE ma_so = '7086';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, chân giò, tươi', ten_khong_dau = 'thit lon chan gio tuoi' WHERE ma_so = '7032';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt lợn, chân giò, luộc', ten_khong_dau = 'thit lon chan gio luoc' WHERE ma_so = '7032002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt trâu, bắp, chần', ten_khong_dau = 'thit trau bap chan' WHERE ma_so = '7024018';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt trâu, bắp, luộc', ten_khong_dau = 'thit trau bap luoc' WHERE ma_so = '7024002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt trâu, thăn, chần', ten_khong_dau = 'thit trau than chan' WHERE ma_so = '7027018';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt trâu, thăn, luộc', ten_khong_dau = 'thit trau than luoc' WHERE ma_so = '7027002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà công nghiệp, cổ, luộc', ten_khong_dau = 'thit ga cong nghiep co luoc' WHERE ma_so = '7111002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà ta, đùi, luộc', ten_khong_dau = 'thit ga ta dui luoc' WHERE ma_so = '7105002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà ta, lườn và đùi, luộc', ten_khong_dau = 'thit ga ta luon va dui luoc' WHERE ma_so = '7106002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà ta, cánh và đùi, luộc', ten_khong_dau = 'thit ga ta canh va dui luoc' WHERE ma_so = '7107002';
UPDATE thuc_pham SET ten_thuc_pham = 'Thịt gà ta, chân và đùi, luộc', ten_khong_dau = 'thit ga ta chan va dui luoc' WHERE ma_so = '7108002';
UPDATE thuc_pham SET ten_thuc_pham = 'Pate lợn', ten_khong_dau = 'pate lon' WHERE ma_so = '7063';
