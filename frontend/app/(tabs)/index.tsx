import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layNhatKyNgay } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import { TheBuaAn } from '../../src/bua-an/components/TheBuaAn';
import { TEN_BUA, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { formatDateLabel, shiftDateKey, todayKey } from '../../src/shared/dateKey';
import { colors } from '../../src/shared/theme';

export default function TrangChu() {
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

  // Không cho xem ngày tương lai
  const laHomNay = ngay === todayKey();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Chọn ngày */}
        <View style={styles.hangNgay}>
          <Pressable style={styles.nutNgay} onPress={() => setNgay(shiftDateKey(ngay, -1))}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.chuNgay}>{formatDateLabel(ngay)}</Text>
          <Pressable style={styles.nutNgay} disabled={laHomNay} onPress={() => setNgay(shiftDateKey(ngay, 1))}>
            <Ionicons name="chevron-forward" size={22} color={laHomNay ? colors.border : colors.primary} />
          </Pressable>
        </View>

        {loi ? <ErrorBox message={loi} onRetry={taiNhatKy} /> : null}
        {!nhatKy && !loi ? <ActivityIndicator color={colors.primary} /> : null}

        {nhatKy ? (
          <>
            {/* Thẻ tổng hợp calo */}
            <TheTongHop nhatKy={nhatKy} />

            {/* Bốn bữa, luôn hiện; bữa chưa có món thì để "—" */}
            {THU_TU_BUA.map((loaiBua) => {
              const danhSachMon = nhatKy.bua_an.filter((buaAn) => buaAn.loai_bua === loaiBua);
              let tongCaloBua = 0;
              for (const buaAn of danhSachMon) {
                tongCaloBua = tongCaloBua + buaAn.so_calo;
              }
              return (
                <View key={loaiBua} style={styles.khoiBua}>
                  <View style={styles.dauBua}>
                    <Text style={styles.tenBua}>
                      {TEN_BUA[loaiBua]} · {danhSachMon.length > 0 ? tongCaloBua.toLocaleString('vi-VN') : '—'}
                    </Text>
                    <Pressable style={styles.nutThem} onPress={() => moThemMon(loaiBua)}>
                      <Ionicons name="add" size={20} color={colors.primary} />
                    </Pressable>
                  </View>
                  {danhSachMon.map((buaAn) => (
                    <TheBuaAn key={buaAn.id} buaAn={buaAn} onPress={() => moSuaMon(buaAn.id)} />
                  ))}
                </View>
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// Thẻ trên đầu: còn lại (hoặc đã vượt), thanh tiến độ, đã ăn / mục tiêu, gam ba chất
function TheTongHop({ nhatKy }: { nhatKy: NhatKyNgay }) {
  const tongHop = nhatKy.tong_hop;
  const mucTieu = nhatKy.muc_tieu_calo ?? 0;

  // Thanh tiến độ không vượt quá 100%
  let phanTramDaAn = 0;
  if (mucTieu > 0) {
    phanTramDaAn = Math.min(100, (tongHop.tong_calo / mucTieu) * 100);
  }

  const daVuot = tongHop.con_lai !== null && tongHop.con_lai < 0;

  return (
    <View style={styles.theTongHop}>
      <View style={styles.hangConLai}>
        <Text style={styles.nhanConLai}>{daVuot ? 'Đã vượt' : 'Còn lại'}</Text>
        <Text style={[styles.soConLai, daVuot ? styles.soVuot : null]}>
          {Math.abs(tongHop.con_lai ?? 0).toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
        </Text>
      </View>
      <View style={styles.thanhNen}>
        <View style={[styles.thanhDaAn, { width: `${phanTramDaAn}%` }, daVuot ? styles.thanhVuot : null]} />
      </View>
      <Text style={styles.chuPhu}>
        Đã ăn {tongHop.tong_calo.toLocaleString('vi-VN')} / {mucTieu.toLocaleString('vi-VN')} kcal
      </Text>
      <View style={styles.hangChat}>
        <Text style={styles.chuChat}>
          <Text style={{ color: colors.protein }}>● </Text>Đạm {tongHop.tong_dam_g.toLocaleString('vi-VN')}g
        </Text>
        <Text style={styles.chuChat}>
          <Text style={{ color: colors.carbs }}>● </Text>Tinh bột {tongHop.tong_tinh_bot_g.toLocaleString('vi-VN')}g
        </Text>
        <Text style={styles.chuChat}>
          <Text style={{ color: colors.fat }}>● </Text>Béo {tongHop.tong_beo_g.toLocaleString('vi-VN')}g
        </Text>
      </View>
      {tongHop.so_mon_thieu_chat > 0 ? (
        <Text style={styles.chuNho}>{tongHop.so_mon_thieu_chat} món chưa có đạm, tinh bột, béo</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hangNgay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutNgay: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuNgay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  theTongHop: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  hangConLai: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  nhanConLai: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  soConLai: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.primary,
  },
  soVuot: {
    color: colors.error,
  },
  donVi: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  thanhNen: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  thanhDaAn: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  thanhVuot: {
    backgroundColor: colors.error,
  },
  chuPhu: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  hangChat: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chuChat: {
    fontSize: 14,
    color: colors.text,
  },
  chuNho: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  khoiBua: {
    marginBottom: 12,
  },
  dauBua: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tenBua: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nutThem: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
