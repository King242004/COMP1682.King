-- Số liệu của món đến từ đâu: người dùng tự nhập, AI ước tính, hay nhãn sản phẩm qua mã vạch
ALTER TABLE bua_an
  ADD COLUMN nguon_so_lieu TEXT NOT NULL DEFAULT 'nhap_tay' CHECK (nguon_so_lieu IN ('nhap_tay', 'ai', 'ma_vach'));

-- Hệ số đổi gam ra kcal và tỷ lệ năng lượng khuyến nghị, để vẽ thanh mục tiêu đạm, tinh bột, béo
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('kcal_moi_g_dam', 4, 'Mỗi gam đạm cho bao nhiêu kcal (hệ số Atwater chung)', 'FAO (2003). Food energy: methods of analysis and conversion factors. FAO Food and Nutrition Paper 77, mục 3.5.1', 'https://www.fao.org/4/y5022e/y5022e04.htm', '2003-01-01'),
  ('kcal_moi_g_tinh_bot', 4, 'Mỗi gam tinh bột cho bao nhiêu kcal (hệ số Atwater chung)', 'FAO (2003). Food energy: methods of analysis and conversion factors. FAO Food and Nutrition Paper 77, mục 3.5.1', 'https://www.fao.org/4/y5022e/y5022e04.htm', '2003-01-01'),
  ('kcal_moi_g_beo', 9, 'Mỗi gam chất béo cho bao nhiêu kcal (hệ số Atwater chung)', 'FAO (2003). Food energy: methods of analysis and conversion factors. FAO Food and Nutrition Paper 77, mục 3.5.1', 'https://www.fao.org/4/y5022e/y5022e04.htm', '2003-01-01'),
  ('ty_le_nang_luong_dam_thap', 13, 'Đạm nên chiếm ít nhất bao nhiêu % tổng năng lượng', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 8. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('ty_le_nang_luong_dam_cao', 20, 'Đạm nên chiếm nhiều nhất bao nhiêu % tổng năng lượng', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 8. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('ty_le_nang_luong_beo_thap', 20, 'Chất béo nên chiếm ít nhất bao nhiêu % tổng năng lượng (người từ 20 tuổi; nhóm 15-19 tài liệu ghi 20-30)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 11, trang 44. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('ty_le_nang_luong_beo_cao', 25, 'Chất béo nên chiếm nhiều nhất bao nhiêu % tổng năng lượng (người từ 20 tuổi; nhóm 15-19 tài liệu ghi 20-30)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 11, trang 44. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');
