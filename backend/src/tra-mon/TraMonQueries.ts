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
};

// Lấy tất cả món, xếp theo tên không dấu (chữ không dấu xếp giống nhau trên mọi máy chủ)
export async function layTatCaMonTraCuu(): Promise<MonTraCuu[]> {
  const ketQua = await database.query<MonTraCuu>(
    `SELECT ma_so, ten_mon, ten_khong_dau, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, anh_url
     FROM mon_tra_cuu
     ORDER BY ten_khong_dau`,
  );
  return ketQua.rows;
}
