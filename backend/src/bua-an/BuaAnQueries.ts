import database from '../database/database.ts';

export type LoaiBua = 'sang' | 'trua' | 'toi' | 'phu';
export type NguonSoLieu = 'nhap_tay' | 'ai' | 'ma_vach';

// Một món đã ăn như lưu trong bảng bua_an
export type BuaAn = {
  id: number;
  ngay: string;
  loai_bua: LoaiBua;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguon_so_lieu: NguonSoLieu;
};

// Dữ liệu một món khi thêm hoặc sửa, đã kiểm tra xong
export type DuLieuBuaAn = {
  ngay: string;
  loai_bua: LoaiBua;
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguon_so_lieu: NguonSoLieu;
};

// Một món trong danh sách "món hay ăn"
export type MonHayAn = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguon_so_lieu: NguonSoLieu;
};

// Các cột trả về mỗi lần đọc một món
const COT_BUA_AN = 'id, ngay, loai_bua, ten_mon, khau_phan, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, duong_g, beo_no_g, nguon_so_lieu';

// Lấy các món của một người trong một ngày, món ghi trước đứng trước
export async function layBuaAnTheoNgay(nguoiDungId: number, ngay: string): Promise<BuaAn[]> {
  const ketQua = await database.query<BuaAn>(
    `SELECT ${COT_BUA_AN} FROM bua_an
     WHERE nguoi_dung_id = $1 AND ngay = $2
     ORDER BY ngay_tao`,
    [nguoiDungId, ngay],
  );
  return ketQua.rows;
}

// Lấy một món, chỉ khi món đó là của người này; không có thì trả về undefined
export async function layMotBuaAn(buaAnId: number, nguoiDungId: number): Promise<BuaAn | undefined> {
  const ketQua = await database.query<BuaAn>(
    `SELECT ${COT_BUA_AN} FROM bua_an WHERE id = $1 AND nguoi_dung_id = $2`,
    [buaAnId, nguoiDungId],
  );
  return ketQua.rows[0];
}

// Thêm một món, trả về món vừa lưu
export async function themBuaAn(nguoiDungId: number, duLieu: DuLieuBuaAn): Promise<BuaAn> {
  const ketQua = await database.query<BuaAn>(
    `INSERT INTO bua_an (nguoi_dung_id, ngay, loai_bua, ten_mon, khau_phan, so_calo, dam_g, tinh_bot_g, beo_g,
                         muoi_g, duong_g, beo_no_g, nguon_so_lieu)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING ${COT_BUA_AN}`,
    [nguoiDungId, duLieu.ngay, duLieu.loai_bua, duLieu.ten_mon, duLieu.khau_phan,
      duLieu.so_calo, duLieu.dam_g, duLieu.tinh_bot_g, duLieu.beo_g,
      duLieu.muoi_g, duLieu.duong_g, duLieu.beo_no_g, duLieu.nguon_so_lieu],
  );
  return ketQua.rows[0];
}

// Sửa một món của người này; không có món đó thì trả về undefined
export async function suaBuaAn(buaAnId: number, nguoiDungId: number, duLieu: DuLieuBuaAn): Promise<BuaAn | undefined> {
  const ketQua = await database.query<BuaAn>(
    `UPDATE bua_an SET
       ngay = $3, loai_bua = $4, ten_mon = $5, khau_phan = $6,
       so_calo = $7, dam_g = $8, tinh_bot_g = $9, beo_g = $10,
       muoi_g = $11, duong_g = $12, beo_no_g = $13, nguon_so_lieu = $14
     WHERE id = $1 AND nguoi_dung_id = $2
     RETURNING ${COT_BUA_AN}`,
    [buaAnId, nguoiDungId, duLieu.ngay, duLieu.loai_bua, duLieu.ten_mon, duLieu.khau_phan,
      duLieu.so_calo, duLieu.dam_g, duLieu.tinh_bot_g, duLieu.beo_g,
      duLieu.muoi_g, duLieu.duong_g, duLieu.beo_no_g, duLieu.nguon_so_lieu],
  );
  return ketQua.rows[0];
}

// Xóa một món của người này; trả về true nếu có món để xóa
export async function xoaBuaAn(buaAnId: number, nguoiDungId: number): Promise<boolean> {
  const ketQua = await database.query('DELETE FROM bua_an WHERE id = $1 AND nguoi_dung_id = $2', [buaAnId, nguoiDungId]);
  return ketQua.rowCount === 1;
}

// Lấy các món người này ghi nhiều lần nhất; mỗi món lấy số liệu của lần ghi gần nhất
export async function layMonHayAn(nguoiDungId: number, soMonToiDa: number): Promise<MonHayAn[]> {
  const ketQua = await database.query<MonHayAn>(
    `SELECT ten_mon, khau_phan, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, duong_g, beo_no_g, nguon_so_lieu
     FROM (
       -- Gom theo tên món (không phân biệt hoa thường), giữ lần ghi mới nhất và đếm số lần ghi
       SELECT DISTINCT ON (lower(ten_mon))
         ten_mon, khau_phan, so_calo, dam_g, tinh_bot_g, beo_g, muoi_g, duong_g, beo_no_g, nguon_so_lieu, ngay_tao,
         count(*) OVER (PARTITION BY lower(ten_mon)) AS so_lan_ghi
       FROM bua_an
       WHERE nguoi_dung_id = $1
       ORDER BY lower(ten_mon), ngay_tao DESC
     ) AS mon
     ORDER BY so_lan_ghi DESC, ngay_tao DESC
     LIMIT $2`,
    [nguoiDungId, soMonToiDa],
  );
  return ketQua.rows;
}

// Tổng calo của một ngày, dùng cho nhận xét nhiều ngày
export type CaloMotNgay = {
  ngay: string;
  tong_calo: number;
};

// Tổng calo từng ngày trong soNgay ngày tính tới denNgay (gồm cả denNgay); ngày chưa ghi món thì không có dòng
export async function layTongCaloCacNgay(nguoiDungId: number, denNgay: string, soNgay: number): Promise<CaloMotNgay[]> {
  const ketQua = await database.query<CaloMotNgay>(
    `SELECT ngay, SUM(so_calo)::int AS tong_calo
     FROM bua_an
     WHERE nguoi_dung_id = $1 AND ngay BETWEEN $2::date - ($3::int - 1) AND $2::date
     GROUP BY ngay
     ORDER BY ngay`,
    [nguoiDungId, denNgay, soNgay],
  );
  return ketQua.rows;
}
