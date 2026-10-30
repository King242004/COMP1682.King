import database from '../database/database.ts';

// Một món Viện Dinh dưỡng đã cân; số liệu là của 1 suất
export type MonTraCuu = {
  ma_so: string;
  ten_mon: string;
  ten_khong_dau: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number;
  anh_url: string;
  // Tên bỏ số lượng hoặc giá ở cuối, ví dụ "Bánh gối" của "Bánh gối 3 cái"; phần cắt ra nằm ở ghi_chu_suat
  ten_goc: string;
  ghi_chu_suat: string | null;
  // Khám phá chỉ hiện 1 bản cho mỗi món; kính lúp ở màn thêm món thấy đủ
  hien_o_kham_pha: boolean;
  // Nhóm để lọc ở Khám phá, xếp theo chữ đầu tên món
  nhom_mon: NhomMon;
};

export type NhomMon = 'bun_pho' | 'com_chao_xoi' | 'che_do_uong' | 'banh' | 'mon_khac';

// Một dòng trong bảng "Trong 1 suất có", chép từ bảng thành phần Viện in trong ảnh suất; ô Viện để trống (không cân) là null
export type ThanhPhanSuat = {
  thu_tu: number;
  ten_thanh_phan: string;
  so_gam: number | null;
  so_calo: number | null;
};

// Lấy tất cả món, xếp theo tên không dấu (chữ không dấu xếp giống nhau trên mọi máy chủ)
export async function layTatCaMonTraCuu(): Promise<MonTraCuu[]> {
  const ketQua = await database.query<MonTraCuu>(
    `SELECT ma_so, ten_mon, ten_khong_dau, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, anh_url, ten_goc, ghi_chu_suat, hien_o_kham_pha, nhom_mon
     FROM mon_tra_cuu
     ORDER BY ten_khong_dau`,
  );
  return ketQua.rows;
}

// Một thực phẩm trong kho Viện Dinh dưỡng 2025; số trên 100 g, chất Viện chưa có số là null
export type ThucPham = {
  ma_so: string;
  ten_thuc_pham: string;
  ten_khong_dau: string;
  kcal_100g: number;
  dam_100g: number | null;
  tinh_bot_100g: number | null;
  beo_100g: number | null;
  muoi_100g: number | null;
  duong_100g: number | null;
  beo_no_100g: number | null;
};

// Lấy cả kho thực phẩm, xếp theo tên không dấu
export async function layTatCaThucPham(): Promise<ThucPham[]> {
  const ketQua = await database.query<ThucPham>(
    `SELECT ma_so, ten_thuc_pham, ten_khong_dau, kcal_100g, dam_100g, tinh_bot_100g, beo_100g, muoi_100g, duong_100g, beo_no_100g
     FROM thuc_pham
     ORDER BY ten_khong_dau`,
  );
  return ketQua.rows;
}

// Lấy tên các dòng thành phần của mọi món, theo thứ tự in trong ảnh: mã món → danh sách tên (để dò dị ứng)
export async function layTenThanhPhanCuaTungMon(): Promise<Map<string, string[]>> {
  const ketQua = await database.query<{ ma_so: string; ten_thanh_phan: string }>(
    `SELECT ma_so, ten_thanh_phan FROM thanh_phan_suat ORDER BY ma_so, thu_tu`,
  );
  const tenCuaTungMon = new Map<string, string[]>();
  for (const dong of ketQua.rows) {
    if (!tenCuaTungMon.has(dong.ma_so)) {
      tenCuaTungMon.set(dong.ma_so, []);
    }
    tenCuaTungMon.get(dong.ma_so)!.push(dong.ten_thanh_phan);
  }
  return tenCuaTungMon;
}

// Lấy bảng "Trong 1 suất có" của một món, theo thứ tự in trong ảnh; món chưa có bảng thì trả mảng rỗng
export async function layThanhPhanSuat(maSo: string): Promise<ThanhPhanSuat[]> {
  const ketQua = await database.query<ThanhPhanSuat>(
    `SELECT thu_tu, ten_thanh_phan, so_gam, so_calo
     FROM thanh_phan_suat
     WHERE ma_so = $1
     ORDER BY thu_tu`,
    [maSo],
  );
  return ketQua.rows;
}
