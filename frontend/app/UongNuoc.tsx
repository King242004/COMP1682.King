import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ErrorBox } from '../src/shared/components/ErrorBox';
import { Screen } from '../src/shared/components/Screen';
import { ScreenTitle } from '../src/shared/components/ScreenTitle';
import { todayKey } from '../src/shared/dateKey';
import { colors } from '../src/shared/theme';
import { CaiDat } from '../src/uong-nuoc/CaiDat';
import { HomNay } from '../src/uong-nuoc/HomNay';
import { henLaiNhacUongNuoc, xinQuyenThongBao } from '../src/uong-nuoc/NhacUongNuoc';
import { botNuoc, layUongNuocNgay, luuCaiDatNuoc, themNuoc } from '../src/uong-nuoc/UongNuocApi';
import type { CaiDatNuoc, UongNuocNgay } from '../src/uong-nuoc/UongNuocApi';

export default function UongNuoc() {
  const [uongNuoc, setUongNuoc] = useState<UongNuocNgay | null>(null);
  const [loi, setLoi] = useState('');
  const [dangGhi, setDangGhi] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loiQuyen, setLoiQuyen] = useState('');

  // Mở màn thì tải lượng nước hôm nay
  useEffect(() => {
    taiUongNuoc();
  }, []);

  async function taiUongNuoc() {
    setLoi('');
    try {
      setUongNuoc(await layUongNuocNgay(todayKey()));
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Bấm "+": lấy ngày lúc bấm, để qua nửa đêm vẫn ghi đúng ngày; đang ghi thì khóa nút
  async function handleThem() {
    setLoi('');
    setDangGhi(true);
    try {
      setUongNuoc(await themNuoc(todayKey()));
    } catch (loiGhi) {
      setLoi((loiGhi as Error).message);
    }
    setDangGhi(false);
  }

  // Bấm "−": giống "+" nhưng trừ bớt
  async function handleBot() {
    setLoi('');
    setDangGhi(true);
    try {
      setUongNuoc(await botNuoc(todayKey()));
    } catch (loiGhi) {
      setLoi((loiGhi as Error).message);
    }
    setDangGhi(false);
  }

  // Lưu cài đặt; bật nhắc từ đang tắt thì xin quyền trước, iPhone không cho thì không bật; lưu xong thì hẹn lại lời nhắc
  async function luuCaiDat(caiDatMoi: CaiDatNuoc) {
    setLoiQuyen('');
    if (caiDatMoi.nhac_uong_nuoc && uongNuoc !== null && !uongNuoc.nhac_uong_nuoc) {
      const duocPhep = await xinQuyenThongBao();
      if (!duocPhep) {
        setLoiQuyen('Hãy cho phép MealMate gửi thông báo trong Cài đặt của iPhone');
        return;
      }
    }

    setLoi('');
    setDangLuu(true);
    try {
      const ketQua = await luuCaiDatNuoc(todayKey(), caiDatMoi);
      setUongNuoc(ketQua);
      await henLaiNhacUongNuoc(ketQua.nhac_uong_nuoc, ketQua.gio_nhac);
    } catch (loiLuu) {
      setLoi((loiLuu as Error).message);
    }
    setDangLuu(false);
  }

  return (
    <Screen compactBottom>
      <ScreenTitle title="Uống nước" onBack={() => router.back()} />

      {loi ? <ErrorBox message={loi} onRetry={taiUongNuoc} /> : null}
      {!uongNuoc && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {uongNuoc ? (
        <>
          {/* Thẻ "Hôm nay": bình nước và nút − / + */}
          <HomNay uongNuoc={uongNuoc} dangGhi={dangGhi} onThem={handleThem} onBot={handleBot} />

          {/* Thẻ "Cài đặt": mỗi lần ghi, mục tiêu, nhắc giờ */}
          <CaiDat uongNuoc={uongNuoc} dangLuu={dangLuu} loiQuyen={loiQuyen} onLuu={luuCaiDat} />
        </>
      ) : null}
    </Screen>
  );
}
