-- Kho thực phẩm chỉ còn thực phẩm đơn (King chốt 02/11/2026): bỏ cả nhóm "Thức ăn truyền thống" của Viện (mã 15…, 76 món nấu sẵn tính trên 100 g), còn 488; không đổi số nào
-- Món nấu đã có ở "Món của Viện" theo suất đã cân (36 món trùng tên, ví dụ "Phở bò chín" 475 kcal/suất mà kho thực phẩm ghi 73 kcal/100 g); món không có ở đó thì người dùng nhờ ô "Bạn đã ăn gì?"

-- Nhóm "Thức ăn truyền thống" (76 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bánh bao chiên có nhân', 'Bánh bèo', 'Bánh bột lọc', 'Bánh cốm',
  'Bánh cuốn', 'Bánh cuốn nóng nhân thịt', 'Bánh chay', 'Bánh chín tầng mây',
  'Bánh chưng', 'Bánh chuối', 'Bánh dày', 'Bánh dẻo nhân thập cẩm',
  'Bánh dẻo nhân trứng', 'Bánh đúc nóng', 'Bánh đúc nguội', 'Bánh gai',
  'Bánh gio', 'Bánh giò', 'Bánh khoái', 'Bánh khoai',
  'Bánh khoai sọ chiên', 'Bánh khúc', 'Bánh mè', 'Bánh mì xíu mại',
  'Bánh mỳ patê', 'Bánh nếp', 'Bánh nướng nhân thập cẩm', 'Bánh nướng nhân trứng đỗ xanh',
  'Bánh phu thê (su sê, xu xuê)', 'Bánh rán bọc đường', 'Bánh tẻ', 'Bánh tôm',
  'Bánh trôi', 'Bún bò Nam Bộ', 'Bún cua', 'Bún chả',
  'Bún đậu', 'Bún nem', 'Bún ốc', 'Caramen',
  'Cơm rang', 'Chả quế', 'Cháo dinh dưỡng tôm', 'Cháo dinh dưỡng thịt bò',
  'Cháo lòng', 'Cháo sườn', 'Cháo trai', 'Chè bưởi',
  'Chè cốm', 'Chè chuối', 'Chè đỗ đen', 'Chè đỗ đỏ',
  'Chè đỗ xanh', 'Chè hạt sen', 'Chè khoai sọ', 'Chè ngô cốm',
  'Chè sắn', 'Chè Thái', 'Gà tần', 'Miến lươn',
  'Miến ngan', 'Mỳ vằn thắn', 'Mỳ xào', 'Nem lụi',
  'Nem rán', 'Nộm tai lợn', 'Phở bò chín', 'Phở bò tái',
  'Phở gà', 'Thịt xiên nướng', 'Xôi đỗ đen', 'Xôi đỗ xanh',
  'Xôi gấc', 'Xôi lạc', 'Xôi ngô', 'Xôi xéo'
);
