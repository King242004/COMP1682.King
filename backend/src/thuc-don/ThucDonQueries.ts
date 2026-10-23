import database from '../database/database.ts';

// Một món trong thực đơn, đã kiểm. "mon_vien": 1 suất Viện Dinh dưỡng đã cân (có mã món, ảnh); "com_nha": mâm cơm nhà AI ghép, số AI ước tính
// Thực đơn tạo trước 24/10/2026 không có kieu, ma_so, anh_url và số là AI ước tính
export type MonThucDon = {
  loai_bua: 'sang' | 'trua' | 'toi' | 'phu';
  kieu: 'mon_vien' | 'com_nha';
  ma_so: string | null;
  anh_url: string | null;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguyen_lieu: string[];
  cach_nau: string[];
};

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

// Lấy thực đơn của mấy ngày ngay trước một ngày (không gồm ngày đó), ngày cũ trước
export async function layThucDonCacNgayTruoc(nguoiDungId: number, ngay: string, soNgay: number): Promise<MonThucDon[][]> {
  const ketQua = await database.query<{ mon: MonThucDon[] }>(
    `SELECT mon FROM thuc_don
     WHERE nguoi_dung_id = $1 AND ngay >= $2::date - $3::int AND ngay < $2::date
     ORDER BY ngay`,
    [nguoiDungId, ngay, soNgay],
  );
  return ketQua.rows.map((dong) => dong.mon);
}

// Lưu thực đơn một ngày; ngày đó đã có thì ghi đè (tạo lại)
export async function luuThucDon(nguoiDungId: number, ngay: string, danhSachMon: MonThucDon[]): Promise<void> {
  await database.query(
    `INSERT INTO thuc_don (nguoi_dung_id, ngay, mon) VALUES ($1, $2, $3)
     ON CONFLICT (nguoi_dung_id, ngay) DO UPDATE SET mon = EXCLUDED.mon, ngay_tao = now()`,
    [nguoiDungId, ngay, JSON.stringify(danhSachMon)],
  );
}
