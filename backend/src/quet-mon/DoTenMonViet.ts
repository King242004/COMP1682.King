import fs from 'node:fs';

import environment from '../environment.ts';
import type { KetQuaNhanMon } from './DocKetQuaNhanMon.ts';
import { nhanMonTuAnh } from './QuetMonService.ts';
import { soTenMon } from './SoTenMon.ts';

// Ảnh món Việt tải từ Wikimedia Commons (ảnh không lên git, danh sách có lên git) và nơi ghi kết quả; chạy từ thư mục backend
const THU_MUC_DU_LIEU = 'do-chinh-xac/mon-viet';
const THU_MUC_KET_QUA = 'do-chinh-xac/ket-qua';

// Bản miễn phí của Gemini cho 5 lần gọi mỗi phút: chờ 15 giây giữa hai ảnh
const THOI_GIAN_CHO_MS = 15000;

// Một dòng trong danh-sach.json: tên file ảnh, các tên được chấp nhận, tác giả và giấy phép của ảnh
type AnhMonViet = {
  file: string;
  ten_dung: string[];
  tac_gia: string;
  giay_phep: string;
  lien_ket: string;
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

// Gửi một ảnh cho AI y như nút "Chụp ảnh" trong app (không tự thử lại), trả về tên các khả năng; AI bận thì null
async function hoiAi(duongDanAnh: string): Promise<string[] | null> {
  const duLieu = { anh_base64: fs.readFileSync(duongDanAnh).toString('base64'), kieu_anh: 'image/jpeg', ghi_chu: '' };
  let ketQua: KetQuaNhanMon;
  try {
    ketQua = await nhanMonTuAnh(duLieu);
  } catch {
    return null;
  }
  return ketQua.kha_nang.map((khaNang) => khaNang.ten_mon);
}

// Bước 1. Đọc danh sách ảnh và tên đúng
const danhSachAnh: AnhMonViet[] = JSON.parse(fs.readFileSync(`${THU_MUC_DU_LIEU}/danh-sach.json`, 'utf8'));
console.log(`Chấm tên ${danhSachAnh.length} ảnh món Việt bằng model ${environment.geminiModel}`);

// Bước 2. Gửi từng ảnh cho AI rồi chấm đúng / sai
const dongCsv = ['file,ten_dung,ai_doan,dung_kha_nang_dau,dung_trong_3_kha_nang,tac_gia,giay_phep,lien_ket'];
let soAnhAiTraLoi = 0;
let soDungKhaNangDau = 0;
let soDungTrongBaKhaNang = 0;
for (let viTri = 0; viTri < danhSachAnh.length; viTri++) {
  const anh = danhSachAnh[viTri];
  const cacTenAiDoan = await hoiAi(`${THU_MUC_DU_LIEU}/anh/${anh.file}`);
  if (cacTenAiDoan === null) {
    console.log(`${viTri + 1}/${danhSachAnh.length} ${anh.file}: AI bận`);
  } else {
    soAnhAiTraLoi = soAnhAiTraLoi + 1;
    const ketQua = soTenMon(cacTenAiDoan, anh.ten_dung);
    if (ketQua.dungKhaNangDau) {
      soDungKhaNangDau = soDungKhaNangDau + 1;
    }
    if (ketQua.dungTrongBaKhaNang) {
      soDungTrongBaKhaNang = soDungTrongBaKhaNang + 1;
    }
    console.log(`${viTri + 1}/${danhSachAnh.length} ${anh.file}: AI đoán "${cacTenAiDoan.join(' | ')}" → ${ketQua.dungKhaNangDau ? 'đúng' : 'sai'} khả năng đầu`);
    dongCsv.push(
      [anh.file, anh.ten_dung.join(' / '), cacTenAiDoan.join(' | '), ketQua.dungKhaNangDau, ketQua.dungTrongBaKhaNang, anh.tac_gia, anh.giay_phep, anh.lien_ket]
        .map((oCsv) => `"${String(oCsv).replace(/"/g, '""')}"`)
        .join(','),
    );
  }
  if (viTri < danhSachAnh.length - 1) {
    await cho(THOI_GIAN_CHO_MS);
  }
}

// Bước 3. Tỷ lệ đúng (%) trên số ảnh AI trả lời được, ghi ra hai file
const ngay = ngayHomNay();
const tenFile = `${THU_MUC_KET_QUA}/${ngay}-${environment.geminiModel}-ten-mon-viet`;
let tyLeDau = 0;
let tyLeBa = 0;
if (soAnhAiTraLoi > 0) {
  tyLeDau = Math.round((soDungKhaNangDau / soAnhAiTraLoi) * 1000) / 10;
  tyLeBa = Math.round((soDungTrongBaKhaNang / soAnhAiTraLoi) * 1000) / 10;
}
const tomTat = [
  `Bộ ảnh: ${danhSachAnh.length} ảnh món Việt từ Wikimedia Commons (2 ảnh đầu tiên trong danh mục mỗi món), giấy phép từng ảnh ghi trong file .csv`,
  `Model: ${environment.geminiModel}, ngày đo: ${ngay}`,
  `AI trả lời được: ${soAnhAiTraLoi}/${danhSachAnh.length} ảnh`,
  `Đúng tên ở khả năng đầu: ${soDungKhaNangDau}/${soAnhAiTraLoi} (${tyLeDau}%)`,
  `Đúng tên trong 3 khả năng: ${soDungTrongBaKhaNang}/${soAnhAiTraLoi} (${tyLeBa}%)`,
];
fs.mkdirSync(THU_MUC_KET_QUA, { recursive: true });
fs.writeFileSync(`${tenFile}.csv`, dongCsv.join('\n') + '\n');
fs.writeFileSync(`${tenFile}-tom-tat.txt`, tomTat.join('\n') + '\n');
console.log('');
console.log(tomTat.join('\n'));
console.log(`Đã ghi ${tenFile}.csv và ${tenFile}-tom-tat.txt`);
