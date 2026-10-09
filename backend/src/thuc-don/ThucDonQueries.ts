import database from '../database/database.ts';
import type { MonThucDon } from './DocThucDon.ts';

// Lấy danh sách món của thực đơn một ngày; chưa tạo thì null
export async function layThucDon(nguoiDungId: number, ngay: string): Promise<MonThucDon[] | null> {
  const ketQua = await database.query<{ mon: MonThucDon[] }>(
    `SELECT mon FROM thuc_don WHERE nguoi_dung_id = $1 AND ngay = $2`,
    [nguoiDungId, ngay],
  );
  const dong = ketQua.rows[0];
  if (!dong) {
    return null;
  }
  return dong.mon;
}

// Lưu thực đơn một ngày; ngày đó đã có thì ghi đè (tạo lại)
export async function luuThucDon(nguoiDungId: number, ngay: string, danhSachMon: MonThucDon[]): Promise<void> {
  await database.query(
    `INSERT INTO thuc_don (nguoi_dung_id, ngay, mon) VALUES ($1, $2, $3)
     ON CONFLICT (nguoi_dung_id, ngay) DO UPDATE SET mon = EXCLUDED.mon, ngay_tao = now()`,
    [nguoiDungId, ngay, JSON.stringify(danhSachMon)],
  );
}
