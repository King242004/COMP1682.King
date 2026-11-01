-- Kho thực phẩm chỉ giữ thứ ăn được ngay (King chốt 01/11/2026): người dùng ghi thứ đã ăn, không cân đồ sống; xóa 223 dòng phải nấu mới ăn được, còn 564; không đổi số nào
-- Giữ hết rau (nhiều rau ăn sống, rau sống và luộc chênh ít), quả chín, trứng, sữa, đồ uống, bánh kẹo, đồ hộp, món truyền thống

-- Gia vị, nước chấm và dầu, mỡ, bơ (nhóm của Viện): đồ để nấu, không ai ăn riêng (34 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bơ', 'Bơ thực vật', 'Bột canh', 'Bột chiên giòn',
  'Bột chiên xù', 'Bột năng', 'Bột nêm', 'Cary bột',
  'Dầu hào', 'Gói thuốc bắc (dùng để hầm thịt)', 'Gừng khô (bột)', 'Gừng tươi',
  'Hạt tiêu', 'Hạt ý dĩ', 'Lá chanh', 'Magi',
  'Mắm tép chua', 'Mắm tôm đặc', 'Mắm tôm loãng', 'Mỡ lợn, muối',
  'Mù tạt', 'Nước mắm cá', 'Nước ướp thịt kho', 'Nghệ khô, bột',
  'Nghệ tươi', 'Ớt khô bột', 'Ớt tươi', 'Riềng',
  'Sa tế', 'Sốt mayonnaise', 'Tương nếp', 'Tương ngô',
  'Tương ớt', 'Xì dầu'
);

-- Thịt (nhóm của Viện) còn sống: chỉ giữ dòng đã nấu (luộc, hấp, nướng, chiên, rán, chần, kho/om, chín) và đồ làm sẵn (chả, giò, xúc xích, ruốc, lạp xường, nem, dăm bông, pate, xá xíu, thịt khô) (74 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bầu dục bò, tươi', 'Bầu dục lợn, tươi', 'Bì lợn, tươi', 'Bột cóc',
  'Châu chấu, tươi', 'Dạ dày bò, tươi', 'Dạ dày lợn, tươi', 'Đầu bò, tươi',
  'Đầu lợn, tươi', 'Đuôi bò, tươi', 'Đuôi lợn, tươi', 'Ếch (thịt đùi), tươi',
  'Gan bò, tươi', 'Gân chân bò, tươi', 'Gan gà, tươi', 'Gan lợn, tươi',
  'Gan vịt, tươi', 'Lòng gà (cả bộ), tươi', 'Lòng lợn (ruột già), tươi', 'Lòng lợn (ruột non), tươi',
  'Lưỡi bò, tươi', 'Lưỡi lợn, tươi', 'Mề gà, tươi', 'Nhộng, tươi',
  'Óc bò, tươi', 'Óc lợn, tươi', 'Phổi bò, tươi', 'Phổi lợn, tươi',
  'Sườn lợn, tươi', 'Tai lợn, tươi', 'Tiết bò, tươi', 'Tiết dê',
  'Tiết gà', 'Tiết lợn, tươi', 'Tim bò, tươi', 'Tim gà, tươi',
  'Tim lợn, tươi', 'Tủy xương bò, tươi', 'Tủy xương lợn, tươi', 'Thịt bê, mỡ, tươi',
  'Thịt bê, nạc, tươi', 'Thịt bò, bắp, tươi', 'Thịt bồ câu, cả con non (ra ràng), tươi', 'Thịt bò, lưng, nạc, tươi',
  'Thịt bò, lưng, nạc và mỡ, tươi', 'Thịt bò, nạc, tươi', 'Thịt bò, nạc và mỡ, tươi', 'Thịt cừu, nạc, tươi',
  'Thịt dê, nạc, tươi', 'Thịt gà công nghiệp, cánh, tươi', 'Thịt gà công nghiệp, đùi, tươi', 'Thịt gà công nghiệp, lườn, tươi',
  'Thịt gà rừng, tươi', 'Thịt gà ta, tươi', 'Thịt gà tây, tươi', 'Thịt hươu, tươi',
  'Thịt lợn, chân giò, tươi', 'Thịt lợn, mỡ, tươi', 'Thịt lợn, mông, tươi', 'Thịt lợn, nạc mông, tươi',
  'Thịt lợn, nạc, tươi', 'Thịt lợn, nạc thăn, tươi', 'Thịt lợn, nạc vai, tươi', 'Thịt lợn, nửa nạc nửa mỡ, tươi',
  'Thịt ngan, tươi', 'Thịt ngỗng, tươi', 'Thịt ngựa, tươi', 'Thịt thỏ nhà, tươi',
  'Thịt thỏ rừng, tươi', 'Thịt trâu, bắp, tươi', 'Thịt trâu, cổ, tươi', 'Thịt trâu, đùi, tươi',
  'Thịt trâu, tươi', 'Thịt vịt, tươi'
);

-- Thủy sản (nhóm của Viện) còn sống: cùng luật với thịt (64 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bánh phồng tôm, sống', 'Bột cá, sống', 'Cá basa, phi lê', 'Cá basa, tươi',
  'Cá bống, tươi', 'Cá chày, tươi', 'Cá chép, tươi', 'Cá chim',
  'Cá chim trắng', 'Cá đao, tươi', 'Cá dầu, tươi', 'Cá đé, tươi',
  'Cá diếc, tươi', 'Cá điêu hồng', 'Cá đối, tươi', 'Cá đồng tiền, tươi',
  'Cá dưa, tươi', 'Cá hồi, tươi', 'Cá khô (chim, thu, nụ, đé), sống', 'Cá lác, tươi',
  'Cá mè, tươi', 'Cá mỡ, tươi', 'Cá mòi (cá sardin), tươi', 'Cá mối, tươi',
  'Cá nạc, tươi', 'Cá nục, tươi', 'Cá ngừ, tươi', 'Cá phèn, tươi',
  'Cá quả, tươi', 'Cá rô đồng, tươi', 'Cá rô phi, tươi', 'Cá thờn bơn, tươi',
  'Cá thu đao, tươi', 'Cá thu, tươi', 'Cá trạch, tươi', 'Cá trắm cỏ, tươi',
  'Cá trê, tươi', 'Cá trích, tươi', 'Cá trôi, tươi', 'Con trùng trục',
  'Cua bể, tươi', 'Cua đồng, tươi', 'Cua ghẹ, tươi', 'Hải sâm, tươi',
  'Hến, tươi', 'Lươn, tươi', 'Mực khô, sống', 'Mực, tươi',
  'Ngao biển trắng', 'Ốc bươu, tươi', 'Ốc đá, tươi', 'Ốc nhồi, tươi',
  'Ốc vặn, tươi', 'Rạm, tươi', 'Rươi, tươi', 'Sò, tươi',
  'Tép gạo, tươi', 'Tép khô, sống', 'Tôm biển, khô', 'Tôm biển, tươi',
  'Tôm đồng, tươi', 'Tôm tít (bề bề)', 'Tu hài', 'Trai, nước ngọt, tươi'
);

-- Khoai củ (nhóm của Viện) chưa nấu: chỉ giữ dòng đã nấu (25 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bột dong lọc', 'Bột khoai lang', 'Bột khoai riềng (bột đao)', 'Bột khoai tây (lọc)',
  'Bột sắn', 'Bột sắn dây', 'Củ ấu, tươi', 'Củ cái, tươi',
  'Củ dong, tươi', 'Củ sắn dây, tươi', 'Củ sắn, tươi', 'Củ súng, bóc vỏ, khô',
  'Củ từ, tươi', 'Khoai lang, khô', 'Khoai lang nghệ, tươi', 'Khoai lang, tươi',
  'Khoai môn, tươi', 'Khoai nước, tươi', 'Khoai riềng, tươi', 'Khoai sọ, tươi',
  'Khoai tây, khô', 'Khoai tây, tươi', 'Miến dong, khô', 'Sắn, củ, khô',
  'Trân châu sắn'
);

-- Ngũ cốc (nhóm của Viện): gạo, kê sống, bột, mỳ sợi khô, ngô hạt khô (12 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bột gạo, gạo nếp thường', 'Bột gạo, gạo tẻ', 'Bột mì, trắng', 'Bột ngô, ngô vàng',
  'Gạo, tẻ, chưa xát (gạo lứt), sống', 'Gạo, trắng, nếp cái, sống', 'Gạo, trắng, nếp thường, sống', 'Gạo, trắng, tẻ, giã tay, sống',
  'Gạo, trắng, tẻ, xát máy, sống', 'Kê, hạt, sống', 'Mỳ sợi, khô', 'Ngô, vàng, hạt, khô'
);

-- Hạt, đậu (nhóm của Viện): bột đậu, đậu hạt khô, đậu phụ sống (14 dòng)
DELETE FROM thuc_pham WHERE ten_thuc_pham IN (
  'Bột đậu tương, đã loại béo', 'Bột đậu tương, rang chín', 'Bột đậu xanh', 'Bột lạc',
  'Đậu cô ve, hạt, khô', 'Đậu đen, hạt, khô', 'Đậu đũa, hạt, khô', 'Đậu Hà Lan, hạt, khô',
  'Đậu phụ chúc, sống', 'Đậu phụ, sống', 'Đậu tương, đậu nành, hạt khô', 'Đậu trắng (đậu tây), hạt, khô',
  'Đậu trứng cuốc, hạt, khô', 'Đậu xanh (đậu tắt), hạt, khô'
);
