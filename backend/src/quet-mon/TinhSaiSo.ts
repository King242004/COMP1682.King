// Một cặp số của cùng một đĩa: số thật (đo bằng cân) và số AI đoán
export type CapSo = {
  that: number;
  doan: number;
};

// Làm tròn 1 số lẻ
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Sai số tuyệt đối trung bình: trung bình của |đoán − thật|; danh sách rỗng thì trả về 0
export function saiSoTuyetDoiTrungBinh(danhSachCap: CapSo[]): number {
  if (danhSachCap.length === 0) {
    return 0;
  }
  let tong = 0;
  for (const cap of danhSachCap) {
    tong = tong + Math.abs(cap.doan - cap.that);
  }
  return lamTronMotSoLe(tong / danhSachCap.length);
}

// Sai số có dấu trung bình: trung bình của (đoán − thật); âm là AI hay đoán thấp hơn thật
export function saiSoCoDauTrungBinh(danhSachCap: CapSo[]): number {
  if (danhSachCap.length === 0) {
    return 0;
  }
  let tong = 0;
  for (const cap of danhSachCap) {
    tong = tong + (cap.doan - cap.that);
  }
  return lamTronMotSoLe(tong / danhSachCap.length);
}

// Sai số phần trăm trung vị: xếp |đoán − thật| / thật × 100 từ nhỏ tới lớn rồi lấy số ở giữa; bỏ đĩa có số thật bằng 0
export function saiSoPhanTramTrungVi(danhSachCap: CapSo[]): number {
  const cacPhanTram: number[] = [];
  for (const cap of danhSachCap) {
    if (cap.that > 0) {
      cacPhanTram.push((Math.abs(cap.doan - cap.that) / cap.that) * 100);
    }
  }
  if (cacPhanTram.length === 0) {
    return 0;
  }
  cacPhanTram.sort((phanTramTruoc, phanTramSau) => phanTramTruoc - phanTramSau);

  // Số phần tử lẻ thì lấy đúng số giữa; chẵn thì lấy trung bình hai số giữa
  const viTriGiua = Math.floor(cacPhanTram.length / 2);
  let trungVi = cacPhanTram[viTriGiua];
  if (cacPhanTram.length % 2 === 0) {
    trungVi = (cacPhanTram[viTriGiua - 1] + cacPhanTram[viTriGiua]) / 2;
  }
  return lamTronMotSoLe(trungVi);
}
