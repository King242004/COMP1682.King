import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { LoaiBua } from './BuaAnApi';

// Thứ tự 4 bữa trên trang chủ
export const THU_TU_BUA: LoaiBua[] = ['sang', 'trua', 'toi', 'phu'];

// Tên hiển thị của từng bữa
export const TEN_BUA: Record<LoaiBua, string> = {
  sang: 'Bữa sáng',
  trua: 'Bữa trưa',
  toi: 'Bữa tối',
  phu: 'Bữa phụ',
};

// Biểu tượng của từng bữa (bộ Ionicons)
export const BIEU_TUONG_BUA: Record<LoaiBua, ComponentProps<typeof Ionicons>['name']> = {
  sang: 'partly-sunny-outline',
  trua: 'sunny-outline',
  toi: 'moon-outline',
  phu: 'cafe-outline',
};

// Giờ đổi bữa cho nút + nổi ở trang chủ; là lựa chọn giao diện
const GIO_BAT_DAU_BUA_TRUA = 11;
const GIO_BAT_DAU_BUA_TOI = 16;

// Đoán bữa theo giờ trên máy: trước 11 giờ là sáng, trước 16 giờ là trưa, còn lại là tối
export function buaTheoGio(gio: number): LoaiBua {
  if (gio < GIO_BAT_DAU_BUA_TRUA) {
    return 'sang';
  }
  if (gio < GIO_BAT_DAU_BUA_TOI) {
    return 'trua';
  }
  return 'toi';
}
