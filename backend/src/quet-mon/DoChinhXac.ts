import fs from 'node:fs';

import environment from '../environment.ts';
import type { KetQuaNhanMon } from './DocKetQuaNhanMon.ts';
import { nhanMonTuAnh } from './QuetMonService.ts';
import { saiSoCoDauTrungBinh, saiSoPhanTramTrungVi, saiSoTuyetDoiTrungBinh } from './TinhSaiSo.ts';
import type { CapSo } from './TinhSaiSo.ts';

// Dữ liệu Nutrition5k tải về (không lên git) và nơi ghi kết quả; chạy từ thư mục backend
const THU_MUC_DU_LIEU = 'do-chinh-xac/nutrition5k';
const THU_MUC_KET_QUA = 'do-chinh-xac/ket-qua';

// Bản miễn phí của Gemini cho 5 lần gọi mỗi phút: chờ 15 giây giữa hai ảnh
const THOI_GIAN_CHO_MS = 15000;

// Số đo thật của một đĩa
type DiaThat = {
  calo: number;
  dam: number;
  tinhBot: number;
  beo: number;
};

// Một lần hỏi AI: trả lời được, AI nói không phải đồ ăn, hoặc AI bận (quá thời gian chờ hay lỗi); chỉ khi trả lời được mới có số
type TraLoiAi = {
  trangThai: 'tra_loi' | 'khong_nhan_ra' | 'ai_ban';
  ai: DiaThat | null;
  tenAi: string;
};

// Kết quả đo một đĩa: số thật và câu trả lời của AI
type KetQuaMotDia = {
  maDia: string;
  that: DiaThat;
  trangThai: 'tra_loi' | 'khong_nhan_ra' | 'ai_ban';
  ai: DiaThat | null;
  tenAi: string;
};

// Ngày hôm nay theo giờ trên máy, dạng 2026-10-06
function ngayHomNay(): string {
  const bayGio = new Date();
  const thang = String(bayGio.getMonth() + 1).padStart(2, '0');
  const ngay = String(bayGio.getDate()).padStart(2, '0');
  return `${bayGio.getFullYear()}-${thang}-${ngay}`;
}

// Chờ một lúc
function cho(miliGiay: number): Promise<void> {
  return new Promise((xong) => setTimeout(xong, miliGiay));
}

// Gửi một ảnh cho AI y như nút "Chụp ảnh" trong app (không ghi chú, phần ăn = 1, không tự thử lại), lấy khả năng đầu tiên
async function hoiAi(duongDanAnh: string): Promise<TraLoiAi> {
  const duLieu = { anh_base64: fs.readFileSync(duongDanAnh).toString('base64'), kieu_anh: 'image/png', ghi_chu: '' };
  let ketQua: KetQuaNhanMon;
  try {
    ketQua = await nhanMonTuAnh(duLieu);
  } catch {
    return { trangThai: 'ai_ban', ai: null, tenAi: '' };
  }
  if (!ketQua.la_mon_an || ketQua.kha_nang.length === 0) {
    return { trangThai: 'khong_nhan_ra', ai: null, tenAi: '' };
  }
  const khaNang = ketQua.kha_nang[0];
  return {
    trangThai: 'tra_loi',
    ai: { calo: khaNang.so_calo, dam: khaNang.dam_g, tinhBot: khaNang.tinh_bot_g, beo: khaNang.beo_g },
    tenAi: khaNang.ten_mon,
  };
}

// Bước 1. Đọc số đo thật: 6 cột đầu mỗi dòng là mã đĩa, calo, khối lượng, béo, tinh bột, đạm
const soLieuThat = new Map<string, DiaThat>();
for (const dong of fs.readFileSync(`${THU_MUC_DU_LIEU}/dish_metadata_cafe1.csv`, 'utf8').split('\n')) {
  const cot = dong.split(',');
  if (cot.length >= 6) {
    soLieuThat.set(cot[0], { calo: Number(cot[1]), beo: Number(cot[3]), tinhBot: Number(cot[4]), dam: Number(cot[5]) });
  }
}

// Bước 2. Mỗi ảnh trong thư mục anh/ là một đĩa cần đo, tên ảnh là mã đĩa
const danhSachAnh = fs.readdirSync(`${THU_MUC_DU_LIEU}/anh`).filter((tenFile) => tenFile.endsWith('.png')).sort();
console.log(`Đo ${danhSachAnh.length} đĩa bằng model ${environment.geminiModel}, mỗi ảnh cách nhau ${THOI_GIAN_CHO_MS / 1000} giây`);

// Bước 3. Gửi từng ảnh cho AI
const danhSachKetQua: KetQuaMotDia[] = [];
for (let viTri = 0; viTri < danhSachAnh.length; viTri++) {
  const maDia = danhSachAnh[viTri].replace('.png', '');
  const that = soLieuThat.get(maDia);
  if (!that) {
    console.log(`${maDia}: không có trong bảng số liệu, bỏ qua`);
    continue;
  }
  const traLoi = await hoiAi(`${THU_MUC_DU_LIEU}/anh/${danhSachAnh[viTri]}`);
  danhSachKetQua.push({ maDia: maDia, that: that, trangThai: traLoi.trangThai, ai: traLoi.ai, tenAi: traLoi.tenAi });
  if (traLoi.ai) {
    console.log(`${viTri + 1}/${danhSachAnh.length} ${maDia}: thật ${Math.round(that.calo)} kcal, AI ${traLoi.ai.calo} kcal (${traLoi.tenAi})`);
  } else {
    console.log(`${viTri + 1}/${danhSachAnh.length} ${maDia}: ${traLoi.trangThai === 'ai_ban' ? 'AI bận' : 'AI nói không phải đồ ăn'}`);
  }
  if (viTri < danhSachAnh.length - 1) {
    await cho(THOI_GIAN_CHO_MS);
  }
}

// Bước 4. Ghép cặp thật / đoán cho từng chất, chỉ tính các đĩa AI trả lời được; đếm số lần AI bận và không nhận ra
const capCalo: CapSo[] = [];
const capDam: CapSo[] = [];
const capTinhBot: CapSo[] = [];
const capBeo: CapSo[] = [];
let soLanAiBan = 0;
let soLanKhongNhanRa = 0;
for (const ketQua of danhSachKetQua) {
  if (ketQua.trangThai === 'ai_ban') {
    soLanAiBan = soLanAiBan + 1;
  }
  if (ketQua.trangThai === 'khong_nhan_ra') {
    soLanKhongNhanRa = soLanKhongNhanRa + 1;
  }
  if (ketQua.ai) {
    capCalo.push({ that: ketQua.that.calo, doan: ketQua.ai.calo });
    capDam.push({ that: ketQua.that.dam, doan: ketQua.ai.dam });
    capTinhBot.push({ that: ketQua.that.tinhBot, doan: ketQua.ai.tinhBot });
    capBeo.push({ that: ketQua.that.beo, doan: ketQua.ai.beo });
  }
}

// Bước 5. Tóm tắt rồi ghi ra hai file: bảng từng đĩa (.csv) và tóm tắt (.txt)
const ngay = ngayHomNay();
const tenFile = `${THU_MUC_KET_QUA}/${ngay}-${environment.geminiModel}`;
const tomTat = [
  `Bộ dữ liệu: Nutrition5k (Thames và cộng sự, CVPR 2021), ${danhSachAnh.length} đĩa đầu tiên có ảnh chụp từ trên xuống`,
  `Model: ${environment.geminiModel}, ngày đo: ${ngay}`,
  `AI trả lời được: ${capCalo.length}/${danhSachKetQua.length} đĩa; AI bận (quá thời gian chờ hoặc lỗi): ${soLanAiBan}; AI nói không phải đồ ăn: ${soLanKhongNhanRa}`,
  `Calo: sai số tuyệt đối trung bình ${saiSoTuyetDoiTrungBinh(capCalo)} kcal; sai số % trung vị ${saiSoPhanTramTrungVi(capCalo)}%; sai số có dấu trung bình ${saiSoCoDauTrungBinh(capCalo)} kcal (âm là đoán thấp)`,
  `Đạm: sai số tuyệt đối trung bình ${saiSoTuyetDoiTrungBinh(capDam)} g`,
  `Tinh bột: sai số tuyệt đối trung bình ${saiSoTuyetDoiTrungBinh(capTinhBot)} g`,
  `Béo: sai số tuyệt đối trung bình ${saiSoTuyetDoiTrungBinh(capBeo)} g`,
];

const dongCsv = ['ma_dia,trang_thai,calo_that,calo_ai,dam_that,dam_ai,tinh_bot_that,tinh_bot_ai,beo_that,beo_ai,ten_ai'];
for (const ketQua of danhSachKetQua) {
  const that = ketQua.that;
  const ai = ketQua.ai;
  dongCsv.push(
    [
      ketQua.maDia,
      ketQua.trangThai,
      Math.round(that.calo), ai ? ai.calo : '',
      Math.round(that.dam * 10) / 10, ai ? ai.dam : '',
      Math.round(that.tinhBot * 10) / 10, ai ? ai.tinhBot : '',
      Math.round(that.beo * 10) / 10, ai ? ai.beo : '',
      `"${ketQua.tenAi.replace(/"/g, '""')}"`,
    ].join(','),
  );
}

fs.mkdirSync(THU_MUC_KET_QUA, { recursive: true });
fs.writeFileSync(`${tenFile}.csv`, dongCsv.join('\n') + '\n');
fs.writeFileSync(`${tenFile}-tom-tat.txt`, tomTat.join('\n') + '\n');
console.log('');
console.log(tomTat.join('\n'));
console.log(`Đã ghi ${tenFile}.csv và ${tenFile}-tom-tat.txt`);
