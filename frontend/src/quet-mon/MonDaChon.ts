// Món người dùng chọn từ ảnh, mã vạch hoặc tra món, đã nhân theo phần thực ăn, để điền vào form thêm món
export type MonDaChon = {
  ten_mon: string;
  khau_phan: string;
  so_calo: number;
  dam_g: number | null;
  tinh_bot_g: number | null;
  beo_g: number | null;
  muoi_g: number | null;
  duong_g: number | null;
  beo_no_g: number | null;
  nguon_so_lieu: 'ai' | 'ma_vach' | 'vien_dinh_duong';
};
