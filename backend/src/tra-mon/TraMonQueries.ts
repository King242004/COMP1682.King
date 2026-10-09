import database from '../database/database.ts';

// Một món Viện Dinh dưỡng đã cân; số liệu là của 1 suất
export type MonTraCuu = {
  ma_so: string;
  ten_mon: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number;
  anh_url: string;
};

// Tìm món có tên chứa từ khóa (so với tên có dấu và tên không dấu), tên ngắn đứng trước
export async function timMonTraCuu(mauTim: string, soMonToiDa: number): Promise<MonTraCuu[]> {
  const ketQua = await database.query<MonTraCuu>(
    `SELECT ma_so, ten_mon, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, anh_url
     FROM mon_tra_cuu
     WHERE ten_mon ILIKE $1 OR ten_khong_dau ILIKE $1
     ORDER BY length(ten_mon), ten_mon
     LIMIT $2`,
    [mauTim, soMonToiDa],
  );
  return ketQua.rows;
}
