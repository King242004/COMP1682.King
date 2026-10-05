import environment from '../environment.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { askGeminiForJson } from '../shared/geminiClient.ts';
import { docKetQuaNhanMon } from './DocKetQuaNhanMon.ts';
import type { KetQuaNhanMon } from './DocKetQuaNhanMon.ts';
import { docSanPhamMaVach } from './DocSanPhamMaVach.ts';
import type { SanPhamMaVach } from './DocSanPhamMaVach.ts';

// Giới hạn chặn gõ nhầm; là lựa chọn giao diện, không phải luật dinh dưỡng
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const GHI_CHU_DAI_NHAT = 200;

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

  const loiNhac = `Bạn là chuyên gia dinh dưỡng, rành món ăn Việt Nam.
Người dùng đã ăn: "${tenMon.trim()}", khẩu phần: "${khauPhan}".
Hãy ước tính số liệu của đúng khẩu phần đó, theo cách nấu phổ biến ở Việt Nam.
Trả về la_mon_an = true và đúng 1 khả năng trong kha_nang:
- ten_mon: tên món bằng tiếng Việt
- khau_phan: nhắc lại khẩu phần, bằng tiếng Việt
- so_calo (kcal), dam_g, tinh_bot_g, beo_g (gam) cho cả khẩu phần
- muoi_g (gam muối, tính cả nước mắm, bột ngọt, hạt nêm quy ra muối), duong_g (gam đường), beo_no_g (gam chất béo no) cho cả khẩu phần
- do_tin_cay: từ 0 đến 1, mức bạn chắc chắn về con số
Nếu tên không phải đồ ăn hoặc đồ uống, trả về la_mon_an = false và kha_nang rỗng.`;

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
