import database from '../database/database.ts';

export type BenhNen = {
  ma: string;
  ten: string;
};

// Lấy cả danh sách bệnh nền để người dùng chọn
export async function layDanhSachBenhNen(): Promise<BenhNen[]> {
  const ketQua = await database.query<BenhNen>('SELECT ma, ten FROM benh_nen ORDER BY ten');
  return ketQua.rows;
}
