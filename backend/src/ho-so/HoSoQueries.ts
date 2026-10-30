import database from '../database/database.ts';

// Các cột hồ sơ trong bảng nguoi_dung; cột nào chưa thiết lập thì là null
export type HoSo = {
  gioi_tinh: 'nam' | 'nu' | null;
  // Ngày sinh dạng năm-tháng-ngày, ví dụ '2004-11-24'
  ngay_sinh: string | null;
  chieu_cao_cm: number | null;
  can_nang_kg: number | null;
  muc_van_dong: 'nhe' | 'trung_binh' | 'nang' | null;
  muc_tieu: 'giam' | 'giu' | 'tang' | null;
  muc_tieu_calo: number | null;
  // Tuổi đã dùng để tính muc_tieu_calo; khác tuổi hôm nay (vừa qua sinh nhật) thì phải tính lại
  tuoi_tinh_muc_tieu: number | null;
  di_ung_kieng_an: string;
};

// Hồ sơ cần lưu, đã kiểm tra và đã tính xong
export type HoSoDeLuu = {
  gioi_tinh: 'nam' | 'nu';
  ngay_sinh: string;
  chieu_cao_cm: number;
  can_nang_kg: number;
  muc_van_dong: 'nhe' | 'trung_binh' | 'nang';
  muc_tieu: 'giam' | 'giu' | 'tang';
  muc_tieu_calo: number;
  tuoi_tinh_muc_tieu: number;
  di_ung_kieng_an: string;
  // Mã các nhóm dị ứng đã chọn, lưu ở bảng nguoi_dung_nhom_di_ung
  ma_nhom_di_ung: string[];
};

// Lấy hồ sơ của một người
export async function layHoSo(nguoiDungId: number): Promise<HoSo> {
  const ketQua = await database.query<HoSo>(
    `SELECT gioi_tinh, ngay_sinh, chieu_cao_cm, can_nang_kg, muc_van_dong, muc_tieu, muc_tieu_calo, tuoi_tinh_muc_tieu, di_ung_kieng_an
     FROM nguoi_dung WHERE id = $1`,
    [nguoiDungId],
  );
  return ketQua.rows[0];
}

// Lưu hồ sơ đã kiểm tra và đã tính xong, cùng các nhóm dị ứng; lỗi ở đâu thì hủy hết, không lưu nửa vời
export async function luuHoSo(nguoiDungId: number, hoSo: HoSoDeLuu): Promise<void> {
  const ketNoi = await database.connect();
  try {
    await ketNoi.query('BEGIN');
    await ketNoi.query(
      `UPDATE nguoi_dung SET
         gioi_tinh = $2, ngay_sinh = $3, chieu_cao_cm = $4, can_nang_kg = $5,
         muc_van_dong = $6, muc_tieu = $7, muc_tieu_calo = $8, tuoi_tinh_muc_tieu = $9, di_ung_kieng_an = $10
       WHERE id = $1`,
      [
        nguoiDungId, hoSo.gioi_tinh, hoSo.ngay_sinh, hoSo.chieu_cao_cm, hoSo.can_nang_kg,
        hoSo.muc_van_dong, hoSo.muc_tieu, hoSo.muc_tieu_calo, hoSo.tuoi_tinh_muc_tieu, hoSo.di_ung_kieng_an,
      ],
    );

    // Xóa nhóm cũ rồi thêm lại từng nhóm mới
    await ketNoi.query('DELETE FROM nguoi_dung_nhom_di_ung WHERE nguoi_dung_id = $1', [nguoiDungId]);
    for (const maNhom of hoSo.ma_nhom_di_ung) {
      await ketNoi.query(
        'INSERT INTO nguoi_dung_nhom_di_ung (nguoi_dung_id, nhom_di_ung_ma) VALUES ($1, $2)',
        [nguoiDungId, maNhom],
      );
    }
    await ketNoi.query('COMMIT');
  } catch (loi) {
    await ketNoi.query('ROLLBACK');
    throw loi;
  } finally {
    ketNoi.release();
  }
}
