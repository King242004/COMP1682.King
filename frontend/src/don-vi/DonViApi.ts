import { callApi } from '../shared/apiClient';
import type { DonVi, HeSoDonVi } from './DoiDonVi';

// Đơn vị đang chọn kèm 4 số đổi, server gửi về
export type DonViDangChon = {
  don_vi: DonVi;
  he_so: HeSoDonVi;
};

// Lấy đơn vị đang chọn
export async function layDonVi(): Promise<DonViDangChon> {
  const ketQua = await callApi('GET', '/don-vi');
  return ketQua as DonViDangChon;
}

// Lưu đơn vị mới
export async function luuDonVi(donVi: DonVi): Promise<DonViDangChon> {
  const ketQua = await callApi('PUT', '/don-vi', { don_vi: donVi });
  return ketQua as DonViDangChon;
}
