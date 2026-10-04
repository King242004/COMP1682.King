import database from '../database/database.ts';

// Các cột hồ sơ trong bảng nguoi_dung; cột nào chưa thiết lập thì là null
export type HoSo = {
  gioi_tinh: 'nam' | 'nu' | null;
  nam_sinh: number | null;
  chieu_cao_cm: number | null;
  can_nang_kg: number | null;
  cong_viec: 'ngoi_nhieu' | 'di_lai_nhieu' | 'lao_dong_nang' | null;
  so_buoi_tap: number | null;
  so_phut_moi_buoi: number | null;
  cam_nhan_khi_tap: 'nhe' | 'vua' | 'nang' | null;
  muc_van_dong: 'nhe' | 'trung_binh' | 'nang' | null;
  muc_tieu: 'giam' | 'giu' | 'tang' | null;
  muc_tieu_calo: number | null;
};

// Hồ sơ cần lưu, đã kiểm tra và đã tính xong
export type HoSoDeLuu = {
  gioi_tinh: 'nam' | 'nu';
  nam_sinh: number;
  chieu_cao_cm: number;
  can_nang_kg: number;
  cong_viec: 'ngoi_nhieu' | 'di_lai_nhieu' | 'lao_dong_nang';
  so_buoi_tap: number;
  so_phut_moi_buoi: number | null;
  cam_nhan_khi_tap: 'nhe' | 'vua' | 'nang' | null;
  muc_van_dong: 'nhe' | 'trung_binh' | 'nang';
  muc_tieu: 'giam' | 'giu' | 'tang';
  muc_tieu_calo: number;
};

// Lấy hồ sơ của một người
export async function layHoSo(nguoiDungId: number): Promise<HoSo> {
  const ketQua = await database.query<HoSo>(
    `SELECT gioi_tinh, nam_sinh, chieu_cao_cm, can_nang_kg, cong_viec, so_buoi_tap,
            so_phut_moi_buoi, cam_nhan_khi_tap, muc_van_dong, muc_tieu, muc_tieu_calo
     FROM nguoi_dung WHERE id = $1`,
    [nguoiDungId],
  );
  return ketQua.rows[0];
}

// Lấy mã các bệnh nền người này đã chọn
export async function layBenhNenCuaNguoiDung(nguoiDungId: number): Promise<string[]> {
  const ketQua = await database.query<{ benh_nen_ma: string }>(
    'SELECT benh_nen_ma FROM nguoi_dung_benh_nen WHERE nguoi_dung_id = $1 ORDER BY benh_nen_ma',
    [nguoiDungId],
  );
  return ketQua.rows.map((dong) => dong.benh_nen_ma);
}

// Lưu hồ sơ và danh sách bệnh nền trong cùng một lần: lỗi ở đâu thì hủy hết
export async function luuHoSo(nguoiDungId: number, hoSo: HoSoDeLuu, danhSachBenhNen: string[]): Promise<void> {
  const client = await database.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE nguoi_dung SET
         gioi_tinh = $2, nam_sinh = $3, chieu_cao_cm = $4, can_nang_kg = $5, cong_viec = $6,
         so_buoi_tap = $7, so_phut_moi_buoi = $8, cam_nhan_khi_tap = $9,
         muc_van_dong = $10, muc_tieu = $11, muc_tieu_calo = $12
       WHERE id = $1`,
      [
        nguoiDungId, hoSo.gioi_tinh, hoSo.nam_sinh, hoSo.chieu_cao_cm, hoSo.can_nang_kg, hoSo.cong_viec,
        hoSo.so_buoi_tap, hoSo.so_phut_moi_buoi, hoSo.cam_nhan_khi_tap,
        hoSo.muc_van_dong, hoSo.muc_tieu, hoSo.muc_tieu_calo,
      ],
    );

    // Xóa bệnh nền cũ rồi ghi lại danh sách mới
    await client.query('DELETE FROM nguoi_dung_benh_nen WHERE nguoi_dung_id = $1', [nguoiDungId]);
    for (const benhNenMa of danhSachBenhNen) {
      await client.query(
        'INSERT INTO nguoi_dung_benh_nen (nguoi_dung_id, benh_nen_ma) VALUES ($1, $2)',
        [nguoiDungId, benhNenMa],
      );
    }

    await client.query('COMMIT');
  } catch (loi) {
    await client.query('ROLLBACK');
    throw loi;
  } finally {
    client.release();
  }
}
