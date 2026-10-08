import { callApi } from '../shared/apiClient';

export type VaiTro = 'nguoi_dung' | 'coach';

// Một tin nhắn server gửi về
export type TinNhan = {
  id: number;
  vai_tro: VaiTro;
  noi_dung: string;
};

// Lấy các tin nhắn gần nhất với coach
export async function layTinNhan(): Promise<TinNhan[]> {
  const ketQua = await callApi('GET', '/tu-van');
  return ketQua as TinNhan[];
}

// Hỏi coach; ngay là ngày trên điện thoại để coach biết "hôm nay" là ngày nào; trả về câu hỏi và câu trả lời vừa lưu
export async function hoiCoach(cauHoi: string, ngay: string): Promise<TinNhan[]> {
  const ketQua = await callApi('POST', '/tu-van', { cau_hoi: cauHoi, ngay: ngay });
  return ketQua as TinNhan[];
}

// Xóa cả cuộc trò chuyện
export async function xoaTroChuyen(): Promise<void> {
  await callApi('DELETE', '/tu-van');
}
