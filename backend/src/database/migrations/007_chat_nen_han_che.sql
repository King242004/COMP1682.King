-- Bỏ bệnh nền: thay bằng giới hạn muối, đường, béo no chung cho mọi người
DROP TABLE nguoi_dung_benh_nen;
DROP TABLE benh_nen;

-- Muối, đường, béo no của phần đã ăn (gam); món nhập tay để trống
ALTER TABLE bua_an
  ADD COLUMN muoi_g NUMERIC(6,1) CHECK (muoi_g >= 0),
  ADD COLUMN duong_g NUMERIC(6,1) CHECK (duong_g >= 0),
  ADD COLUMN beo_no_g NUMERIC(6,1) CHECK (beo_no_g >= 0);

-- Giới hạn mỗi ngày cho người từ 15 tuổi
INSERT INTO quy_dinh (ma, gia_tri, mo_ta, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('muoi_toi_da_g', 5, 'Muối ăn mỗi ngày phải dưới bao nhiêu gam (natri dưới 2.000 mg)', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, Bảng 46, trang 145, theo WHO 2012. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('ty_le_nang_luong_duong_toi_da', 10, 'Đường đơn, đường đôi chiếm nhiều nhất bao nhiêu % tổng năng lượng', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, mục 4.3, trang 55, theo WHO 2015. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16'),
  ('ty_le_nang_luong_beo_no_toi_da', 10, 'Acid béo no chiếm nhiều nhất bao nhiêu % tổng năng lượng', 'Bộ Y tế, Viện Dinh dưỡng (2016). Nhu cầu dinh dưỡng khuyến nghị cho người Việt Nam, mục 3.4, trang 45. QĐ 2615/QĐ-BYT', 'https://tranbinhduong.com/wp-content/uploads/2024/09/NIN_Vietamese-RDAs-2016.pdf', '2016-06-16');
