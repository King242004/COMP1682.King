-- "Trong 1 suất có": bảng thành phần Viện in trong ảnh suất món ăn, Gemini CHÉP lại (không viết), nhận khi cộng kcal các dòng lệch tổng của món không quá 1%; ô Viện để trống ghi trống
CREATE TABLE thanh_phan_suat (
  id SERIAL PRIMARY KEY,
  ma_so TEXT NOT NULL REFERENCES mon_tra_cuu (ma_so) ON DELETE CASCADE,
  thu_tu INTEGER NOT NULL CHECK (thu_tu >= 1),
  ten_thanh_phan TEXT NOT NULL,
  -- Ô Viện để trống (không cân) thì để trống, không ghi 0
  so_gam NUMERIC(7, 1) CHECK (so_gam >= 0),
  so_calo NUMERIC(7, 1) CHECK (so_calo >= 0),
  nguon TEXT NOT NULL,
  -- Đường dẫn ảnh của Viện có in bảng này, để đối chiếu
  lien_ket TEXT NOT NULL,
  -- Ngày chép từ ảnh
  ngay_hieu_luc DATE NOT NULL,
  UNIQUE (ma_so, thu_tu)
);

-- Chép ngày 23/10/2026, 344 món có bảng (2149 dòng), xếp theo tên món; tên thành phần đã sửa chữ chép sai và bỏ địa danh nơi Viện mua, không đổi số nào (NguonSoLieu.md)

-- Bánh bèo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211054', 1, 'Bánh bèo', 230.0, 344.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23'),
  ('HAP-211054', 2, 'Chả quế', 23.0, 77.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23'),
  ('HAP-211054', 3, 'Quất', 9.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23'),
  ('HAP-211054', 4, 'Rau mùi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23'),
  ('HAP-211054', 5, 'Ớt đỏ', 0.5, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23'),
  ('HAP-211054', 6, 'Nước chấm pha', 68.0, 25.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/banh_beo_hp.webp', '2026-10-23');

-- Bánh bỏng gạo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121079', 1, 'Bỏng gạo', 74.0, 255.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_126.png', '2026-10-23'),
  ('HAN-121079', 2, 'Đường kính', 36.0, 143.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_126.png', '2026-10-23');

-- Bánh bỏng kê
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121075', 1, 'Bỏng kê', 53.0, 183.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_69.webp', '2026-10-23'),
  ('HAN-121075', 2, 'Đường kính', 26.0, 103.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_69.webp', '2026-10-23');

-- Bánh bỏng ngô mật
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121078', 1, 'Bỏng ngô', 33.3, 128.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_127.png', '2026-10-23'),
  ('HAN-121078', 2, 'Mật mía', 16.7, 66.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_127.png', '2026-10-23');

-- Bánh bột lọc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111027', 1, 'Bánh bột lọc', 203.0, 386.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 2, 'Hành phi', 5.0, 9.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 3, 'Rau xà lách', 47.0, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 4, 'Rau thơm', 11.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 5, 'Nước chấm pha', 70.5, 25.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 6, 'Cà rốt', 15.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23'),
  ('HAN-111027', 7, 'Đu đủ', 25.0, 9.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_18.webp', '2026-10-23');

-- Bánh canh ghẹ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112012', 1, 'Bánh canh', 250.0, 279.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 10, 'Chanh, ớt', 17.0, 4.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 11, 'Giá đậu xanh', 45.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 12, 'Rau cần', 45.0, 24.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 13, 'Rau xà lách', 22.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 14, 'Hẹ, rau mùi, hành lá', 12.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 2, 'Trứng cút luộc', 20.0, 34.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 3, 'Thịt chân giò lợn luộc', 27.0, 62.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 4, 'Ghẹ', 17.0, 9.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 5, 'Chả lợn', 11.0, 56.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 6, 'Bỏng cua', 10.0, 41.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 7, 'Tiết lợn luộc', 20.0, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 8, 'Hành phi', 3.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23'),
  ('HAN-112012', 9, 'Nước dùng', 340.0, 39.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_21.png', '2026-10-23');

-- Bánh canh sườn heo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112013', 1, 'Bánh canh', 242.0, 270.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 10, 'Chanh', 14.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 11, 'Ớt', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 12, 'Giá đậu xanh', 45.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 13, 'Rau xà lách', 22.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 14, 'Cần tây', 11.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 15, 'Nước dùng', 320.0, 37.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 2, 'Sườn lợn', 30.0, 56.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 3, 'Tiết lợn luộc', 23.0, 5.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 4, 'Thịt chân giò lợn luộc', 22.0, 50.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 5, 'Gan lợn luộc', 9.0, 13.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 6, 'Hành lá, mùi, hẹ', 11.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 7, 'Hành phi', 3.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 8, 'Củ cải khô', 2.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23'),
  ('HAN-112013', 9, 'Cà rốt', 13.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_22.png', '2026-10-23');

-- Bánh crepe dăm bông phô mai
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122059', 1, 'Bơ', 5.0, 37.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 10, 'Phô mai', 10.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 11, 'Sốt mayonnaise', 10.0, 70.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 2, 'Dầu hỗn hợp', 3.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 3, 'Trứng gà công nghiệp', 10.0, 13.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 4, 'Sữa không đường', 50.0, 37.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 5, 'Đường kính', 4.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 6, 'Bột mỳ', 19.0, 65.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 7, 'Dăm bông lợn', 10.0, 31.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 8, 'Tương ớt', 5.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23'),
  ('HAN-122059', 9, 'Tương cà', 10.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_108.png', '2026-10-23');

-- Bánh crepe mặn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123047', 1, 'Bơ', 4.0, 30.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 10, 'Sốt mayonnaise', 5.0, 35.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 2, 'Dầu hỗn hợp', 3.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 3, 'Trứng gà công nghiệp', 8.0, 10.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 4, 'Sữa bò không đường', 38.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 5, 'Đường kính', 3.0, 11.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 6, 'Bột mỳ', 15.0, 52.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 7, 'Xúc xích', 17.0, 55.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 8, 'Phô mai', 10.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23'),
  ('HAN-123047', 9, 'Tương cà', 10.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_109.png', '2026-10-23');

-- Bánh crepe ngọt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123048', 1, 'Bơ', 4.0, 30.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 2, 'Dầu hỗn hợp', 3.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 3, 'Trứng gà công nghiệp', 8.0, 10.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 4, 'Sữa tươi', 38.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 5, 'Đường kính', 4.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 6, 'Bột mỳ', 15.0, 52.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 7, 'Sữa hộp Milo', 61.0, 33.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 8, 'Sữa đặc', 15.0, 49.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23'),
  ('HAN-123048', 9, 'Phô mai', 10.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_110.png', '2026-10-23');

-- Bánh crepe socola chuối
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122058', 1, 'Bơ', 8.9, 67.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 2, 'Dầu hỗn hợp', 3.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 3, 'Trứng gà công nghiệp', 10.0, 13.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 4, 'Sữa bò tiệt trùng không đường toàn phần trắng', 53.4, 39.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 5, 'Đường kính', 6.3, 25.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 6, 'Muối', 0.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 7, 'Bột mỳ', 19.0, 65.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 8, 'Chuối tiêu', 50.0, 49.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23'),
  ('HAN-122058', 9, 'Bột ca cao', 5.0, 21.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_111.png', '2026-10-23');

-- Bánh crepe xúc xích
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-122057', 1, 'Bơ', 5.0, 37.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 10, 'Sốt mayonnaise', 5.0, 35.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 2, 'Dầu hỗn hợp', 3.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 3, 'Trứng gà công nghiệp', 10.0, 13.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 4, 'Sữa bò không đường', 50.0, 37.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 5, 'Đường kính', 4.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 6, 'Bột mỳ', 19.0, 65.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 7, 'Phô mai', 10.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 8, 'Xúc xích', 20.0, 65.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23'),
  ('SFF-122057', 9, 'Tương cà', 10.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/02/143.PNG', '2026-10-23');

-- Bánh cuốn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113053', 1, 'Bánh cuốn', 171.0, 214.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 2, 'Hành phi', 7.0, 12.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 3, 'Ruốc tôm', 3.0, 9.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 4, 'Chả quế lợn', 45.0, 187.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 5, 'Rau mùi, rau húng', 2.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 6, 'Nước chấm pha', 50.0, 18.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 7, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23'),
  ('HAN-113053', 8, 'Ớt', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_9.webp', '2026-10-23');

-- Bánh cuốn chả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123003', 1, 'Bánh cuốn nóng nhân thịt', 258.0, 351.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_29.webp', '2026-10-23'),
  ('HAN-123003', 2, 'Chả quế', 28.0, 94.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_29.webp', '2026-10-23'),
  ('HAN-123003', 3, 'Hành khô', 10.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_29.webp', '2026-10-23'),
  ('HAN-123003', 4, 'Nước chấm pha', 75.0, 27.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_29.webp', '2026-10-23'),
  ('HAN-123003', 5, 'Rau thơm', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_29.webp', '2026-10-23');

-- Bánh cuốn chay chả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211004', 1, 'Bánh cuốn', 251.0, 314.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_chay_cha_hp.webp', '2026-10-23'),
  ('HAP-211004', 2, 'Chả lợn', 64.0, 331.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_chay_cha_hp.webp', '2026-10-23'),
  ('HAP-211004', 3, 'Hành phi', 3.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_chay_cha_hp.webp', '2026-10-23'),
  ('HAP-211004', 4, 'Rau mùi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_chay_cha_hp.webp', '2026-10-23'),
  ('HAP-211004', 5, 'Nước chấm pha', 61.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_chay_cha_hp.webp', '2026-10-23');

-- Bánh cuốn nóng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111002', 1, 'Bánh cuốn nóng nhân thịt', 272.0, 370.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 10, 'Hạt tiêu', 1.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 11, 'Nước chấm pha', 97.0, 35.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 2, 'Chả lợn', 33.0, 170.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 3, 'Bánh cuốn trứng gà', 112.0, 144.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 4, 'Hành khô', 6.0, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 5, 'Ớt vàng to', 24.0, 8.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 6, 'Quất chín', 35.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 7, 'Rau húng', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 8, 'Rau kinh giới', 2.0, 0.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23'),
  ('HAN-111002', 9, 'Rau mùi', 3.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_11.webp', '2026-10-23');

-- Bánh cuốn nhân tôm thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211005', 1, 'Bánh cuốn nhân thịt', 216.0, 270.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 2, 'Chả lợn', 28.0, 144.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 3, 'Ruốc thịt lợn', 5.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 4, 'Tôm biển chiên', 6.0, 7.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 5, 'Rau mùi', 4.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 6, 'Hành phi', 6.0, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23'),
  ('SFF-211005', 7, 'Nước chấm pha', 61.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/214.PNG', '2026-10-23');

-- Bánh cuốn nhân thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113009', 1, 'Bánh cuốn nóng nhân thịt', 224.0, 304.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_12.webp', '2026-10-23'),
  ('HAN-113009', 2, 'Chả quế lợn', 40.0, 166.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_12.webp', '2026-10-23'),
  ('HAN-113009', 3, 'Hành củ tươi', 12.0, 3.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_12.webp', '2026-10-23'),
  ('HAN-113009', 4, 'Rau húng', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_12.webp', '2026-10-23'),
  ('HAN-113009', 5, 'Rau kinh giới', 6.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_12.webp', '2026-10-23');

-- Bánh cuốn Thanh Trì
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113075', 1, 'Bánh cuốn nóng nhân thịt', 275.0, 374.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 2, 'Chả quế', 20.0, 67.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 3, 'Ruốc tôm', 9.0, 27.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 4, 'Hành phi', 25.0, 46.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 5, 'Rau mùi', 6.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 6, 'Rau húng', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23'),
  ('HAN-113075', 7, 'Ớt tươi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_47.png', '2026-10-23');

-- Bánh cuốn thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211009', 1, 'Bánh cuốn', 205.0, 256.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 2, 'Chả lợn', 27.0, 139.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 3, 'Ruốc thịt lợn', 10.0, 36.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 4, 'Hành phi', 8.0, 15.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 5, 'Nước chấm pha', 98.0, 36.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 6, 'Hành tây', 8.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 7, 'Chanh', 3.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 8, 'Ớt đỏ', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23'),
  ('HAP-211009', 9, 'Rau ăn kèm', 11.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_cuon_thit.webp', '2026-10-23');

-- Bánh cuốn trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211006', 1, 'Bánh cuốn', 152.0, 190.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 2, 'Trứng gà ta', 101.5, 152.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 3, 'Ruốc thịt lợn', 5.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 4, 'Chả lợn', 28.0, 144.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 5, 'Hành phi', 5.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 6, 'Rau mùi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23'),
  ('SFF-211006', 7, 'Nước chấm pha', 61.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/215.PNG', '2026-10-23');

-- Bánh chay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122041', 1, 'Bánh chay', 60.0, 154.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_30.webp', '2026-10-23'),
  ('HAN-122041', 2, 'Nước đường', 128.0, 46.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_30.webp', '2026-10-23');

-- Bánh chưng rán
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122042', 1, 'Bánh chưng', 185.0, 416.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_33.webp', '2026-10-23');

-- Bánh chuối
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122051', 1, 'Bánh chuối', 89.0, 177.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_31.webp', '2026-10-23');

-- Bánh đa bò nhừ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211055', 1, 'Bánh đa trắng', 69.0, 239.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 10, 'Nước dùng', 438.0, 52.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 11, 'Rau mùi', 10.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 2, 'Thịt bò hầm', 99.0, 205.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 3, 'Rau mùi', 24.0, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 4, 'Rau xà lách', 24.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 5, 'Rau húng', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 6, 'Quất chín', 9.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 7, 'Ớt', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 8, 'Hành tây', 40.0, 20.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23'),
  ('SFF-211055', 9, 'Nước chấm', 34.0, 12.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/173.PNG', '2026-10-23');

-- Bánh đa cua
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211045', 1, 'Bánh đa', 59.0, 204.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 10, 'Bề bề luộc', 5.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 11, 'Nấm hương', 7.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 12, 'Thịt lợn ba chỉ', 7.0, 18.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 13, 'Quất chín', 13.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 14, 'Nước dùng + cà chua', 319.0, 39.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 15, 'Cua đồng', 12.0, 10.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 16, 'Đậu phụ', 24.0, 23.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 2, 'Giá đậu xanh', 33.0, 17.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 3, 'Cần ta', 19.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 4, 'Thịt lợn ba chỉ rán', 6.0, 20.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 5, 'Chả cá thu rán', 5.0, 9.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 6, 'Chả lá lốt', 10.0, 23.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 7, 'Tôm biển luộc', 4.0, 3.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 8, 'Hành phi', 1.2, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23'),
  ('HAP-211045', 9, 'Rau ăn kèm', 50.0, 12.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_22.png', '2026-10-23');

-- Bánh đa cua, bò, giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113002', 1, 'Bánh đa đỏ', 65.0, 225.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_5.png', '2026-10-23'),
  ('HAN-113002', 2, 'Thịt bò', 40.0, 47.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_5.png', '2026-10-23'),
  ('HAN-113002', 3, 'Giò tai', 25.0, 138.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_5.png', '2026-10-23'),
  ('HAN-113002', 4, 'Hành lá', 11.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_5.png', '2026-10-23'),
  ('HAN-113002', 5, 'Nước cua', 250.0, 66.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_5.png', '2026-10-23');

-- Bánh đa cua, bò, mọc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111030', 1, 'Bánh đa đỏ', 69.6, 241.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 10, 'Quất chín', 24.0, 10.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 11, 'Nước dùng', 430.0, 50.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 12, 'Ớt khô chưng mỡ', 14.0, 73.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 2, 'Nước xốt cua', 49.0, 50.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 3, 'Cần ta', 85.0, 14.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 4, 'Giá đậu xanh', 27.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 5, 'Mọc', 31.0, 42.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 6, 'Cá rô phi chiên', 29.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 7, 'Đậu phụ rán', 42.0, 69.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 8, 'Chả cá', 21.0, 43.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23'),
  ('HAN-111030', 9, 'Thịt bò chần', 57.0, 100.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_1-1.png', '2026-10-23');

-- Bánh đa cua, giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113093', 1, 'Bánh đa đỏ', 63.0, 217.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 2, 'Cần ta', 23.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 3, 'Giá đậu xanh', 25.0, 13.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 4, 'Giò tai lợn', 28.0, 154.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 5, 'Chả cá', 15.0, 31.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 6, 'Hành phi', 12.0, 22.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23'),
  ('HAN-113093', 7, 'Nước riêu cua', 300.0, 35.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_3.png', '2026-10-23');

-- Bánh đa cua trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113094', 1, 'Bánh đa đỏ', 77.0, 267.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 2, 'Cần tây', 66.0, 36.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 3, 'Giá đậu xanh', 45.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 4, 'Giò tai', 25.0, 138.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 5, 'Chả cá', 13.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 6, 'Hành phi', 16.0, 30.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23'),
  ('HAN-113094', 7, 'Magi', 16.0, 10.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_4.png', '2026-10-23');

-- Bánh đa đỏ trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112016', 1, 'Bánh đa đỏ', 73.0, 253.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 10, 'Ớt đỏ to', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 2, 'Giá đậu xanh', 55.0, 29.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 3, 'Cá rô phi rán', 25.0, 32.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 4, 'Mọc', 15.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 5, 'Giò tai', 24.0, 132.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 6, 'Rau muống luộc', 52.0, 14.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 7, 'Nước sốt', 26.0, 9.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 8, 'Hành phi', 8.0, 13.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23'),
  ('HAN-112016', 9, 'Lạc rang', 8.0, 48.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_6.png', '2026-10-23');

-- Bánh đa kê
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223037', 1, 'Bánh đa', 18.0, 71.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_71.webp', '2026-10-23'),
  ('HAP-223037', 2, 'Kê nấu', 114.0, 196.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_71.webp', '2026-10-23'),
  ('HAP-223037', 3, 'Đậu xanh đồ', 29.0, 56.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_71.webp', '2026-10-23'),
  ('HAP-223037', 4, 'Đường kính', 7.0, 27.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_71.webp', '2026-10-23');

-- Bánh đa ngan
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213069', 1, 'Bánh đa trắng', 60.0, 208.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 10, 'Nước dùng', 458.0, 72.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 2, 'Hành tây', 16.0, 8.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 3, 'Thịt ngan luộc', 52.0, 208.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 4, 'Măng tươi luộc', 20.0, 7.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 5, 'Tiết luộc', 22.0, 5.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 6, 'Quất', 8.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 7, 'Rau thơm', 22.0, 4.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 8, 'Magi', 14.0, 9.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23'),
  ('SFF-213069', 9, 'Hành tây', 15.0, 7.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/174.PNG', '2026-10-23');

-- Bánh dày
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122038', 1, 'Xôi trắng (đồ)', 80.0, 184.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_34.webp', '2026-10-23'),
  ('HAN-122038', 2, 'Đậu xanh đồ', 20.0, 38.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_34.webp', '2026-10-23');

-- Bánh dày giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122066', 1, 'Xôi trắng (đồ)', 95.0, 218.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_36.webp', '2026-10-23'),
  ('HAN-122066', 2, 'Giò lụa', 53.0, 71.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_36.webp', '2026-10-23');

-- Bánh dày ngọt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122039', 1, 'Bánh nếp nhân ngọt', 159.0, 374.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_37.webp', '2026-10-23');

-- Bánh đúc tàu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211002', 1, 'Bánh đúc', 188.0, 97.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_duc_tau.webp', '2026-10-23'),
  ('HAP-211002', 2, 'Tôm biển luộc', 36.0, 29.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_duc_tau.webp', '2026-10-23'),
  ('HAP-211002', 3, 'Thịt lợn mỡ luộc', 4.0, 13.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_duc_tau.webp', '2026-10-23'),
  ('HAP-211002', 4, 'Đu đủ xào', 51.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_duc_tau.webp', '2026-10-23'),
  ('HAP-211002', 5, 'Nước chấm pha', 45.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/14/banh_duc_tau.webp', '2026-10-23');

-- Bánh gà Hồng Mai
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112054', 1, 'Thịt gà lườn tẩm bột chiên', 470.0, 1501.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_50.png', '2026-10-23'),
  ('HAN-112054', 2, 'Tương ớt', 20.0, 8.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_50.png', '2026-10-23'),
  ('HAN-112054', 3, 'Tương cà chua', 20.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_50.png', '2026-10-23'),
  ('HAN-112054', 4, 'Sốt mayonnaise', 10.0, 70.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_50.png', '2026-10-23');

-- Bánh gối 3 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121042', 1, 'Bánh gối', 210.0, 563.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23'),
  ('HAN-121042', 2, 'Rau xà lách', 40.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23'),
  ('HAN-121042', 3, 'Rau húng', 7.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23'),
  ('HAN-121042', 4, 'Rau kinh giới', 2.0, 0.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23'),
  ('HAN-121042', 5, 'Ớt đỏ to', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23'),
  ('HAN-121042', 6, 'Nước chấm', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_41.webp', '2026-10-23');

-- Bánh gối rán 2 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223005', 1, 'Bánh gối', 194.0, 520.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 2, 'Trứng gà', 12.0, 17.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 3, 'Cà rốt', 7.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 4, 'Đu đủ xanh', 7.0, 2.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 5, 'Rau xà lách', 31.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 6, 'Rau húng', 7.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23'),
  ('HAP-223005', 7, 'Nước chấm pha', 62.0, 22.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_73.webp', '2026-10-23');

-- Bánh giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122030', 1, 'Bánh giò', 260.0, 325.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_42.webp', '2026-10-23');

-- Bánh gio mật mía
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122031', 1, 'Bánh gio', 159.0, 275.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_107.png', '2026-10-23'),
  ('HAN-122031', 2, 'Mật mía', 48.0, 156.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_107.png', '2026-10-23');

-- Bánh mì chảo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111031', 1, 'Bánh mỳ (4 cái)', 112.0, 280.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 2, 'Pate gan', 70.0, 129.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 3, 'Xúc xích', 39.0, 126.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 4, 'Trứng gà rán', 37.0, 56.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 5, 'Khoai tây', 23.0, 24.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 6, 'Thịt chân giò lợn muối', 26.0, 59.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 7, 'Nước sốt', 20.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23'),
  ('HAN-111031', 8, 'Nộm su hào', 20.0, 8.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_40.png', '2026-10-23');

-- Bánh mì thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112048', 1, 'Bánh mỳ', 71.0, 177.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 2, 'Pate', 65.0, 212.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 3, 'Thịt lợn ba chỉ rán', 30.0, 98.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 4, 'Ruốc thịt lợn', 6.0, 22.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 5, 'Thịt nguội', 38.0, 120.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 6, 'Bơ', 6.0, 45.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23'),
  ('HAN-112048', 7, 'Dưa chuột', 13.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_1.webp', '2026-10-23');

-- Bánh mì - xôi chảo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211085', 1, 'Bánh mỳ', 39.0, 97.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 10, 'Nước sốt', 151.0, 55.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 2, 'Trứng gà ốp', 56.0, 85.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 3, 'Pate', 47.0, 153.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 4, 'Lạp xưởng', 51.0, 298.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 5, 'Xúc xích', 53.0, 172.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 6, 'Khoai tây rán', 20.0, 59.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 7, 'Dưa chuột', 24.0, 4.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 8, 'Xôi lá nếp', 30.0, 69.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23'),
  ('SFF-211085', 9, 'Cùi dừa non', 2.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/218.PNG', '2026-10-23');

-- Bánh mỳ bít tết
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111003', 1, 'Bánh mỳ', 65.0, 162.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 10, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 11, 'Xì dầu', 7.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 12, 'Bột đao', 2.0, 6.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 2, 'Thịt bò sống', 100.0, 118.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 3, 'Pate', 63.0, 205.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 4, 'Trứng gà ốp', 64.0, 84.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 5, 'Hành lá', 5.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 6, 'Cà chua', 7.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 7, 'Nước sốt', 120.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 8, 'Dưa chuột', 103.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23'),
  ('HAN-111003', 9, 'Khoai tây rán', 127.0, 375.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_3.webp', '2026-10-23');

-- Bánh mỳ bò sốt vang
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213024', 1, 'Bánh mỳ', 74.0, 185.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23'),
  ('HAP-213024', 2, 'Thịt bò nạm hầm', 100.0, 207.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23'),
  ('HAP-213024', 3, 'Cà rốt nấu', 20.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23'),
  ('HAP-213024', 4, 'Khoai tây hầm', 20.0, 20.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23'),
  ('HAP-213024', 5, 'Rau mùi', 6.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23'),
  ('HAP-213024', 6, 'Nước sốt vang', 210.0, 77.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_119.webp', '2026-10-23');

-- Bánh mỳ cay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211020', 1, 'Bánh mỳ', 110.0, 275.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_114.webp', '2026-10-23'),
  ('HAP-211020', 2, 'Pate', 140.0, 456.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_114.webp', '2026-10-23'),
  ('HAP-211020', 3, 'Tương ớt', 50.0, 20.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_114.webp', '2026-10-23');

-- Bánh mỳ chả cá sốt cay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213012', 1, 'Bánh mỳ', 42.0, 105.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/216.PNG', '2026-10-23'),
  ('SFF-213012', 2, 'Chả cá basa rán', 35.0, 65.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/216.PNG', '2026-10-23'),
  ('SFF-213012', 3, 'Rau xà lách', 5.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/216.PNG', '2026-10-23'),
  ('SFF-213012', 4, 'Dưa chuột', 16.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/216.PNG', '2026-10-23'),
  ('SFF-213012', 5, 'Nước chấm pha', 10.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/216.PNG', '2026-10-23');

-- Bánh mỳ chảo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211072', 1, 'Bánh mỳ', 79.0, 197.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 2, 'Xúc xích chiên', 44.0, 176.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 3, 'Pate', 20.0, 65.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 4, 'Trứng gà rán', 40.0, 60.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 5, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 6, 'Dưa chuột', 32.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 7, 'Khoai tây rán', 28.0, 83.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 8, 'Thịt bò thăn xào', 13.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23'),
  ('SFF-211072', 9, 'Nước chấm pha', 257.0, 94.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/217.PNG', '2026-10-23');

-- Bánh mỳ chảo bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112011', 1, 'Bánh mỳ', 79.0, 197.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23'),
  ('HAN-112011', 2, 'Thịt bò xào', 73.0, 234.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23'),
  ('HAN-112011', 3, 'Trứng gà rán', 39.0, 59.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23'),
  ('HAN-112011', 4, 'Dưa chuột', 157.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23'),
  ('HAN-112011', 5, 'Nước dùng', 118.0, 14.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23'),
  ('HAN-112011', 6, 'Pate', 47.0, 153.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_42.png', '2026-10-23');

-- Bánh mỳ chảo lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112010', 1, 'Bánh mỳ', 79.0, 197.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 2, 'Xúc xích', 49.0, 159.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 3, 'Trứng rán', 39.0, 59.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 4, 'Dăm bông lợn', 36.0, 114.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 5, 'Pate', 47.0, 153.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 6, 'Nước dùng', 118.0, 14.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23'),
  ('HAN-112010', 7, 'Dưa chuột', 157.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_43.png', '2026-10-23');

-- Bánh mỳ chảo sốt ngọt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211044', 1, 'Bánh mỳ', 39.0, 97.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 2, 'Trứng gà rán', 52.0, 79.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 3, 'Pate', 20.0, 65.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 4, 'Lạp xưởng', 20.0, 117.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 5, 'Dưa chuột', 39.0, 7.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 6, 'Xúc xích', 26.0, 84.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 7, 'Khoai tây rán', 14.0, 41.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23'),
  ('SFF-211044', 8, 'Nước sốt', 193.0, 221.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/219.PNG', '2026-10-23');

-- Bánh mỳ gà quay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113030', 1, 'Bánh mỳ', 63.0, 157.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 2, 'Thịt đùi gà rán', 61.0, 120.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 3, 'Hành tây', 28.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 4, 'Bơ thực vật', 5.0, 36.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 5, 'Dưa chuột', 19.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 6, 'Rau xà lách', 9.0, 1.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 7, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 8, 'Nộm rau củ', 12.0, 15.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23'),
  ('HAN-113030', 9, 'Hành phi', 5.0, 9.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_4.webp', '2026-10-23');

-- Bánh mỳ giò chả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122065', 1, 'Bánh mỳ', 54.0, 135.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_45.webp', '2026-10-23'),
  ('HAN-122065', 2, 'Chả lợn', 28.0, 144.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_45.webp', '2026-10-23'),
  ('HAN-122065', 3, 'Ruốc thịt lợn', 3.0, 11.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_45.webp', '2026-10-23'),
  ('HAN-122065', 4, 'Lạp xưởng rán', 7.0, 41.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_45.webp', '2026-10-23'),
  ('HAN-122065', 5, 'Dưa chuột', 29.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_45.webp', '2026-10-23');

-- Bánh mỳ nướng muối ớt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211094', 1, 'Bánh mỳ', 81.0, 202.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23'),
  ('SFF-211094', 2, 'Dầu hỗn hợp', 10.0, 90.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23'),
  ('SFF-211094', 3, 'Ruốc thịt lợn', 11.0, 40.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23'),
  ('SFF-211094', 4, 'Xúc xích chiên rán', 18.0, 72.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23'),
  ('SFF-211094', 5, 'Hành phi', 6.0, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23'),
  ('SFF-211094', 6, 'Nước sốt', 33.0, 12.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/221.PNG', '2026-10-23');

-- Bánh mỳ pa tê trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111016', 1, 'Bánh mỳ', 62.0, 155.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 2, 'Pate', 34.0, 110.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 3, 'Ruốc thịt lợn', 13.0, 48.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 4, 'Trứng rán', 56.0, 85.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 5, 'Hành khô', 11.0, 20.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 6, 'Tương ớt', 8.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 7, 'Rau mùi', 9.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23'),
  ('HAN-111016', 8, 'Dưa chuột', 11.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_45.png', '2026-10-23');

-- Bánh mỳ pate thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113027', 1, 'Bánh mỳ', 63.0, 157.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 10, 'Ruốc thịt lợn', 2.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 11, 'Nước sốt', 20.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 2, 'Pate gan', 32.0, 59.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 3, 'Bơ thực vật', 15.0, 109.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 4, 'Dăm bông lợn', 34.0, 108.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 5, 'Chả lợn', 25.0, 129.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 6, 'Thịt ba chỉ rán', 19.0, 62.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 7, 'Dưa chuột', 6.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 8, 'Su hào', 8.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23'),
  ('HAN-113027', 9, 'Hành phi', 2.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_46.png', '2026-10-23');

-- Bánh mỳ pate trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113029', 1, 'Bánh mỳ', 65.0, 162.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 2, 'Pate gan', 40.0, 74.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 3, 'Trứng gà', 57.0, 75.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 4, 'Dưa chuột', 23.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 5, 'Nộm rau củ thập cẩm', 15.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 6, 'Hành phi', 5.0, 9.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23'),
  ('HAN-113029', 7, 'Nước sốt', 20.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_5.webp', '2026-10-23');

-- Bánh mỳ pate trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123019', 1, 'Bánh mỳ', 49.0, 122.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23'),
  ('HAN-123019', 2, 'Trứng rán', 55.9, 98.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23'),
  ('HAN-123019', 3, 'Pate', 53.0, 172.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23'),
  ('HAN-123019', 4, 'Dưa chuột', 48.0, 7.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23'),
  ('HAN-123019', 5, 'Cà rốt', 30.0, 13.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23'),
  ('HAN-123019', 6, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_44.webp', '2026-10-23');

-- Bánh mỳ pate trứng chả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113028', 1, 'Bánh mỳ', 60.0, 150.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 2, 'Pate gan', 41.0, 76.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 3, 'Trứng gà rán', 57.0, 75.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 4, 'Chả lợn', 2.0, 10.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 5, 'Dưa chuột', 23.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 6, 'Su hào', 17.0, 7.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 7, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 8, 'Hành phi', 7.0, 12.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23'),
  ('HAN-113028', 9, 'Nước sốt', 20.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_6.webp', '2026-10-23');

-- Bánh mỳ que
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121030', 1, 'Bánh mỳ', 27.0, 67.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_46.webp', '2026-10-23'),
  ('HAN-121030', 2, 'Pate', 28.0, 91.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_46.webp', '2026-10-23'),
  ('HAN-121030', 3, 'Tương ớt', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_46.webp', '2026-10-23'),
  ('HAN-121030', 4, 'Rau mùi', 17.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_46.webp', '2026-10-23'),
  ('HAN-121030', 5, 'Sốt mayonnaise', 45.0, 315.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_46.webp', '2026-10-23');

-- Bánh mỳ sốt trứng cút
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213011', 1, 'Bánh mỳ', 40.0, 100.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23'),
  ('SFF-213011', 2, 'Lạc rang', 21.0, 127.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23'),
  ('SFF-213011', 3, 'Thịt bò khô', 16.0, 38.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23'),
  ('SFF-213011', 4, 'Trứng cút luộc', 40.0, 69.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23'),
  ('SFF-213011', 5, 'Hành phi', 9.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23'),
  ('SFF-213011', 6, 'Nước sốt bánh mỳ', 133.0, 49.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/222.PNG', '2026-10-23');

-- Bánh mỳ sốt vang
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113035', 1, 'Bánh mỳ', 67.0, 167.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_8.webp', '2026-10-23'),
  ('HAN-113035', 2, 'Thịt bò hầm', 115.0, 356.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_8.webp', '2026-10-23'),
  ('HAN-113035', 3, 'Rau mùi', 10.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_8.webp', '2026-10-23'),
  ('HAN-113035', 4, 'Hành lá', 7.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_8.webp', '2026-10-23');

-- Bánh mỳ thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122007', 1, 'Bánh mỳ', 65.0, 162.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 2, 'Chả lợn', 16.0, 82.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 3, 'Thịt lợn xá xíu', 25.0, 72.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 4, 'Pate', 31.0, 101.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 5, 'Dăm bông lợn', 33.0, 105.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 6, 'Đu đủ xanh', 47.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 7, 'Cà rốt', 5.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23'),
  ('HAN-122007', 8, 'Rau mùi', 4.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_47.webp', '2026-10-23');

-- Bánh mỳ thịt xiên mật ong
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211073', 1, 'Bánh mỳ', 44.0, 110.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/220.PNG', '2026-10-23'),
  ('SFF-211073', 2, 'Nước pha mật ong', 5.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/220.PNG', '2026-10-23'),
  ('SFF-211073', 3, 'Dầu hỗn hợp', 5.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/220.PNG', '2026-10-23'),
  ('SFF-211073', 4, 'Thịt lợn nướng', 49.0, 168.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/220.PNG', '2026-10-23'),
  ('SFF-211073', 5, 'Đu đủ', 39.0, 11.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/220.PNG', '2026-10-23');

-- Bánh nếp
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122040', 1, 'Bánh nếp', 116.0, 282.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_48.webp', '2026-10-23');

-- Bánh ngô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121020', 1, 'Bánh ngô', 131.0, 458.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_114.png', '2026-10-23');

-- Bánh rán đường
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122032', 1, 'Bánh rán bọc đường', 240.0, 680.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_50.webp', '2026-10-23');

-- Bánh rán mặn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121004', 1, 'Bánh rán nhân mặn', 134.0, 377.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_52.webp', '2026-10-23'),
  ('HAN-121004', 2, 'Nước chấm pha', 45.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_52.webp', '2026-10-23'),
  ('HAN-121004', 3, 'Su hào', 20.0, 9.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_52.webp', '2026-10-23'),
  ('HAN-121004', 4, 'Cà rốt', 5.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_52.webp', '2026-10-23'),
  ('HAN-121004', 5, 'Ớt tươi', 3.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_52.webp', '2026-10-23');

-- Bánh rán mật
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122034', 1, 'Bánh rán mật', 244.0, 691.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_53.webp', '2026-10-23');

-- Bánh rán ngọt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123042', 1, 'Bột mỳ', 30.0, 104.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_55.webp', '2026-10-23'),
  ('HAN-123042', 2, 'Đường kính', 36.0, 143.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_55.webp', '2026-10-23'),
  ('HAN-123042', 3, 'Đậu xanh đồ', 2.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_55.webp', '2026-10-23');

-- Bánh rán ngọt có vừng 3 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223014', 1, 'Bánh rán nhân ngọt có vừng', 60.0, 289.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_81.webp', '2026-10-23');

-- Bánh rán ngọt không vừng 5 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223015', 1, 'Bánh rán nhân ngọt không vừng', 115.0, 554.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_82.webp', '2026-10-23');

-- Bánh rán vừng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122033', 1, 'Bánh rán nhân đỗ', 210.0, 1012.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_57.webp', '2026-10-23'),
  ('HAN-122033', 2, 'Vừng trắng', 5.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_57.webp', '2026-10-23');

-- Bánh tẻ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122052', 1, 'Bánh tẻ', 180.0, 336.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_58.webp', '2026-10-23');

-- Bánh tiêu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123041', 1, 'Bánh tiêu to', 51.0, 199.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_59.webp', '2026-10-23');

-- Bánh tôm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111026', 1, 'Bánh tôm', 156.0, 503.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 2, 'Rau xà lách', 22.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 3, 'Tía tô', 9.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 4, 'Cà chua tỉa hoa', 19.0, 4.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 5, 'Nước chấm pha, ớt', 70.5, 25.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 6, 'Cà rốt', 10.0, 4.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23'),
  ('HAN-111026', 7, 'Đu đủ xanh', 25.0, 7.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_13.webp', '2026-10-23');

-- Bánh tráng nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121051', 1, 'Bánh đa', 19.0, 63.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 10, 'Tép khô', 2.0, 5.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 11, 'Sốt mayonnaise', 10.0, 70.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 2, 'Bơ', 2.0, 15.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 3, 'Trứng cút', 25.0, 37.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 4, 'Xúc xích', 10.0, 32.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 5, 'Thịt bò khô', 10.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 6, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 7, 'Hành phi', 10.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 8, 'Sốt bơ', 10.0, 38.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23'),
  ('HAN-121051', 9, 'Sốt me', 10.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_115.png', '2026-10-23');

-- Bánh tráng trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121045', 1, 'Bánh đa nem', 58.0, 194.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 2, 'Thịt bò khô', 10.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 3, 'Lạc rang', 10.0, 60.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 4, 'Hành khô', 11.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 5, 'Tép khô', 2.0, 5.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 6, 'Xoài xanh', 80.0, 59.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 7, 'Sốt bơ', 10.0, 70.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23'),
  ('HAN-121045', 8, 'Sốt me', 10.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_60.webp', '2026-10-23');

-- Bánh trôi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113026', 1, 'Bánh trôi tàu', 139.0, 223.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 2, 'Cùi dừa già', 5.0, 19.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 3, 'Vừng', 1.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 4, 'Nước cốt dừa', 10.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 5, 'Nước chè', 100.0, 72.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 6, 'Gừng tươi', 2.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23'),
  ('HAN-113026', 7, 'Lạc rang', 5.0, 30.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_16.webp', '2026-10-23');

-- Bánh trôi tàu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113098', 1, 'Bánh trôi nhân đỗ xanh', 58.0, 93.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23'),
  ('HAN-113098', 2, 'Bánh trôi nhân mè đen', 61.0, 97.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23'),
  ('HAN-113098', 3, 'Lạc rang', 22.0, 133.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23'),
  ('HAN-113098', 4, 'Nước cốt dừa', 50.0, 15.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23'),
  ('HAN-113098', 5, 'Gừng tươi', 5.0, 2.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23'),
  ('HAN-113098', 6, 'Phần nước', 70.0, 50.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_49.png', '2026-10-23');

-- Bắp xào tép
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-221022', 1, 'Ngô ngọt chiên bơ', 180.0, 712.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/263-1742975512.PNG', '2026-10-23'),
  ('HAP-221022', 2, 'Hành phi', 18.0, 34.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/263-1742975512.PNG', '2026-10-23'),
  ('HAP-221022', 3, 'Tép khô rang', 5.0, 12.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/263-1742975512.PNG', '2026-10-23');

-- Bì bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211071', 1, 'Thịt bò gân luộc', 148.0, 268.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 10, 'Chanh, ớt', 18.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 11, 'Rau thơm', 29.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 12, 'Tương nếp', 42.0, 36.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 13, 'Mắm tôm loãng', 37.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 2, 'Thịt bò nạm luộc', 98.0, 243.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 3, 'Bánh đa', 52.0, 174.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 4, 'Thính', 34.0, 122.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 5, 'Chuối xanh', 134.0, 103.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 6, 'Khế', 23.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 7, 'Đu đủ xanh', 16.0, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 8, 'Cà rốt', 9.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23'),
  ('SFF-211071', 9, 'Giá đậu xanh', 1.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/223.PNG', '2026-10-23');

-- Bò bía
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122069', 1, 'Bánh đa', 13.0, 43.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_116.png', '2026-10-23'),
  ('HAN-122069', 2, 'Cùi dừa già', 25.0, 96.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_116.png', '2026-10-23'),
  ('HAN-122069', 3, 'Mạch nha', 10.0, 33.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_116.png', '2026-10-23'),
  ('HAN-122069', 4, 'Vừng đen', 2.0, 11.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_116.png', '2026-10-23');

-- Bỏng ngô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121077', 1, 'Bỏng ngô', 68.0, 262.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_128.png', '2026-10-23');

-- Bún bò dấm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211011', 1, 'Bún tươi', 195.0, 217.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 2, 'Thịt bò thăn xào', 67.0, 108.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 3, 'Tỏi ta', 4.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 4, 'Giá đậu xanh', 30.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 5, 'Hành phi', 4.9, 8.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 6, 'Lạc rang', 10.0, 60.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 7, 'Dưa chuột', 40.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 8, 'Rau xà lách', 22.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23'),
  ('HAP-211011', 9, 'Nước chấm pha', 351.0, 129.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_17.png', '2026-10-23');

-- Bún bò Nam Bộ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112017', 1, 'Bún tươi', 212.0, 236.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 10, 'Nước dùng', 88.0, 10.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 2, 'Rau xà lách', 12.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 3, 'Rau thơm', 6.0, 1.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 4, 'Thịt bò xào', 54.0, 77.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 5, 'Lạc rang', 9.0, 54.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 6, 'Hành phi', 14.0, 26.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 7, 'Nước chấm pha, ớt', 100.0, 37.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 8, 'Tỏi ta', 1.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23'),
  ('HAN-112017', 9, 'Giá đậu xanh', 18.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_8.png', '2026-10-23');

-- Bún bò nhừ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211001', 1, 'Bún tươi', 250.0, 279.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 10, 'Ớt', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 11, 'Hành, mùi', 10.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 12, 'Nước dùng', 455.0, 54.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 2, 'Thịt bò nạc hầm', 31.0, 64.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 3, 'Thịt bò có gân hầm', 45.0, 139.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 4, 'Thịt bò nạm hầm', 46.0, 65.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 5, 'Thịt bò nạc chần', 19.0, 29.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 6, 'Bánh quẩy', 51.0, 150.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 7, 'Rau xà lách', 54.0, 9.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 8, 'Hành tây', 13.0, 6.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23'),
  ('SFF-211001', 9, 'Chanh', 7.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/176.PNG', '2026-10-23');

-- Bún cá
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121047', 1, 'Bún tươi', 142.0, 158.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 2, 'Cá rô phi chiên', 88.0, 115.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 3, 'Thìa là', 12.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 4, 'Hành phi', 11.0, 14.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 5, 'Cải ngọt', 55.0, 9.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 6, 'Ớt đỏ', 10.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 7, 'Cà chua', 40.0, 10.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23'),
  ('HAN-121047', 8, 'Nước dùng', 350.0, 55.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_52.webp', '2026-10-23');

-- Bún cá cay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213030', 1, 'Bún tươi', 273.0, 304.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 2, 'Cá thu rán', 16.0, 34.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 3, 'Chả cá thu rán', 30.0, 55.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 4, 'Cá rô phi rán', 23.0, 30.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 5, 'Lòng cá ba sa rán', 31.0, 27.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 6, 'Dồi lợn rán', 21.0, 24.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 7, 'Thìa là, hành lá', 9.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23'),
  ('SFF-213030', 8, 'Nước dùng', 540.0, 67.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/177.PNG', '2026-10-23');

-- Bún cá cay Cảng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211104', 1, 'Bún tươi', 203.0, 226.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 10, 'Nước me', 20.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 11, 'Nước dùng', 341.0, 42.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 2, 'Cá bò chiên', 21.0, 22.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 3, 'Cá thu chiên', 17.0, 37.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 4, 'Chả cá thu chần', 27.0, 50.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 5, 'Thịt chân giò lợn luộc', 22.0, 50.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 6, 'Rau xà lách', 32.0, 5.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 7, 'Hành, mùi', 13.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 8, 'Ớt', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23'),
  ('SFF-211104', 9, 'Ớt đỏ chưng', 24.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/178.PNG', '2026-10-23');

-- Bún cá chấm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-13034', 1, 'Bún tươi', 210.0, 234.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 10, 'Nước chấm', 20.0, 7.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 2, 'Cá rô phi rán', 117.0, 153.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 3, 'Giá đậu xanh', 37.0, 19.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 4, 'Cần ta', 57.0, 9.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 5, 'Dứa ta', 7.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 6, 'Cà chua', 2.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 7, 'Hành lá', 17.0, 4.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 8, 'Măng chua', 34.0, 9.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23'),
  ('HAN-13034', 9, 'Nước dùng', 90.0, 10.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_7.png', '2026-10-23');

-- Bún cua thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213048', 1, 'Bún tươi', 239.0, 266.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 10, 'Nước dùng', 367.0, 43.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 2, 'Cần ta', 59.0, 10.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 3, 'Rau mùi, hành lá', 26.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 4, 'Mộc nhĩ xào', 53.0, 176.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 5, 'Bề bề chiên', 9.0, 11.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 6, 'Tôm biển chiên', 10.0, 12.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 7, 'Thịt cua bể rán', 26.0, 26.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 8, 'Chả lá lốt', 10.0, 23.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23'),
  ('SFF-213048', 9, 'Rau ăn kèm', 45.0, 19.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/180.PNG', '2026-10-23');

-- Bún chả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113016', 1, 'Bún tươi', 397.0, 443.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 10, 'Nước chấm pha', 250.0, 91.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 2, 'Cà rốt', 4.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 3, 'Đu đủ xanh', 101.0, 30.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 4, 'Rau húng', 5.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 5, 'Rau kinh giới', 5.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 6, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 7, 'Rau xà lách', 19.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 8, 'Chanh', 9.7, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23'),
  ('HAN-113016', 9, 'Chả viên nướng', 163.0, 653.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_11.png', '2026-10-23');

-- Bún chả nem
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112037', 1, 'Bún tươi', 280.0, 312.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 10, 'Cà rốt', 3.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 2, 'Chả viên nướng', 105.0, 421.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 3, 'Nem hải sản', 107.0, 337.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 4, 'Rau xà lách', 31.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 5, 'Rau thơm', 15.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 6, 'Ớt đỏ to', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 7, 'Tỏi ta', 8.0, 9.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 8, 'Nước chấm pha', 273.0, 100.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23'),
  ('HAN-112037', 9, 'Đu đủ', 40.0, 14.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_10.png', '2026-10-23');

-- Bún chả quạt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211008', 1, 'Bún tươi', 276.0, 308.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 10, 'Cà rốt', 16.0, 7.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 11, 'Đu đủ xanh', 57.0, 17.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 2, 'Thịt lợn ba chỉ nướng', 125.0, 429.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 3, 'Ớt đỏ', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 4, 'Rau xà lách', 20.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 5, 'Rau kinh giới', 3.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 6, 'Rau húng', 5.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 7, 'Rau mùi', 4.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 8, 'Rau xà lách', 18.0, 3.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23'),
  ('HAP-211008', 9, 'Nước chấm pha', 174.0, 64.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_cha_quat_hp.png', '2026-10-23');

-- Bún chả rươi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111005', 1, 'Bún tươi', 253.0, 282.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 10, 'Nước chấm pha', 66.0, 24.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 2, 'Chả rươi', 186.0, 394.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 3, 'Ớt tươi', 3.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 4, 'Cà rốt', 9.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 5, 'Đu đủ xanh', 25.0, 7.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 6, 'Rau xà lách', 3.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 7, 'Rau húng', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 8, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23'),
  ('HAN-111005', 9, 'Chanh', 17.5, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_5.png', '2026-10-23');

-- Bún đậu mắm tôm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112055', 1, 'Bún tươi', 371.0, 414.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 10, 'Dầu đậu tương', 18.0, 162.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 11, 'Ớt đỏ', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 12, 'Đường kính', 10.0, 39.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 2, 'Rau mùi', 11.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 3, 'Dưa chuột', 80.0, 14.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 4, 'Rau kinh giới', 20.0, 7.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 5, 'Thịt chân giò lợn luộc', 52.0, 119.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 6, 'Đậu phụ rán', 150.0, 249.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 7, 'Chả cốm', 29.0, 150.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 8, 'Quất', 13.5, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23'),
  ('HAN-112055', 9, 'Mắm tôm đặc', 40.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_mam_tom.png', '2026-10-23');

-- Bún đậu mắm tôm, lòng lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111029', 1, 'Bún tươi', 340.0, 379.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 10, 'Quất', 10.0, 4.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 11, 'Mắm tôm + đường', 39.0, 57.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 2, 'Đậu phụ rán', 138.0, 229.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 3, 'Chả lợn', 19.0, 98.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 4, 'Nem rán', 19.0, 50.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 5, 'Lòng non luộc', 16.0, 8.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 6, 'Dạ dày rán', 9.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 7, 'Tai lợn luộc', 14.0, 17.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 8, 'Thịt chân giò lợn luộc', 11.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23'),
  ('HAN-111029', 9, 'Dồi lợn luộc', 29.0, 33.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_6.png', '2026-10-23');

-- Bún đậu mẹt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113056', 1, 'Bún tươi', 378.0, 421.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 2, 'Đậu phụ rán', 170.0, 283.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 3, 'Thịt chân giò lợn', 35.0, 80.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 4, 'Dồi lợn luộc', 34.0, 39.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 5, 'Dưa chuột', 41.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 6, 'Quất', 5.0, 2.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 7, 'Rau thơm', 16.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 8, 'Mắm tôm loãng', 42.0, 18.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23'),
  ('HAN-113056', 9, 'Ớt tươi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_dau_met.png', '2026-10-23');

-- Bún dọc mùng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113019', 1, 'Bún tươi', 200.0, 223.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 10, 'Nước dùng', 350.0, 41.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 2, 'Móng giò luộc', 11.7, 13.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 3, 'Lưỡi lợn luộc', 18.0, 45.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 4, 'Sườn lợn hầm', 40.0, 102.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 5, 'Thịt chân giò luộc', 36.0, 39.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 6, 'Mộc nhĩ', 2.0, 6.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 7, 'Giò lụa', 18.0, 24.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 8, 'Dọc mùng', 50.0, 6.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23'),
  ('HAN-113019', 9, 'Hành lá', 2.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_doc_mung.png', '2026-10-23');

-- Bún gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211046', 1, 'Bún tươi', 184.0, 205.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 2, 'Thịt gà ta đùi luộc', 66.0, 172.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 3, 'Hành, thì là, mùi', 9.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 4, 'Rau kinh giới, xà lách, hoa chuối', 14.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 5, 'Quất', 15.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 6, 'Nước dùng', 289.0, 34.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 7, 'Hành tây', 18.0, 9.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23'),
  ('SFF-211046', 8, 'Tiết lợn luộc', 33.0, 8.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/181.PNG', '2026-10-23');

-- Bún giả cầy
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112056', 1, 'Bún tươi', 459.0, 512.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 10, 'Măng củ', 56.0, 16.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 11, 'Hành lá', 27.0, 7.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 12, 'Nước dùng', 190.0, 22.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 2, 'Dưa chuột', 71.0, 17.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 3, 'Quất chín', 20.0, 8.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 4, 'Rau thơm', 41.0, 12.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 5, 'Mắm tôm', 40.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 6, 'Dầu ăn', 10.0, 90.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 7, 'Ớt', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 8, 'Đường kính', 10.0, 39.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23'),
  ('HAN-112056', 9, 'Móng giả cầy', 49.8, 60.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_gia_cay.png', '2026-10-23');

-- Bún mắm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213019', 1, 'Bún tươi', 200.0, 223.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 10, 'Tỏi phi', 4.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 11, 'Cà tím', 33.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 12, 'Nước dùng', 338.0, 53.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 2, 'Tôm biển luộc', 5.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 3, 'Chả cá basa', 15.0, 27.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 4, 'Chả viên cá basa', 22.0, 40.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 5, 'Thịt lợn xá xíu', 27.0, 78.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 6, 'Mực tươi hấp', 22.0, 25.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 7, 'Hẹ lá', 3.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 8, 'Rau đắng', 7.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23'),
  ('SFF-213019', 9, 'Rau xà lách', 14.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/175.PNG', '2026-10-23');

-- Bún móng giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-221035', 1, 'Bún tươi', 200.0, 223.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 10, 'Hành phi', 11.0, 20.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 11, 'Quất', 14.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 12, 'Rau ăn kèm', 24.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 13, 'Ớt đỏ', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 2, 'Móng giò lợn luộc', 30.0, 35.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 3, 'Mọc thịt chiên', 11.0, 14.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 4, 'Chả lá lốt rán', 7.0, 16.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 5, 'Chả thịt lợn chiên', 8.0, 26.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 6, 'Nước dùng', 416.0, 65.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 7, 'Riêu cua đồng', 19.0, 16.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 8, 'Mọc thịt lợn luộc', 5.0, 11.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23'),
  ('HAP-221035', 9, 'Hành, mùi', 8.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_48.webp', '2026-10-23');

-- Bún nem cá
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113033', 1, 'Bún tươi', 230.0, 256.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 10, 'Nấm hương, mộc nhĩ', 3.0, 7.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 11, 'Thịt lợn nạc', 18.0, 25.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 12, 'Dầu ăn', 7.0, 63.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 13, 'Rau thơm', 44.0, 13.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 14, 'Nước dùng', 300.0, 37.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 15, 'Nước chấm pha', 30.0, 11.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 2, 'Cần ta', 28.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 3, 'Cải ngọt luộc', 33.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 4, 'Dọc mùng', 23.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 5, 'Hành lá', 3.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 6, 'Cá rô phi rán', 48.0, 62.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 7, 'Chả cá', 37.0, 76.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 8, 'Bột chiên', 24.0, 83.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23'),
  ('HAN-113033', 9, 'Cá rô phi', 17.0, 16.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/07/17/screenshot_9.png', '2026-10-23');

-- Bún nem cua bể
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113017', 1, 'Bún tươi', 300.0, 335.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 2, 'Nem hải sản', 90.0, 130.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 3, 'Cà rốt', 5.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 4, 'Đu đủ xanh', 100.0, 30.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 5, 'Rau húng', 5.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 6, 'Rau kinh giới', 5.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 7, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 8, 'Chanh', 9.7, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23'),
  ('HAN-113017', 9, 'Nước chấm pha', 250.0, 91.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_7.png', '2026-10-23');

-- Bún nem nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213042', 1, 'Nem nướng', 68.0, 189.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 10, 'Nước chấm pha', 101.0, 37.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 2, 'Chả ram', 32.0, 101.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 3, 'Bánh đa nem', 26.0, 87.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 4, 'Bún tươi', 140.0, 156.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 5, 'Dưa chuột', 38.0, 6.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 6, 'Xoài xanh', 23.0, 17.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 7, 'Cà rốt', 8.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 8, 'Củ cải trắng muối', 40.0, 13.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23'),
  ('HAP-213042', 9, 'Rau ăn kèm', 18.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_37.webp', '2026-10-23');

-- Bún ngâm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211010', 1, 'Bún tươi', 272.0, 303.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 10, 'Nước dùng', 296.0, 35.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 11, 'Rau xà lách', 66.0, 11.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 2, 'Tôm biển hấp', 9.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 3, 'Cá rô phi rán', 21.0, 27.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 4, 'Chả cá thu', 8.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 5, 'Sườn lợn hầm', 24.0, 62.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 6, 'Rau cần', 19.0, 10.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 7, 'Thìa là, hành lá', 8.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 8, 'Quất', 11.0, 4.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23'),
  ('SFF-211010', 9, 'Ớt', 11.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/182.PNG', '2026-10-23');

-- Bún ngan
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123009', 1, 'Bún tươi', 202.0, 225.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 2, 'Thịt ngan luộc', 83.0, 332.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 3, 'Tiết lợn luộc', 21.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 4, 'Bánh quẩy', 29.0, 85.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 5, 'Măng tươi luộc', 68.0, 23.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 6, 'Hành lá', 33.0, 8.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 7, 'Chanh', 11.3, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23'),
  ('HAN-123009', 8, 'Rau thơm', 15.0, 4.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_54.webp', '2026-10-23');

-- Bún ngan măng khô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113105', 1, 'Bún tươi', 189.0, 210.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 2, 'Thịt ngan luộc', 76.0, 304.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 3, 'Mọc mộc nhĩ', 28.0, 43.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 4, 'Tiết ngan luộc', 27.0, 6.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 5, 'Măng khô nấu', 53.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 6, 'Hành lá', 7.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 7, 'Rau mùi', 8.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23'),
  ('HAN-113105', 8, 'Nước dùng', 380.0, 45.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_9.png', '2026-10-23');

-- Bún ngan măng tươi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113005', 1, 'Bún tươi', 179.0, 199.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 2, 'Tiết ngan luộc', 46.5, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 3, 'Mọc mộc nhĩ', 39.2, 58.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 4, 'Thịt ngan luộc', 68.0, 272.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 5, 'Hành lá', 22.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 6, 'Măng tươi', 55.0, 16.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23'),
  ('HAN-113005', 7, 'Nước dùng', 310.0, 36.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_8.png', '2026-10-23');

-- Bún ngan Thanh Hà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121041', 1, 'Bún tươi', 277.0, 309.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 10, 'Nước dùng', 374.0, 59.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 2, 'Thịt ngan luộc', 72.0, 288.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 3, 'Măng tre', 44.0, 13.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 4, 'Hành tây', 10.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 5, 'Hành lá', 12.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 6, 'Rau húng', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 7, 'Măng muối', 91.0, 24.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 8, 'Chanh', 13.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23'),
  ('HAN-121041', 9, 'Ớt đỏ', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_55.webp', '2026-10-23');

-- Bún ốc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111023', 1, 'Bún tươi', 148.0, 165.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 10, 'Rau sống', 20.0, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 2, 'Ốc vặn luộc', 36.0, 104.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 3, 'Ốc mít luộc', 36.0, 104.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 4, 'Đậu phụ rán', 25.0, 41.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 5, 'Nước dùng', 463.0, 55.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 6, 'Tía tô', 6.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 7, 'Cà chua', 61.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 8, 'Hành phi', 3.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23'),
  ('HAN-111023', 9, 'Giá đậu xanh', 7.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/21/bun_oc.png', '2026-10-23');

-- Bún ốc chấm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111014', 1, 'Bún tươi', 223.0, 248.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 2, 'Ốc vặn luộc', 56.0, 162.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 3, 'Ốc nhồi luộc', 54.0, 182.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 4, 'Chanh', 24.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 5, 'Ớt tươi', 31.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 6, 'Rau sống', 10.5, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 7, 'Hoa chuối', 18.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 8, 'Cà chua', 20.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23'),
  ('HAN-111014', 9, 'Nước dùng', 365.0, 43.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_10.png', '2026-10-23');

-- Bún ốc nóng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113052', 1, 'Bún tươi', 256.0, 285.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 2, 'Ốc nhồi luộc', 24.0, 80.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 3, 'Ốc vặn luộc', 26.0, 65.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 4, 'Hành lá', 11.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 5, 'Bánh quẩy', 17.0, 50.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 6, 'Rau sống', 11.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 7, 'Cà chua', 27.0, 6.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23'),
  ('HAN-113052', 8, 'Ớt chưng', 5.0, 27.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_oc_nong.png', '2026-10-23');

-- Bún ốc nguội
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112057', 1, 'Bún tươi', 255.0, 284.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_12.png', '2026-10-23'),
  ('HAN-112057', 2, 'Ốc nhồi luộc', 70.0, 236.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_12.png', '2026-10-23'),
  ('HAN-112057', 3, 'Nước ốc', 155.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_12.png', '2026-10-23'),
  ('HAN-112057', 4, 'Giấm bỗng', 10.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_12.png', '2026-10-23'),
  ('HAN-112057', 5, 'Ớt chưng', 4.0, 24.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_12.png', '2026-10-23');

-- Bún ốc sườn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112015', 1, 'Bún tươi', 202.0, 225.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 10, 'Ớt đỏ', 11.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 11, 'Nước dùng', 465.0, 55.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 2, 'Sườn lợn hầm', 40.0, 102.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 3, 'Ốc nhồi luộc', 18.0, 60.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 4, 'Ốc vặn luộc', 22.0, 63.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 5, 'Củ chuối', 8.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 6, 'Rau xà lách', 26.0, 4.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 7, 'Tía tô', 14.0, 5.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 8, 'Giá đậu xanh', 10.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23'),
  ('HAN-112015', 9, 'Cà chua', 50.0, 12.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_13.png', '2026-10-23');

-- Bún riêu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121048', 1, 'Bún tươi', 155.0, 173.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 2, 'Riêu cua', 32.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 3, 'Đậu phụ rán', 20.0, 33.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 4, 'Tía tô', 7.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 5, 'Hành lá', 10.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 6, 'Chuối xanh', 28.0, 21.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 7, 'Cà chua', 40.0, 10.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 8, 'Ớt đỏ', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23'),
  ('HAN-121048', 9, 'Nước dùng', 395.0, 62.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_1.webp', '2026-10-23');

-- Bún riêu bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113001', 1, 'Bún tươi', 173.0, 193.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23'),
  ('HAN-113001', 2, 'Hành lá', 12.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23'),
  ('HAN-113001', 3, 'Thịt bò', 87.0, 102.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23'),
  ('HAN-113001', 4, 'Giò tai', 23.0, 127.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23'),
  ('HAN-113001', 5, 'Đậu phụ rán', 28.0, 46.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23'),
  ('HAN-113001', 6, 'Nước riêu cua', 205.0, 54.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_14.png', '2026-10-23');

-- Bún riêu cua
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211090', 1, 'Bún tươi', 208.0, 232.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 2, 'Mọc thịt lợn luộc', 75.0, 164.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 3, 'Hành phi', 1.0, 1.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 4, 'Riêu cua', 17.8, 15.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 5, 'Hành, mùi', 8.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 6, 'Rau ăn kèm', 37.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 7, 'Ớt tươi', 4.0, 0.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 8, 'Nước dùng', 241.0, 64.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23'),
  ('HAP-211090', 9, 'Cà chua nấu canh', 40.0, 10.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_cua_hp.png', '2026-10-23');

-- Bún riêu cua bò giò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123001', 1, 'Bún tươi', 197.0, 219.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 2, 'Đậu phụ rán', 51.0, 84.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 3, 'Giò tai', 28.0, 154.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 4, 'Thịt bò', 27.0, 28.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 5, 'Chả cá', 14.0, 26.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 6, 'Hành lá', 6.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23'),
  ('HAN-123001', 7, 'Nước dùng', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_2.webp', '2026-10-23');

-- Bún riêu cua, giò, bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113013', 1, 'Bún tươi', 150.0, 168.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 2, 'Thịt bò', 43.0, 50.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 3, 'Giò tai', 20.0, 110.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 4, 'Đậu phụ rán', 19.0, 31.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 5, 'Cà chua', 30.0, 7.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 6, 'Hành lá', 4.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23'),
  ('HAN-113013', 7, 'Nước riêu cua', 221.0, 58.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_11.png', '2026-10-23');

-- Bún riêu gánh
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111006', 1, 'Bún tươi', 171.0, 190.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 10, 'Đậu phụ rán', 22.0, 36.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 11, 'Nước dùng', 279.0, 33.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 12, 'Rau thơm', 10.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 13, 'Rau xà lách', 65.0, 10.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 2, 'Ốc nhỏ luộc', 35.0, 88.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 3, 'Chả cá', 20.0, 41.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 4, 'Giò tai', 26.0, 143.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 5, 'Thịt bò', 33.0, 39.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 6, 'Hành phi', 17.0, 54.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 7, 'Giá đậu xanh', 33.0, 17.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 8, 'Riêu cua', 10.0, 10.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23'),
  ('HAN-111006', 9, 'Hành lá', 14.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_rieu_ganh.png', '2026-10-23');

-- Bún rươi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211115', 1, 'Bún tươi', 208.0, 232.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 2, 'Xúc xích rán', 9.0, 36.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 3, 'Rươi chiên', 34.0, 30.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 4, 'Dọc mùng sống', 24.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 5, 'Hành, mùi', 10.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 6, 'Rau ăn kèm', 43.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 7, 'Nước dùng', 367.0, 44.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 8, 'Nước cốt me', 20.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23'),
  ('HAP-211115', 9, 'Kim chi cải thảo muối', 43.0, 10.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_ruoi_hp.png', '2026-10-23');

-- Bún sườn mọc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121074', 1, 'Bún tươi', 250.0, 279.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 2, 'Sườn lợn hầm', 44.1, 112.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 3, 'Mọc mộc nhĩ', 31.0, 39.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 4, 'Măng khô', 41.0, 12.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 5, 'Rau mùi tàu', 8.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 6, 'Hành tây', 3.0, 1.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 7, 'Rau húng', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23'),
  ('HAN-121074', 8, 'Nước dùng', 390.0, 61.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_3.webp', '2026-10-23');

-- Bún tôm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211070', 1, 'Bún tươi', 175.0, 195.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23'),
  ('SFF-211070', 2, 'Tôm biển luộc', 46.0, 37.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23'),
  ('SFF-211070', 3, 'Nấm hương, mộc nhĩ chần', 12.0, 6.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23'),
  ('SFF-211070', 4, 'Rau cần', 13.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23'),
  ('SFF-211070', 5, 'Hành, mùi', 11.0, 4.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23'),
  ('SFF-211070', 6, 'Nước dùng', 306.0, 36.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/183.PNG', '2026-10-23');

-- Bún thang
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113024', 1, 'Bún tươi', 250.0, 279.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 10, 'Nước dùng', 380.0, 45.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 2, 'Trứng vịt rán', 4.0, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 3, 'Giò lụa', 5.0, 6.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 4, 'Cải xanh', 19.0, 4.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 5, 'Thịt gà ta luộc', 65.0, 179.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 6, 'Hành lá', 6.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 7, 'Nấm hương', 7.0, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 8, 'Rau răm', 4.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23'),
  ('HAN-113024', 9, 'Mắm tôm loãng', 10.0, 4.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_thang.png', '2026-10-23');

-- Bún trộn Nam Bộ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113038', 1, 'Bún tươi', 235.0, 262.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 2, 'Thịt bò', 55.0, 91.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 3, 'Cà rốt', 15.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 4, 'Rau xà lách', 15.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 5, 'Hành lá', 8.0, 2.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 6, 'Lạc rang', 15.0, 91.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23'),
  ('HAN-113038', 7, 'Nước sốt trộn', 100.0, 36.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/bun_tron_nam_bo.png', '2026-10-23');

-- Burger BBQ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111018', 1, 'Bánh mỳ', 100.0, 265.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 10, 'Nước sốt', 21.0, 12.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 2, 'Thịt hun khói', 14.0, 22.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 3, 'Rau xà lách', 21.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 4, 'Cà chua', 26.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 5, 'Hành tây', 9.0, 4.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 6, 'Dưa chuột muối', 14.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 7, 'Phô mai', 24.0, 91.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 8, 'Thịt bò băm rán', 123.0, 199.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23'),
  ('HAN-111018', 9, 'Sốt mayonnaise', 21.0, 147.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_20.webp', '2026-10-23');

-- Burger cá
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112008', 1, 'Bánh mỳ', 64.0, 170.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23'),
  ('HAN-112008', 2, 'Cá tẩm bột chiên', 72.0, 85.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23'),
  ('HAN-112008', 3, 'Sốt mayonnaise', 5.0, 35.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23'),
  ('HAN-112008', 4, 'Rau xà lách', 10.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23'),
  ('HAN-112008', 5, 'Tương ớt', 8.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23'),
  ('HAN-112008', 6, 'Tương cà chua', 9.0, 10.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_51.png', '2026-10-23');

-- Burger Cheesy
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111019', 1, 'Bánh mỳ', 100.0, 265.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 2, 'Thịt bò', 123.0, 193.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 3, 'Rau xà lách', 21.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 4, 'Cà chua', 26.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 5, 'Phô mai', 24.0, 91.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 6, 'Sốt mayonnaise', 35.0, 245.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23'),
  ('HAN-111019', 7, 'Hành củ chiên', 14.0, 26.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_21.webp', '2026-10-23');

-- Burger gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112006', 1, 'Bánh mỳ', 68.0, 180.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 2, 'Thịt gà chiên xù', 75.0, 239.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 3, 'Rau xà lách', 5.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 4, 'Cà chua', 5.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 5, 'Sốt mayonnaise', 5.0, 35.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 6, 'Sốt BBQ', 5.0, 19.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 7, 'Tương cà chua', 9.0, 10.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23'),
  ('HAN-112006', 8, 'Tương ớt', 8.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_52.png', '2026-10-23');

-- Burger tôm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112009', 1, 'Bánh mỳ', 58.0, 154.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_53.png', '2026-10-23'),
  ('HAN-112009', 2, 'Tôm tẩm bột chiên', 75.0, 346.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_53.png', '2026-10-23'),
  ('HAN-112009', 3, 'Rau xà lách', 10.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_53.png', '2026-10-23'),
  ('HAN-112009', 4, 'Sốt mayonnaise', 5.0, 35.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_53.png', '2026-10-23');

-- Cà phê dừa
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211037', 1, 'Cà phê đen', 147.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23'),
  ('SFF-211037', 2, 'Thạch đen', 26.0, 11.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23'),
  ('SFF-211037', 3, 'Thạch dừa', 24.0, 10.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23'),
  ('SFF-211037', 4, 'Trân châu', 22.0, 75.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23'),
  ('SFF-211037', 5, 'Mứt dừa khô', 9.0, 69.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23'),
  ('SFF-211037', 6, 'Cùi dừa', 4.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/226.PNG', '2026-10-23');

-- Cà phê trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-113060', 1, 'Lòng đỏ trứng gà', 55.0, 179.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/31/92.PNG', '2026-10-23'),
  ('SFF-113060', 2, 'Cà phê đen', 10.0, 0.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/31/92.PNG', '2026-10-23'),
  ('SFF-113060', 3, 'Sữa đặc', 15.0, 49.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/31/92.PNG', '2026-10-23');

-- Cá viên chiên đường phố (5 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121083', 1, 'Tương ớt', 30.0, 12.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_129.png', '2026-10-23'),
  ('HAN-121083', 2, 'Cá viên chiên (1 xiên)', 75.0, 191.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_129.png', '2026-10-23');

-- Cánh gà nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113108', 1, 'Cánh gà', 330.0, 621.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 2, 'Dầu hỗn hợp', 10.0, 90.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 3, 'Sốt ướp', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 4, 'Rau húng', 13.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 5, 'Rau mùi tàu', 10.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 6, 'Su hào', 15.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23'),
  ('HAN-113108', 7, 'Nước sốt chấm', 39.0, 14.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_40.webp', '2026-10-23');

-- Cánh gà tẩm bột chiên
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113069', 1, 'Cánh gà tẩm bột chiên', 88.0, 320.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_84.png', '2026-10-23'),
  ('HAN-113069', 2, 'Nước sốt cà chua', 10.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_84.png', '2026-10-23'),
  ('HAN-113069', 3, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_84.png', '2026-10-23');

-- Caramen hoa quả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111008', 1, 'Caramen', 100.0, 108.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 2, 'Nước đường', 8.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 3, 'Dưa hấu', 29.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 4, 'Mít dai', 3.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 5, 'Quả thanh long', 13.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 6, 'Lê', 15.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23'),
  ('HAN-111008', 7, 'Xoài chín', 7.0, 4.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_22.webp', '2026-10-23');

-- Caramen hoa quả tươi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112059', 1, 'Quả thanh long', 34.0, 16.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 10, 'Nước sốt', 66.0, 42.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 11, 'Nước cốt dừa', 10.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 2, 'Mít dai', 50.0, 26.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 3, 'Chuối tây', 23.0, 15.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 4, 'Xoài chín', 30.0, 20.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 5, 'Táo tây', 15.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 6, 'Dâu tây', 12.0, 7.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 7, 'Bơ sáp', 25.0, 25.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 8, 'Nho', 14.0, 9.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23'),
  ('HAN-112059', 9, 'Caramen', 71.0, 77.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_66.png', '2026-10-23');

-- Caramen matcha trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112045', 1, 'Thạch macha', 119.0, 53.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 2, 'Trân châu trắng to', 10.0, 34.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 3, 'Caramen', 68.0, 74.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 4, 'Trân châu trắng bé', 37.0, 127.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 5, 'Trân châu lá dứa', 6.0, 20.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 6, 'Hạt chia', 3.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 7, 'Nước cốt dừa', 20.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23'),
  ('HAN-112045', 8, 'Sữa đặc có đường', 18.0, 59.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_67.png', '2026-10-23');

-- Caramen thập cẩm (có xôi)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111009', 1, 'Caramen', 111.0, 120.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 10, 'Nước cốt dừa', 47.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 2, 'Dưa hấu', 21.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 3, 'Mít dai', 3.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 4, 'Quả thanh long', 12.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 5, 'Lê', 11.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 6, 'Xoài chín', 11.0, 7.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 7, 'Thạch', 37.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 8, 'Trân châu', 39.5, 135.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23'),
  ('HAN-111009', 9, 'Xôi nếp cẩm', 90.0, 211.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_68.png', '2026-10-23');

-- Caramen thập cẩm (không xôi)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112058', 1, 'Caramen', 71.0, 77.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 2, 'Nước cốt dừa', 60.0, 18.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 3, 'Đường kính', 6.0, 23.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 4, 'Nước cốt dừa', 10.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 5, 'Thạch dừa ngọt', 30.0, 19.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 6, 'Trân châu đen', 20.0, 68.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 7, 'Trân châu trắng', 18.0, 61.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 8, 'Thạch socola', 21.0, 9.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23'),
  ('HAN-112058', 9, 'Thạch dừa', 54.0, 17.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_69.png', '2026-10-23');

-- Cơm gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121033', 1, 'Cơm tẻ', 213.0, 383.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 10, 'Giá đậu xanh luộc', 32.0, 18.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 2, 'Trứng ốp', 34.0, 67.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 3, 'Thịt đùi gà tẩm bột chiên', 184.0, 588.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 4, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 5, 'Cải bắp luộc', 82.0, 33.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 6, 'Dưa muối', 34.0, 8.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 7, 'Cà rốt', 2.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 8, 'Hành lá', 5.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23'),
  ('HAN-121033', 9, 'Nước dùng', 217.0, 34.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_98.png', '2026-10-23');

-- Cơm rang dưa bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112003', 1, 'Cơm rang', 444.0, 880.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23'),
  ('HAN-112003', 2, 'Thịt bò', 84.0, 88.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23'),
  ('HAN-112003', 3, 'Dưa cải sen', 122.0, 20.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23'),
  ('HAN-112003', 4, 'Dưa chuột muối', 90.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23'),
  ('HAN-112003', 5, 'Nước dùng', 140.0, 16.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23'),
  ('HAN-112003', 6, 'Hành lá', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_33.png', '2026-10-23');

-- Cơm rang thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112004', 1, 'Cơm rang', 444.0, 880.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 2, 'Dưa chuột muối', 90.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 3, 'Cà rốt', 15.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 4, 'Ngô ngọt', 10.0, 20.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 5, 'Đậu cô ve', 48.0, 37.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 6, 'Lạp xưởng', 10.0, 58.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 7, 'Chả lợn', 10.0, 51.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 8, 'Nước dùng', 140.0, 16.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23'),
  ('HAN-112004', 9, 'Hành lá', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_34.png', '2026-10-23');

-- Cuốn bỗng 8 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213053', 1, 'Bún tươi', 80.0, 89.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 10, 'Rau xà lách', 33.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 11, 'Rau sắn', 5.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 12, 'Rau mùi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 13, 'Rau húng', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 2, 'Thịt lợn nạc luộc', 24.0, 28.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 3, 'Tôm biển luộc', 24.0, 19.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 4, 'Trứng rán', 24.0, 36.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 5, 'Giò lụa', 48.0, 65.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 6, 'Rau kinh giới', 8.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 7, 'Rau xà lách', 4.0, 0.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 8, 'Hành lá', 5.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23'),
  ('SFF-213053', 9, 'Nước chấm pha', 91.0, 33.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/224.PNG', '2026-10-23');

-- Chả cá Lã Vọng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111017', 1, 'Cá lăng rán', 144.0, 127.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 2, 'Bún tươi', 227.0, 253.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 3, 'Mắm tôm + chanh đường', 59.0, 53.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 4, 'Hành lá', 49.0, 12.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 5, 'Thì là', 22.0, 9.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 6, 'Rau mùi', 9.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 7, 'Hành củ tươi', 20.0, 5.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 8, 'Ớt', 6.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23'),
  ('HAN-111017', 9, 'Lạc rang', 33.0, 200.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_85.png', '2026-10-23');

-- Chả cá Thăng Long chảo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113012', 1, 'Bún tươi', 239.0, 266.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 10, 'Lạc rang', 19.0, 115.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 2, 'Cá lăng rán', 294.0, 260.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 3, 'Hành lá', 145.0, 37.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 4, 'Rau húng', 6.0, 1.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 5, 'Thìa là', 69.0, 29.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 6, 'Dầu hỗn hợp', 5.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 7, 'Đường kính', 2.0, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 8, 'Mắm tôm', 18.0, 13.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23'),
  ('HAN-113012', 9, 'Nước mắm', 15.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_41.webp', '2026-10-23');

-- Chả lợn mỡ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223019', 1, 'Chả lợn', 71.0, 367.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/264-1742975593.PNG', '2026-10-23');

-- Chả rươi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112052', 1, 'Chả rươi', 198.0, 327.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 10, 'Tương ớt', 3.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 2, 'Rau mùi', 9.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 3, 'Rau húng', 18.0, 5.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 4, 'Rau kinh giới', 8.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 5, 'Tỏi ta', 2.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 6, 'Cà rốt', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 7, 'Đu đủ', 54.0, 20.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 8, 'Nước chấm pha', 150.0, 55.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23'),
  ('HAN-112052', 9, 'Quất', 12.7, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_86.png', '2026-10-23');

-- Chân gà nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113109', 1, 'Dầu hỗn hợp', 5.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 2, 'Chân gà', 31.0, 58.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 3, 'Sốt ướp', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 4, 'Rau húng', 13.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 5, 'Rau mùi tàu', 10.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 6, 'Su su', 15.0, 3.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23'),
  ('HAN-113109', 7, 'Nước sốt chấm', 40.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_42.webp', '2026-10-23');

-- Chân gà nướng mắm (5 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112025', 1, 'Dầu hỗn hợp', 4.0, 36.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 2, 'Đường kính', 0.6, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 3, 'Nước mắm cá', 5.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 4, 'Bột canh', 1.7, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 5, 'Chân gà chiên (189g)', 28.5, 80.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 6, 'Dưa chuột', 285.0, 51.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 7, 'Ớt tươi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23'),
  ('HAN-112025', 8, 'Nước sốt', 10.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_44.webp', '2026-10-23');

-- Chân gà nướng muối
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112028', 1, 'Dầu hỗn hợp', 2.0, 18.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_45.webp', '2026-10-23'),
  ('HAN-112028', 2, 'Chân gà (163g)', 24.4, 88.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_45.webp', '2026-10-23'),
  ('HAN-112028', 3, 'Dưa chuột', 285.0, 51.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_45.webp', '2026-10-23'),
  ('HAN-112028', 4, 'Ớt tươi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_45.webp', '2026-10-23'),
  ('HAN-112028', 5, 'Nước sốt', 10.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_45.webp', '2026-10-23');

-- Cháo đậu đen, đậu phụ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121052', 1, 'Cháo đỗ đen', 318.0, 171.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_104.png', '2026-10-23'),
  ('HAN-121052', 2, 'Đậu phụ rán', 80.0, 133.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_104.png', '2026-10-23'),
  ('HAN-121052', 3, 'Cà muối nén', 14.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_104.png', '2026-10-23');

-- Cháo đậu đen đường
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121053', 1, 'Cháo đỗ đen', 318.0, 171.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_22.webp', '2026-10-23'),
  ('HAN-121053', 2, 'Đường kính', 38.0, 150.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_22.webp', '2026-10-23');

-- Cháo đỗ xanh
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123008', 1, 'Cháo đậu đỗ', 495.0, 229.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_23.webp', '2026-10-23');

-- Cháo ếch
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-211023', 1, 'Cháo trắng', 620.0, 264.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 2, 'Ếch xào', 191.0, 260.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 3, 'Hành phi', 5.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 4, 'Tía tô', 4.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 5, 'Hành lá', 41.0, 10.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 6, 'Nước sốt ếch', 69.0, 25.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23'),
  ('HAN-211023', 7, 'Riềng', 2.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/chao_ech_hp.png', '2026-10-23');

-- Cháo gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113008', 1, 'Cháo trắng', 466.0, 198.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_ga_hn.png', '2026-10-23'),
  ('HAN-113008', 2, 'Thịt gà ta luộc', 90.0, 248.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_ga_hn.png', '2026-10-23'),
  ('HAN-113008', 3, 'Bánh quẩy', 47.0, 138.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_ga_hn.png', '2026-10-23'),
  ('HAN-113008', 4, 'Hành lá', 4.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_ga_hn.png', '2026-10-23'),
  ('HAN-113008', 5, 'Tía tô', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_ga_hn.png', '2026-10-23');

-- Cháo khoái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213082', 1, 'Cháo sườn', 230.0, 132.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/197.PNG', '2026-10-23'),
  ('SFF-213082', 2, 'Đậu xanh bào', 25.0, 48.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/197.PNG', '2026-10-23'),
  ('SFF-213082', 3, 'Hành phi', 8.0, 15.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/197.PNG', '2026-10-23');

-- Cháo lòng lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121057', 1, 'Cháo trắng', 710.0, 302.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 10, 'Ớt đỏ to', 11.0, 3.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 11, 'Rau thơm', 29.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 12, 'Nước chấm pha', 30.0, 11.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 2, 'Dồi lợn luộc', 46.0, 53.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 3, 'Lòng non luộc', 40.0, 21.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 4, 'Dạ dày lợn luộc', 21.0, 22.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 5, 'Gan lợn luộc', 18.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 6, 'Thịt dải lợn luộc', 13.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 7, 'Nõn đuôi lợn luộc', 10.5, 42.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 8, 'Hành lá', 12.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23'),
  ('HAN-121057', 9, 'Quất', 18.8, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_105.png', '2026-10-23');

-- Cháo lươn cay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213021', 1, 'Cháo trắng', 214.0, 91.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 2, 'Mộc nhĩ xào thịt nạc', 5.0, 10.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 3, 'Lươn xào', 14.0, 24.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 4, 'Bánh quẩy', 16.0, 47.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 5, 'Rau mùi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 6, 'Tía tô', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23'),
  ('SFF-213021', 7, 'Sa tế', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/195.PNG', '2026-10-23');

-- Cháo ruốc thịt lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121008', 1, 'Cháo trắng', 300.0, 127.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_106.png', '2026-10-23'),
  ('HAN-121008', 2, 'Bánh quẩy', 25.0, 73.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_106.png', '2026-10-23'),
  ('HAN-121008', 3, 'Ruốc thịt lợn', 6.0, 22.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_106.png', '2026-10-23');

-- Cháo sườn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112050', 1, 'Cháo sườn', 369.0, 212.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_hn.png', '2026-10-23'),
  ('HAN-112050', 2, 'Bánh quẩy', 41.0, 120.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_hn.png', '2026-10-23');

-- Cháo sườn lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113006', 1, 'Cháo sườn', 256.0, 147.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_lon_hn.png', '2026-10-23'),
  ('HAN-113006', 2, 'Bánh quẩy', 79.0, 232.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_lon_hn.png', '2026-10-23'),
  ('HAN-113006', 3, 'Sườn lợn', 24.0, 44.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_lon_hn.png', '2026-10-23'),
  ('HAN-113006', 4, 'Ruốc thịt lợn', 9.0, 33.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_suon_lon_hn.png', '2026-10-23');

-- Cháo sườn sụn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111020', 1, 'Cháo trắng', 500.0, 213.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23'),
  ('HAN-111020', 2, 'Bánh quẩy', 18.0, 53.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23'),
  ('HAN-111020', 3, 'Sườn sụn', 41.0, 104.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23'),
  ('HAN-111020', 4, 'Ruốc thịt lợn', 11.0, 40.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23'),
  ('HAN-111020', 5, 'Ruốc nấm', 12.0, 27.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23'),
  ('HAN-111020', 6, 'Thịt lợn băm rim', 20.0, 31.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_35.png', '2026-10-23');

-- Cháo tim
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112021', 1, 'Cháo trắng', 581.0, 247.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_tim_hn.png', '2026-10-23'),
  ('HAN-112021', 2, 'Tim sống', 65.0, 73.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_tim_hn.png', '2026-10-23'),
  ('HAN-112021', 3, 'Tía tô', 6.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_tim_hn.png', '2026-10-23'),
  ('HAN-112021', 4, 'Hành lá', 6.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_tim_hn.png', '2026-10-23'),
  ('HAN-112021', 5, 'Hạt tiêu, ớt', 1.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_tim_hn.png', '2026-10-23');

-- Cháo thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-221031', 1, 'Cháo trắng', 387.0, 164.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_56.webp', '2026-10-23'),
  ('HAP-221031', 2, 'Thịt lợn nạc xay hầm', 13.0, 25.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_56.webp', '2026-10-23'),
  ('HAP-221031', 3, 'Hành lá', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_56.webp', '2026-10-23'),
  ('HAP-221031', 4, 'Ruốc thịt lợn', 11.0, 40.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_56.webp', '2026-10-23'),
  ('HAP-221031', 5, 'Tía tô', 8.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_56.webp', '2026-10-23');

-- Cháo trai
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112051', 1, 'Cháo trắng', 339.0, 144.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23'),
  ('HAN-112051', 2, 'Trai xào', 28.0, 100.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23'),
  ('HAN-112051', 3, 'Ruốc thịt lợn', 9.0, 33.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23'),
  ('HAN-112051', 4, 'Rau răm', 3.0, 1.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23'),
  ('HAN-112051', 5, 'Hành phi', 3.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23'),
  ('HAN-112051', 6, 'Bánh quẩy', 34.0, 100.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/chao_trai.png', '2026-10-23');

-- Cháo trai có quẩy
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121016', 1, 'Cháo trắng', 330.0, 140.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 2, 'Trai xào', 22.3, 48.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 3, 'Bánh quẩy', 25.0, 73.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 4, 'Rau răm', 10.0, 4.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 5, 'Ớt khô bột', 0.1, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 6, 'Hạt tiêu', 0.1, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23'),
  ('HAN-121016', 7, 'Dấm tỏi ớt', 4.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_24.webp', '2026-10-23');

-- Cháo trai sườn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211053', 1, 'Cháo sườn', 408.0, 234.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23'),
  ('SFF-211053', 2, 'Ruốc thịt lợn', 7.0, 25.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23'),
  ('SFF-211053', 3, 'Rau răm', 6.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23'),
  ('SFF-211053', 4, 'Bánh quẩy', 24.0, 70.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23'),
  ('SFF-211053', 5, 'Hành phi', 1.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23'),
  ('SFF-211053', 6, 'Hạt tiêu', 0.5, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/198.PNG', '2026-10-23');

-- Chè bưởi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123015', 1, 'Chè bưởi', 113.0, 97.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_117.png', '2026-10-23'),
  ('HAN-123015', 2, 'Trân châu', 18.0, 61.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_117.png', '2026-10-23'),
  ('HAN-123015', 3, 'Nước cốt dừa', 21.0, 6.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_117.png', '2026-10-23'),
  ('HAN-123015', 4, 'Mứt dừa khô', 10.0, 38.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_117.png', '2026-10-23');

-- Chè đỗ đen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121001', 1, 'Chè đỗ đen', 251.0, 198.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 2, 'Rau câu tươi', 41.0, 18.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 3, 'Trân châu', 21.0, 72.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 4, 'Nước cốt dừa', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 5, 'Cùi dừa', 1.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 6, 'Lạc rang', 11.0, 66.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23'),
  ('HAN-121001', 7, 'Mứt dừa khô', 3.5, 26.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_118.png', '2026-10-23');

-- Chè đỗ đỏ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123014', 1, 'Đậu đỏ hầm', 130.0, 182.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_119.png', '2026-10-23'),
  ('HAN-123014', 2, 'Trân châu', 25.0, 85.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_119.png', '2026-10-23'),
  ('HAN-123014', 3, 'Nước cốt dừa', 16.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_119.png', '2026-10-23'),
  ('HAN-123014', 4, 'Mứt dừa khô', 10.0, 38.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_119.png', '2026-10-23');

-- Chè đỗ xanh
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-221006', 1, 'Chè đỗ xanh', 380.0, 304.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_89.webp', '2026-10-23'),
  ('HAP-221006', 2, 'Nước cốt dừa', 5.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_89.webp', '2026-10-23'),
  ('HAP-221006', 3, 'Cùi dừa già', 5.0, 19.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_89.webp', '2026-10-23');

-- Chè đỗ xanh trân châu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121002', 1, 'Chè đỗ xanh', 113.0, 90.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 2, 'Thạch sương sáo', 29.0, 13.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 3, 'Trân châu', 45.0, 154.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 4, 'Nước cốt dừa', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 5, 'Cùi dừa tươi', 6.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 6, 'Lạc rang', 17.0, 103.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23'),
  ('HAN-121002', 7, 'Mứt dừa khô', 6.0, 23.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_120.png', '2026-10-23');

-- Chè dừa dầm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213073', 1, 'Thạch dừa', 193.0, 86.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23'),
  ('SFF-213073', 2, 'Cùi dừa non', 108.0, 58.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23'),
  ('SFF-213073', 3, 'Nước cốt dừa', 58.0, 18.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23'),
  ('SFF-213073', 4, 'Trân châu trắng', 42.0, 144.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23'),
  ('SFF-213073', 5, 'Sữa đặc', 44.0, 144.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23'),
  ('SFF-213073', 6, 'Sữa béo', 25.0, 18.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/229.PNG', '2026-10-23');

-- Chè kem dừa
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113055', 1, 'Nước cốt dừa', 60.0, 18.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 2, 'Kem dừa', 60.0, 119.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 3, 'Trân châu', 31.0, 107.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 4, 'Thạch dừa', 30.0, 13.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 5, 'Lạc rang', 5.0, 30.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 6, 'Trân châu trắng', 17.0, 58.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 7, 'Thạch nha đam', 34.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23'),
  ('HAN-113055', 8, 'Cùi dừa nạo', 6.0, 23.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_70.png', '2026-10-23');

-- Chè khúc bạch
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111036', 1, 'Thạch trắng', 90.0, 40.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_71.png', '2026-10-23'),
  ('HAN-111036', 2, 'Thạch lá dứa', 42.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_71.png', '2026-10-23'),
  ('HAN-111036', 3, 'Nước đường', 169.0, 61.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_71.png', '2026-10-23'),
  ('HAN-111036', 4, 'Hạt hạnh nhân', 4.0, 24.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_71.png', '2026-10-23');

-- Chè sầu riêng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213006', 1, 'Mít dai', 118.0, 62.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 2, 'Sầu riêng', 52.0, 71.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 3, 'Thạch trắng', 86.0, 38.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 4, 'Thạch lá nếp', 41.0, 18.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 5, 'Củ mã thầy', 35.0, 42.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 6, 'Bột năng', 8.0, 27.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 7, 'Nước đường', 25.0, 9.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 8, 'Nước cốt dừa', 19.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23'),
  ('SFF-213006', 9, 'Hạt đác', 21.0, 7.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/227.PNG', '2026-10-23');

-- Chè sen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213007', 1, 'Củ sen luộc', 14.0, 17.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 2, 'Củ mã thầy', 26.0, 31.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 3, 'Long nhãn', 26.0, 75.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 4, 'Nha đam', 17.0, 8.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 5, 'Táo tây', 25.0, 12.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 6, 'Hạt sen tươi luộc', 35.0, 60.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 7, 'Bông tuyết', 12.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23'),
  ('HAP-213007', 8, 'Nước sen đường', 160.0, 58.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_2.webp', '2026-10-23');

-- Chè Thái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211057', 1, 'Thạch xanh', 65.0, 29.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/228.PNG', '2026-10-23'),
  ('SFF-211057', 2, 'Thạch trắng', 61.0, 27.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/228.PNG', '2026-10-23'),
  ('SFF-211057', 3, 'Nước đường', 72.0, 26.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/228.PNG', '2026-10-23'),
  ('SFF-211057', 4, 'Sữa bò tươi', 54.0, 40.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/228.PNG', '2026-10-23'),
  ('SFF-211057', 5, 'Đá', 133.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/228.PNG', '2026-10-23');

-- Chè thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112038', 1, 'Chè đỗ xanh', 89.0, 71.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 2, 'Chè đỗ đen', 102.0, 80.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 3, 'Bánh chay', 44.0, 112.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 4, 'Thạch', 30.0, 13.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 5, 'Hạt sen', 29.0, 99.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 6, 'Trân châu', 15.0, 51.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 7, 'Cùi dừa nạo', 6.0, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 8, 'Vừng', 1.0, 5.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23'),
  ('HAN-112038', 9, 'Nước cốt dừa', 11.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_26.webp', '2026-10-23');

-- Chè thập cẩm (có xôi)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113054', 1, 'Xôi nếp cẩm', 30.0, 70.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 2, 'Thạch dừa', 36.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 3, 'Mít dai', 12.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 4, 'Thạch trà xanh', 25.0, 11.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 5, 'Trân châu', 58.0, 199.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 6, 'Thạch nha đam', 30.0, 13.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 7, 'Trân châu trắng', 32.0, 110.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23'),
  ('HAN-113054', 8, 'Nước cốt dừa', 102.0, 31.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_72.png', '2026-10-23');

-- Chè thập cẩm (không có xôi)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113097', 1, 'Chè hạt sen', 27.0, 19.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23'),
  ('HAN-113097', 2, 'Chè đỗ xanh', 64.0, 51.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23'),
  ('HAN-113097', 3, 'Chè đỗ đen', 48.0, 38.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23'),
  ('HAN-113097', 4, 'Thạch sương sáo', 45.0, 20.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23'),
  ('HAN-113097', 5, 'Trân châu + củ mã thầy', 42.0, 144.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23'),
  ('HAN-113097', 6, 'Nước đường', 38.0, 13.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_73.png', '2026-10-23');

-- Chè vừng đen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223028', 1, 'Chè vừng đen', 257.0, 286.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_90.webp', '2026-10-23'),
  ('HAP-223028', 2, 'Cùi dừa già', 8.0, 31.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_90.webp', '2026-10-23'),
  ('HAP-223028', 3, 'Lạc rang', 8.0, 48.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_90.webp', '2026-10-23'),
  ('HAP-223028', 4, 'Bánh quẩy', 31.0, 91.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_90.webp', '2026-10-23');

-- Chè xoài
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111013', 1, 'Sữa đặc có đường', 23.0, 75.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_27.webp', '2026-10-23'),
  ('HAN-111013', 2, 'Rau câu tươi', 42.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_27.webp', '2026-10-23'),
  ('HAN-111013', 3, 'Xoài chín', 84.0, 57.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_27.webp', '2026-10-23');

-- Chim cút quay lá mắc mật (4 con)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211068', 1, 'Thịt chim quay (270g cả con)', 162.0, 357.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/250.PNG', '2026-10-23'),
  ('SFF-211068', 2, 'Lá mắc mật', 2.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/250.PNG', '2026-10-23'),
  ('SFF-211068', 3, 'Tương ớt', 38.0, 15.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/250.PNG', '2026-10-23');

-- Dồi sụn nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211098', 1, 'Dồi lợn nướng', 213.0, 292.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23'),
  ('SFF-211098', 2, 'Magi', 19.0, 12.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23'),
  ('SFF-211098', 3, 'Rau húng', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23'),
  ('SFF-211098', 4, 'Rau ngổ', 6.0, 1.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23'),
  ('SFF-211098', 5, 'Rau húng', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23'),
  ('SFF-211098', 6, 'Rau kinh giới', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/251.PNG', '2026-10-23');

-- Đùi gà rán
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113070', 1, 'Đùi gà chiên xù', 85.0, 271.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_47.webp', '2026-10-23'),
  ('HAN-113070', 2, 'Nước sốt cà chua', 10.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_47.webp', '2026-10-23'),
  ('HAN-113070', 3, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_47.webp', '2026-10-23');

-- Giá bể xào
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211012', 1, 'Giá bể biển xào', 179.0, 297.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/252.PNG', '2026-10-23'),
  ('SFF-211012', 2, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/252.PNG', '2026-10-23'),
  ('SFF-211012', 3, 'Cà chua', 15.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/252.PNG', '2026-10-23'),
  ('SFF-211012', 4, 'Thân chuối', 5.0, 1.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/252.PNG', '2026-10-23'),
  ('SFF-211012', 5, 'Bột nghệ, tỏi, riềng', 4.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/252.PNG', '2026-10-23');

-- Hamburger bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113072', 1, 'Bánh mỳ', 63.0, 167.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_54.png', '2026-10-23'),
  ('HAN-113072', 2, 'Thịt bò băm rán', 33.0, 75.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_54.png', '2026-10-23'),
  ('HAN-113072', 3, 'Rau xà lách', 25.0, 4.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_54.png', '2026-10-23'),
  ('HAN-113072', 4, 'Cà chua', 20.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_54.png', '2026-10-23'),
  ('HAN-113072', 5, 'Phô mai, nước sốt', 15.0, 57.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_54.png', '2026-10-23');

-- Hamburger gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113071', 1, 'Bánh mỳ', 68.0, 180.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_55.png', '2026-10-23'),
  ('HAN-113071', 2, 'Ức gà chiên', 73.0, 207.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_55.png', '2026-10-23'),
  ('HAN-113071', 3, 'Rau xà lách', 10.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_55.png', '2026-10-23'),
  ('HAN-113071', 4, 'Cà chua', 20.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_55.png', '2026-10-23'),
  ('HAN-113071', 5, 'Phô mai, nước sốt', 15.0, 57.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_55.png', '2026-10-23');

-- Hamburger lợn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113073', 1, 'Bánh mỳ', 60.0, 159.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_56.png', '2026-10-23'),
  ('HAN-113073', 2, 'Thịt lợn xay rán', 35.0, 66.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_56.png', '2026-10-23'),
  ('HAN-113073', 3, 'Phô mai, nước sốt', 15.0, 57.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_56.png', '2026-10-23');

-- Hạt dẻ luộc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122045', 1, 'Hạt dẻ luộc', 71.4, 159.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_71.webp', '2026-10-23');

-- Hạt dẻ nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122047', 1, 'Hạt dẻ nướng', 102.0, 227.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_72.webp', '2026-10-23');

-- Hàu nướng mọi (10 con)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211016', 1, 'Hàu nướng', 309.0, 152.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_19.webp', '2026-10-23');

-- Hoa quả dầm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113021', 1, 'Dưa lưới', 61.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 10, 'Nước cốt dừa', 15.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 2, 'Xoài chín', 38.0, 26.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 3, 'Đu đủ chín', 72.0, 26.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 4, 'Mít dai', 45.0, 23.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 5, 'Nhãn', 21.0, 10.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 6, 'Dâu tây', 15.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 7, 'Quả bơ', 19.0, 19.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 8, 'Vú sữa', 25.0, 12.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23'),
  ('HAN-113021', 9, 'Sữa đặc', 43.0, 140.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_28.webp', '2026-10-23');

-- Hủ tiếu đại dương
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112031', 1, 'Hủ tiếu', 52.0, 180.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 10, 'Chanh', 12.7, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 11, 'Ớt', 4.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 12, 'Giá đậu xanh', 61.0, 32.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 13, 'Rau xà lách', 35.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 14, 'Hành phi', 12.9, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 2, 'Chả cá', 43.0, 89.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 3, 'Thanh cua', 22.0, 22.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 4, 'Bề bề', 36.0, 29.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 5, 'Tôm sú', 14.5, 11.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 6, 'Mực tươi', 42.0, 30.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 7, 'Thịt lợn vai xay', 30.0, 44.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 8, 'Trứng cút luộc', 20.0, 34.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23'),
  ('HAN-112031', 9, 'Nước dùng', 624.0, 73.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_23.png', '2026-10-23');

-- Hủ tiếu Nam Vang
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112020', 1, 'Hủ tiếu', 71.0, 315.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 10, 'Thịt lợn sấn băm', 10.0, 32.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 11, 'Chanh, ớt, tỏi', 30.7, 10.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 12, 'Nước dùng', 318.0, 50.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 2, 'Gan lợn luộc', 13.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 3, 'Trứng cút luộc', 10.0, 17.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 4, 'Tôm biển luộc', 9.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 5, 'Rau xà lách, rau cần', 26.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 6, 'Giá đậu xanh', 27.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 7, 'Dạ dày lợn luộc', 15.0, 15.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 8, 'Thịt bò luộc', 26.0, 40.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23'),
  ('HAN-112020', 9, 'Hành lá', 19.0, 4.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_24.png', '2026-10-23');

-- Hủ tiếu Nam Vang nước
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112014', 1, 'Hủ tiếu', 52.0, 180.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 10, 'Củ cải muối', 2.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 11, 'Chanh', 14.0, 3.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 12, 'Ớt', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 13, 'Giá đậu xanh', 45.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 14, 'Rau xà lách', 22.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 15, 'Cần tây', 11.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 16, 'Nước dùng', 385.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 2, 'Trứng cút luộc', 22.0, 38.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 3, 'Thịt lợn xay', 26.0, 50.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 4, 'Gan lợn luộc', 12.0, 18.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 5, 'Thịt lợn thăn luộc', 24.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 6, 'Thịt chân giò luộc', 26.0, 59.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 7, 'Tôm luộc', 20.0, 16.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 8, 'Hành lá, rau mùi, hẹ', 12.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23'),
  ('HAN-112014', 9, 'Tỏi chiên', 3.0, 3.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/hu_tieu_nam_vang_nuoc_hn.png', '2026-10-23');

-- Hủ tiếu thịt bằm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112032', 1, 'Hủ tiếu', 62.0, 214.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 10, 'Ớt', 4.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 11, 'Nước dùng', 624.0, 72.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 2, 'Thịt lợn vai xay', 100.0, 148.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 3, 'Trứng cút luộc', 18.0, 31.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 4, 'Hành lá', 10.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 5, 'Hẹ lá', 30.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 6, 'Hành phi', 12.9, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 7, 'Giá đậu xanh', 61.0, 32.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 8, 'Rau xà lách', 35.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23'),
  ('HAN-112032', 9, 'Chanh', 12.7, 3.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_25.png', '2026-10-23');

-- Kem cốm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113077', 1, 'Kem cốm', 70.0, 139.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_31.webp', '2026-10-23');

-- Kem đậu xanh
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113078', 1, 'Kem đậu xanh', 70.0, 139.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_32.webp', '2026-10-23');

-- Kem khoai môn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113082', 1, 'Kem khoai môn', 71.0, 141.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_37.webp', '2026-10-23');

-- Kem ốc quế cacao
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113086', 1, 'Kem cacao', 61.0, 138.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_33.webp', '2026-10-23'),
  ('HAN-113086', 2, 'Ốc quế', 13.0, 56.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_33.webp', '2026-10-23');

-- Kem ốc quế vani
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113085', 1, 'Kem vani', 62.0, 123.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_34.webp', '2026-10-23'),
  ('HAN-113085', 2, 'Ốc quế', 13.0, 56.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_34.webp', '2026-10-23');

-- Kem sầu riêng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113080', 1, 'Kem sầu riêng', 69.0, 137.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_35.webp', '2026-10-23');

-- Kem socola
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113081', 1, 'Kem sô cô la', 20.0, 45.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_36.webp', '2026-10-23'),
  ('HAN-113081', 2, 'Kem vani', 45.0, 89.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_36.webp', '2026-10-23');

-- Kem sữa chua trân châu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213063', 1, 'Sữa chua đặc có đường', 180.0, 117.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/235.PNG', '2026-10-23'),
  ('SFF-213063', 2, 'Trân châu trắng', 45.0, 154.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/235.PNG', '2026-10-23'),
  ('SFF-213063', 3, 'Nước cốt dừa', 40.0, 12.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/235.PNG', '2026-10-23');

-- Kem sữa dừa
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113084', 1, 'Kem sữa dừa', 70.0, 139.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_38.webp', '2026-10-23');

-- Kem trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113022', 1, 'Lòng đỏ trứng gà', 48.0, 156.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_39.webp', '2026-10-23'),
  ('HAN-113022', 2, 'Đường kính', 5.0, 19.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_39.webp', '2026-10-23'),
  ('HAN-113022', 3, 'Bột ca cao', 10.0, 42.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_39.webp', '2026-10-23');

-- Khoai lang chiên
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123026', 1, 'Khoai lang tẩm bột chiên', 100.0, 376.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_73.webp', '2026-10-23');

-- Khoai lang luộc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121025', 1, 'Khoai lang luộc', 323.0, 393.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_74.webp', '2026-10-23');

-- Khoai lang mật nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122029', 1, 'Khoai lang nướng', 438.6, 746.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_75.webp', '2026-10-23');

-- Khoai tây chiên
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113074', 1, 'Khoai tây chiên', 73.0, 216.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_48.webp', '2026-10-23');

-- Lòng dồi sụn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213015', 1, 'Lòng non luộc', 60.0, 32.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 2, 'Sụn vai nấu', 30.0, 77.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 3, 'Thịt lợn nạc luộc', 100.0, 117.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 4, 'Đậu xanh đồ', 30.0, 58.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 5, 'Rau thơm', 24.0, 7.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 6, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23'),
  ('SFF-213015', 7, 'Nước chấm', 40.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/253.PNG', '2026-10-23');

-- Lòng lợn luộc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223026', 1, 'Lòng non lợn luộc', 73.0, 39.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_102.webp', '2026-10-23'),
  ('HAP-223026', 2, 'Dồi lợn luộc', 161.0, 186.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_102.webp', '2026-10-23'),
  ('HAP-223026', 3, 'Dạ dày lợn luộc', 51.0, 53.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_102.webp', '2026-10-23'),
  ('HAP-223026', 4, 'Rau thơm', 29.0, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_102.webp', '2026-10-23'),
  ('HAP-223026', 5, 'Nước chấm pha', 42.0, 15.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_102.webp', '2026-10-23');

-- Miến gà trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211074', 1, 'Miến dong', 63.0, 212.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 10, 'Dầu hỗn hợp', 4.0, 36.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 11, 'Xì dầu', 14.0, 7.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 2, 'Thịt gà lườn luộc', 17.0, 31.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 3, 'Thịt lợn xá xíu', 20.0, 58.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 4, 'Tôm biển luộc', 20.0, 16.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 5, 'Giá đậu xanh chần', 30.0, 15.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 6, 'Mộc nhĩ, nấm hương chần', 12.0, 39.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 7, 'Rau mùi, hành lá', 8.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 8, 'Hành phi', 5.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23'),
  ('SFF-211074', 9, 'Nước dùng', 146.0, 23.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/192.PNG', '2026-10-23');

-- Miến lươn (nước)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112022', 1, 'Miến', 58.5, 197.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 10, 'Hạt tiêu', 0.5, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 11, 'Nước dùng', 334.0, 39.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 2, 'Bánh quẩy', 39.0, 115.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 3, 'Lươn rán', 35.0, 54.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 4, 'Hành tây', 13.0, 6.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 5, 'Giá đậu xanh', 36.0, 19.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 6, 'Quất', 14.0, 5.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 7, 'Ớt đỏ', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 8, 'Hành lá', 9.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23'),
  ('HAN-112022', 9, 'Rau răm', 11.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_luon.png', '2026-10-23');

-- Miến lươn nước
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113010', 1, 'Miến dong', 58.8, 198.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 2, 'Lươn chiên giòn', 18.0, 27.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 3, 'Giá đậu xanh', 68.0, 36.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 4, 'Hành phi', 10.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 5, 'Hành tây', 20.0, 10.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 6, 'Rau răm', 5.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23'),
  ('HAN-113010', 7, 'Nước dùng', 380.0, 44.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_26.png', '2026-10-23');

-- Miến lươn trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113011', 1, 'Miến dong', 57.0, 193.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 2, 'Lươn chiên giòn', 18.0, 27.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 3, 'Cà rốt', 3.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 4, 'Dưa chuột', 5.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 5, 'Giá đậu xanh', 20.0, 10.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 6, 'Hành phi', 10.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 7, 'Rau kinh giới', 4.0, 1.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23'),
  ('HAN-113011', 8, 'Lạc rang', 9.0, 54.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_27.png', '2026-10-23');

-- Miến ngan
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111033', 1, 'Miến dong khô', 70.0, 236.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 2, 'Thịt ngan luộc', 49.0, 196.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 3, 'Măng tre tươi', 65.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 4, 'Rau thơm', 21.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 5, 'Rau húng', 8.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 6, 'Quất', 21.7, 9.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 7, 'Nước dùng', 253.0, 30.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23'),
  ('HAN-111033', 8, 'Măng chua', 69.0, 19.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_hn.png', '2026-10-23');

-- Miến ngan mọc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113004', 1, 'Miến dong', 54.8, 184.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 2, 'Tiết ngan luộc', 26.0, 6.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 3, 'Mọc mộc nhĩ', 39.0, 58.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 4, 'Thịt ngan luộc', 65.6, 262.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 5, 'Hành lá', 22.0, 5.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 6, 'Măng tươi', 56.0, 16.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23'),
  ('HAN-113004', 7, 'Nước dùng', 310.0, 35.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_28.png', '2026-10-23');

-- Miến ngan nước
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211105', 1, 'Miến dong', 70.0, 237.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 2, 'Thịt ngan luộc', 69.0, 276.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 3, 'Măng khô chần', 33.0, 12.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 4, 'Hành tây', 29.0, 14.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 5, 'Rau răm', 9.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 6, 'Rau xà lách', 28.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 7, 'Nước dùng', 320.0, 38.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 8, 'Chanh', 4.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23'),
  ('HAP-211105', 9, 'Ớt đỏ', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/mien_ngan_nuoc_hp.png', '2026-10-23');

-- Miến ngan trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213027', 1, 'Miến dong', 55.0, 185.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 10, 'Rau húng', 3.0, 0.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 2, 'Giá đậu xanh', 59.0, 31.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 3, 'Cải ngọt', 50.0, 8.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 4, 'Rau răm', 6.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 5, 'Thịt ngan luộc', 117.0, 468.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 6, 'Nước dùng', 200.0, 31.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 7, 'Nước chấm pha', 90.0, 33.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 8, 'Magi', 47.0, 30.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23'),
  ('SFF-213027', 9, 'Hành tây', 19.0, 9.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/193.PNG', '2026-10-23');

-- Miến riêu cua (nước)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113050', 1, 'Miến dong', 53.0, 179.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 10, 'Hành lá', 9.0, 2.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 11, 'Nước dùng', 380.0, 44.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 2, 'Rau muống luộc', 74.0, 20.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 3, 'Cần ta', 37.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 4, 'Giá đậu xanh', 42.0, 22.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 5, 'Giò tai', 15.0, 82.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 6, 'Chả cá', 14.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 7, 'Thịt bò', 31.0, 36.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 8, 'Đậu phụ rán', 14.0, 23.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23'),
  ('HAN-113050', 9, 'Gạch cua', 14.0, 14.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_29.png', '2026-10-23');

-- Miến riêu cua (trộn)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113051', 1, 'Miến dong', 59.0, 199.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 10, 'Hành lá', 8.0, 2.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 11, 'Rau muống luộc', 57.0, 15.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 12, 'Xì dầu', 13.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 2, 'Giá đậu xanh', 33.0, 17.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 3, 'Cần ta', 31.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 4, 'Đậu phụ rán', 15.0, 25.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 5, 'Giò tai', 15.0, 82.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 6, 'Chả cá', 13.0, 27.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 7, 'Thịt bò', 28.0, 33.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 8, 'Lạc rang', 11.0, 66.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23'),
  ('HAN-113051', 9, 'Thịt cua', 11.0, 11.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_30.png', '2026-10-23');

-- Mực viên chiên đường phố (5 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121084', 1, 'Mực viên chiên đường phố', 55.0, 134.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_132.png', '2026-10-23'),
  ('HAN-121084', 2, 'Tương ớt', 30.0, 12.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_132.png', '2026-10-23');

-- Mỳ chờ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211102', 1, 'Mỳ sợi', 96.0, 335.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 2, 'Há cảo chần', 46.0, 123.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 3, 'Gan lợn luộc', 15.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 4, 'Lòng dồi rán', 22.0, 45.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 5, 'Thịt lợn xá xíu', 19.0, 55.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 6, 'Cải ngọt luộc', 29.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 7, 'Hành lá', 6.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23'),
  ('SFF-211102', 8, 'Nước dùng', 350.0, 55.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/189.PNG', '2026-10-23');

-- Mỳ chờ thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211101', 1, 'Mỳ sợi', 82.0, 287.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 10, 'Rau răm', 4.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 11, 'Nước dùng', 269.0, 42.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 2, 'Cải ngọt luộc', 46.0, 8.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 3, 'Bánh há cảo', 37.0, 99.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 4, 'Gan lợn luộc', 13.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 5, 'Thịt lợn nạc luộc', 22.0, 25.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 6, 'Trứng gà luộc', 17.0, 25.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 7, 'Lạp xưởng', 17.0, 99.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 8, 'Quất chín', 8.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23'),
  ('SFF-211101', 9, 'Ớt', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/190.PNG', '2026-10-23');

-- Mỳ tim cật
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113062', 1, 'Mì ăn liền', 73.0, 265.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_31.png', '2026-10-23'),
  ('HAN-113062', 2, 'Tim lợn luộc', 20.0, 27.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_31.png', '2026-10-23'),
  ('HAN-113062', 3, 'Bầu dục lợn luộc', 27.0, 29.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_31.png', '2026-10-23'),
  ('HAN-113062', 4, 'Cải ngọt luộc', 53.0, 10.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_31.png', '2026-10-23'),
  ('HAN-113062', 5, 'Nước dùng', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_31.png', '2026-10-23');

-- Mỳ trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211092', 1, 'Mỳ ăn liền', 85.6, 311.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 2, 'Thịt lợn nạc luộc', 24.0, 28.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 3, 'Há cảo hấp', 26.0, 69.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 4, 'Xúc xích rán', 22.0, 88.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 5, 'Trứng gà ốp lết', 39.0, 59.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 6, 'Dưa chuột', 49.0, 8.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 7, 'Rau mùi', 4.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 8, 'Hành phi', 10.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23'),
  ('SFF-211092', 9, 'Nước sốt', 103.0, 118.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/191.PNG', '2026-10-23');

-- Mỳ trộn bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213055', 1, 'Mỳ ăn liền', 85.0, 309.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 10, 'Tương cà', 12.0, 13.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 11, 'Tương ớt', 11.0, 4.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 12, 'Sốt mayonnaise', 8.0, 56.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 2, 'Thịt bò nạc xào', 76.0, 127.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 3, 'Dăm bông lợn', 28.0, 89.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 4, 'Dưa chuột', 23.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 5, 'Hành phi', 6.0, 11.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 6, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 7, 'Su hào', 18.0, 7.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 8, 'Cà rốt', 6.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23'),
  ('HAP-213055', 9, 'Nước sốt thịt bò', 38.0, 43.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/23/my_tron_bo_hp.png', '2026-10-23');

-- Mỳ vằn thắn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113067', 1, 'Mỳ sợi', 48.0, 167.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 10, 'Sủi cảo chiên', 22.0, 59.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 11, 'Nước dùng', 380.0, 60.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 2, 'Thịt lợn xá xíu', 40.0, 116.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 3, 'Trứng vịt luộc', 22.0, 42.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 4, 'Nấm hương', 7.0, 23.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 5, 'Hẹ lá', 15.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 6, 'Cải ngọt luộc', 33.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 7, 'Gan lợn luộc', 19.0, 28.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 8, 'Bóng bì lợn', 20.0, 23.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23'),
  ('HAN-113067', 9, 'Sủi cảo luộc', 26.0, 48.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_32.png', '2026-10-23');

-- Nem chua
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213065', 1, 'Nem chua', 101.0, 138.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_32.webp', '2026-10-23'),
  ('HAP-213065', 2, 'Sắn tàu', 20.0, 19.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_32.webp', '2026-10-23'),
  ('HAP-213065', 3, 'Lá đinh lăng', 7.0, 3.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_32.webp', '2026-10-23'),
  ('HAP-213065', 4, 'Lá mơ lông', 5.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_32.webp', '2026-10-23'),
  ('HAP-213065', 5, 'Nước chấm pha', 48.0, 17.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_32.webp', '2026-10-23');

-- Nem chua rán
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211017', 1, 'Nem chua rán', 187.0, 256.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_33.webp', '2026-10-23'),
  ('HAP-211017', 2, 'Tương ớt', 40.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_33.webp', '2026-10-23');

-- Nem lụi
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211086', 1, 'Bún tươi', 184.0, 205.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 10, 'Nước chấm', 51.0, 18.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 11, 'Nước sốt', 40.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 12, 'Cà rốt', 29.0, 12.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 13, 'Củ cải trắng', 36.0, 10.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 2, 'Bánh đa nem rán', 10.0, 49.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 3, 'Nem lụi', 113.0, 314.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 4, 'Bánh đa nem', 11.0, 37.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 5, 'Cà rốt', 20.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 6, 'Dưa chuột', 11.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 7, 'Xoài xanh', 30.0, 22.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 8, 'Rau xà lách', 45.0, 7.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23'),
  ('HAP-211086', 9, 'Rau thơm', 12.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_35.webp', '2026-10-23');

-- Nem lụi nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213067', 1, 'Nem lụi', 120.0, 334.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 2, 'Bánh đa nem', 15.0, 50.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 3, 'Dưa chuột', 21.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 4, 'Cà rốt', 16.0, 7.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 5, 'Xoài xanh', 19.0, 14.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 6, 'Bún tươi', 118.0, 131.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 7, 'Rau xà lách', 56.0, 9.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 8, 'Rau ăn kèm', 21.0, 8.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23'),
  ('HAP-213067', 9, 'Nước chấm pha', 108.0, 39.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_36.webp', '2026-10-23');

-- Nem nướng (5 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112023', 1, 'Nem nướng', 115.0, 158.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_49.webp', '2026-10-23'),
  ('HAN-112023', 2, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_49.webp', '2026-10-23');

-- Nem nướng cuốn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112043', 1, 'Bánh phở', 87.0, 122.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 10, 'Rau húng', 20.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 11, 'Nước sốt cà chua', 83.0, 95.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 12, 'Hành phi', 15.0, 28.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 2, 'Bánh đa nem rán', 22.0, 103.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 3, 'Xoài xanh', 22.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 4, 'Củ cải', 37.0, 10.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 5, 'Cà rốt', 7.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 6, 'Nem nướng', 49.0, 136.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 7, 'Bánh đa cuốn', 31.0, 104.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 8, 'Dưa chuột', 53.0, 9.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23'),
  ('HAN-112043', 9, 'Rau xà lách', 26.0, 4.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_88.png', '2026-10-23');

-- Nem rán
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-221020', 1, 'Nem rán', 99.0, 264.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_103.webp', '2026-10-23'),
  ('HAP-221020', 2, 'Dưa chuột', 34.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_103.webp', '2026-10-23'),
  ('HAP-221020', 3, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_103.webp', '2026-10-23'),
  ('HAP-221020', 4, 'Tương cà', 42.0, 48.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_103.webp', '2026-10-23'),
  ('HAP-221020', 5, 'Sốt mayonnaise', 2.0, 14.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_103.webp', '2026-10-23');

-- Nem thính
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211039', 1, 'Thịt lợn ba chỉ', 116.0, 255.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 10, 'Cà rốt', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 2, 'Tai lợn luộc', 69.0, 87.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 3, 'Bì lợn luộc', 36.0, 42.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 4, 'Thính gạo', 50.0, 180.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 5, 'Rau xà lách', 31.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 6, 'Rau ăn kèm', 24.0, 9.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 7, 'Nước chấm pha', 73.0, 26.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 8, 'Tỏi ta, ớt', 4.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23'),
  ('SFF-211039', 9, 'Đu đủ', 8.0, 3.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/254.PNG', '2026-10-23');

-- Nộm bò khô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111021', 1, 'Sụn bò rán', 15.0, 34.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 10, 'Tương ớt', 20.0, 8.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 11, 'Rau thơm', 15.0, 4.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 2, 'Dạ dày bò rán', 24.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 3, 'Ngẩu pín bò rán', 23.0, 27.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 4, 'Lách bò rán', 24.0, 54.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 5, 'Thịt bò rán', 23.0, 52.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 6, 'Đu đủ xanh', 112.0, 34.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 7, 'Tỏi ta', 5.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 8, 'Lạc rang', 19.0, 115.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23'),
  ('HAN-111021', 9, 'Nước chấm pha', 136.0, 50.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_89.png', '2026-10-23');

-- Nước chanh leo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123029', 1, 'Chanh leo tươi', 24.0, 26.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_123.png', '2026-10-23'),
  ('HAN-123029', 2, 'Đường kính', 10.0, 39.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_123.png', '2026-10-23');

-- Nước ép chanh leo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121013', 1, 'Quả chanh leo (ruột chanh)', 30.2, 32.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_63.webp', '2026-10-23'),
  ('HAN-121013', 2, 'Nước đường', 95.0, 34.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_63.webp', '2026-10-23');

-- Nước ép dưa hấu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121010', 1, 'Dưa hấu (phần ruột đỏ để ép)', 478.0, 85.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_64.webp', '2026-10-23');

-- Nước ép lê
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-221013', 1, 'Nước lê ép', 350.0, 229.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/260-1742976456.PNG', '2026-10-23');

-- Nước ép lựu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-221011', 1, 'Nước ép lựu', 380.0, 211.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/261-1742976575.PNG', '2026-10-23');

-- Ngao hoa hấp sả
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213046', 1, 'Ngao biển luộc', 150.0, 249.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_20.webp', '2026-10-23'),
  ('HAP-213046', 2, 'Cùi dừa già', 33.0, 127.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_20.webp', '2026-10-23'),
  ('HAP-213046', 3, 'Dứa ta', 24.0, 7.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_20.webp', '2026-10-23'),
  ('HAP-213046', 4, 'Nước sốt', 276.0, 102.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_20.webp', '2026-10-23');

-- Ngao trắng hấp
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213071', 1, 'Ngao biển trắng hấp', 125.0, 207.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/242.PNG', '2026-10-23'),
  ('SFF-213071', 2, 'Nước chấm pha', 50.0, 18.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/242.PNG', '2026-10-23');

-- Ngô cay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223021', 1, 'Ngô chiên', 200.0, 791.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_104.webp', '2026-10-23');

-- Ngô nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123051', 1, 'Ngô tươi nếp nướng', 146.0, 400.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_133.png', '2026-10-23');

-- Nha đam trộn mít caramen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112044', 1, 'Trân châu lá dứa', 6.0, 20.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 2, 'Trân châu trắng', 10.0, 34.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 3, 'Mít dai', 31.0, 16.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 4, 'Caramen', 68.0, 74.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 5, 'Nha đam', 107.0, 48.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 6, 'Trân châu trắng', 37.0, 127.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 7, 'Nước cốt dừa', 20.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 8, 'Sữa đặc có đường', 18.0, 59.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23'),
  ('HAN-112044', 9, 'Hạt chia', 3.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_75.png', '2026-10-23');

-- Ốc bé hấp
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213070', 1, 'Ốc vặn hấp', 74.0, 214.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/243.PNG', '2026-10-23'),
  ('SFF-213070', 2, 'Nước chấm pha', 50.0, 18.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/243.PNG', '2026-10-23');

-- Ốc bông xào bơ trứng mặn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211015', 1, 'Ốc bông', 112.0, 81.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 2, 'Bơ', 40.0, 291.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 3, 'Trứng muối', 20.0, 65.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 4, 'Ngô ngọt', 30.0, 60.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 5, 'Hành phi', 5.0, 9.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 6, 'Nước sốt', 141.0, 52.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 7, 'Tương ớt', 40.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23'),
  ('SFF-211015', 8, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/244.PNG', '2026-10-23');

-- Ốc bông xào me
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213045', 1, 'Ốc bông', 77.0, 194.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/245.PNG', '2026-10-23'),
  ('SFF-213045', 2, 'Nước sốt me', 135.0, 49.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/245.PNG', '2026-10-23'),
  ('SFF-213045', 3, 'Cùi dừa già', 44.0, 169.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/245.PNG', '2026-10-23'),
  ('SFF-213045', 4, 'Dứa ta', 38.0, 12.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/245.PNG', '2026-10-23'),
  ('SFF-213045', 5, 'Dầu ăn', 7.0, 63.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/245.PNG', '2026-10-23');

-- Ốc đá xào
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211013', 1, 'Ốc đá xào', 67.0, 169.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/246.PNG', '2026-10-23'),
  ('SFF-211013', 2, 'Nước chấm', 40.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/246.PNG', '2026-10-23'),
  ('SFF-211013', 3, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/246.PNG', '2026-10-23'),
  ('SFF-211013', 4, 'Hành phi', 1.0, 1.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/246.PNG', '2026-10-23');

-- Ốc đĩa luộc mắm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211014', 1, 'Ốc đá luộc', 66.0, 166.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_23.webp', '2026-10-23'),
  ('HAP-211014', 2, 'Nước chấm', 40.0, 16.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_23.webp', '2026-10-23'),
  ('HAP-211014', 3, 'Rau mùi', 2.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_23.webp', '2026-10-23'),
  ('HAP-211014', 4, 'Hành phi', 1.0, 1.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_23.webp', '2026-10-23');

-- Ốc hương xào sốt bơ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213043', 1, 'Ốc hương', 64.0, 46.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 2, 'Bơ thực vật', 25.0, 182.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 3, 'Tỏi', 5.0, 6.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 4, 'Đường', 10.0, 40.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 5, 'Hạt nêm', 7.0, 10.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 6, 'Gừng tươi', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23'),
  ('HAP-213043', 7, 'Ớt', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_24.webp', '2026-10-23');

-- Ốc mỡ xào ngô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213044', 1, 'Ốc mỡ xào', 80.0, 201.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/248.PNG', '2026-10-23'),
  ('SFF-213044', 2, 'Ngô ngọt', 38.0, 104.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/248.PNG', '2026-10-23'),
  ('SFF-213044', 3, 'Nước chấm pha', 68.0, 25.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/248.PNG', '2026-10-23'),
  ('SFF-213044', 4, 'Tóp mỡ', 18.0, 89.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/248.PNG', '2026-10-23');

-- Pizza bò (cỡ M)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113101', 1, 'Đế bánh', 253.0, 551.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 2, 'Nước sốt cà chua', 20.0, 23.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 3, 'Sốt mayonnaise', 15.0, 105.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 4, 'Thịt bò viên', 25.0, 41.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 5, 'Thịt bò', 25.0, 29.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 6, 'Hành tây', 25.0, 12.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 7, 'Cà chua', 25.0, 6.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23'),
  ('HAN-113101', 8, 'Phô mai', 90.0, 342.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_57.png', '2026-10-23');

-- Pizza gà nướng nấm (cỡ L)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112035', 1, 'Tương ớt', 22.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 2, 'Nước sốt cà chua', 22.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 3, 'Dứa ta', 60.0, 19.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 4, 'Nấm', 55.0, 20.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 5, 'Thịt gà', 85.0, 169.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 6, 'Cà rốt', 15.0, 6.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 7, 'Rau mùi', 10.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 8, 'Phô mai', 135.0, 513.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23'),
  ('HAN-112035', 9, 'Đế bánh', 440.0, 963.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_58.png', '2026-10-23');

-- Pizza gà phô mai (cỡ S)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113102', 1, 'Đế bánh', 145.0, 315.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23'),
  ('HAN-113102', 2, 'Sốt phô mai', 10.0, 70.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23'),
  ('HAN-113102', 3, 'Phô mai', 45.0, 171.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23'),
  ('HAN-113102', 4, 'Thịt gà', 15.0, 29.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23'),
  ('HAN-113102', 5, 'Thịt heo muối', 15.0, 47.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23'),
  ('HAN-113102', 6, 'Cà chua', 15.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_59.png', '2026-10-23');

-- Pizza hải sản (cỡ L)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112033', 1, 'Tương ớt', 22.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 2, 'Nước sốt cà chua', 22.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 3, 'Nấm', 120.0, 44.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 4, 'Mực tươi', 100.0, 114.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 5, 'Tôm biển', 100.0, 82.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 6, 'Phô mai', 135.0, 513.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23'),
  ('HAN-112033', 7, 'Đế bánh', 440.0, 963.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_60.png', '2026-10-23');

-- Pizza hải sản (cỡ M)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113100', 1, 'Đế bánh', 220.0, 481.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 2, 'Nước sốt cà chua', 30.0, 34.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 3, 'Phô mai', 90.0, 342.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 4, 'Tôm biển', 25.0, 20.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 5, 'Mực tươi', 25.0, 18.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 6, 'Thanh cua', 25.0, 25.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23'),
  ('HAN-113100', 7, 'Hành tây', 25.0, 12.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_61.png', '2026-10-23');

-- Pizza thập cẩm (cỡ L)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112034', 1, 'Tương ớt', 22.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 10, 'Đế bánh', 440.0, 963.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 2, 'Nước sốt cà chua', 22.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 3, 'Nấm', 45.0, 16.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 4, 'Hành tây', 28.0, 14.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 5, 'Ớt', 28.0, 8.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 6, 'Thịt lợn bằm', 55.0, 81.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 7, 'Thịt bò bằm', 51.0, 53.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 8, 'Lạp xưởng', 35.0, 204.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23'),
  ('HAN-112034', 9, 'Phô mai', 135.0, 513.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_62.png', '2026-10-23');

-- Pizza thịt xông khói (cỡ L)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112036', 1, 'Tương ớt', 22.0, 8.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23'),
  ('HAN-112036', 2, 'Nước sốt cà chua', 22.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23'),
  ('HAN-112036', 3, 'Dăm bông lợn', 150.0, 477.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23'),
  ('HAN-112036', 4, 'Dứa ta', 120.0, 38.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23'),
  ('HAN-112036', 5, 'Phô mai', 135.0, 513.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23'),
  ('HAN-112036', 6, 'Đế bánh', 440.0, 963.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_63.png', '2026-10-23');

-- Phá lấu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211093', 1, 'Bánh mỳ', 75.0, 187.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 10, 'Nước mắm cá', 10.0, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 11, 'Ớt đỏ', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 12, 'Nước dùng', 119.0, 18.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 2, 'Rau răm', 17.0, 7.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 3, 'Lòng bò luộc', 20.0, 24.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 4, 'Khăn lông bò luộc', 16.0, 19.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 5, 'Dạ dày bò luộc', 9.0, 10.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 6, 'Cổ hũ bò luộc', 13.0, 15.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 7, 'Lá lách bò luộc', 10.0, 12.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 8, 'Tổ ong bò luộc', 2.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23'),
  ('SFF-211093', 9, 'Sách bò luộc', 2.0, 2.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/256.PNG', '2026-10-23');

-- Phở bò chín
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113045', 1, 'Bánh phở', 156.0, 220.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 2, 'Thịt bò luộc', 42.0, 74.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 3, 'Hành lá', 25.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 4, 'Hành tây', 5.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 5, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 6, 'Bánh quẩy', 42.0, 123.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23'),
  ('HAN-113045', 7, 'Nước dùng', 380.0, 45.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_chin.png', '2026-10-23');

-- Phở bò tái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113047', 1, 'Bánh phở', 162.0, 228.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 2, 'Thịt bò', 64.0, 75.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 3, 'Bánh quẩy', 42.0, 123.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 4, 'Hành lá', 28.0, 7.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 5, 'Hành tây', 6.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 6, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 7, 'Ớt đỏ', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23'),
  ('HAN-113047', 8, 'Nước dùng', NULL, NULL, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_tai.png', '2026-10-23');

-- Phở bò tái chín
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113090', 1, 'Bánh phở', 190.0, 268.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 2, 'Nạm bò luộc', 56.0, 98.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 3, 'Nạm bò sống', 58.0, 68.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 4, 'Rau mùi', 7.0, 1.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 5, 'Chanh', 12.5, 3.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 6, 'Hành tây', 5.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23'),
  ('HAN-113090', 7, 'Nước dùng', 504.0, 60.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_16.png', '2026-10-23');

-- Phở bò tái gầu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113046', 1, 'Bánh phở', 180.0, 254.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 2, 'Thịt bò gầu luộc', 41.0, 101.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 3, 'Thịt bò', 35.0, 41.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 4, 'Bánh quẩy', 42.0, 123.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 5, 'Hành lá', 25.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 6, 'Hành tây', 5.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 7, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 8, 'Ớt đỏ', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23'),
  ('HAN-113046', 9, 'Nước dùng', 400.0, 47.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_15.png', '2026-10-23');

-- Phở bò xào
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111011', 1, 'Bánh phở', 169.0, 238.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 2, 'Dầu ăn', 12.6, 113.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 3, 'Cải ngọt', 150.0, 25.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 4, 'Hành tây', 155.0, 79.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 5, 'Thịt bò', 85.0, 100.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 6, 'Cà chua', 10.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23'),
  ('HAN-111011', 7, 'Nước sốt', 45.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_bo_xao.png', '2026-10-23');

-- Phở cuốn (10 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111010', 1, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 2, 'Rau xà lách', 5.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 3, 'Thịt bò xào', 120.0, 384.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 4, 'Bánh phở', 250.0, 353.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 5, 'Đu đủ chín', 8.0, 3.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 6, 'Cà rốt', 3.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 7, 'Nước chấm pha', 100.0, 36.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23'),
  ('HAN-111010', 8, 'Rau mùi ở đĩa', 3.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_cuon_2.png', '2026-10-23');

-- Phở chiên
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113063', 1, 'Phở chiên phồng', 111.0, 347.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 10, 'Bột năng', 25.0, 85.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 11, 'Đu đủ xanh', 11.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 2, 'Thịt bò', 60.0, 70.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 3, 'Cà chua', 7.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 4, 'Hành tây', 10.0, 5.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 5, 'Cải ngọt luộc', 150.0, 28.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 6, 'Tỏi ta', 5.0, 6.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 7, 'Cần tây', 10.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 8, 'Nấm hương', 5.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23'),
  ('HAN-113063', 9, 'Bột ngô', 25.0, 91.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_chien.png', '2026-10-23');

-- Phở chiên phồng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111012', 1, 'Đu đủ xanh', 11.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 2, 'Nước chấm pha', 77.0, 28.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 3, 'Cà chua', 22.0, 5.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 4, 'Cải ngọt', 160.0, 27.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 5, 'Hành tây', 75.0, 38.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 6, 'Thịt bò', 72.0, 85.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 7, 'Bánh phở', 144.0, 203.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 8, 'Dầu ăn', 29.6, 266.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23'),
  ('HAN-111012', 9, 'Nước sốt', 53.0, 19.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_17.png', '2026-10-23');

-- Phở gà
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-111022', 1, 'Bánh phở', 119.0, 168.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 2, 'Thịt gà ta lườn luộc', 55.0, 102.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 3, 'Thịt gà ta đùi luộc', 37.0, 96.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 4, 'Nước dùng', 600.0, 71.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 5, 'Chanh', 10.0, 2.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 6, 'Ớt xanh to', 4.0, 1.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23'),
  ('HAN-111022', 7, 'Rau sống', 10.0, 2.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_ga.png', '2026-10-23');

-- Phở gà chặt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213029', 1, 'Bánh phở', 167.0, 235.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 2, 'Thịt gà ta đùi luộc', 40.0, 104.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 3, 'Trứng gà non luộc', 10.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 4, 'Hành tây', 6.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 5, 'Hành, mùi', 9.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 6, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23'),
  ('SFF-213029', 7, 'Nước dùng', 438.0, 52.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/184.PNG', '2026-10-23');

-- Phở gà trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113057', 1, 'Bánh phở', 183.0, 258.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 10, 'Ớt tươi', 1.0, 0.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 2, 'Thịt gà ta luộc', 68.0, 188.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 3, 'Giá đậu xanh', 36.0, 19.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 4, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 5, 'Hành lá', 16.0, 4.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 6, 'Xì dầu', 40.0, 22.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 7, 'Hành tây', 23.0, 11.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 8, 'Nước dùng', 150.0, 17.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23'),
  ('HAN-113057', 9, 'Chanh', 7.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_18.png', '2026-10-23');

-- Phở lõi bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113049', 1, 'Bánh phở', 155.0, 218.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 2, 'Thịt bò', 52.0, 61.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 3, 'Hành lá', 26.0, 6.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 4, 'Hành tây', 5.0, 2.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 5, 'Chanh', 9.0, 2.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 6, 'Bánh quẩy', 42.0, 123.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23'),
  ('HAN-113049', 7, 'Nước dùng', 380.0, 45.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_19.png', '2026-10-23');

-- Phô mai que chiên 2 cái
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123024', 1, 'Phô mai', 48.0, 182.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_134.png', '2026-10-23'),
  ('HAN-123024', 2, 'Bột chiên xù, bột mỳ', 20.0, 69.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_134.png', '2026-10-23'),
  ('HAN-123024', 3, 'Dầu ăn', 10.0, 90.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_134.png', '2026-10-23');

-- Phở sốt vang
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113096', 1, 'Bánh phở', 143.0, 201.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_sot_vang.png', '2026-10-23'),
  ('HAN-113096', 2, 'Thịt bò nạm hầm', 100.0, 309.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_sot_vang.png', '2026-10-23'),
  ('HAN-113096', 3, 'Hành lá', 20.0, 5.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_sot_vang.png', '2026-10-23'),
  ('HAN-113096', 4, 'Rau mùi', 11.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_sot_vang.png', '2026-10-23'),
  ('HAN-113096', 5, 'Nước dùng', 374.0, 62.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_sot_vang.png', '2026-10-23');

-- Phở tái bò
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213047', 1, 'Bánh phở', 176.0, 248.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 2, 'Thịt bò thăn', 176.0, 185.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 3, 'Hành tây', 59.0, 30.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 4, 'Rau mùi', 5.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 5, 'Hành lá', 4.0, 1.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 6, 'Chanh', 12.0, 3.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 7, 'Ớt đỏ', 1.0, 0.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23'),
  ('HAP-213047', 8, 'Nước dùng', 374.0, 59.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_tai_bo_hp.png', '2026-10-23');

-- Phở trâu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213074', 1, 'Bánh phở', 146.0, 206.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 2, 'Trứng gà', 51.6, 68.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 3, 'Thịt gân trâu luộc', 11.0, 16.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 4, 'Thịt mông trâu', 35.0, 34.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 5, 'Thịt gầu trâu luộc', 27.0, 39.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 6, 'Thịt trâu bắp luộc', 17.0, 29.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 7, 'Thịt nạm trâu luộc', 17.0, 24.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 8, 'Hành, mùi', 11.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23'),
  ('SFF-213074', 9, 'Nước dùng', 297.0, 46.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/185.PNG', '2026-10-23');

-- Phở trộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211061', 1, 'Bánh phở', 133.0, 187.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 2, 'Thịt bò thăn tươi', 132.0, 139.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 3, 'Rau xà lách', 47.0, 7.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 4, 'Lạc rang', 18.0, 109.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 5, 'Hành phi', 6.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 6, 'Nước trộn', 73.0, 26.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 7, 'Dưa chuột', 48.0, 8.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 8, 'Chanh', 19.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23'),
  ('SFF-211061', 9, 'Ớt', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/186.PNG', '2026-10-23');

-- Phở xào
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113048', 1, 'Bánh phở', 132.0, 186.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 2, 'Thịt bò', 61.0, 72.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 3, 'Cải ngọt', 36.0, 6.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 4, 'Cà chua', 34.0, 8.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 5, 'Hành tây', 24.0, 12.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 6, 'Cần tây', 9.0, 5.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 7, 'Bột đao', 2.0, 6.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23'),
  ('HAN-113048', 8, 'Dầu hỗn hợp', 17.7, 159.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/pho_xao.png', '2026-10-23');

-- Phở xào mềm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211112', 1, 'Bánh phở', 293.0, 413.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/187.PNG', '2026-10-23'),
  ('SFF-211112', 2, 'Cải xanh luộc', 50.0, 12.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/187.PNG', '2026-10-23'),
  ('SFF-211112', 3, 'Thịt bò xào cần tỏi', 186.0, 273.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/187.PNG', '2026-10-23'),
  ('SFF-211112', 4, 'Hành tây xào', 31.0, 18.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/187.PNG', '2026-10-23'),
  ('SFF-211112', 5, 'Dưa chuột', 58.0, 10.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/187.PNG', '2026-10-23');

-- Quả xoài dầm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122010', 1, 'Xoài xanh', 480.0, 354.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_80.webp', '2026-10-23'),
  ('HAN-122010', 2, 'Muối ớt', 8.0, 6.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_80.webp', '2026-10-23');

-- Quẩy nóng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213052', 1, 'Bánh quẩy', 155.0, 456.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_42.webp', '2026-10-23'),
  ('HAP-213052', 2, 'Nước chấm pha', 61.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_42.webp', '2026-10-23'),
  ('HAP-213052', 3, 'Dưa chuột', 23.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_42.webp', '2026-10-23');

-- Sắn luộc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121026', 1, 'Sắn luộc', 178.5, 281.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_82.webp', '2026-10-23');

-- Sò huyết nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211097', 1, 'Sò huyết nướng', 127.0, 401.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_25.webp', '2026-10-23'),
  ('HAP-211097', 2, 'Tương ớt', 30.0, 12.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_25.webp', '2026-10-23');

-- Sữa chua đậu xanh rau má
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112040', 1, 'Sữa chua', 80.0, 52.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23'),
  ('HAN-112040', 2, 'Sinh tố rau má', 180.0, 130.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23'),
  ('HAN-112040', 3, 'Đậu xanh đồ', 40.0, 77.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23'),
  ('HAN-112040', 4, 'Thạch', 50.0, 22.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23'),
  ('HAN-112040', 5, 'Nước cốt dừa', 7.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23'),
  ('HAN-112040', 6, 'Nước dừa tươi', 33.0, 6.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_80.png', '2026-10-23');

-- Sữa chua gạo tím
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213008', 1, 'Sữa chua đặc có đường', 200.0, 130.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/236.PNG', '2026-10-23'),
  ('SFF-213008', 2, 'Xôi nếp cẩm', 70.0, 164.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/236.PNG', '2026-10-23'),
  ('SFF-213008', 3, 'Nước đường', 20.0, 7.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/236.PNG', '2026-10-23');

-- Sữa chua kem
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213062', 1, 'Sữa chua có đường', 180.0, 117.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/234.PNG', '2026-10-23');

-- Sữa chua kem gạo tím
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211036', 1, 'Sữa chua đặc có đường', 120.0, 78.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/233.PNG', '2026-10-23'),
  ('SFF-211036', 2, 'Cơm gạo lứt tím', 70.0, 117.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/233.PNG', '2026-10-23');

-- Sữa chua lá nếp
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211035', 1, 'Sữa chua có đường', 200.0, 130.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_12.webp', '2026-10-23'),
  ('HAP-211035', 2, 'Nước đường', 20.0, 7.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_12.webp', '2026-10-23'),
  ('HAP-211035', 3, 'Cơm nếp nấu lá dứa', 70.0, 146.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_12.webp', '2026-10-23'),
  ('HAP-211035', 4, 'Nước đá', 150.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/08/screenshot_12.webp', '2026-10-23');

-- Sữa chua nếp cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112041', 1, 'Sữa chua', 160.0, 104.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23'),
  ('HAN-112041', 2, 'Trân châu', 33.0, 112.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23'),
  ('HAN-112041', 3, 'Nước cốt dừa', 17.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23'),
  ('HAN-112041', 4, 'Sữa đặc có đường', 15.0, 49.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23'),
  ('HAN-112041', 5, 'Cùi dừa nạo', 3.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23'),
  ('HAN-112041', 6, 'Xôi nếp cẩm', 70.0, 164.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_76.png', '2026-10-23');

-- Sữa chua nếp cẩm, mít, caramen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112046', 1, 'Xôi nếp cẩm', 80.0, 187.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 10, 'Hạt chia', 3.0, 15.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 2, 'Mít dai', 33.0, 17.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 3, 'Sữa chua', 55.0, 35.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 4, 'Trân châu trắng to', 10.0, 34.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 5, 'Trân châu lá dứa', 6.0, 20.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 6, 'Trân châu trắng bé', 37.0, 127.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 7, 'Caramen', 68.0, 74.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 8, 'Nước cốt dừa', 15.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23'),
  ('HAN-112046', 9, 'Sữa đặc', 15.0, 49.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_77.png', '2026-10-23');

-- Sữa chua thạch lá nếp
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113031', 1, 'Sữa chua', 100.0, 65.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23'),
  ('HAN-113031', 2, 'Xoài chín', 33.0, 22.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23'),
  ('HAN-113031', 3, 'Thạch lá nếp', 120.0, 53.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23'),
  ('HAN-113031', 4, 'Trân châu', 44.0, 151.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23'),
  ('HAN-113031', 5, 'Nước cốt dừa', 15.0, 4.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23'),
  ('HAN-113031', 6, 'Sữa đặc', 30.0, 98.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_78.png', '2026-10-23');

-- Sữa chua trân châu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112039', 1, 'Sữa chua', 160.0, 104.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_79.png', '2026-10-23'),
  ('HAN-112039', 2, 'Trân châu', 32.8, 112.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_79.png', '2026-10-23'),
  ('HAN-112039', 3, 'Nước cốt dừa', 17.0, 5.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_79.png', '2026-10-23'),
  ('HAN-112039', 4, 'Sữa đặc có đường', 15.0, 49.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_79.png', '2026-10-23');

-- Sữa chua trân châu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213009', 1, 'Sữa chua có đường', 120.0, 78.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/232.PNG', '2026-10-23'),
  ('SFF-213009', 2, 'Trân châu trắng', 41.0, 140.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/232.PNG', '2026-10-23'),
  ('SFF-213009', 3, 'Nước cốt dừa', 81.0, 25.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/232.PNG', '2026-10-23');

-- Sữa tươi trân châu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112042', 1, 'Sữa bò tươi', 225.0, 167.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_81.png', '2026-10-23'),
  ('HAN-112042', 2, 'Đường kính', 31.0, 123.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_81.png', '2026-10-23'),
  ('HAN-112042', 3, 'Trân châu đen', 39.0, 134.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_81.png', '2026-10-23');

-- Sủi dìn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211114', 1, 'Nước đường, gừng', 153.0, 55.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/257.PNG', '2026-10-23'),
  ('SFF-211114', 2, 'Sỉu dìn nhân đậu xanh', 54.0, 87.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/257.PNG', '2026-10-23'),
  ('SFF-211114', 3, 'Sỉu dìn nhân mè đen', 63.0, 101.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/257.PNG', '2026-10-23'),
  ('SFF-211114', 4, 'Vừng', 2.0, 12.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/257.PNG', '2026-10-23'),
  ('SFF-211114', 5, 'Dừa già nạo', 5.0, 19.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/257.PNG', '2026-10-23');

-- Tào phớ
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122044', 1, 'Tào phớ', 320.0, 119.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_68.webp', '2026-10-23'),
  ('HAN-122044', 2, 'Thạch sương sáo', 31.0, 13.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_68.webp', '2026-10-23'),
  ('HAN-122044', 3, 'Trân châu', 77.0, 264.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_68.webp', '2026-10-23'),
  ('HAN-122044', 4, 'Nước đường', 64.0, 23.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_68.webp', '2026-10-23');

-- Tào phớ caramen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213059', 1, 'Tào phớ', 201.0, 75.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/239.PNG', '2026-10-23'),
  ('SFF-213059', 2, 'Caramen', 56.0, 61.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/239.PNG', '2026-10-23'),
  ('SFF-213059', 3, 'Nước đường đỏ', 104.0, 37.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/239.PNG', '2026-10-23');

-- Tào phớ thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113040', 1, 'Tào phớ', 435.0, 162.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23'),
  ('HAN-113040', 2, 'Nước đường', 55.0, 33.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23'),
  ('HAN-113040', 3, 'Trân châu trắng', 17.0, 58.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23'),
  ('HAN-113040', 4, 'Trân châu đen', 17.0, 58.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23'),
  ('HAN-113040', 5, 'Thạch đen', 56.0, 25.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23'),
  ('HAN-113040', 6, 'Hạt é', 3.5, 17.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_82.png', '2026-10-23');

-- Tào phớ truyền thống
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113039', 1, 'Tào phớ', 137.0, 51.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_29.webp', '2026-10-23'),
  ('HAN-113039', 2, 'Nước đường', 53.0, 32.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/31/screenshot_29.webp', '2026-10-23');

-- Tiết luộc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223025', 1, 'Tiết lợn luộc', 184.0, 45.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23'),
  ('HAP-223025', 2, 'Rau mùi tàu', 6.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23'),
  ('HAP-223025', 3, 'Rau húng', 7.0, 2.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23'),
  ('HAP-223025', 4, 'Tía tô', 4.0, 1.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23'),
  ('HAP-223025', 5, 'Ớt đỏ to', 2.0, 0.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23'),
  ('HAP-223025', 6, 'Nước chấm pha', 40.0, 14.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/265-1742975667.PNG', '2026-10-23');

-- Tôm viên chiên đường phố
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-223002', 1, 'Tôm viên chiên đường phố', 108.0, 264.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/03/26/266-1742975785.PNG', '2026-10-23');

-- Thạch găng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213033', 1, 'Thạch sương sáo', 109.0, 48.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/240.PNG', '2026-10-23'),
  ('SFF-213033', 2, 'Thạch găng', 201.0, 90.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/240.PNG', '2026-10-23'),
  ('SFF-213033', 3, 'Nước đường đỏ', 100.0, 36.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/240.PNG', '2026-10-23');

-- Thịt lợn quay
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223024', 1, 'Thịt lợn quay', 244.0, 514.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_109.webp', '2026-10-23'),
  ('HAP-223024', 2, 'Nước chấm pha', 43.0, 15.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_109.webp', '2026-10-23');

-- Thịt xiên nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122055', 1, 'Thịt lợn vai nướng', 93.0, 223.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_83.webp', '2026-10-23'),
  ('HAN-122055', 2, 'Tương ớt', 10.0, 4.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_83.webp', '2026-10-23');

-- Trứng chén nướng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113107', 1, 'Trứng cút', 27.0, 40.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 2, 'Xúc xích', 5.0, 16.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 3, 'Hành lá', 3.0, 0.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 4, 'Ruốc thịt lợn', 3.0, 11.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 5, 'Hành phi', 3.0, 9.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 6, 'Sốt me', 5.0, 1.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23'),
  ('HAN-113107', 7, 'Bơ thực vật', 10.0, 72.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_93.png', '2026-10-23');

-- Trứng gà rán ngải cứu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223010', 1, 'Trứng gà công nghiệp', 46.4, 61.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/trung_ga_ran_ngai_cuu_hp.png', '2026-10-23'),
  ('HAP-223010', 2, 'Ngải cứu', 25.0, 8.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/trung_ga_ran_ngai_cuu_hp.png', '2026-10-23'),
  ('HAP-223010', 3, 'Dầu ăn', 5.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/22/trung_ga_ran_ngai_cuu_hp.png', '2026-10-23');

-- Trứng ngải cứu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122012', 1, 'Trứng gà công nghiệp', 117.0, 154.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23'),
  ('HAN-122012', 2, 'Ngải cứu', 46.0, 15.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23'),
  ('HAN-122012', 3, 'Dầu ăn', 10.0, 90.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23'),
  ('HAN-122012', 4, 'Bột canh', 7.0, 0.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23'),
  ('HAN-122012', 5, 'Tương ớt', 17.0, 6.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23'),
  ('HAN-122012', 6, 'Quất', 7.5, 3.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_138.png', '2026-10-23');

-- Trứng vịt lộn
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-123002', 1, 'Trứng vịt lộn luộc', 58.0, 117.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_84.webp', '2026-10-23'),
  ('HAN-123002', 2, 'Rau răm', 1.0, 0.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_84.webp', '2026-10-23'),
  ('HAN-123002', 3, 'Gừng tươi', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_84.webp', '2026-10-23');

-- Vịt rang me
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211109', 1, 'Thịt vịt rang', 395.0, 630.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 2, 'Hành tây', 29.0, 14.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 3, 'Rau mùi', 10.0, 2.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 4, 'Rau mùi tàu', 4.0, 1.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 5, 'Rau kinh giới', 9.0, 3.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 6, 'Rau ngổ', 7.0, 1.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 7, 'Rau húng thơm', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23'),
  ('SFF-211109', 8, 'Rau húng chó', 4.0, 1.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/15/258.PNG', '2026-10-23');

-- Xôi cá rô đồng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112001', 1, 'Xôi trắng', 209.0, 480.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_36.png', '2026-10-23'),
  ('HAN-112001', 2, 'Ruốc cá rô đồng', 17.0, 53.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_36.png', '2026-10-23'),
  ('HAN-112001', 3, 'Hành phi', 14.0, 25.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_36.png', '2026-10-23'),
  ('HAN-112001', 4, 'Dưa chuột', 75.0, 13.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_36.png', '2026-10-23');

-- Xôi chè
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122035', 1, 'Xôi vò đậu xanh, chè', 413.0, 803.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_15.webp', '2026-10-23');

-- Xôi chè bà cốt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113018', 1, 'Xôi chè', 245.0, 476.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_che_ba_cot.png', '2026-10-23');

-- Xôi đỗ đen
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213051', 1, 'Xôi đậu đen', 191.0, 526.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_do_den_hp.webp', '2026-10-23'),
  ('HAP-213051', 2, 'Hành phi', 16.0, 26.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_do_den_hp.webp', '2026-10-23'),
  ('HAP-213051', 3, 'Mỡ lợn nước', 8.0, 71.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_do_den_hp.webp', '2026-10-23'),
  ('HAP-213051', 4, 'Muối vừng', 10.0, 52.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_do_den_hp.webp', '2026-10-23');

-- Xôi đỗ xanh
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121038', 1, 'Xôi đỗ xanh', 209.0, 603.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_17.webp', '2026-10-23');

-- Xôi dừa
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121039', 1, 'Xôi trắng', 239.0, 549.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_16.webp', '2026-10-23'),
  ('HAN-121039', 2, 'Cùi dừa già', 2.0, 7.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_16.webp', '2026-10-23'),
  ('HAN-121039', 3, 'Vừng', 6.0, 34.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_16.webp', '2026-10-23'),
  ('HAN-121039', 4, 'Đường kính', 1.0, 4.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_16.webp', '2026-10-23');

-- Xôi khúc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122067', 1, 'Xôi khúc', 208.0, 595.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_18.webp', '2026-10-23'),
  ('HAN-122067', 2, 'Muối vừng', 3.0, 15.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_18.webp', '2026-10-23');

-- Xôi lạc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-223033', 1, 'Xôi trắng', 251.0, 577.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_62.webp', '2026-10-23'),
  ('HAP-223033', 2, 'Lạc đồ', 30.0, 129.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_62.webp', '2026-10-23'),
  ('HAP-223033', 3, 'Muối vừng', 5.0, 26.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/12/09/screenshot_62.webp', '2026-10-23');

-- Xôi lạc vừng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121037', 1, 'Xôi trắng (đồ)', 223.0, 512.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_19.webp', '2026-10-23'),
  ('HAN-121037', 2, 'Lạc hạt', 20.0, 116.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_19.webp', '2026-10-23'),
  ('HAN-121037', 3, 'Muối vừng lạc', 12.0, 63.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_19.webp', '2026-10-23');

-- Xôi lạc vừng ruốc
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122002', 1, 'Xôi trắng (đồ)', 156.0, 358.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_101.png', '2026-10-23'),
  ('HAN-122002', 2, 'Lạc đồ', 11.0, 47.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_101.png', '2026-10-23'),
  ('HAN-122002', 3, 'Ruốc thịt lợn', 9.0, 33.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_101.png', '2026-10-23'),
  ('HAN-122002', 4, 'Lạc, vừng rang', 3.0, 17.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_101.png', '2026-10-23');

-- Xôi ngô
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121036', 1, 'Xôi ngô', 160.0, 318.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_102.png', '2026-10-23'),
  ('HAN-121036', 2, 'Đỗ xanh đồ', 26.0, 50.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_102.png', '2026-10-23'),
  ('HAN-121036', 3, 'Hành phi', 11.0, 21.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_102.png', '2026-10-23');

-- Xôi pate
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211083', 1, 'Xôi trắng', 242.0, 556.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/209.PNG', '2026-10-23'),
  ('SFF-211083', 2, 'Dưa chuột', 36.0, 6.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/209.PNG', '2026-10-23'),
  ('SFF-211083', 3, 'Pate', 43.0, 140.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/209.PNG', '2026-10-23'),
  ('SFF-211083', 4, 'Ruốc thịt lợn', 7.0, 25.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/209.PNG', '2026-10-23'),
  ('SFF-211083', 5, 'Nước thịt', 158.0, 42.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/209.PNG', '2026-10-23');

-- Xôi pate thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-213017', 1, 'Xôi trắng', 240.0, 552.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23'),
  ('SFF-213017', 2, 'Pate gan', 54.0, 100.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23'),
  ('SFF-213017', 3, 'Thịt ba chỉ kho', 86.0, 155.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23'),
  ('SFF-213017', 4, 'Nước thịt kho', 90.0, 24.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23'),
  ('SFF-213017', 5, 'Đu đủ xanh', 62.0, 18.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23'),
  ('SFF-213017', 6, 'Cà rốt', 10.0, 4.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/210.PNG', '2026-10-23');

-- Xôi thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112049', 1, 'Xôi trắng (đồ)', 221.0, 508.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 2, 'Pate', 71.0, 231.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 3, 'Thịt xá xíu', 82.0, 269.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 4, 'Trứng gà rán', 30.0, 45.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 5, 'Thịt gà xào', 55.0, 97.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 6, 'Mộc nhĩ', 14.0, 46.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 7, 'Hành phi', 9.0, 16.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 8, 'Đu đủ', 38.0, 11.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23'),
  ('HAN-112049', 9, 'Cà rốt', 1.0, 0.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_37.png', '2026-10-23');

-- Xôi thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-213075', 1, 'Xôi trắng', 243.0, 558.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_hp.webp', '2026-10-23'),
  ('HAP-213075', 2, 'Thịt ba chỉ kho tàu', 93.0, 168.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_hp.webp', '2026-10-23'),
  ('HAP-213075', 3, 'Nước thịt', 65.0, 17.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_hp.webp', '2026-10-23'),
  ('HAP-213075', 4, 'Cà rốt', 27.0, 12.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_hp.webp', '2026-10-23'),
  ('HAP-213075', 5, 'Đu đủ', 77.0, 28.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_hp.webp', '2026-10-23');

-- Xôi thịt thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAP-211082', 1, 'Xôi trắng', 245.0, 563.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 2, 'Thịt lườn gà xào nấm', 17.0, 31.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 3, 'Pate', 15.0, 48.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 4, 'Lạp xưởng rán', 14.0, 81.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 5, 'Thịt lợn ba chỉ kho', 34.0, 61.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 6, 'Ruốc thịt lợn', 5.0, 18.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 7, 'Dưa chuột', 46.0, 8.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23'),
  ('HAP-211082', 8, 'Nước thịt', 158.0, 42.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/10/xoi_thit_thap_cam_hp.webp', '2026-10-23');

-- Xôi trắng muối vừng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122068', 1, 'Xôi trắng (đồ)', 213.0, 489.9, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_20.webp', '2026-10-23'),
  ('HAN-122068', 2, 'Muối vừng', 3.0, 15.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_20.webp', '2026-10-23');

-- Xôi trắng thịt trứng
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-122003', 1, 'Xôi trắng (đồ)', 226.0, 519.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_103.png', '2026-10-23'),
  ('HAN-122003', 2, 'Thịt lợn ba chỉ kho tàu', 22.0, 38.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_103.png', '2026-10-23'),
  ('HAN-122003', 3, 'Trứng vịt rán', 57.0, 112.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_103.png', '2026-10-23'),
  ('HAN-122003', 4, 'Nước thịt kho', 40.0, 10.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_103.png', '2026-10-23'),
  ('HAN-122003', 5, 'Hành phi', 2.5, 8.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/21/screenshot_103.png', '2026-10-23');

-- Xôi xéo
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113058', 1, 'Xôi trắng (đồ)', 200.0, 460.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_xeo.png', '2026-10-23'),
  ('HAN-113058', 2, 'Đậu xanh đồ', 30.0, 58.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_xeo.png', '2026-10-23'),
  ('HAN-113058', 3, 'Hành phi', 11.0, 22.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_xeo.png', '2026-10-23'),
  ('HAN-113058', 4, 'Dưa chuột', 15.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_xeo.png', '2026-10-23'),
  ('HAN-113058', 5, 'Dầu ăn', 5.0, 45.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/10/27/xoi_xeo.png', '2026-10-23');

-- Xôi xéo đùi gà sốt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211041', 1, 'Xôi xéo', 201.0, 462.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23'),
  ('SFF-211041', 2, 'Dưa chuột', 40.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23'),
  ('SFF-211041', 3, 'Cà rốt', 7.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23'),
  ('SFF-211041', 4, 'Thịt gà đùi sốt', 65.0, 128.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23'),
  ('SFF-211041', 5, 'Ruốc thịt lợn', 2.0, 7.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23'),
  ('SFF-211041', 6, 'Hành phi', 2.0, 3.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/211.PNG', '2026-10-23');

-- Xôi xéo thập cẩm
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('SFF-211042', 1, 'Xôi xéo', 201.0, 462.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 2, 'Dưa chuột', 40.0, 7.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 3, 'Cà rốt', 7.0, 3.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 4, 'Chả quế', 28.0, 94.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 5, 'Lạp xưởng rán', 9.0, 52.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 6, 'Thịt ba chỉ rán', 17.0, 55.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 7, 'Trứng vịt rán', 23.0, 45.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23'),
  ('SFF-211042', 8, 'Pate', 21.0, 68.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/04/08/212.PNG', '2026-10-23');

-- Xôi xéo thịt
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-113059', 1, 'Xôi đồ', 198.0, 455.4, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23'),
  ('HAN-113059', 2, 'Đậu xanh đồ', 30.0, 58.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23'),
  ('HAN-113059', 3, 'Hành phi', 12.0, 22.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23'),
  ('HAN-113059', 4, 'Dưa chuột', 15.0, 2.7, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23'),
  ('HAN-113059', 5, 'Thịt lợn ba chỉ kho', 72.0, 125.6, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23'),
  ('HAN-113059', 6, 'Nước thịt kho', 43.0, 11.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_38.png', '2026-10-23');

-- Xôi xíu
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-112024', 1, 'Xôi trắng', 206.0, 473.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 2, 'Lạp xưởng', 18.0, 105.3, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 3, 'Ruốc thịt lợn', 16.0, 59.1, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 4, 'Trứng gà rán', 45.0, 89.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 5, 'Chả lợn', 22.0, 113.8, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 6, 'Hành phi', 26.0, 51.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23'),
  ('HAN-112024', 7, 'Pate', 40.0, 130.5, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/08/20/screenshot_39.png', '2026-10-23');

-- Xúc xích rán (5 cái)
INSERT INTO thanh_phan_suat (ma_so, thu_tu, ten_thanh_phan, so_gam, so_calo, nguon, lien_ket, ngay_hieu_luc) VALUES
  ('HAN-121082', 1, 'Xúc xích chiên rán', 80.0, 321.0, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_85.webp', '2026-10-23'),
  ('HAN-121082', 2, 'Tương ớt', 30.0, 12.2, 'Viện Dinh dưỡng (2025). Bảng thành phần trong ảnh suất món ăn', 'https://viendinhduong.vn/storage/app/uploads/public/2025/11/06/screenshot_85.webp', '2026-10-23');
