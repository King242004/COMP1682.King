import { layNhomDiUngCuaNguoiDung, layTuKhoaDiUng } from '../di-ung/DiUngQueries.ts';
import { timNhomDiUng } from '../di-ung/DiUngService.ts';
import { layTatCaMonTraCuu, layTatCaThucPham, layTenThanhPhanCuaTungMon, layThanhPhanSuat } from './TraMonQueries.ts';
import type { MonTraCuu, ThanhPhanSuat, ThucPham } from './TraMonQueries.ts';

// Món, thực phẩm, dòng thành phần gửi về app kèm tên các nhóm dị ứng bị trùng (chỉ nhóm người dùng đã chọn)
type MonCoDiUng = MonTraCuu & { nhom_di_ung: string[] };
type ThucPhamCoDiUng = ThucPham & { nhom_di_ung: string[] };
type ThanhPhanCoDiUng = ThanhPhanSuat & { nhom_di_ung: string[] };

// Bảng "Trong 1 suất có" kèm việc người dùng có chọn nhóm dị ứng nào không (để app hiện câu nói rõ giới hạn)
type BangThanhPhan = {
  thanh_phan: ThanhPhanCoDiUng[];
  co_chon_nhom_di_ung: boolean;
};

// Lấy cả bảng món Viện Dinh dưỡng đã cân (414 món, khoảng 100 KB); app tự lọc khi người dùng gõ; mỗi món dò dị ứng theo tên món và từng dòng thành phần
export async function xemTatCaMon(nguoiDungId: number): Promise<MonCoDiUng[]> {
  const nhomDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  const danhSachTuKhoa = await layTuKhoaDiUng();
  const tenThanhPhanCuaTungMon = await layTenThanhPhanCuaTungMon();
  const danhSachMon = await layTatCaMonTraCuu();
  return danhSachMon.map((mon) => ({
    ...mon,
    nhom_di_ung: timNhomDiUng([mon.ten_mon, ...(tenThanhPhanCuaTungMon.get(mon.ma_so) ?? [])], danhSachTuKhoa, nhomDaChon),
  }));
}

// Lấy cả kho thực phẩm Viện Dinh dưỡng 2025 (793 thực phẩm); app tự lọc khi người dùng gõ; mỗi thực phẩm dò dị ứng theo tên
export async function xemTatCaThucPham(nguoiDungId: number): Promise<ThucPhamCoDiUng[]> {
  const nhomDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  const danhSachTuKhoa = await layTuKhoaDiUng();
  const danhSachThucPham = await layTatCaThucPham();
  return danhSachThucPham.map((thucPham) => ({
    ...thucPham,
    nhom_di_ung: timNhomDiUng([thucPham.ten_thuc_pham], danhSachTuKhoa, nhomDaChon),
  }));
}

// Lấy bảng "Trong 1 suất có" của một món; mỗi dòng dò dị ứng riêng để app tô đúng dòng bị trùng
export async function xemThanhPhanSuat(maSo: string, nguoiDungId: number): Promise<BangThanhPhan> {
  const nhomDaChon = await layNhomDiUngCuaNguoiDung(nguoiDungId);
  const danhSachTuKhoa = await layTuKhoaDiUng();
  const danhSachThanhPhan = await layThanhPhanSuat(maSo);
  return {
    thanh_phan: danhSachThanhPhan.map((thanhPhan) => ({
      ...thanhPhan,
      nhom_di_ung: timNhomDiUng([thanhPhan.ten_thanh_phan], danhSachTuKhoa, nhomDaChon),
    })),
    co_chon_nhom_di_ung: nhomDaChon.length > 0,
  };
}
