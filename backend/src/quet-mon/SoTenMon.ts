// Kết quả chấm một ảnh: AI đoán đúng ở khả năng đầu, hoặc ở một trong 3 khả năng
export type KetQuaSoTen = {
  dungKhaNangDau: boolean;
  dungTrongBaKhaNang: boolean;
};

// Bỏ dấu tiếng Việt và viết thường, ví dụ "Phở Bò" thành "pho bo"
function boDau(chu: string): string {
  // Tách chữ và dấu ra rồi xóa phần dấu; chữ đ không tách được nên đổi riêng
  return chu.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

// Một tên AI đoán được tính là đúng nếu (đã bỏ dấu) chứa một trong các tên được chấp nhận, ví dụ "Phở bò tái" chứa "phở"
export function laDungTen(tenAiDoan: string, cacTenDung: string[]): boolean {
  const tenAiBoDau = boDau(tenAiDoan);
  for (const tenDung of cacTenDung) {
    if (tenAiBoDau.includes(boDau(tenDung))) {
      return true;
    }
  }
  return false;
}

// Chấm một ảnh: xét khả năng đầu tiên và cả 3 khả năng AI đưa ra
export function soTenMon(cacTenAiDoan: string[], cacTenDung: string[]): KetQuaSoTen {
  let dungTrongBaKhaNang = false;
  for (const tenAiDoan of cacTenAiDoan.slice(0, 3)) {
    if (laDungTen(tenAiDoan, cacTenDung)) {
      dungTrongBaKhaNang = true;
    }
  }
  return {
    dungKhaNangDau: cacTenAiDoan.length > 0 && laDungTen(cacTenAiDoan[0], cacTenDung),
    dungTrongBaKhaNang: dungTrongBaKhaNang,
  };
}
