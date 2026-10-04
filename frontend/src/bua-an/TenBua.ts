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
