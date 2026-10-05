import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { layNhatKyNgay } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import { DaiNgay } from '../../src/trang-chu/DaiNgay';
import { NhomNenHanChe } from '../../src/trang-chu/NhomNenHanChe';
import { TheBua } from '../../src/trang-chu/TheBua';
import { TheCalo } from '../../src/trang-chu/TheCalo';
import { buaTheoGio, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { formatDateLabel, todayKey } from '../../src/shared/dateKey';
import { colors } from '../../src/shared/theme';

export default function TrangChu() {
  const { user } = useAuth();

  // Ngày đang xem, mặc định là hôm nay
  const [ngay, setNgay] = useState(todayKey());
  const [nhatKy, setNhatKy] = useState<NhatKyNgay | null>(null);
  const [loi, setLoi] = useState('');

  // Mỗi lần mở tab, đổi ngày, hoặc quay lại từ màn thêm / sửa món thì tải lại nhật ký
  useFocusEffect(
    useCallback(() => {
      taiNhatKy();
    }, [ngay]),
  );

  async function taiNhatKy() {
    setLoi('');
    try {
      setNhatKy(await layNhatKyNgay(ngay));
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
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
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Lời chào, ngày đang xem, chữ cái đầu tên (bấm để mở hồ sơ) */}
        <View style={styles.hangChao}>
          <View>
            <Text style={styles.chuChao}>Chào {user.ten_hien_thi}</Text>
            <Text style={styles.tieuDe}>{formatDateLabel(ngay)}</Text>
          </View>
          <Pressable style={styles.vongTen} onPress={() => router.push('/(tabs)/ho-so')}>
            <Text style={styles.chuVongTen}>{user.ten_hien_thi.trim().charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

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
            <Text style={styles.tieuDeNhom}>Bữa ăn</Text>
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
      </ScrollView>

      {/* Nút + nổi: thêm món vào bữa đoán theo giờ hiện tại */}
      <Pressable style={styles.nutNoi} onPress={() => moThemMon(buaTheoGio(new Date().getHours()))}>
        <Ionicons name="add" size={30} color={colors.textOnPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  hangChao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chuChao: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tieuDe: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  vongTen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuVongTen: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuNho: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tieuDeNhom: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  nutNoi: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
