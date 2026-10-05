// Sản phẩm đọc được từ Open Food Facts, số liệu tính trên 100 g
export type SanPhamMaVach = {
  ten_san_pham: string;
  kcal_100g: number;
  dam_100g: number | null;
  tinh_bot_100g: number | null;
  beo_100g: number | null;
  muoi_100g: number | null;
  duong_100g: number | null;
  beo_no_100g: number | null;
  // Khối lượng 1 phần theo nhãn (ví dụ 1 hộp = 100 g); nhãn không ghi thì null
  khoi_luong_1_phan_g: number | null;
};

// Lấy một số không âm, sai hoặc thiếu thì trả về null
function docSo(giaTri: unknown): number | null {
  if (typeof giaTri === 'number' && Number.isFinite(giaTri) && giaTri >= 0) {
    return giaTri;
  }
  return null;
}

// Đọc câu trả lời của Open Food Facts; không có sản phẩm hoặc không có số calo thì trả về null
export function docSanPhamMaVach(duLieu: unknown): SanPhamMaVach | null {
  if (typeof duLieu !== 'object' || duLieu === null) {
    return null;
  }
  const traLoi = duLieu as { status?: unknown; product?: Record<string, unknown> };
  if (traLoi.status !== 1 || typeof traLoi.product !== 'object' || traLoi.product === null) {
    return null;
  }
  const sanPham = traLoi.product;

  // Không có kcal trên 100 g thì không dùng được
  const chatDinhDuong = (sanPham.nutriments ?? {}) as Record<string, unknown>;
  const kcal100g = docSo(chatDinhDuong['energy-kcal_100g']);
  if (kcal100g === null) {
    return null;
  }

  // Tên sản phẩm kèm nhãn hiệu nếu có
  let tenSanPham = 'Sản phẩm chưa có tên';
  if (typeof sanPham.product_name === 'string' && sanPham.product_name.trim() !== '') {
    tenSanPham = sanPham.product_name.trim();
  }
  if (typeof sanPham.brands === 'string' && sanPham.brands.trim() !== '') {
    tenSanPham = `${tenSanPham} (${sanPham.brands.trim()})`;
  }

  // Open Food Facts có lúc ghi khối lượng 1 phần là chữ "100", nên đổi sang số
  let khoiLuong1Phan = docSo(Number(sanPham.serving_quantity));
  if (khoiLuong1Phan === 0) {
    khoiLuong1Phan = null;
  }

  return {
    ten_san_pham: tenSanPham,
    kcal_100g: kcal100g,
    dam_100g: docSo(chatDinhDuong.proteins_100g),
    tinh_bot_100g: docSo(chatDinhDuong.carbohydrates_100g),
    beo_100g: docSo(chatDinhDuong.fat_100g),
    muoi_100g: docSo(chatDinhDuong.salt_100g),
    duong_100g: docSo(chatDinhDuong.sugars_100g),
    beo_no_100g: docSo(chatDinhDuong['saturated-fat_100g']),
    khoi_luong_1_phan_g: khoiLuong1Phan,
  };
}
