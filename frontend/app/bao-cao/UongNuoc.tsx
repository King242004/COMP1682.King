import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { layBaoCaoUongNuoc } from '../../src/bao-cao/BaoCaoApi';
import type { BaoCaoUongNuoc } from '../../src/bao-cao/BaoCaoApi';
import { CotCacNgay } from '../../src/bao-cao/uong-nuoc/CotCacNgay';
import { LichThang } from '../../src/bao-cao/uong-nuoc/LichThang';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { formatShortDate, fromDateKey, monthDateKeys, shiftDateKey, todayKey, weekDateKeys } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../../src/shared/theme';

type NutXemTheoProps = {
  nhan: string;
  dangChon: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Một nút trong thanh "Tuần / Tháng": nút đang chọn nền trắng chữ đậm
function NutXemTheo({ nhan, dangChon, biKhoa, onPress }: NutXemTheoProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nutCheDo, dangChon ? styles.nutCheDoDangChon : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Text style={[styles.chuCheDo, dangChon ? styles.chuCheDoDangChon : null]}>{nhan}</Text>
    </Pressable>
  );
}

export default function UongNuoc() {
  const [xemTheo, setXemTheo] = useState<'tuan' | 'thang'>('tuan');
  const [ngayDangXem, setNgayDangXem] = useState(todayKey());
  const [baoCao, setBaoCao] = useState<BaoCaoUongNuoc | null>(null);
  const [loi, setLoi] = useState('');
  const [dangTai, setDangTai] = useState(false);

  // Các ngày đang xem: 7 ngày của tuần, hoặc mọi ngày của tháng, chứa ngày mốc
  const homNay = todayKey();
  let cacNgayHien = weekDateKeys(ngayDangXem);
  if (xemTheo === 'thang') {
    cacNgayHien = monthDateKeys(ngayDangXem);
  }
  const ngayDau = cacNgayHien[0];
  const ngayCuoi = cacNgayHien[cacNgayHien.length - 1];

  // Khoảng đang xem có hôm nay thì không tiến tiếp được
  const choTien = ngayCuoi < homNay;

  // Chữ giữa hàng ‹ ›: "27/10 – 2/11" hoặc "Tháng 10, 2026"
  let nhanKhoang = `${formatShortDate(ngayDau)} – ${formatShortDate(ngayCuoi)}`;
  if (xemTheo === 'thang') {
    const ngayDauThang = fromDateKey(ngayDau);
    nhanKhoang = `Tháng ${ngayDauThang.getMonth() + 1}, ${ngayDauThang.getFullYear()}`;
  }

  // Đổi Tuần / Tháng hoặc lùi / tiến thì tải lại báo cáo
  useEffect(() => {
    taiBaoCao();
  }, [xemTheo, ngayDangXem]);

  // Tải báo cáo của khoảng đang xem
  async function taiBaoCao() {
    setLoi('');
    setBaoCao(null);
    setDangTai(true);
    try {
      setBaoCao(await layBaoCaoUongNuoc(ngayDau, ngayCuoi));
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
    setDangTai(false);
  }

  return (
    <Screen compactBottom>
      <ScreenTitle title="Báo cáo uống nước" onBack={() => router.back()} />

      {/* Thanh 2 nút Tuần / Tháng; đang tải thì khóa */}
      <View style={styles.thanhCheDo}>
        <NutXemTheo nhan="Tuần" dangChon={xemTheo === 'tuan'} biKhoa={dangTai} onPress={() => setXemTheo('tuan')} />
        <NutXemTheo nhan="Tháng" dangChon={xemTheo === 'thang'} biKhoa={dangTai} onPress={() => setXemTheo('thang')} />
      </View>

      {/* Hàng ‹ khoảng ngày ›; › mờ khi đang xem khoảng có hôm nay */}
      <View style={styles.hangKhoang}>
        <Pressable
          style={({ pressed }) => [styles.nutMuiTen, pressed ? styles.dangBam : null]}
          disabled={dangTai}
          onPress={() => setNgayDangXem(shiftDateKey(ngayDau, -1))}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.giuaKhoang}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.chuKhoang}>{nhanKhoang}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.nutMuiTen, pressed ? styles.dangBam : null]}
          disabled={!choTien || dangTai}
          onPress={() => setNgayDangXem(shiftDateKey(ngayCuoi, 1))}
        >
          <Ionicons name="chevron-forward" size={24} color={choTien ? colors.primary : colors.border} />
        </Pressable>
      </View>

      {loi ? <ErrorBox message={loi} onRetry={taiBaoCao} /> : null}
      {dangTai ? <ActivityIndicator color={colors.primary} /> : null}

      {baoCao ? (
        <>
          {/* Hai ô số: ml trung bình và số ngày đạt mục tiêu; chưa ghi ngày nào thì "—" */}
          <View style={styles.hangOSo}>
            <View style={styles.oSo}>
              <View style={styles.hangNhanO}>
                <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.nhanO}>Trung bình</Text>
              </View>
              <Text style={styles.soTo}>
                {baoCao.tom_tat.ml_trung_binh === null ? '—' : baoCao.tom_tat.ml_trung_binh.toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.chuNho}>ml / ngày</Text>
            </View>
            <View style={styles.oSo}>
              <View style={styles.hangNhanO}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.nhanO}>Đạt mục tiêu</Text>
              </View>
              <Text style={styles.soTo}>
                {baoCao.tom_tat.so_ngay_co_ghi === 0 ? '—' : `${baoCao.tom_tat.so_ngay_dat}/${baoCao.tom_tat.so_ngay_co_ghi}`}
              </Text>
              <Text style={styles.chuNho}>ngày có ghi</Text>
            </View>
          </View>

          {/* Thẻ lượng nước: 7 cột (Tuần) hoặc lịch (Tháng) */}
          <Card>
            {xemTheo === 'tuan' ? (
              <CotCacNgay cacNgay={cacNgayHien} duLieuCacNgay={baoCao.cac_ngay} mucTieuMl={baoCao.muc_tieu_ml} />
            ) : (
              <LichThang cacNgay={cacNgayHien} duLieuCacNgay={baoCao.cac_ngay} mucTieuMl={baoCao.muc_tieu_ml} />
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  thanhCheDo: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.medium,
  },
  nutCheDo: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutCheDoDangChon: {
    backgroundColor: colors.surface,
  },
  chuCheDo: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuCheDoDangChon: {
    color: colors.text,
    fontWeight: '600',
  },
  hangKhoang: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  nutMuiTen: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giuaKhoang: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chuKhoang: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  hangOSo: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginBottom: spacing.medium,
  },
  // Ô số trắng bo tròn, cùng kiểu thẻ Card
  oSo: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.large,
    ...shadows.card,
  },
  hangNhanO: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nhanO: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  soTo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
