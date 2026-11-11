import { layNhomDiUngCuaNguoiDung, layTuKhoaDiUng } from '../di-ung/DiUngQueries.ts';
import { timNhomDiUng } from '../di-ung/DiUngService.ts';
import { layDonVi } from '../don-vi/DonViQueries.ts';
import { vietLoiDanDonViChoAi } from '../don-vi/DonViService.ts';
import environment from '../environment.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';

// Giới hạn chặn gõ nhầm; là lựa chọn giao diện, không phải luật dinh dưỡng
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const GHI_CHU_DAI_NHAT = 200;
const CALO_LON_NHAT = 10000;

// Ảnh nhận món đưa 3 khả năng; ước tính theo tên chỉ cần 1
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
          thanh_phan: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Nguyên liệu chính của món theo cách nấu phổ biến ở Việt Nam, mỗi phần tử một nguyên liệu, tiếng Việt. Ghi cả nước chấm, nước mắm, mắm tôm, lạc, vừng, trứng, sữa, bơ, phô mai, bột mì, tôm, cua, mực nếu món thường có.',
          },
        },
        required: ['ten_mon', 'khau_phan', 'so_calo', 'dam_g', 'tinh_bot_g', 'beo_g', 'muoi_g', 'duong_g', 'beo_no_g', 'do_tin_cay', 'thanh_phan'],
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

// Một khả năng AI đoán: món gì, khẩu phần nhìn thấy, số liệu, độ chắc chắn (0 tới 1), nguyên liệu chính để dò dị ứng
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
  thanh_phan: string[];
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
function docSoGamKhongBatBuoc(giaTri: unknown): number | null {
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
    // Nguyên liệu chính: chỉ giữ chữ không rỗng; AI không trả thì để rỗng, vẫn giữ khả năng này
    const thanhPhan: string[] = [];
    if (Array.isArray(khaNang.thanh_phan)) {
      for (const nguyenLieu of khaNang.thanh_phan) {
        if (typeof nguyenLieu === 'string' && nguyenLieu.trim() !== '') {
          thanhPhan.push(nguyenLieu.trim());
        }
      }
    }
    danhSachHopLe.push({
      ten_mon: khaNang.ten_mon.trim(),
      khau_phan: khauPhan,
      so_calo: Math.round(khaNang.so_calo),
      dam_g: lamTronMotSoLe(khaNang.dam_g),
      tinh_bot_g: lamTronMotSoLe(khaNang.tinh_bot_g),
      beo_g: lamTronMotSoLe(khaNang.beo_g),
      muoi_g: docSoGamKhongBatBuoc(khaNang.muoi_g),
      duong_g: docSoGamKhongBatBuoc(khaNang.duong_g),
      beo_no_g: docSoGamKhongBatBuoc(khaNang.beo_no_g),
      do_tin_cay: doTinCay,
      thanh_phan: thanhPhan,
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
  // Khối lượng 1 phần = cả gói, hộp hoặc lon (ví dụ gói mì 75 g); Open Food Facts không ghi thì null
  khoi_luong_1_phan_g: number | null;
  // Mã dị ứng ghi trên nhãn theo Open Food Facts, ví dụ "en:milk"; rỗng là không có dữ liệu
  ma_di_ung: string[];
};

// Kết quả AI gửi về app: mỗi khả năng kèm câu cảnh báo dị ứng do server viết sẵn (rỗng khi người dùng chưa chọn nhóm) và tên các nhóm bị trùng (cho nhãn vàng ngắn)
type KetQuaNhanMonCoCanhBao = {
  la_mon_an: boolean;
  kha_nang: (KhaNang & { canh_bao_di_ung: string; nhom_di_ung: string[] })[];
};

// Sản phẩm mã vạch gửi về app kèm câu cảnh báo dị ứng
type SanPhamMaVachCoCanhBao = SanPhamMaVach & {
  canh_bao_di_ung: string;
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

  // 1 phần là cả bao bì; Open Food Facts có lúc ghi khối lượng là chữ "320", nên đổi sang số; không có hoặc bằng 0 thì để null
  let khoiLuong1Phan = docSo(Number(sanPham.product_quantity));
  if (khoiLuong1Phan === 0) {
    khoiLuong1Phan = null;
  }

  // Mã dị ứng trên nhãn: chỉ giữ mã tiếng Anh "en:..." vì bảng nhom_di_ung đổi mã theo dạng này
  const maDiUng: string[] = [];
  if (Array.isArray(sanPham.allergens_tags)) {
    for (const ma of sanPham.allergens_tags) {
      if (typeof ma === 'string' && ma.startsWith('en:')) {
        maDiUng.push(ma);
      }
    }
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
    ma_di_ung: maDiUng,
  };
}

// Câu cảnh báo cho món AI nhận (ảnh, tên, mô tả): kiểm theo tên món và nguyên liệu AI đoán nên luôn nhắc tự kiểm; chưa chọn nhóm thì rỗng
export function vietCanhBaoMonAi(nhomTrung: string[], thuBiBat: string[], coChonNhom: boolean): string {
  if (!coChonNhom) {
    return '';
  }
  if (nhomTrung.length > 0) {
    return `⚠ AI đoán món có: ${nhomTrung.join(' · ')} (${thuBiBat.join(', ')}). App không biết thành phần thật. Hãy tự kiểm.`;
  }
  return 'App chỉ kiểm theo tên món và nguyên liệu AI đoán, không biết thành phần thật. Hãy tự kiểm.';
}

// Câu cảnh báo cho sản phẩm mã vạch: trùng thì nêu nhóm; không có dữ liệu dị ứng thì nhắc xem bao bì; chưa chọn nhóm thì rỗng
export function vietCanhBaoMaVach(nhomTrung: string[], coDuLieu: boolean, coChonNhom: boolean): string {
  if (!coChonNhom) {
    return '';
  }
  const cacCau: string[] = [];
  if (nhomTrung.length > 0) {
    cacCau.push(`⚠ Có: ${nhomTrung.join(' · ')}.`);
  }
  if (!coDuLieu) {
    cacCau.push('Sản phẩm chưa có dữ liệu dị ứng trên Open Food Facts, hãy xem bao bì.');
  }
  if (coDuLieu && nhomTrung.length === 0) {
    cacCau.push('Nhãn không ghi nhóm bạn đã chọn.');
  }
  return cacCau.join(' ');
}

// Người dùng chọn Anh-Mỹ thì thêm câu dặn AI ghi khẩu phần bằng oz; Mét thì giữ nguyên lời nhắc
async function themLoiDanDonVi(loiNhac: string, nguoiDungId: number): Promise<string> {
  const loiDanDonVi = vietLoiDanDonViChoAi(await layDonVi(nguoiDungId));
  if (loiDanDonVi === '') {
    return loiNhac;
  }
  return `${loiNhac}\n${loiDanDonVi}`;
}

// Gắn câu cảnh báo dị ứng cho từng khả năng AI trả về, dò theo tên món và nguyên liệu AI đoán (thứ bị bắt là những tên mà dò riêng từng tên thì trùng)
async function ganCanhBaoDiUng(ketQua: KetQuaNhanMon, nguoiDungId: number): Promise<KetQuaNhanMonCoCanhBao> {
  const nhomDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  const danhSachTuKhoa = await layTuKhoaDiUng();
  return {
    la_mon_an: ketQua.la_mon_an,
    kha_nang: ketQua.kha_nang.map((khaNang) => {
      const danhSachTen = [khaNang.ten_mon, ...khaNang.thanh_phan];
      const thuBiBat = danhSachTen.filter((ten) => timNhomDiUng([ten], danhSachTuKhoa, nhomDaChon).length > 0);
      const nhomTrung = timNhomDiUng(danhSachTen, danhSachTuKhoa, nhomDaChon);
      return {
        ...khaNang,
        canh_bao_di_ung: vietCanhBaoMonAi(nhomTrung, thuBiBat, nhomDaChon.length > 0),
        nhom_di_ung: nhomTrung,
      };
    }),
  };
}

// Ước tính số liệu theo tên món và khẩu phần người dùng gõ
export async function uocTinhTheoTen(duLieu: Record<string, unknown>, nguoiDungId: number): Promise<KetQuaNhanMonCoCanhBao> {
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
      throw new HttpError(400, `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`);
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

  const traLoi = await askGeminiForJson(await themLoiDanDonVi(loiNhac, nguoiDungId), KHUON_KET_QUA);
  const ketQua = docKetQuaNhanMon(traLoi, SO_KHA_NANG_TEN);

  // Người dùng đã biết calo thì giữ đúng số của họ, không tin số AI trả về
  if (soCaloDaBiet !== null) {
    for (const khaNang of ketQua.kha_nang) {
      khaNang.so_calo = soCaloDaBiet;
    }
  }
  return ganCanhBaoDiUng(ketQua, nguoiDungId);
}

// Nhận món từ ảnh chụp, trả tối đa 3 khả năng
export async function nhanMonTuAnh(duLieu: Record<string, unknown>, nguoiDungId: number): Promise<KetQuaNhanMonCoCanhBao> {
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

  const traLoi = await askGeminiForJson(await themLoiDanDonVi(loiNhac, nguoiDungId), KHUON_KET_QUA, { base64Data: anhBase64, mimeType: kieuAnh });
  return ganCanhBaoDiUng(docKetQuaNhanMon(traLoi, SO_KHA_NANG_ANH), nguoiDungId);
}

// Tra mã vạch trên Open Food Facts, kèm câu cảnh báo dị ứng (theo nhãn và theo tên sản phẩm)
export async function traMaVach(maVach: string, nguoiDungId: number): Promise<SanPhamMaVachCoCanhBao> {
  if (!DANG_MA_VACH.test(maVach)) {
    throw new HttpError(400, 'Mã vạch không hợp lệ');
  }

  // Chỉ lấy những trường cần dùng (phải xin cả quantity thì Open Food Facts mới trả product_quantity); User-Agent theo yêu cầu của Open Food Facts
  const duongDan = `${environment.openFoodFactsUrl}/api/v2/product/${maVach}.json?fields=product_name,brands,nutriments,quantity,product_quantity,allergens_tags`;
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

  // Nhóm trùng = nhóm dò được theo tên sản phẩm, cộng nhóm có mã ghi trên nhãn
  const nhomDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  const danhSachTuKhoa = await layTuKhoaDiUng();
  const nhomTrung = timNhomDiUng([sanPham.ten_san_pham], danhSachTuKhoa, nhomDaChon);
  for (const nhom of nhomDaChon) {
    if (sanPham.ma_di_ung.includes(nhom.ma_open_food_facts) && !nhomTrung.includes(nhom.ten)) {
      nhomTrung.push(nhom.ten);
    }
  }
  const coDuLieu = sanPham.ma_di_ung.length > 0;
  return { ...sanPham, canh_bao_di_ung: vietCanhBaoMaVach(nhomTrung, coDuLieu, nhomDaChon.length > 0) };
}
