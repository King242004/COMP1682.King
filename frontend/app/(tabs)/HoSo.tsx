import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { vietCanNang } from '../../src/don-vi/DoiDonVi';
import { useDonVi } from '../../src/don-vi/DonViContext';
import { layHoSo } from '../../src/ho-so/HoSoApi';
import type { HoSo } from '../../src/ho-so/HoSoApi';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

type TenBieuTuong = ComponentProps<typeof Ionicons>['name'];
type TenBieuTuongMaterial = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Chữ hiển thị cho các giá trị lưu trong database
const TEN_MUC_VAN_DONG = { nhe: 'Nhẹ', trung_binh: 'Trung bình', nang: 'Nặng' };
const TEN_MUC_TIEU = { giam: 'Giảm cân', giu: 'Giữ cân', tang: 'Tăng cân' };

export default function HoSo() {
  const { user, logout } = useAuth();
  const { donVi, heSo } = useDonVi();
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
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
      setHoSo(await layHoSo());
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
          {/* Mục tiêu calo, 3 ô BMI · BMR · TDEE, lối vào màn Tiến độ */}
          <Card>
            <Text style={styles.chuPhu}>Mục tiêu mỗi ngày</Text>
            <Text style={styles.soCalo}>
              {hoSo.muc_tieu_calo.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
            </Text>
            <Text style={styles.chuNho}>Ước tính từ giới tính, tuổi, chiều cao, cân nặng và mức vận động</Text>
            <View style={styles.duongKe} />
            <View style={styles.hangChiSo}>
              <OChiSo nhan="BMI" giaTri={hoSo.bmi?.toLocaleString('vi-VN') ?? ''} chuNho={hoSo.phan_loai_bmi ?? ''} />
              <OChiSo nhan="BMR" giaTri={`${hoSo.chuyen_hoa_co_ban?.toLocaleString('vi-VN')} kcal`} chuNho="Đốt khi nghỉ" />
              <OChiSo nhan="TDEE" giaTri={`${hoSo.nang_luong_giu_can?.toLocaleString('vi-VN')} kcal`} chuNho="Để giữ cân" />
            </View>
            <Pressable style={({ pressed }) => [styles.dongTienDo, pressed ? styles.dangBam : null]} onPress={() => router.push('/TienDo')}>
              <View style={[styles.oBieuTuong, styles.oBieuTuongTrang]}>
                <MaterialCommunityIcons name="scale-bathroom" size={18} color={colors.primary} />
              </View>
              <View style={styles.cotChu}>
                <Text style={styles.chuTienDo}>Tiến độ cân nặng</Text>
                <Text style={styles.chuPhu}>
                  Hiện tại: <Text style={styles.chuDam}>{hoSo.can_nang_kg === null ? '' : vietCanNang(hoSo.can_nang_kg, donVi, heSo)}</Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </Card>

          {/* Mục tiêu: mức vận động và giảm / giữ / tăng; "Sửa" chỉ sửa 2 thứ này */}
          <Card>
            <TieuDeThe bieuTuong="target" tieuDe="Mục tiêu" phanSua="muc-tieu" />
            <View style={styles.luoi}>
              <OThongTin nhan="Mức vận động" giaTri={hoSo.muc_van_dong ? TEN_MUC_VAN_DONG[hoSo.muc_van_dong] : ''} />
              <OThongTin nhan="Mục tiêu" giaTri={hoSo.muc_tieu ? TEN_MUC_TIEU[hoSo.muc_tieu] : ''} laMauXanh />
            </View>
          </Card>

          {/* Dị ứng (mỗi nhóm một nhãn vàng) và kiêng ăn khác; "Sửa" chỉ sửa phần này */}
          <Card>
            <TieuDeThe bieuTuong="food-off-outline" tieuDe="Dị ứng, kiêng ăn" phanSua="di-ung" />
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

      {/* Cài đặt tài khoản (đổi mật khẩu, xóa tài khoản) và đăng xuất */}
      <Card>
        <DongBam
          bieuTuong="settings-outline"
          mauBieuTuong={colors.primary}
          mauNenBieuTuong={colors.primaryLight}
          nhan="Cài đặt tài khoản"
          chuNho="Thông tin cá nhân, đổi mật khẩu, xóa tài khoản"
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

// Một ô trong hàng BMI · BMR · TDEE: tên chỉ số, số đậm, chữ nhỏ giải thích
function OChiSo({ nhan, giaTri, chuNho }: { nhan: string; giaTri: string; chuNho: string }) {
  return (
    <View style={styles.oChiSo}>
      <Text style={styles.nhanNhoGiua}>{nhan}</Text>
      <Text style={styles.giaTriChiSo}>{giaTri}</Text>
      <Text style={styles.nhanNhoGiua}>{chuNho}</Text>
    </View>
  );
}

// Tiêu đề trong thẻ: biểu tượng nhỏ màu xanh, chữ đậm, bên phải chữ "Sửa" mở màn sửa đúng phần của thẻ
function TieuDeThe({ bieuTuong, tieuDe, phanSua }: { bieuTuong: TenBieuTuongMaterial; tieuDe: string; phanSua: 'muc-tieu' | 'di-ung' }) {
  return (
    <View style={styles.hangTieuDe}>
      <MaterialCommunityIcons name={bieuTuong} size={18} color={colors.primary} />
      <Text style={styles.tieuDeThe}>{tieuDe}</Text>
      <Pressable style={({ pressed }) => [styles.nutSua, pressed ? styles.dangBam : null]} onPress={() => router.push(`/ho-so/SuaHoSo?phan=${phanSua}`)}>
        <Ionicons name="pencil-outline" size={15} color={colors.primary} />
        <Text style={styles.chuSua}>Sửa</Text>
      </Pressable>
    </View>
  );
}

// Một ô trong thẻ Mục tiêu: nhãn nhỏ xám, giá trị đậm, căn giữa ô (mục tiêu thì chữ xanh)
function OThongTin({ nhan, giaTri, laMauXanh }: { nhan: string; giaTri: string; laMauXanh?: boolean }) {
  return (
    <View style={styles.oThongTin}>
      <Text style={styles.nhanNhoGiua}>{nhan}</Text>
      <Text style={[styles.giaTriThongTin, laMauXanh ? styles.chuXanh : null]}>{giaTri}</Text>
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
    fontWeight: '700',
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
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  chuDam: {
    fontWeight: '700',
    color: colors.text,
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '700',
    color: colors.primary,
  },
  donVi: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  hangChiSo: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oChiSo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.medium,
  },
  nhanNhoGiua: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  giaTriChiSo: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.textOnPrimaryLight,
    textAlign: 'center',
    marginVertical: 2,
  },
  dongTienDo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    minHeight: 48,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.medium,
    marginTop: spacing.medium,
  },
  chuTienDo: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  oBieuTuong: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oBieuTuongTrang: {
    backgroundColor: colors.surface,
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  tieuDeThe: {
    flex: 1,
    fontSize: fontSizes.body,
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
  luoi: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  oThongTin: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 10,
  },
  giaTriThongTin: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  chuXanh: {
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
