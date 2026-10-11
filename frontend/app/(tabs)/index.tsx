import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { layNhatKyNgay } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import { DaiNgay } from '../../src/trang-chu/DaiNgay';
import { NhomNenHanChe } from '../../src/trang-chu/NhomNenHanChe';
import { TheBua } from '../../src/trang-chu/TheBua';
import { TheCalo } from '../../src/trang-chu/TheCalo';
import { buaTheoGio, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { SectionTitle } from '../../src/shared/components/SectionTitle';
import { formatDateLabel, todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

export default function TrangChu() {
  const { user } = useAuth();

  // Ngày đang xem, mặc định là hôm nay
  const [ngay, setNgay] = useState(todayKey());
  const [nhatKy, setNhatKy] = useState<NhatKyNgay | null>(null);
  const [loi, setLoi] = useState('');

  // Nhớ ngày đang xem mới nhất, để bỏ kết quả của ngày cũ về trễ khi đổi ngày nhanh
  const ngayDangXem = useRef(ngay);
  useEffect(() => {
    ngayDangXem.current = ngay;
  }, [ngay]);

  // Mỗi lần mở tab, đổi ngày, hoặc quay lại từ màn thêm / sửa món thì tải lại nhật ký
  useFocusEffect(
    useCallback(() => {
      taiNhatKy();
    }, [ngay]),
  );

  async function taiNhatKy() {
    setLoi('');
    try {
      const ketQua = await layNhatKyNgay(ngay);
      // Trong lúc chờ mà người dùng đã đổi sang ngày khác thì bỏ kết quả này, tránh hiện nhầm ngày
      if (ngay === ngayDangXem.current) {
        setNhatKy(ketQua);
      }
    } catch (loiTai) {
      if (ngay === ngayDangXem.current) {
        setLoi((loiTai as Error).message);
      }
    }
  }

  // Mở màn thêm món với bữa và ngày đã chọn sẵn
  function moThemMon(loaiBua: LoaiBua) {
    router.push({ pathname: '/bua-an/sua', params: { ngay: ngay, loaiBua: loaiBua } });
  }

  // Mở màn sửa một món
  function moSuaMon(buaAnId: number) {
    router.push({ pathname: '/bua-an/sua', params: { id: String(buaAnId) } });
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.khung}>
      <Screen>
        {/* Ngày đang xem, lời chào, chữ cái đầu tên (bấm để mở hồ sơ) */}
        <ScreenTitle
          title={formatDateLabel(ngay)}
          subtitle={`Chào ${user.ten_hien_thi}`}
          right={
            <Pressable style={({ pressed }) => [styles.vongTen, pressed ? styles.dangBam : null]} onPress={() => router.push('/(tabs)/ho-so')}>
              <Text style={styles.chuVongTen}>{user.ten_hien_thi.trim().charAt(0).toUpperCase()}</Text>
            </Pressable>
          }
        />

        <DaiNgay ngay={ngay} onChon={setNgay} />

        {loi ? <ErrorBox message={loi} onRetry={taiNhatKy} /> : null}
        {!nhatKy && !loi ? <ActivityIndicator color={colors.primary} /> : null}

        {nhatKy ? (
          <>
            <TheCalo nhatKy={nhatKy} />
            <NhomNenHanChe nhatKy={nhatKy} />
            {nhatKy.tong_hop.so_mon_thieu_so_lieu > 0 ? (
              <Text style={styles.chuNho}>
                {nhatKy.tong_hop.so_mon_thieu_so_lieu} món chưa đủ số liệu nên các số có thể thấp hơn thực tế
              </Text>
            ) : null}

            {/* Bốn bữa, luôn hiện */}
            <SectionTitle title="Bữa ăn" />
            {THU_TU_BUA.map((loaiBua) => (
              <TheBua
                key={loaiBua}
                loaiBua={loaiBua}
                danhSachMon={nhatKy.bua_an.filter((buaAn) => buaAn.loai_bua === loaiBua)}
                onThem={() => moThemMon(loaiBua)}
                onSuaMon={moSuaMon}
              />
            ))}
          </>
        ) : null}
      </Screen>

      {/* Nút + nổi: thêm món vào bữa đoán theo giờ hiện tại */}
      <Pressable
        style={({ pressed }) => [styles.nutNoi, pressed ? styles.dangBam : null]}
        onPress={() => moThemMon(buaTheoGio(new Date().getHours()))}
        accessibilityRole="button"
        accessibilityLabel="Thêm món"
      >
        <Ionicons name="add" size={30} color={colors.textOnPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
  },
  vongTen: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuVongTen: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  nutNoi: {
    position: 'absolute',
    right: spacing.large,
    bottom: spacing.large,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
