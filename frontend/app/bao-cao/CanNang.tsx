import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { BieuDoCanNang } from '../../src/bao-cao/can-nang/BieuDoCanNang';
import { KetQuaBonTuan } from '../../src/bao-cao/can-nang/KetQuaBonTuan';
import { layBaoCaoCanNang } from '../../src/can-nang/CanNangApi';
import type { BaoCaoCanNang } from '../../src/can-nang/CanNangApi';
import { doiKgRaDonVi } from '../../src/don-vi/DoiDonVi';
import { useDonVi } from '../../src/don-vi/DonViContext';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { SectionTitle } from '../../src/shared/components/SectionTitle';
import { todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, spacing } from '../../src/shared/theme';

// Số ngày của biểu đồ (giống backend)
const SO_NGAY_BIEU_DO = 30;

export default function CanNang() {
  const [baoCaoCanNang, setBaoCaoCanNang] = useState<BaoCaoCanNang | null>(null);
  const [loi, setLoi] = useState('');
  const { donVi, heSo } = useDonVi();
  // Số xu hướng theo đơn vị người dùng chọn
  const tenDonViCan = donVi === 'anh_my' && heSo !== null ? 'lb' : 'kg';

  // Mỗi lần mở màn thì tải lại, vì món ăn, hồ sơ và cân có thể vừa đổi
  useFocusEffect(
    useCallback(() => {
      taiBaoCaoCanNang();
    }, []),
  );

  async function taiBaoCaoCanNang() {
    setLoi('');
    try {
      setBaoCaoCanNang(await layBaoCaoCanNang(todayKey()));
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Mở tab Coach với câu hỏi điền sẵn trong ô nhập
  function moHoiCoach() {
    router.push({ pathname: '/(tabs)/TuVan', params: { cauHoi: 'Nhận xét tiến độ 4 tuần qua của tôi' } });
  }

  return (
    <Screen>
      <ScreenTitle title="Báo cáo cân nặng" onBack={() => router.back()} />

      {loi ? <ErrorBox message={loi} onRetry={taiBaoCaoCanNang} /> : null}
      {!baoCaoCanNang && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {baoCaoCanNang ? (
        <>
          {/* Cân nặng theo đường xu hướng và biểu đồ 30 ngày */}
          <Card>
            <SectionTitle title="Cân nặng" />
            {baoCaoCanNang.can_nang_xu_huong !== null ? (
              <Text style={styles.soCan}>
                {(Math.round(doiKgRaDonVi(baoCaoCanNang.can_nang_xu_huong, donVi, heSo) * 10) / 10).toLocaleString('vi-VN')}{' '}
                <Text style={styles.chuPhu}>{tenDonViCan} (xu hướng 7 ngày)</Text>
              </Text>
            ) : null}
            <BieuDoCanNang diemCanNang={baoCaoCanNang.can_nang} ngayCuoi={baoCaoCanNang.ngay} soNgay={SO_NGAY_BIEU_DO} />
            {baoCaoCanNang.can_nang.length > 0 ? (
              <Text style={styles.chuThich}>
                <Text style={styles.chuChamXam}>Chấm xám</Text>: cân từng ngày · <Text style={styles.chuDuongXanh}>Đường xanh</Text>: trung bình 7 ngày
              </Text>
            ) : null}
          </Card>

          {/* Thẻ Kết quả 4 tuần */}
          <KetQuaBonTuan baoCaoCanNang={baoCaoCanNang} onHoiCoach={moHoiCoach} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  soCan: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  chuThich: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  chuChamXam: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chuDuongXanh: {
    fontWeight: '600',
    color: colors.primary,
  },
});
