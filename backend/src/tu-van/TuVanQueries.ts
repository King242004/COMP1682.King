import database from '../database/database.ts';

export type VaiTro = 'nguoi_dung' | 'coach';

// Một tin nhắn như lưu trong bảng tin_nhan_tu_van
export type TinNhan = {
  id: number;
  vai_tro: VaiTro;
  noi_dung: string;
};

// Lấy các tin nhắn gần nhất của một người, xếp cũ trước mới sau để hiện từ trên xuống
export async function layTinNhanGanNhat(nguoiDungId: number, soTinToiDa: number): Promise<TinNhan[]> {
  const ketQua = await database.query<TinNhan>(
    `SELECT id, vai_tro, noi_dung
     FROM (
       -- Lấy những tin mới nhất trước, rồi đảo lại thứ tự ở ngoài
       SELECT id, vai_tro, noi_dung FROM tin_nhan_tu_van
       WHERE nguoi_dung_id = $1
       ORDER BY id DESC
       LIMIT $2
     ) AS gan_nhat
     ORDER BY id`,
    [nguoiDungId, soTinToiDa],
  );
  return ketQua.rows;
}

// Lưu một tin nhắn, trả về tin vừa lưu
export async function themTinNhan(nguoiDungId: number, vaiTro: VaiTro, noiDung: string): Promise<TinNhan> {
  const ketQua = await database.query<TinNhan>(
    `INSERT INTO tin_nhan_tu_van (nguoi_dung_id, vai_tro, noi_dung)
     VALUES ($1, $2, $3)
     RETURNING id, vai_tro, noi_dung`,
    [nguoiDungId, vaiTro, noiDung],
  );
  return ketQua.rows[0];
}

// Xóa cả cuộc trò chuyện của một người
export async function xoaTinNhan(nguoiDungId: number): Promise<void> {
  await database.query('DELETE FROM tin_nhan_tu_van WHERE nguoi_dung_id = $1', [nguoiDungId]);
}
