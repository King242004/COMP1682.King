import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { layHoSo } from '../../src/ho-so/HoSoApi';
import type { HoSo } from '../../src/ho-so/HoSoApi';
import { TheMucTieu } from '../../src/ho-so/TheMucTieu';
import { layLoTrinh } from '../../src/lo-trinh/LoTrinhApi';
import type { LoTrinh } from '../../src/lo-trinh/LoTrinhApi';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

type TenBieuTuong = ComponentProps<typeof Ionicons>['name'];
type TenBieuTuongMaterial = ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function HoSo() {
  const { user, logout } = useAuth();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [loTrinh, setLoTrinh] = useState<LoTrinh | null>(null);
  const [loi, setLoi] = useState('');

  // Mỗi lần quay lại màn này (ví dụ sau khi sửa hồ sơ) thì tải lại
  useFocusEffect(
    useCallback(() => {
      taiHoSo();
    }, []),
  );

  async function taiHoSo() {
    setLoi('');
    try {
      const hoSoMoi = await layHoSo();
      setHoSo(hoSoMoi);
      // Đã thiết lập hồ sơ thì tải thêm lộ trình cho thẻ "Mục tiêu"
      if (hoSoMoi.muc_tieu_calo !== null) {
        setLoTrinh(await layLoTrinh());
      }
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <Screen compactBottom>
      {/* Chữ cái đầu tên, tên và email (chỉ xem) */}
      <Card>
        <View style={styles.hangTen}>
          <View style={styles.oChuCai}>
            <Text style={styles.chuCai}>{user.ten_hien_thi.trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cotChu}>
            <Text style={styles.ten}>{user.ten_hien_thi}</Text>
            <Text style={styles.chuPhu}>{user.email}</Text>
          </View>
        </View>
      </Card>

      {loi ? <ErrorBox message={loi} onRetry={taiHoSo} /> : null}
      {!hoSo && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {hoSo && hoSo.muc_tieu_calo !== null ? (
        <View>
          {/* Mục tiêu: phần cân nặng và phần calo; bấm cả thẻ mở màn Lộ trình */}
          <TheMucTieu hoSo={hoSo} loTrinh={loTrinh} onPress={() => router.push('/LoTrinh')} />

          {/* Xem báo cáo: Dinh dưỡng mở Báo cáo dinh dưỡng, Cân nặng mở màn Tiến độ, Uống nước mở Báo cáo uống nước */}
          <Card>
            <View style={styles.hangTieuDeXemBaoCao}>
              <MaterialCommunityIcons name="chart-box-outline" size={18} color={colors.primary} />
              <Text style={styles.tieuDeThe}>Xem báo cáo</Text>
            </View>
            <View style={styles.hangNutBaoCao}>
              <NutBaoCao bieuTuong="food-apple-outline" nhan="Dinh dưỡng" onPress={() => router.push('/bao-cao/DinhDuong')} />
              <NutBaoCao bieuTuong="scale-bathroom" nhan="Cân nặng" onPress={() => router.push('/bao-cao/CanNang')} />
              <NutBaoCao bieuTuong="water-outline" nhan="Uống nước" onPress={() => router.push('/bao-cao/UongNuoc')} />
            </View>
          </Card>

          {/* Dị ứng (mỗi nhóm một nhãn vàng) và kiêng ăn khác; "Sửa" chỉ sửa phần này */}
          <Card>
            <TieuDeThe bieuTuong="food-off-outline" tieuDe="Dị ứng, kiêng ăn" />
            <Text style={styles.nhanNho}>Dị ứng</Text>
            {hoSo.nhom_di_ung_da_chon.length === 0 ? (
              <Text style={styles.chuThuong}>Không có</Text>
            ) : (
              <View style={styles.hangNhan}>
                {hoSo.nhom_di_ung_da_chon.map((nhom) => (
                  <View key={nhom.ma} style={styles.nhanDiUng}>
                    <Ionicons name="warning-outline" size={13} color={colors.warningText} />
                    <Text style={styles.chuNhanDiUng}>{nhom.ten}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.duongKe} />
            <Text style={styles.nhanNho}>Kiêng ăn khác</Text>
            <View style={styles.oKiengAn}>
              <Text style={styles.chuKiengAn}>{hoSo.di_ung_kieng_an === '' ? 'Không có' : hoSo.di_ung_kieng_an}</Text>
            </View>
          </Card>
        </View>
      ) : null}

      {/* Cài đặt tài khoản (thông tin cá nhân, đổi mật khẩu) và đăng xuất */}
      <Card>
        <DongBam
          bieuTuong="settings-outline"
          mauBieuTuong={colors.primary}
          mauNenBieuTuong={colors.primaryLight}
          nhan="Cài đặt tài khoản"
          chuNho="Thông tin cá nhân, đổi mật khẩu"
          coMuiTen
          onPress={() => router.push('/ho-so/TaiKhoan')}
        />
        <View style={styles.duongKe} />
        <DongBam
          bieuTuong="log-out-outline"
          mauBieuTuong={colors.textSecondary}
          mauNenBieuTuong={colors.background}
          nhan="Đăng xuất"
          chuNho=""
          coMuiTen={false}
          onPress={logout}
        />
      </Card>
    </Screen>
  );
}

// Một nút trong thẻ "Xem báo cáo": biểu tượng trong vòng tròn xanh nhạt, chữ nhỏ ở dưới; 3 nút chia đều chiều ngang thẻ
function NutBaoCao({ bieuTuong, nhan, onPress }: { bieuTuong: TenBieuTuongMaterial; nhan: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.nutBaoCao, pressed ? styles.dangBam : null]} onPress={onPress}>
      <View style={styles.vongBieuTuong}>
        <MaterialCommunityIcons name={bieuTuong} size={24} color={colors.primary} />
      </View>
      <Text style={styles.chuNutBaoCao}>{nhan}</Text>
    </Pressable>
  );
}

// Tiêu đề thẻ Dị ứng: biểu tượng nhỏ màu xanh, chữ đậm, bên phải chữ "Sửa" mở màn sửa dị ứng
function TieuDeThe({ bieuTuong, tieuDe }: { bieuTuong: TenBieuTuongMaterial; tieuDe: string }) {
  return (
    <View style={styles.hangTieuDe}>
      <MaterialCommunityIcons name={bieuTuong} size={18} color={colors.primary} />
      <Text style={styles.tieuDeThe}>{tieuDe}</Text>
      <Pressable style={({ pressed }) => [styles.nutSua, pressed ? styles.dangBam : null]} onPress={() => router.push('/ho-so/TaoSuaHoSo?phan=di-ung')}>
        <Ionicons name="pencil-outline" size={15} color={colors.primary} />
        <Text style={styles.chuSua}>Sửa</Text>
      </Pressable>
    </View>
  );
}

type DongBamProps = {
  bieuTuong: TenBieuTuong;
  mauBieuTuong: string;
  mauNenBieuTuong: string;
  nhan: string;
  chuNho: string;
  coMuiTen: boolean;
  onPress: () => void;
};

// Một dòng bấm được: biểu tượng trong ô vuông nhỏ, chữ (và dòng nhỏ nếu có), dấu › khi mở màn khác
function DongBam({ bieuTuong, mauBieuTuong, mauNenBieuTuong, nhan, chuNho, coMuiTen, onPress }: DongBamProps) {
  return (
    <Pressable style={({ pressed }) => [styles.dongBam, pressed ? styles.dangBam : null]} onPress={onPress}>
      <View style={[styles.oBieuTuong, { backgroundColor: mauNenBieuTuong }]}>
        <Ionicons name={bieuTuong} size={18} color={mauBieuTuong} />
      </View>
      <View style={styles.cotChu}>
        <Text style={styles.chuDongBam}>{nhan}</Text>
        {chuNho !== '' ? <Text style={styles.chuPhu}>{chuNho}</Text> : null}
      </View>
      {coMuiTen ? <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  oChuCai: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuCai: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  cotChu: {
    flex: 1,
  },
  ten: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  hangTieuDeXemBaoCao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  hangNutBaoCao: {
    flexDirection: 'row',
  },
  nutBaoCao: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  vongBieuTuong: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuNutBaoCao: {
    fontSize: fontSizes.label,
    color: colors.text,
    textAlign: 'center',
  },
  oBieuTuong: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  tieuDeThe: {
    flex: 1,
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  nutSua: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  chuSua: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
  nhanNho: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  chuThuong: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  hangNhan: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  nhanDiUng: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBackground,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.medium,
  },
  chuNhanDiUng: {
    fontSize: fontSizes.secondary,
    color: colors.warningText,
  },
  duongKe: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.medium,
  },
  oKiengAn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 10,
  },
  chuKiengAn: {
    fontSize: fontSizes.secondary,
    lineHeight: 20,
    color: colors.text,
  },
  dongBam: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    minHeight: 44,
  },
  chuDongBam: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
