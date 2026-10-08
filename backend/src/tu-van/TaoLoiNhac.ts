import type { CaloMotNgay, MonHayAn } from '../bua-an/BuaAnQueries.ts';
import type { NhatKyNgay } from '../bua-an/BuaAnService.ts';
import type { TienDo } from '../tien-do/TienDoService.ts';

// Hồ sơ rút gọn để coach biết đang nói chuyện với ai
export type HoSoCoach = {
  gioi_tinh: 'nam' | 'nu' | null;
  tuoi: number | null;
  chieu_cao_cm: number | null;
  can_nang_kg: number | null;
  bmi: number | null;
  phan_loai_bmi: string | null;
  muc_tieu: 'giam' | 'giu' | 'tang' | null;
  di_ung_kieng_an: string;
};

// Một tin nhắn cũ gửi kèm để AI nhớ đang nói tới đâu
export type TinNhanCu = {
  vai_tro: 'nguoi_dung' | 'coach';
  noi_dung: string;
};

// Mọi thứ cần để ghép lời nhắc
export type DuLieuLoiNhac = {
  hoSo: HoSoCoach;
  nhatKy: NhatKyNgay;
  bayNgay: CaloMotNgay[];
  monHayAn: MonHayAn[];
  tienDo: TienDo;
  lichSu: TinNhanCu[];
  cauHoi: string;
};

// Chữ hiển thị cho các giá trị lưu trong database
const TEN_GIOI_TINH = { nam: 'nam', nu: 'nữ' };
const TEN_MUC_TIEU = { giam: 'giảm cân', giu: 'giữ cân', tang: 'tăng cân' };
const TEN_BUA = { sang: 'Bữa sáng', trua: 'Bữa trưa', toi: 'Bữa tối', phu: 'Bữa phụ' };

// Luật cho coach; "healthy" theo 10 lời khuyên dinh dưỡng hợp lý đến 2030 của Viện Dinh dưỡng
const LUAT = [
  'Bạn là coach dinh dưỡng của app MealMate. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (khoảng 120 chữ), không dùng ký hiệu định dạng như ** hay #.',
  'Phạm vi: ăn uống, dinh dưỡng, món ăn, nấu ăn healthy, vận động. Câu hỏi ngoài phạm vi này thì trả trong_pham_vi = false.',
  'Chỉ dùng số liệu trong phần "Số liệu của người dùng"; không tự tính lại mục tiêu calo hay giới hạn.',
  'Món người dùng đã ghi thì dùng đúng số đã ghi. Món khác chỉ nói khoảng (ví dụ khoảng 450–600 kcal): mọi con số calo của món chưa ghi phải có chữ "khoảng".',
  'Healthy theo 10 lời khuyên dinh dưỡng hợp lý của Viện Dinh dưỡng: ăn đủ, cân đối, đa dạng; nhiều rau củ quả; ưu tiên cá, thịt gia cầm, các loại hạt, thịt đỏ có mức độ; uống đủ nước; hạn chế chiên rán, đồ ăn nhanh nhiều dầu mỡ, muối, đường, đồ uống có đường hoặc có cồn; ăn đủ 3 bữa, không bỏ bữa, không ăn quá no.',
  'Khi gợi ý bữa: ưu tiên món Việt dễ kiếm, đưa một món ăn ngoài và một món tự nấu (nguyên liệu cho 1 người, 3–5 bước ngắn, calo khoảng), hợp với số calo còn lại và các chất đang thiếu hoặc đã vượt.',
  'Câu hỏi về bệnh hoặc thuốc vẫn là trong_pham_vi = true: nói rõ bạn không tư vấn bệnh và thuốc, khuyên hỏi bác sĩ; được nhắc thêm nguyên tắc ăn uống chung. Không chẩn đoán bệnh, không nói liều hay giờ uống thuốc.',
  'Không khuyên nhịn ăn, bỏ bữa, ăn dưới mục tiêu calo hay giảm cân thật nhanh.',
  'Nếu người dùng có ghi dị ứng hoặc kiêng ăn: không gợi ý món có những thành phần đó; khi gợi ý món ăn ngoài thì nhắc hỏi quán về thành phần. Không bao giờ nói một món là an toàn với người dị ứng.',
  'Người cao tuổi muốn giảm cân: nhắc ăn đủ đạm, giữ vận động và hỏi bác sĩ trước khi giảm.',
];

// Số có thể chưa có: null thì ghi "chưa có"
function vietSo(so: number | null): string {
  if (so === null) {
    return 'chưa có';
  }
  return String(so);
}

// Hai dòng hồ sơ: giới, tuổi, chiều cao, cân nặng, BMI, mục tiêu; dị ứng hoặc kiêng ăn
function vietHoSo(hoSo: HoSoCoach): string[] {
  const gioiTinh = hoSo.gioi_tinh ? TEN_GIOI_TINH[hoSo.gioi_tinh] : 'chưa có';
  const mucTieu = hoSo.muc_tieu ? TEN_MUC_TIEU[hoSo.muc_tieu] : 'chưa có';
  const diUngKiengAn = hoSo.di_ung_kieng_an === '' ? 'không có' : hoSo.di_ung_kieng_an;
  return [
    `- Hồ sơ: ${gioiTinh}, ${vietSo(hoSo.tuoi)} tuổi, cao ${vietSo(hoSo.chieu_cao_cm)} cm, nặng ${vietSo(hoSo.can_nang_kg)} kg, BMI ${vietSo(hoSo.bmi)} (${hoSo.phan_loai_bmi ?? 'chưa có'}), mục tiêu ${mucTieu}`,
    `- Dị ứng hoặc kiêng ăn: ${diUngKiengAn}`,
  ];
}

// Các dòng của ngày hôm nay: calo, ba chất, ba chất nên hạn chế, từng món
function vietHomNay(nhatKy: NhatKyNgay): string[] {
  const tongHop = nhatKy.tong_hop;
  const dong: string[] = [];

  if (nhatKy.muc_tieu_calo === null) {
    dong.push(`- Hôm nay (${nhatKy.ngay}): đã ăn ${tongHop.tong_calo} kcal, chưa thiết lập mục tiêu`);
  } else {
    dong.push(`- Hôm nay (${nhatKy.ngay}): đã ăn ${tongHop.tong_calo} / ${nhatKy.muc_tieu_calo} kcal, còn lại ${tongHop.con_lai} kcal (số âm là đã vượt)`);
  }

  if (nhatKy.muc_tieu_chat) {
    const chat = nhatKy.muc_tieu_chat;
    dong.push(`- Đạm ${tongHop.tong_dam_g} g (nên ít nhất ${chat.dam_g_toi_thieu} g), tinh bột ${tongHop.tong_tinh_bot_g} g (nên ${chat.tinh_bot_g_thap}–${chat.tinh_bot_g_cao} g), béo ${tongHop.tong_beo_g} g (nên ${chat.beo_g_thap}–${chat.beo_g_cao} g)`);
  }
  if (nhatKy.gioi_han_nen_han_che) {
    const gioiHan = nhatKy.gioi_han_nen_han_che;
    dong.push(`- Nên hạn chế: muối ${tongHop.tong_muoi_g} / dưới ${gioiHan.muoi_g_toi_da} g, đường ${tongHop.tong_duong_g} / tối đa ${gioiHan.duong_g_toi_da} g, béo no ${tongHop.tong_beo_no_g} / tối đa ${gioiHan.beo_no_g_toi_da} g`);
  }
  if (tongHop.so_mon_thieu_so_lieu > 0) {
    dong.push(`- ${tongHop.so_mon_thieu_so_lieu} món chưa đủ số liệu nên các tổng trên có thể thấp hơn thực tế`);
  }

  // Từng món đã ăn hôm nay
  if (nhatKy.bua_an.length === 0) {
    dong.push('- Hôm nay chưa ghi món nào');
  }
  for (const buaAn of nhatKy.bua_an) {
    dong.push(`- ${TEN_BUA[buaAn.loai_bua]}: ${buaAn.ten_mon} (${buaAn.khau_phan || 'không ghi khẩu phần'}) ${buaAn.so_calo} kcal, muối ${vietSo(buaAn.muoi_g)} g, đường ${vietSo(buaAn.duong_g)} g, béo no ${vietSo(buaAn.beo_no_g)} g`);
  }
  return dong;
}

// Các dòng tiến độ: cân theo xu hướng, tóm tắt 4 tuần, tốc độ giảm cân nên có (chỉ khi đang giảm cân)
function vietTienDo(tienDo: TienDo): string[] {
  const tomTat = tienDo.tom_tat;
  const dong: string[] = [];
  dong.push(`- Cân nặng theo đường xu hướng 7 ngày: ${tienDo.can_nang_xu_huong === null ? 'chưa ghi cân lần nào' : `${tienDo.can_nang_xu_huong} kg`}`);
  dong.push(`- ${tomTat.so_ngay} ngày qua: ăn trung bình ${vietSo(tomTat.calo_trung_binh)} kcal mỗi ngày có ghi, ghi món ${tomTat.so_ngay_co_ghi}/${tomTat.so_ngay} ngày`);
  if (tomTat.thay_doi_kg_moi_thang === null) {
    dong.push('- Cân thay đổi mỗi tháng: chưa đủ dữ liệu cân (cần trải dài ít nhất 14 ngày)');
  } else {
    dong.push(`- Cân thay đổi khoảng ${tomTat.thay_doi_kg_moi_thang} kg mỗi tháng (số âm là giảm)`);
  }
  if (tienDo.muc_tieu === 'giam') {
    dong.push(`- Tốc độ giảm cân nên có theo QĐ 2892 của Bộ Y tế: ${tienDo.giam_can_kg_moi_thang_thap}–${tienDo.giam_can_kg_moi_thang_cao} kg mỗi tháng`);
  }
  return dong;
}

// Ghép luật, số liệu thật, cuộc trò chuyện gần đây và câu hỏi mới thành một lời nhắc gửi AI
export function taoLoiNhac(duLieu: DuLieuLoiNhac): string {
  const dong: string[] = [];
  dong.push(...LUAT);

  dong.push('');
  dong.push('Số liệu của người dùng:');
  dong.push(...vietHoSo(duLieu.hoSo));
  dong.push(...vietHomNay(duLieu.nhatKy));

  // Tổng calo 7 ngày gần nhất
  dong.push('- Tổng calo các ngày gần đây (ngày không có trong danh sách là chưa ghi):');
  for (const motNgay of duLieu.bayNgay) {
    dong.push(`  ${motNgay.ngay}: ${motNgay.tong_calo} kcal`);
  }

  dong.push(...vietTienDo(duLieu.tienDo));

  // Món hay ăn kèm số đã ghi
  dong.push('- Món hay ăn (số đã ghi):');
  for (const mon of duLieu.monHayAn) {
    dong.push(`  ${mon.ten_mon} (${mon.khau_phan || 'không ghi khẩu phần'}) ${mon.so_calo} kcal`);
  }

  // Cuộc trò chuyện gần đây, cũ trước mới sau
  dong.push('');
  dong.push('Cuộc trò chuyện gần đây:');
  if (duLieu.lichSu.length === 0) {
    dong.push('(chưa có)');
  }
  for (const tinNhan of duLieu.lichSu) {
    const nguoiNoi = tinNhan.vai_tro === 'nguoi_dung' ? 'Người dùng' : 'Coach';
    dong.push(`${nguoiNoi}: ${tinNhan.noi_dung}`);
  }

  dong.push('');
  dong.push(`Câu hỏi mới của người dùng: "${duLieu.cauHoi}"`);
  dong.push('Trả về JSON: trong_pham_vi (true hoặc false) và tra_loi (câu trả lời).');
  return dong.join('\n');
}
