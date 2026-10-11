import { callApi } from '../shared/apiClient';

// Một món Viện Dinh dưỡng đã cân; số liệu là của 1 suất
export type MonTraCuu = {
  ma_so: string;
  ten_mon: string;
  ten_khong_dau: string;
  so_calo: number;
  dam_g: number;
  tinh_bot_g: number;
  beo_g: number;
  muoi_g: number;
  anh_url: string;
};

// Lấy tất cả món Viện Dinh dưỡng đã cân
export async function layTatCaMon(): Promise<MonTraCuu[]> {
  const ketQua = await callApi('GET', '/tra-mon');
  return ketQua as MonTraCuu[];
}
