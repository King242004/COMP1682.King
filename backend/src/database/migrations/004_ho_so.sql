-- Thông tin hồ sơ, để trống cho tới khi người dùng thiết lập lần đầu
ALTER TABLE nguoi_dung
  ADD COLUMN gioi_tinh TEXT CHECK (gioi_tinh IN ('nam', 'nu')),
  ADD COLUMN nam_sinh INTEGER,
  ADD COLUMN chieu_cao_cm NUMERIC(4, 1) CHECK (chieu_cao_cm BETWEEN 100 AND 250),
  ADD COLUMN can_nang_kg NUMERIC(4, 1) CHECK (can_nang_kg BETWEEN 30 AND 300),
  -- Bốn câu hỏi về vận động
  ADD COLUMN cong_viec TEXT CHECK (cong_viec IN ('ngoi_nhieu', 'di_lai_nhieu', 'lao_dong_nang')),
  ADD COLUMN so_buoi_tap INTEGER CHECK (so_buoi_tap BETWEEN 0 AND 7),
  ADD COLUMN so_phut_moi_buoi INTEGER CHECK (so_phut_moi_buoi > 0),
  ADD COLUMN cam_nhan_khi_tap TEXT CHECK (cam_nhan_khi_tap IN ('nhe', 'vua', 'nang')),
  -- Kết quả backend tính ra từ các câu trả lời
  ADD COLUMN muc_van_dong TEXT CHECK (muc_van_dong IN ('nhe', 'trung_binh', 'nang')),
  ADD COLUMN muc_tieu TEXT CHECK (muc_tieu IN ('giam', 'giu', 'tang')),
  ADD COLUMN muc_tieu_calo INTEGER CHECK (muc_tieu_calo > 0);
