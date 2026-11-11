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
  di_ung_kieng_an: string;
  // Vòng eo (không bắt buộc), cân mục tiêu và cân lúc bắt đầu lộ trình; giữ cân thì 2 cột cân là null
  vong_eo_cm: number | null;
  can_muc_tieu_kg: number | null;
  can_bat_dau_kg: number | null;
  // Cân giữ quanh: chỉ có khi giữ cân
  can_giu_quanh_kg: number | null;
  // Tốc độ giảm cân: chỉ có khi giảm cân
  toc_do_giam_can: 'vua' | 'nhanh' | null;
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
  di_ung_kieng_an: string;
  vong_eo_cm: number | null;
  can_muc_tieu_kg: number | null;
  can_bat_dau_kg: number | null;
  can_giu_quanh_kg: number | null;
  toc_do_giam_can: 'vua' | 'nhanh' | null;
  // Mã các nhóm dị ứng đã chọn, lưu ở bảng nguoi_dung_nhom_di_ung
  ma_nhom_di_ung: string[];
};

// Lấy hồ sơ của một người
export async function layHoSo(nguoiDungId: number): Promise<HoSo> {
  const ketQua = await database.query<HoSo>(
    `SELECT gioi_tinh, ngay_sinh, chieu_cao_cm, can_nang_kg, muc_van_dong, muc_tieu, muc_tieu_calo, di_ung_kieng_an,
            vong_eo_cm, can_muc_tieu_kg, can_bat_dau_kg, can_giu_quanh_kg, toc_do_giam_can
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
         muc_van_dong = $6, muc_tieu = $7, muc_tieu_calo = $8, di_ung_kieng_an = $9,
         vong_eo_cm = $10, can_muc_tieu_kg = $11, can_bat_dau_kg = $12, can_giu_quanh_kg = $13,
         toc_do_giam_can = $14
       WHERE id = $1`,
      [
        nguoiDungId, hoSo.gioi_tinh, hoSo.ngay_sinh, hoSo.chieu_cao_cm, hoSo.can_nang_kg,
        hoSo.muc_van_dong, hoSo.muc_tieu, hoSo.muc_tieu_calo, hoSo.di_ung_kieng_an,
        hoSo.vong_eo_cm, hoSo.can_muc_tieu_kg, hoSo.can_bat_dau_kg, hoSo.can_giu_quanh_kg,
        hoSo.toc_do_giam_can,
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
