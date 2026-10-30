import database from '../database/database.ts';
import type { DonVi } from './DonViService.ts';

// Lấy đơn vị người dùng đã chọn
export async function layDonVi(nguoiDungId: number): Promise<DonVi> {
  const ketQua = await database.query<{ don_vi: DonVi }>('SELECT don_vi FROM nguoi_dung WHERE id = $1', [nguoiDungId]);
  return ketQua.rows[0].don_vi;
}

// Lưu đơn vị người dùng chọn
export async function luuDonVi(nguoiDungId: number, donVi: DonVi): Promise<void> {
  await database.query('UPDATE nguoi_dung SET don_vi = $2 WHERE id = $1', [nguoiDungId, donVi]);
}
