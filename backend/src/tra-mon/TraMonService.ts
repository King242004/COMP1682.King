import { layTatCaMonTraCuu } from './TraMonQueries.ts';
import type { MonTraCuu } from './TraMonQueries.ts';

// Lấy cả bảng món Viện Dinh dưỡng đã cân (414 món, khoảng 100 KB); app tự lọc khi người dùng gõ
export async function xemTatCaMon(): Promise<MonTraCuu[]> {
  return layTatCaMonTraCuu();
}
