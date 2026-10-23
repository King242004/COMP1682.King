import environment from '../environment.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';

// Giới hạn chặn gõ nhầm; là lựa chọn giao diện, không phải luật dinh dưỡng
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const GHI_CHU_DAI_NHAT = 200;
const MO_TA_DAI_NHAT = 200;
const CALO_LON_NHAT = 10000;

// Ảnh nhận món đưa 3 khả năng; ước tính theo tên hoặc câu mô tả chỉ cần 1
const SO_KHA_NANG_ANH = 3;
const SO_KHA_NANG_TEN = 1;

// Mã vạch sản phẩm là dãy 8 đến 14 chữ số (EAN-8, UPC, EAN-13, GTIN-14)
const DANG_MA_VACH = /^\d{8,14}$/;

// Tra Open Food Facts chờ tối đa 10 giây
const THOI_GIAN_CHO_MA_VACH_MS = 10000;

// Khuôn JSON bắt Gemini phải trả về
const KHUON_KET_QUA = {
  type: 'object',
  properties: {
    la_mon_an: { type: 'boolean' },
    kha_nang: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ten_mon: { type: 'string' },
          khau_phan: { type: 'string' },
          so_calo: { type: 'number' },
          dam_g: { type: 'number' },
          tinh_bot_g: { type: 'number' },
          beo_g: { type: 'number' },
          muoi_g: { type: 'number' },
          duong_g: { type: 'number' },
          beo_no_g: { type: 'number' },
          do_tin_cay: { type: 'number' },
        },
        required: ['ten_mon', 'khau_phan', 'so_calo', 'dam_g', 'tinh_bot_g', 'beo_g', 'muoi_g', 'duong_g', 'beo_no_g', 'do_tin_cay'],
      },
    },
  },
  required: ['la_mon_an', 'kha_nang'],
};

// Đọc một ô chữ không bắt buộc, quá dài thì báo lỗi
function docChuKhongBatBuoc(giaTri: unknown, doDaiToiDa: number, tenO: string): string {
  if (giaTri === undefined || giaTri === null) {
    return '';
  }
  if (typeof giaTri !== 'string' || giaTri.trim().length > doDaiToiDa) {
    throw new HttpError(400, `${tenO} tối đa ${doDaiToiDa} ký tự`);
  }
  return giaTri.trim();
}

// Một khả năng AI đoán: món gì, khẩu phần nhìn thấy, số liệu, độ chắc chắn (0 tới 1)
export type KhaNang = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  do_tin_cay: number;
};

// Kết quả đã kiểm: la_mon_an = false nghĩa là AI thấy ảnh không phải đồ ăn
export type KetQuaNhanMon = {
  la_mon_an: boolean;
  kha_nang: KhaNang[];
};

// Kiểm một số: phải là số hữu hạn, không âm
function laSoKhongAm(giaTri: unknown): giaTri is number {
  return typeof giaTri === 'number' && Number.isFinite(giaTri) && giaTri >= 0;
}

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Muối, đường, béo no: hợp lệ thì làm tròn, sai hoặc thiếu thì null (vẫn giữ khả năng đó)
function docSoGamPhu(giaTri: unknown): number | null {
  if (laSoKhongAm(giaTri)) {
    return lamTronMotSoLe(giaTri);
  }
  return null;
}

// Kiểm JSON AI trả về: bỏ khả năng nào thiếu hoặc sai số liệu, xếp chắc nhất lên đầu, giữ tối đa soKhaNangToiDa
export function docKetQuaNhanMon(duLieu: unknown, soKhaNangToiDa: number): KetQuaNhanMon {
  if (typeof duLieu !== 'object' || duLieu === null) {
    return { la_mon_an: false, kha_nang: [] };
  }
  const ketQuaTho = duLieu as { la_mon_an?: unknown; kha_nang?: unknown };
  if (ketQuaTho.la_mon_an !== true || !Array.isArray(ketQuaTho.kha_nang)) {
    return { la_mon_an: false, kha_nang: [] };
  }

  // Giữ lại khả năng có đủ tên và số liệu hợp lệ
  const danhSachHopLe: KhaNang[] = [];
  for (const muc of ketQuaTho.kha_nang) {
    const khaNang = muc as Record<string, unknown>;
    if (typeof khaNang.ten_mon !== 'string' || khaNang.ten_mon.trim() === '') {
      continue;
    }
    if (!laSoKhongAm(khaNang.so_calo) || !laSoKhongAm(khaNang.dam_g) || !laSoKhongAm(khaNang.tinh_bot_g) || !laSoKhongAm(khaNang.beo_g)) {
      continue;
    }
    let doTinCay = 0;
    if (laSoKhongAm(khaNang.do_tin_cay) && khaNang.do_tin_cay <= 1) {
      doTinCay = khaNang.do_tin_cay;
    }
    let khauPhan = '';
    if (typeof khaNang.khau_phan === 'string') {
      khauPhan = khaNang.khau_phan.trim();
    }
    danhSachHopLe.push({
      ten_mon: khaNang.ten_mon.trim(),
      khau_phan: khauPhan,
      so_calo: Math.round(khaNang.so_calo),
      dam_g: lamTronMotSoLe(khaNang.dam_g),
      tinh_bot_g: lamTronMotSoLe(khaNang.tinh_bot_g),
      beo_g: lamTronMotSoLe(khaNang.beo_g),
      muoi_g: docSoGamPhu(khaNang.muoi_g),
      duong_g: docSoGamPhu(khaNang.duong_g),
      beo_no_g: docSoGamPhu(khaNang.beo_no_g),
      do_tin_cay: doTinCay,
    });
  }

  // Chắc nhất đứng đầu, cắt bớt cho đủ số lượng
  danhSachHopLe.sort((khaNangTruoc, khaNangSau) => khaNangSau.do_tin_cay - khaNangTruoc.do_tin_cay);
  return { la_mon_an: danhSachHopLe.length > 0, kha_nang: danhSachHopLe.slice(0, soKhaNangToiDa) };
}

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

// Ước tính số liệu theo tên món và khẩu phần người dùng gõ
export async function uocTinhTheoTen(duLieu: Record<string, unknown>): Promise<KetQuaNhanMon> {
  const tenMon = duLieu.ten_mon;
  if (typeof tenMon !== 'string' || tenMon.trim() === '' || tenMon.trim().length > TEN_MON_DAI_NHAT) {
    throw new HttpError(400, 'Hãy nhập tên món');
  }
  const khauPhan = docChuKhongBatBuoc(duLieu.khau_phan, KHAU_PHAN_DAI_NHAT, 'Khẩu phần');
  if (khauPhan === '') {
    throw new HttpError(400, 'Hãy nhập khẩu phần đã ăn để AI ước tính, ví dụ "1 tô lớn"');
  }

  // Calo người dùng đã biết (không bắt buộc): có thì AI chỉ ước tính các số còn lại
  let soCaloDaBiet: number | null = null;
  if (duLieu.so_calo !== undefined && duLieu.so_calo !== null) {
    const soCalo = duLieu.so_calo;
    if (typeof soCalo !== 'number' || !Number.isInteger(soCalo) || soCalo < 0 || soCalo > CALO_LON_NHAT) {
      throw new HttpError(400, `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT}`);
    }
    soCaloDaBiet = soCalo;
  }

  // Dòng thêm vào lời nhắc khi người dùng đã biết calo
  let dongCalo = '';
  if (soCaloDaBiet !== null) {
    dongCalo = `Người dùng đã biết tổng là ${soCaloDaBiet} kcal: so_calo phải đúng bằng ${soCaloDaBiet}, các số còn lại ước tính cho khớp với tổng này.`;
  }

  const loiNhac = `Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam.
Người dùng đã ăn: "${tenMon.trim()}", khẩu phần: "${khauPhan}".
${dongCalo}
Hãy ước tính số liệu của đúng khẩu phần đó, theo cách nấu phổ biến ở Việt Nam.
Trả về la_mon_an = true và đúng 1 khả năng trong kha_nang:
- ten_mon: tên món bằng tiếng Việt
- khau_phan: nhắc lại khẩu phần, bằng tiếng Việt
- so_calo (kcal), dam_g, tinh_bot_g, beo_g (gam) cho cả khẩu phần
- muoi_g (gam muối, tính cả nước mắm, bột ngọt, hạt nêm quy ra muối), duong_g (gam đường), beo_no_g (gam chất béo no) cho cả khẩu phần
- do_tin_cay: từ 0 đến 1, mức bạn chắc chắn về con số
Nếu tên không phải đồ ăn hoặc đồ uống, trả về la_mon_an = false và kha_nang rỗng.`;

  const traLoi = await askGeminiForJson(loiNhac, KHUON_KET_QUA);
  const ketQua = docKetQuaNhanMon(traLoi, SO_KHA_NANG_TEN);

  // Người dùng đã biết calo thì giữ đúng số của họ, không tin số AI trả về
  if (soCaloDaBiet !== null) {
    for (const khaNang of ketQua.kha_nang) {
      khaNang.so_calo = soCaloDaBiet;
    }
  }
  return ketQua;
}

// Ước tính số liệu từ một câu người dùng tả bữa vừa ăn, gộp thành một món
export async function uocTinhTheoMoTa(duLieu: Record<string, unknown>): Promise<KetQuaNhanMon> {
  const moTa = duLieu.mo_ta;
  if (typeof moTa !== 'string' || moTa.trim() === '') {
    throw new HttpError(400, 'Hãy ghi bạn đã ăn gì');
  }
  if (moTa.trim().length > MO_TA_DAI_NHAT) {
    throw new HttpError(400, `Câu mô tả tối đa ${MO_TA_DAI_NHAT} ký tự`);
  }

  const loiNhac = `Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam.
Người dùng tả bữa vừa ăn: "${moTa.trim()}".
Hãy gộp tất cả những gì người dùng tả thành MỘT món (nhiều thứ thì gộp tên, ví dụ "Phở bò, thêm trứng") và ước tính theo cách nấu phổ biến ở Việt Nam.
Trả về la_mon_an = true và đúng 1 khả năng trong kha_nang:
- ten_mon: tên món ngắn gọn bằng tiếng Việt
- khau_phan: lượng người dùng ghi, bằng tiếng Việt; nếu người dùng không ghi lượng thì coi là 1 phần thường và ghi đúng "1 phần (AI giả định)"
- so_calo (kcal), dam_g, tinh_bot_g, beo_g (gam) cho cả lượng đó
- muoi_g (gam muối, tính cả nước mắm, bột ngọt, hạt nêm quy ra muối), duong_g (gam đường), beo_no_g (gam chất béo no) cho cả lượng đó
- do_tin_cay: từ 0 đến 1, mức bạn chắc chắn về con số
Nếu câu không nói về đồ ăn hoặc đồ uống, trả về la_mon_an = false và kha_nang rỗng.`;

  const traLoi = await askGeminiForJson(loiNhac, KHUON_KET_QUA);
  return docKetQuaNhanMon(traLoi, SO_KHA_NANG_TEN);
}

// Nhận món từ ảnh chụp, trả tối đa 3 khả năng
export async function nhanMonTuAnh(duLieu: Record<string, unknown>): Promise<KetQuaNhanMon> {
  const anhBase64 = duLieu.anh_base64;
  if (typeof anhBase64 !== 'string' || anhBase64 === '') {
    throw new HttpError(400, 'Thiếu ảnh');
  }
  const kieuAnh = duLieu.kieu_anh;
  if (kieuAnh !== 'image/jpeg' && kieuAnh !== 'image/png') {
    throw new HttpError(400, 'Ảnh phải là JPEG hoặc PNG');
  }
  const ghiChu = docChuKhongBatBuoc(duLieu.ghi_chu, GHI_CHU_DAI_NHAT, 'Ghi chú');

  // Ghi chú của người dùng (ví dụ "tô lớn, ăn ở quán") giúp AI đoán khẩu phần đúng hơn
  let dongGhiChu = '';
  if (ghiChu !== '') {
    dongGhiChu = `Người dùng ghi thêm: "${ghiChu}". Hãy dùng thông tin này khi ước tính.`;
  }

  const loiNhac = `Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam.
Ảnh chụp phần ăn của một người. ${dongGhiChu}
Hãy đưa ra tối đa ${SO_KHA_NANG_ANH} khả năng món trong ảnh là gì, khả năng chắc nhất trước.
Mỗi khả năng là CẢ phần ăn nhìn thấy trong ảnh (đĩa có nhiều thứ thì gộp tên, ví dụ "Cơm, sườn nướng, trứng ốp la"):
- ten_mon: tên bằng tiếng Việt
- khau_phan: khẩu phần nhìn thấy, bằng tiếng Việt, ví dụ "1 tô lớn", "1 dĩa"
- so_calo (kcal), dam_g, tinh_bot_g, beo_g (gam) cho cả phần nhìn thấy
- muoi_g (gam muối, tính cả nước mắm, bột ngọt, hạt nêm quy ra muối), duong_g (gam đường), beo_no_g (gam chất béo no) cho cả phần nhìn thấy
- do_tin_cay: từ 0 đến 1; tổng các khả năng khoảng 1
Ước lượng khẩu phần theo vật quen thuộc trong ảnh như đũa, thìa, chén; đừng đoán thấp khẩu phần lớn.
Nếu ảnh không có đồ ăn hoặc đồ uống, trả về la_mon_an = false và kha_nang rỗng.`;

  const traLoi = await askGeminiForJson(loiNhac, KHUON_KET_QUA, { base64Data: anhBase64, mimeType: kieuAnh });
  return docKetQuaNhanMon(traLoi, SO_KHA_NANG_ANH);
}

// Tra mã vạch trên Open Food Facts
export async function traMaVach(maVach: string): Promise<SanPhamMaVach> {
  if (!DANG_MA_VACH.test(maVach)) {
    throw new HttpError(400, 'Mã vạch không hợp lệ');
  }

  // Chỉ lấy những trường cần dùng; User-Agent theo yêu cầu của Open Food Facts
  const duongDan = `${environment.openFoodFactsUrl}/api/v2/product/${maVach}.json?fields=product_name,brands,nutriments,serving_quantity`;
  let traLoi: unknown;
  try {
    const phanHoi = await fetch(duongDan, {
      headers: { 'User-Agent': environment.openFoodFactsUserAgent },
      signal: AbortSignal.timeout(THOI_GIAN_CHO_MA_VACH_MS),
    });
    traLoi = await phanHoi.json();
  } catch (loi) {
    console.error(loi);
    throw new HttpError(503, 'Không tra được mã vạch lúc này, thử lại sau hoặc gõ tên món');
  }

  const sanPham = docSanPhamMaVach(traLoi);
  if (!sanPham) {
    throw new HttpError(404, 'Chưa có sản phẩm này hoặc thiếu số calo, hãy gõ tên món');
  }
  return sanPham;
}
