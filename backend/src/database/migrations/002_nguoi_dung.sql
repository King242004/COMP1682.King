-- Tài khoản và hồ sơ của người dùng; hồ sơ để trống cho tới khi người dùng thiết lập lần đầu
CREATE TABLE nguoi_dung (
  id SERIAL PRIMARY KEY,
  ten_hien_thi TEXT NOT NULL CHECK (length(trim(ten_hien_thi)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  mat_khau_bam TEXT NOT NULL,
  -- Tăng lên khi đổi mật khẩu, mọi token cũ hết dùng được
  phien_ban_token INTEGER NOT NULL DEFAULT 1,
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Hồ sơ: giới tính, ngày sinh, chiều cao, cân nặng, mức vận động, mục tiêu
  gioi_tinh TEXT CHECK (gioi_tinh IN ('nam', 'nu')),
  ngay_sinh DATE,
  chieu_cao_cm NUMERIC(4, 1) CHECK (chieu_cao_cm BETWEEN 100 AND 250),
  -- Cân nặng lưu 2 số lẻ để gõ lb rồi hiện lại không lệch (150 lb = 68,04 kg; lưu 68,0 thì hiện lại 149,9 lb)
  can_nang_kg NUMERIC(5, 2) CHECK (can_nang_kg BETWEEN 30 AND 300),
  muc_van_dong TEXT CHECK (muc_van_dong IN ('nhe', 'trung_binh', 'nang')),
  muc_tieu TEXT CHECK (muc_tieu IN ('giam', 'giu', 'tang')),
  -- Mục tiêu calo backend tính, tính lại mỗi lần lưu hồ sơ hoặc ghi cân
  muc_tieu_calo INTEGER CHECK (muc_tieu_calo > 0),
  -- Dị ứng hoặc kiêng ăn người dùng tự gõ (ví dụ "ăn chay"); để trống là không có; chỉ coach dùng
  di_ung_kieng_an TEXT NOT NULL DEFAULT '' CHECK (length(di_ung_kieng_an) <= 200),
  -- Đơn vị người dùng chọn (Mét hoặc Anh-Mỹ); database vẫn lưu kg, cm, g, chỉ đổi lúc hiện và lúc gõ
  don_vi TEXT NOT NULL DEFAULT 'met' CHECK (don_vi IN ('met', 'anh_my')),
  -- Lộ trình: vòng eo (không bắt buộc), cân mục tiêu, cân lúc bắt đầu lộ trình, cân giữ quanh khi chọn giữ cân
  vong_eo_cm NUMERIC(4, 1) CHECK (vong_eo_cm BETWEEN 40 AND 200),
  can_muc_tieu_kg NUMERIC(5, 2) CHECK (can_muc_tieu_kg BETWEEN 30 AND 300),
  can_bat_dau_kg NUMERIC(5, 2) CHECK (can_bat_dau_kg BETWEEN 30 AND 300),
  can_giu_quanh_kg NUMERIC(5, 2) CHECK (can_giu_quanh_kg BETWEEN 30 AND 300),
  -- Uống nước: mỗi lần ghi bao nhiêu ml, mục tiêu tự đặt (trống là dùng gợi ý), có bật nhắc không; giới hạn là để chặn gõ nhầm
  nuoc_ml_moi_lan INTEGER NOT NULL DEFAULT 250 CHECK (nuoc_ml_moi_lan BETWEEN 50 AND 1000),
  muc_tieu_nuoc_ml INTEGER CHECK (muc_tieu_nuoc_ml BETWEEN 500 AND 5000),
  nhac_uong_nuoc BOOLEAN NOT NULL DEFAULT false,
  -- Có cân mục tiêu thì có cân bắt đầu; giữ cân thì không có cân mục tiêu
  CHECK ((can_muc_tieu_kg IS NULL) = (can_bat_dau_kg IS NULL)),
  CHECK (muc_tieu <> 'giu' OR can_muc_tieu_kg IS NULL),
  -- Có cân giữ quanh khi và chỉ khi mục tiêu là giữ cân (chưa thiết lập hồ sơ thì muc_tieu là null, không bị kiểm)
  CHECK ((muc_tieu = 'giu') = (can_giu_quanh_kg IS NOT NULL))
);

-- Cân nặng người dùng ghi theo ngày; mỗi ngày một dòng, ghi lại trong ngày thì đè; giới hạn giống hồ sơ
CREATE TABLE can_nang (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  can_nang_kg NUMERIC(5, 2) NOT NULL CHECK (can_nang_kg BETWEEN 30 AND 300),
  UNIQUE (nguoi_dung_id, ngay)
);

-- Mỗi dòng là một món đã ăn; số liệu là tổng của khẩu phần đã ăn
CREATE TABLE bua_an (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  loai_bua TEXT NOT NULL CHECK (loai_bua IN ('sang', 'trua', 'toi', 'phu')),
  ten_mon TEXT NOT NULL CHECK (length(trim(ten_mon)) > 0),
  -- Khẩu phần mô tả bằng chữ, ví dụ "2 chén", "1 tô nhỏ", "150 g"; để trống được
  khau_phan TEXT NOT NULL DEFAULT '',
  -- Giới hạn trên 10000 kcal là để chặn gõ nhầm, không phải luật dinh dưỡng
  so_calo INTEGER NOT NULL CHECK (so_calo BETWEEN 0 AND 10000),
  -- Đạm, tinh bột, béo, muối, đường, béo no không bắt buộc: NULL là chưa có số liệu
  dam_g NUMERIC(6, 1) CHECK (dam_g >= 0),
  tinh_bot_g NUMERIC(6, 1) CHECK (tinh_bot_g >= 0),
  beo_g NUMERIC(6, 1) CHECK (beo_g >= 0),
  muoi_g NUMERIC(6, 1) CHECK (muoi_g >= 0),
  duong_g NUMERIC(6, 1) CHECK (duong_g >= 0),
  beo_no_g NUMERIC(6, 1) CHECK (beo_no_g >= 0),
  -- Số liệu đến từ đâu: tự nhập, AI ước tính, nhãn sản phẩm qua mã vạch, món Viện Dinh dưỡng, kho thực phẩm
  nguon_so_lieu TEXT NOT NULL DEFAULT 'nhap_tay' CHECK (nguon_so_lieu IN ('nhap_tay', 'ai', 'ma_vach', 'vien_dinh_duong', 'thuc_pham')),
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trang chủ luôn lấy món theo người dùng và ngày, nên đánh chỉ mục cho nhanh
CREATE INDEX bua_an_nguoi_dung_ngay ON bua_an (nguoi_dung_id, ngay);

-- Tin nhắn giữa người dùng và coach; xóa tài khoản thì xóa luôn
CREATE TABLE tin_nhan_tu_van (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  vai_tro TEXT NOT NULL CHECK (vai_tro IN ('nguoi_dung', 'coach')),
  -- Câu hỏi tối đa 500 ký tự (kiểm ở Service); 2000 là giới hạn chung để chặn câu trả lời quá dài
  noi_dung TEXT NOT NULL CHECK (length(trim(noi_dung)) > 0 AND length(noi_dung) <= 2000),
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Màn Coach luôn lấy tin nhắn theo người dùng, mới nhất trước
CREATE INDEX tin_nhan_tu_van_nguoi_dung ON tin_nhan_tu_van (nguoi_dung_id, id);

-- Thực đơn một ngày do AI gợi ý; mỗi người mỗi ngày một dòng, tạo lại thì ghi đè
CREATE TABLE thuc_don (
  id SERIAL PRIMARY KEY,
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  -- Danh sách món đã kiểm (bữa, cách ăn, tên, khẩu phần, số liệu, nguyên liệu, cách nấu), lưu nguyên dạng JSON
  mon JSONB NOT NULL,
  ngay_tao TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nguoi_dung_id, ngay)
);

-- Tổng ml nước đã uống của mỗi người mỗi ngày
CREATE TABLE uong_nuoc (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  ngay DATE NOT NULL,
  so_ml INTEGER NOT NULL CHECK (so_ml >= 0),
  PRIMARY KEY (nguoi_dung_id, ngay)
);

-- Các giờ nhắc uống nước của mỗi người, mỗi giờ nhắc lặp lại hằng ngày
CREATE TABLE gio_nhac_uong_nuoc (
  nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung (id) ON DELETE CASCADE,
  gio TIME NOT NULL,
  PRIMARY KEY (nguoi_dung_id, gio)
);
