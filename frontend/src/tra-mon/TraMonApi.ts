import { callApi } from '../shared/apiClient';

// Một món Viện Dinh dưỡng đã cân; số liệu là của 1 suất
export type MonTraCuu = {
  ma_so: string;
  ten_mon: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number;
  anh_url: string;
};

// Tìm món theo từ khóa, có dấu hay không dấu đều được, ví dụ "pho bo"
export async function timMon(tuKhoa: string): Promise<MonTraCuu[]> {
  const ketQua = await callApi('GET', `/tra-mon?tu-khoa=${encodeURIComponent(tuKhoa)}`);
  return ketQua as MonTraCuu[];
}
