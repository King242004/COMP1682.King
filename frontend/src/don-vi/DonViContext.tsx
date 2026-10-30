import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '../auth/AuthContext';
import type { DonVi, HeSoDonVi } from './DoiDonVi';
import { layDonVi, luuDonVi } from './DonViApi';

// Những gì mọi màn lấy được từ useDonVi()
type TrangThaiDonVi = {
  donVi: DonVi;
  heSo: HeSoDonVi | null;
  doiDonVi: (donViMoi: DonVi) => Promise<void>;
};

const DonViContext = createContext<TrangThaiDonVi | null>(null);

// Giữ đơn vị người dùng chọn cho cả app; chưa tải xong hoặc tải lỗi thì coi là Mét
export function DonViProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [donVi, setDonVi] = useState<DonVi>('met');
  const [heSo, setHeSo] = useState<HeSoDonVi | null>(null);

  // Đăng nhập thì tải đơn vị một lần; đăng xuất thì về Mét
  useEffect(() => {
    if (user) {
      taiDonVi();
    } else {
      setDonVi('met');
      setHeSo(null);
    }
  }, [user?.id]);

  async function taiDonVi() {
    try {
      const ketQua = await layDonVi();
      setDonVi(ketQua.don_vi);
      setHeSo(ketQua.he_so);
    } catch {
      // Tải lỗi thì giữ Mét, app vẫn dùng được
    }
  }

  // Đổi đơn vị: lưu lên server rồi nhớ kết quả server gửi về
  async function doiDonVi(donViMoi: DonVi) {
    const ketQua = await luuDonVi(donViMoi);
    setDonVi(ketQua.don_vi);
    setHeSo(ketQua.he_so);
  }

  return <DonViContext.Provider value={{ donVi, heSo, doiDonVi }}>{children}</DonViContext.Provider>;
}

// Lấy đơn vị đang chọn ở bất kỳ màn nào
export function useDonVi(): TrangThaiDonVi {
  const trangThai = useContext(DonViContext);
  if (!trangThai) {
    throw new Error('useDonVi phải nằm bên trong DonViProvider');
  }
  return trangThai;
}
