import database from '../database/database.ts';

// Cài đặt uống nước app gửi lên, đã kiểm tra xong; muc_tieu_ml null là dùng mục tiêu gợi ý
export type CaiDatNuoc = {
  nuoc_ml_moi_lan: number;
  muc_tieu_ml: number | null;
  nhac_uong_nuoc: boolean;
  gio_nhac: string[];
};

// Cài đặt uống nước lưu trong bảng nguoi_dung; muc_tieu_nuoc_ml null là dùng mục tiêu gợi ý
export type CaiDatNuocDaLuu = {
  nuoc_ml_moi_lan: number;
  muc_tieu_nuoc_ml: number | null;
  nhac_uong_nuoc: boolean;
};

// Lấy cài đặt uống nước của một người
export async function layCaiDatNuoc(nguoiDungId: number): Promise<CaiDatNuocDaLuu> {
  const ketQua = await database.query<CaiDatNuocDaLuu>(
    'SELECT nuoc_ml_moi_lan, muc_tieu_nuoc_ml, nhac_uong_nuoc FROM nguoi_dung WHERE id = $1',
    [nguoiDungId],
  );
  return ketQua.rows[0];
}

// Lấy các giờ nhắc của một người dạng 08:00, giờ sớm trước
export async function layGioNhac(nguoiDungId: number): Promise<string[]> {
  const ketQua = await database.query<{ gio: string }>(
    `SELECT to_char(gio, 'HH24:MI') AS gio FROM gio_nhac_uong_nuoc
     WHERE nguoi_dung_id = $1
     ORDER BY gio`,
    [nguoiDungId],
  );
  return ketQua.rows.map((dong) => dong.gio);
}

// Lấy tổng ml đã uống của một ngày; chưa ghi thì là 0
export async function laySoMlNgay(nguoiDungId: number, ngay: string): Promise<number> {
  const ketQua = await database.query<{ so_ml: number }>(
    'SELECT so_ml FROM uong_nuoc WHERE nguoi_dung_id = $1 AND ngay = $2',
    [nguoiDungId, ngay],
  );
  const dong = ketQua.rows[0];
  if (!dong) {
    return 0;
  }
  return dong.so_ml;
}

// Cộng thêm số ml vào ngày đó; ngày chưa có dòng thì tạo mới
export async function congNuoc(nguoiDungId: number, ngay: string, soMl: number): Promise<void> {
  await database.query(
    `INSERT INTO uong_nuoc (nguoi_dung_id, ngay, so_ml)
     VALUES ($1, $2, $3)
     ON CONFLICT (nguoi_dung_id, ngay) DO UPDATE SET so_ml = uong_nuoc.so_ml + EXCLUDED.so_ml`,
    [nguoiDungId, ngay, soMl],
  );
}

// Trừ bớt số ml của ngày đó, không xuống dưới 0
export async function truNuoc(nguoiDungId: number, ngay: string, soMl: number): Promise<void> {
  await database.query(
    'UPDATE uong_nuoc SET so_ml = GREATEST(so_ml - $3, 0) WHERE nguoi_dung_id = $1 AND ngay = $2',
    [nguoiDungId, ngay, soMl],
  );
}

// Lưu cài đặt và các giờ nhắc; lỗi ở đâu thì hủy hết, không lưu nửa vời
export async function luuCaiDatNuoc(nguoiDungId: number, caiDat: CaiDatNuoc): Promise<void> {
  const ketNoi = await database.connect();
  try {
    await ketNoi.query('BEGIN');
    await ketNoi.query(
      'UPDATE nguoi_dung SET nuoc_ml_moi_lan = $2, muc_tieu_nuoc_ml = $3, nhac_uong_nuoc = $4 WHERE id = $1',
      [nguoiDungId, caiDat.nuoc_ml_moi_lan, caiDat.muc_tieu_ml, caiDat.nhac_uong_nuoc],
    );

    // Xóa giờ cũ rồi thêm lại từng giờ mới
    await ketNoi.query('DELETE FROM gio_nhac_uong_nuoc WHERE nguoi_dung_id = $1', [nguoiDungId]);
    for (const gio of caiDat.gio_nhac) {
      await ketNoi.query('INSERT INTO gio_nhac_uong_nuoc (nguoi_dung_id, gio) VALUES ($1, $2)', [nguoiDungId, gio]);
    }
    await ketNoi.query('COMMIT');
  } catch (loi) {
    await ketNoi.query('ROLLBACK');
    throw loi;
  } finally {
    ketNoi.release();
  }
}
