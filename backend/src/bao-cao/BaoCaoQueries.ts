import database from '../database/database.ts';

// Một món đã ăn trong khoảng ngày, chỉ giữ những cột báo cáo cần
export type MonTrongKhoang = {
  ngay: string;
  ten_mon: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
};

// Lấy mọi món của một người từ tuNgay tới denNgay (gồm cả hai ngày), ngày cũ trước, trong ngày món ghi trước đứng trước
export async function layMonTrongKhoang(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<MonTrongKhoang[]> {
  const ketQua = await database.query<MonTrongKhoang>(
    `SELECT ngay, ten_mon, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, duong_g, beo_no_g
     FROM bua_an
     WHERE nguoi_dung_id = $1 AND ngay BETWEEN $2 AND $3
     ORDER BY ngay, ngay_tao`,
    [nguoiDungId, tuNgay, denNgay],
  );
  return ketQua.rows;
}

// Tổng ml nước của một ngày có uống
export type NuocMotNgay = {
  ngay: string;
  so_ml: number;
};

// Lấy tổng ml nước từng ngày từ tuNgay tới denNgay (gồm cả hai ngày), chỉ ngày có uống, ngày cũ trước
export async function layNuocTrongKhoang(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<NuocMotNgay[]> {
  const ketQua = await database.query<NuocMotNgay>(
    `SELECT ngay, so_ml
     FROM uong_nuoc
     WHERE nguoi_dung_id = $1 AND ngay BETWEEN $2 AND $3 AND so_ml > 0
     ORDER BY ngay`,
    [nguoiDungId, tuNgay, denNgay],
  );
  return ketQua.rows;
}
