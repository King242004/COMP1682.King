export type CongViec = 'ngoi_nhieu' | 'di_lai_nhieu' | 'lao_dong_nang';
export type CamNhanKhiTap = 'nhe' | 'vua' | 'nang';
export type MucVanDong = 'nhe' | 'trung_binh' | 'nang';

// Bốn câu trả lời về vận động trong hồ sơ
export type CauTraLoiVanDong = {
  congViec: CongViec;
  soBuoiTap: number;
  soPhutMoiBuoi: number | null;
  camNhanKhiTap: CamNhanKhiTap | null;
};

// Hai con số lấy từ bảng quy_dinh (WHO 2020)
export type QuyDinhVanDong = {
  phutKhuyenNghi: number;
  heSoPhutMucNang: number;
};

// Đổi số phút tập trong tuần ra số phút tương đương mức vừa: mức nặng nhân lên, mức nhẹ không tính
export function tinhPhutTuongDuongMucVua(cauTraLoi: CauTraLoiVanDong, quyDinh: QuyDinhVanDong): number {
  if (cauTraLoi.soBuoiTap === 0 || cauTraLoi.soPhutMoiBuoi === null || cauTraLoi.camNhanKhiTap === null) {
    return 0;
  }
  const tongPhut = cauTraLoi.soBuoiTap * cauTraLoi.soPhutMoiBuoi;
  if (cauTraLoi.camNhanKhiTap === 'nang') {
    return tongPhut * quyDinh.heSoPhutMucNang;
  }
  if (cauTraLoi.camNhanKhiTap === 'vua') {
    return tongPhut;
  }
  return 0;
}

// Mức nền theo công việc; tập đủ số phút WHO khuyến nghị thì lên một bậc (đã nặng thì giữ nguyên)
export function xacDinhMucVanDong(cauTraLoi: CauTraLoiVanDong, quyDinh: QuyDinhVanDong): MucVanDong {
  const tapDuKhuyenNghi = tinhPhutTuongDuongMucVua(cauTraLoi, quyDinh) >= quyDinh.phutKhuyenNghi;

  if (cauTraLoi.congViec === 'ngoi_nhieu') {
    if (tapDuKhuyenNghi) {
      return 'trung_binh';
    }
    return 'nhe';
  }
  if (cauTraLoi.congViec === 'di_lai_nhieu') {
    if (tapDuKhuyenNghi) {
      return 'nang';
    }
    return 'trung_binh';
  }
  return 'nang';
}
