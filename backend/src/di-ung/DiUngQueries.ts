import database from '../database/database.ts';

// Một nhóm dị ứng người dùng tick được ở hồ sơ; ma_open_food_facts là mã nhóm đó trên nhãn sản phẩm của Open Food Facts
export type NhomDiUng = {
  ma: string;
  ten: string;
  ma_open_food_facts: string;
};

// Một từ khóa của một nhóm: loai_tru = false là gặp từ này thì món có nhóm đó; true là xóa từ này khỏi tên trước khi dò
export type TuKhoaDiUng = {
  nhom_di_ung_ma: string;
  tu_khoa: string;
  loai_tru: boolean;
};

// Lấy 9 nhóm theo thứ tự hiện trên màn hồ sơ
export async function layNhomDiUng(): Promise<NhomDiUng[]> {
  const ketQua = await database.query<NhomDiUng>(
    `SELECT ma, ten, ma_open_food_facts FROM nhom_di_ung ORDER BY thu_tu`,
  );
  return ketQua.rows;
}

// Lấy cả bảng từ khóa
export async function layTuKhoaDiUng(): Promise<TuKhoaDiUng[]> {
  const ketQua = await database.query<TuKhoaDiUng>(
    `SELECT nhom_di_ung_ma, tu_khoa, loai_tru FROM tu_khoa_di_ung ORDER BY nhom_di_ung_ma, tu_khoa`,
  );
  return ketQua.rows;
}

// Lấy những nhóm một người đã chọn, theo thứ tự hiện trên màn hồ sơ
export async function layNhomDiUngCuaNguoiDung(nguoiDungId: number): Promise<NhomDiUng[]> {
  const ketQua = await database.query<NhomDiUng>(
    `SELECT nhom.ma, nhom.ten, nhom.ma_open_food_facts
     FROM nguoi_dung_nhom_di_ung AS da_chon JOIN nhom_di_ung AS nhom ON nhom.ma = da_chon.nhom_di_ung_ma
     WHERE da_chon.nguoi_dung_id = $1
     ORDER BY nhom.thu_tu`,
    [nguoiDungId],
  );
  return ketQua.rows;
}
