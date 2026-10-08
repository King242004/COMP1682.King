// Một lần cân, như lưu trong bảng can_nang
export type LanCan = {
  ngay: string;
  can_nang_kg: number;
};

// Một điểm trên biểu đồ: cân ngày đó và cân theo đường xu hướng
export type DiemCanNang = {
  ngay: string;
  can_nang_kg: number;
  xu_huong_kg: number;
};

// Số mili giây trong một ngày, để đổi ngày ra số
const MILI_GIAY_MOT_NGAY = 24 * 60 * 60 * 1000;

// Làm tròn 1 số lẻ
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Đổi ngày "2026-10-06" ra số thứ tự của ngày, để trừ hai ngày cho nhau ra số ngày cách nhau
export function doiRaSoNgay(ngay: string): number {
  const phan = ngay.split('-');
  const nam = Number(phan[0]);
  const thang = Number(phan[1]);
  const ngayTrongThang = Number(phan[2]);
  return Date.UTC(nam, thang - 1, ngayTrongThang) / MILI_GIAY_MOT_NGAY;
}

// Đường xu hướng: mỗi lần cân lấy trung bình các lần cân trong soNgayXuHuong ngày tính tới ngày đó (gồm cả ngày đó)
export function tinhXuHuongCanNang(danhSachLanCan: LanCan[], soNgayXuHuong: number): DiemCanNang[] {
  const danhSachDiem: DiemCanNang[] = [];
  for (const lanCan of danhSachLanCan) {
    const ngayNay = doiRaSoNgay(lanCan.ngay);

    // Cộng các lần cân nằm trong cửa sổ ngày
    let tongCan = 0;
    let soLanCan = 0;
    for (const lanKhac of danhSachLanCan) {
      const ngayKhac = doiRaSoNgay(lanKhac.ngay);
      if (ngayKhac <= ngayNay && ngayKhac > ngayNay - soNgayXuHuong) {
        tongCan = tongCan + lanKhac.can_nang_kg;
        soLanCan = soLanCan + 1;
      }
    }

    danhSachDiem.push({
      ngay: lanCan.ngay,
      can_nang_kg: lanCan.can_nang_kg,
      xu_huong_kg: lamTronMotSoLe(tongCan / soLanCan),
    });
  }
  return danhSachDiem;
}
