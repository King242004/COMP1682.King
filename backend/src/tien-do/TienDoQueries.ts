import database from '../database/database.ts';

// Số ngày của đường xu hướng cân nặng (màn Tiến độ, lộ trình, giữ cân); là lựa chọn giao diện, không phải luật dinh dưỡng
export const SO_NGAY_XU_HUONG = 7;

// Một lần cân, như lưu trong bảng can_nang
export type LanCan = {
  ngay: string;
  can_nang_kg: number;
};

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

// Cân theo xu hướng gần nhất: trung bình các lần cân trong soNgay ngày tính tới lần cân gần nhất, làm tròn 1 số lẻ; chưa cân lần nào thì null
export async function layCanXuHuongGanNhat(nguoiDungId: number, soNgay: number): Promise<number | null> {
  const ketQua = await database.query<{ can_xu_huong_kg: number | null }>(
    `SELECT ROUND(AVG(can_nang_kg), 1) AS can_xu_huong_kg
     FROM can_nang
     WHERE nguoi_dung_id = $1
       AND ngay > (SELECT MAX(ngay) FROM can_nang WHERE nguoi_dung_id = $1) - $2::int`,
    [nguoiDungId, soNgay],
  );
  return ketQua.rows[0].can_xu_huong_kg;
}
