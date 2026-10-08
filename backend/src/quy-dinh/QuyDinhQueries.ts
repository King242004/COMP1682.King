import database from '../database/database.ts';
import { HttpError } from '../shared/errorHandler.ts';

// Lấy một con số theo mã, bản còn hiệu lực mới nhất tính tới hôm nay
export async function layQuyDinh(ma: string): Promise<number> {
  const ketQua = await database.query<{ gia_tri: number }>(
    `SELECT gia_tri FROM quy_dinh
     WHERE ma = $1 AND ngay_hieu_luc <= CURRENT_DATE
     ORDER BY ngay_hieu_luc DESC
     LIMIT 1`,
    [ma],
  );
  const dong = ketQua.rows[0];
  if (!dong) {
    throw new HttpError(500, `Thiếu quy định ${ma} trong database`);
  }
  return dong.gia_tri;
}

// Lấy hệ số vận động theo mức vận động và tuổi, bản còn hiệu lực mới nhất
export async function layHeSoVanDong(mucVanDong: string, tuoi: number): Promise<number> {
  const ketQua = await database.query<{ he_so: number }>(
    `SELECT he_so FROM he_so_van_dong
     WHERE muc_van_dong = $1
       AND tuoi_tu <= $2 AND (tuoi_den IS NULL OR $2 <= tuoi_den)
       AND ngay_hieu_luc <= CURRENT_DATE
     ORDER BY ngay_hieu_luc DESC
     LIMIT 1`,
    [mucVanDong, tuoi],
  );
  const dong = ketQua.rows[0];
  if (!dong) {
    throw new HttpError(500, `Thiếu hệ số vận động ${mucVanDong}, ${tuoi} tuổi trong database`);
  }
  return dong.he_so;
}
