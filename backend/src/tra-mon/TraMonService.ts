import { HttpError } from '../shared/errorHandler.ts';
import { timMonTraCuu } from './TraMonQueries.ts';
import type { MonTraCuu } from './TraMonQueries.ts';

// Từ khóa từ 2 đến 50 ký tự; trả tối đa 20 món. Là lựa chọn giao diện, không phải luật dinh dưỡng
const TU_KHOA_NGAN_NHAT = 2;
const TU_KHOA_DAI_NHAT = 50;
const SO_MON_TOI_DA = 20;

// Tìm món trong bảng món Viện Dinh dưỡng đã cân theo từ khóa người dùng gõ
export async function timMon(tuKhoa: unknown): Promise<MonTraCuu[]> {
  if (typeof tuKhoa !== 'string' || tuKhoa.trim().length < TU_KHOA_NGAN_NHAT || tuKhoa.trim().length > TU_KHOA_DAI_NHAT) {
    throw new HttpError(400, `Hãy gõ từ ${TU_KHOA_NGAN_NHAT} đến ${TU_KHOA_DAI_NHAT} ký tự`);
  }

  // Dấu % hai bên nghĩa là "tên có chứa từ khóa ở bất kỳ đâu"
  const mauTim = `%${tuKhoa.trim()}%`;
  return timMonTraCuu(mauTim, SO_MON_TOI_DA);
}
