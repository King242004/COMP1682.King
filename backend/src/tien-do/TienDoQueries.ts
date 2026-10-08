import database from '../database/database.ts';
import type { LanCan } from './TinhXuHuongCanNang.ts';

// Ghi cân của một ngày; ngày đó đã có thì đè số mới lên
export async function luuCanNang(nguoiDungId: number, ngay: string, canNangKg: number): Promise<void> {
  await database.query(
    `INSERT INTO can_nang (nguoi_dung_id, ngay, can_nang_kg)
     VALUES ($1, $2, $3)
     ON CONFLICT (nguoi_dung_id, ngay) DO UPDATE SET can_nang_kg = EXCLUDED.can_nang_kg`,
    [nguoiDungId, ngay, canNangKg],
  );
}

// Lấy các lần cân trong soNgay ngày tính tới denNgay (gồm cả denNgay), ngày cũ trước
export async function layCanNangCacNgay(nguoiDungId: number, denNgay: string, soNgay: number): Promise<LanCan[]> {
  const ketQua = await database.query<LanCan>(
    `SELECT ngay, can_nang_kg
     FROM can_nang
     WHERE nguoi_dung_id = $1 AND ngay BETWEEN $2::date - ($3::int - 1) AND $2::date
     ORDER BY ngay`,
    [nguoiDungId, denNgay, soNgay],
  );
  return ketQua.rows;
}
