// Món người dùng chọn từ ảnh, mã vạch hoặc kho Viện, đã nhân theo phần thực ăn, để điền vào form thêm món
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
  nguon_so_lieu: 'ai' | 'ma_vach' | 'vien_dinh_duong' | 'thuc_pham';
  // Câu cảnh báo dị ứng: món AI nhận, sản phẩm mã vạch do server viết; món Viện và thực phẩm ghép từ nhãn ⚠ lúc chọn; rỗng là không có
  canh_bao_di_ung: string;
};
