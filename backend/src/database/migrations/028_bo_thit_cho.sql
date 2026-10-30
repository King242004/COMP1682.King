-- Bỏ 2 dòng thịt chó khỏi kho thực phẩm (King chốt 30/10/2026); không bảng nào nối tới thuc_pham nên xóa thẳng
DELETE FROM thuc_pham WHERE ma_so IN ('7008', '7009');
