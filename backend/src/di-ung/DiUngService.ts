import type { NhomDiUng, TuKhoaDiUng } from './DiUngQueries.ts';

// Làm sạch một tên để so chữ: một kiểu dấu, chữ thường, dấu câu thành dấu cách, có một dấu cách ở hai đầu
function lamSachTen(ten: string): string {
  const chuThuong = ten.normalize('NFC').toLowerCase();
  // Mỗi đoạn ký tự không phải chữ, dấu thanh hay số (dấu phẩy, ngoặc, gạch, nhiều dấu cách) thành một dấu cách
  const chiConChuVaSo = chuThuong.replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ');
  return ` ${chiConChuVaSo.trim()} `;
}

// Tìm những nhóm (trong các nhóm người dùng đã chọn) có trong ít nhất một tên; trả về tên nhóm theo thứ tự nhóm đã chọn
export function timNhomDiUng(danhSachTen: string[], danhSachTuKhoa: TuKhoaDiUng[], nhomDaChon: NhomDiUng[]): string[] {
  const nhomTrung: string[] = [];
  for (const nhom of nhomDaChon) {
    const tuKhoaCuaNhom = danhSachTuKhoa.filter((tuKhoa) => tuKhoa.nhom_di_ung_ma === nhom.ma);

    for (const ten of danhSachTen) {
      // Xóa các từ loại trừ của nhóm khỏi tên trước, ví dụ "quả bơ" khi xét nhóm Sữa
      let tenConLai = lamSachTen(ten);
      for (const tuKhoa of tuKhoaCuaNhom) {
        if (tuKhoa.loai_tru) {
          const tuLoaiTru = lamSachTen(tuKhoa.tu_khoa);
          while (tenConLai.includes(tuLoaiTru)) {
            tenConLai = tenConLai.replace(tuLoaiTru, ' ');
          }
        }
      }

      // Tên còn lại chứa nguyên một từ bắt thì nhóm này trùng; đã trùng thì không cần xét tên khác
      const coTuBat = tuKhoaCuaNhom.some((tuKhoa) => !tuKhoa.loai_tru && tenConLai.includes(lamSachTen(tuKhoa.tu_khoa)));
      if (coTuBat) {
        nhomTrung.push(nhom.ten);
        break;
      }
    }
  }
  return nhomTrung;
}

// Viết các nhóm đã chọn kèm từ bắt để dặn AI, ví dụ "Cá (cá, nước mắm); Tôm, cua (tôm, cua)"; chưa chọn nhóm thì chuỗi rỗng
export function vietDanhSachDiUngChoAi(nhomDaChon: NhomDiUng[], danhSachTuKhoa: TuKhoaDiUng[]): string {
  const cacPhan: string[] = [];
  for (const nhom of nhomDaChon) {
    const tuBat = danhSachTuKhoa
      .filter((tuKhoa) => tuKhoa.nhom_di_ung_ma === nhom.ma && !tuKhoa.loai_tru)
      .map((tuKhoa) => tuKhoa.tu_khoa);
    cacPhan.push(`${nhom.ten} (${tuBat.join(', ')})`);
  }
  return cacPhan.join('; ');
}
