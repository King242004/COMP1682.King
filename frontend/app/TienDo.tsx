import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../src/shared/components/Button';
import { Card } from '../src/shared/components/Card';
import { ErrorBox } from '../src/shared/components/ErrorBox';
import { Screen } from '../src/shared/components/Screen';
import { ScreenTitle } from '../src/shared/components/ScreenTitle';
import { SectionTitle } from '../src/shared/components/SectionTitle';
import { TextField } from '../src/shared/components/TextField';
import { todayKey } from '../src/shared/dateKey';
import { colors, fontSizes, spacing } from '../src/shared/theme';
import { BieuDoCanNang } from '../src/tien-do/BieuDoCanNang';
import { TheBonTuan } from '../src/tien-do/TheBonTuan';
import { ghiCanNang, layTienDo } from '../src/tien-do/TienDoApi';
import type { TienDo } from '../src/tien-do/TienDoApi';

// Giới hạn cân nặng (giống backend) và số ngày của biểu đồ (giống backend)
const CAN_NANG_NHO_NHAT = 30;
const CAN_NANG_LON_NHAT = 300;
const SO_NGAY_BIEU_DO = 30;

export default function TienDo() {
  const [tienDo, setTienDo] = useState<TienDo | null>(null);
  const [loi, setLoi] = useState('');
  const [canNang, setCanNang] = useState('');
  const [loiCanNang, setLoiCanNang] = useState('');
  const [dangGhi, setDangGhi] = useState(false);

  // Mỗi lần mở tab thì tải lại, vì món ăn và hồ sơ có thể vừa đổi
  useFocusEffect(
    useCallback(() => {
      taiTienDo();
    }, []),
  );

  async function taiTienDo() {
    setLoi('');
    try {
      setTienDo(await layTienDo(todayKey()));
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Kiểm số cân rồi ghi cho hôm nay; server trả về tiến độ mới
  async function handleGhi() {
    const canNangSo = Number(canNang.replace(',', '.'));
    if (!(canNangSo >= CAN_NANG_NHO_NHAT && canNangSo <= CAN_NANG_LON_NHAT)) {
      setLoiCanNang(`Cân nặng từ ${CAN_NANG_NHO_NHAT} đến ${CAN_NANG_LON_NHAT} kg`);
      return;
    }
    setLoiCanNang('');
    setLoi('');
    setDangGhi(true);
    try {
      setTienDo(await ghiCanNang(todayKey(), canNangSo));
      setCanNang('');
    } catch (loiGhi) {
      setLoi((loiGhi as Error).message);
    }
    setDangGhi(false);
  }

  // Mở tab Coach với câu hỏi điền sẵn trong ô nhập
  function moHoiCoach() {
    router.push({ pathname: '/(tabs)/TuVan', params: { cauHoi: 'Nhận xét tiến độ 4 tuần qua của tôi' } });
  }

  return (
    <Screen>
      <ScreenTitle title="Tiến độ" onBack={() => router.back()} />

      {/* Ghi cân hôm nay */}
      <Card>
        <View style={styles.hangGhiCan}>
          <View style={styles.oCan}>
            <TextField
              label="Cân hôm nay (kg)"
              value={canNang}
              onChangeText={setCanNang}
              error={loiCanNang}
              placeholder={tienDo && tienDo.can_nang_xu_huong !== null ? String(tienDo.can_nang_xu_huong) : 'Ví dụ: 55'}
              isNumber
              isDisabled={dangGhi}
            />
          </View>
          <View style={styles.nutGhi}>
            <Button title="Ghi" loadingTitle="…" isLoading={dangGhi} onPress={handleGhi} />
          </View>
        </View>
      </Card>

      {loi ? <ErrorBox message={loi} onRetry={taiTienDo} /> : null}
      {!tienDo && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {tienDo ? (
        <>
          {/* Cân nặng theo đường xu hướng và biểu đồ 30 ngày */}
          <Card>
            <SectionTitle title="Cân nặng" />
            {tienDo.can_nang_xu_huong !== null ? (
              <Text style={styles.soCan}>
                {tienDo.can_nang_xu_huong.toLocaleString('vi-VN')} <Text style={styles.chuPhu}>kg (xu hướng 7 ngày)</Text>
              </Text>
            ) : null}
            <BieuDoCanNang diemCanNang={tienDo.can_nang} ngayCuoi={tienDo.ngay} soNgay={SO_NGAY_BIEU_DO} />
            {tienDo.can_nang.length > 0 ? (
              <Text style={styles.chuThich}>Chấm xám: cân từng ngày · Đường xanh: trung bình 7 ngày</Text>
            ) : null}
          </Card>

          {/* Thẻ 4 tuần qua */}
          <TheBonTuan tienDo={tienDo} onHoiCoach={moHoiCoach} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hangGhiCan: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
  },
  oCan: {
    flex: 1,
  },
  nutGhi: {
    width: 88,
    marginTop: spacing.xlarge,
  },
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
  },
});
