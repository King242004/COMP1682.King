import { layTatCaMonTraCuu, layTatCaThucPham, layThanhPhanSuat } from './TraMonQueries.ts';
import type { MonTraCuu, ThanhPhanSuat, ThucPham } from './TraMonQueries.ts';

// Lấy cả bảng món Viện Dinh dưỡng đã cân (414 món, khoảng 100 KB); app tự lọc khi người dùng gõ
export async function xemTatCaMon(): Promise<MonTraCuu[]> {
  return layTatCaMonTraCuu();
}

// Lấy cả kho thực phẩm Viện Dinh dưỡng 2025 (793 thực phẩm); app tự lọc khi người dùng gõ
export async function xemTatCaThucPham(): Promise<ThucPham[]> {
  return layTatCaThucPham();
}

// Lấy bảng "Trong 1 suất có" của một món
export async function xemThanhPhanSuat(maSo: string): Promise<ThanhPhanSuat[]> {
  return layThanhPhanSuat(maSo);
}
