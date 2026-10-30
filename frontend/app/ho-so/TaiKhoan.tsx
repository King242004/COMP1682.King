import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { vietChieuCao } from '../../src/don-vi/DoiDonVi';
import type { DonVi } from '../../src/don-vi/DoiDonVi';
import { useDonVi } from '../../src/don-vi/DonViContext';
import { layHoSo } from '../../src/ho-so/HoSoApi';
import type { HoSo } from '../../src/ho-so/HoSoApi';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { formatFullDate } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

// Chữ hiển thị cho giới tính lưu trong database
const TEN_GIOI_TINH = { nam: 'Nam', nu: 'Nữ' };

export default function TaiKhoan() {
  const { user, deleteAccount } = useAuth();
  const { donVi, heSo, doiDonVi } = useDonVi();
  const [dangLuuDonVi, setDangLuuDonVi] = useState(false);
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [loi, setLoi] = useState('');

  // Mỗi lần quay lại màn này (ví dụ sau khi sửa thông tin cá nhân) thì tải lại hồ sơ
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

  // Hỏi lại trước khi xóa, vì không khôi phục được; xóa xong về màn bắt đầu, màn đó tự chuyển sang đăng nhập
  function xacNhanXoaTaiKhoan() {
    Alert.alert('Xóa tài khoản?', 'Toàn bộ dữ liệu của bạn sẽ bị xóa và không khôi phục được.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            router.replace('/');
          } catch (loiXoa) {
            setLoi((loiXoa as Error).message);
          }
        },
      },
    ]);
  }

  // Chọn đơn vị: bấm ô nào cũng lưu lên server (kể cả ô đang sáng, để sửa được khi app tải đơn vị bị lỗi); đang lưu thì khóa 2 ô
  async function chonDonVi(donViMoi: DonVi) {
    setLoi('');
    setDangLuuDonVi(true);
    try {
      await doiDonVi(donViMoi);
    } catch (loiLuu) {
      setLoi((loiLuu as Error).message);
    }
    setDangLuuDonVi(false);
  }

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <ScreenTitle title="Tài khoản" onBack={() => router.back()} />

      {loi ? <ErrorBox message={loi} /> : null}

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

      {/* Thông tin cá nhân: giới tính, ngày sinh, chiều cao; "Sửa" mở màn sửa (có cả ô tên) */}
      {hoSo && hoSo.muc_tieu_calo !== null ? (
        <Card>
          <View style={styles.hangTieuDe}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.tieuDeThe}>Thông tin cá nhân</Text>
            <Pressable
              style={({ pressed }) => [styles.nutSua, pressed ? styles.dangBam : null]}
              onPress={() => router.push('/ho-so/SuaHoSo?phan=ca-nhan')}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.primary} />
              <Text style={styles.chuSua}>Sửa</Text>
            </Pressable>
          </View>
          <View style={styles.hangO}>
            <OThongTin nhan="Giới tính" giaTri={hoSo.gioi_tinh ? TEN_GIOI_TINH[hoSo.gioi_tinh] : ''} />
            <OThongTin nhan="Ngày sinh" giaTri={hoSo.ngay_sinh === null ? '' : formatFullDate(hoSo.ngay_sinh)} />
            <OThongTin nhan="Chiều cao" giaTri={hoSo.chieu_cao_cm === null ? '' : vietChieuCao(hoSo.chieu_cao_cm, donVi, heSo)} />
          </View>
        </Card>
      ) : null}

      {/* Đơn vị: Mét hoặc Anh-Mỹ, bấm là lưu */}
      <Card>
        <View style={styles.hangTieuDe}>
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={styles.tieuDeThe}>Đơn vị</Text>
        </View>
        <View style={styles.hangO}>
          <ODonVi ten="Mét" chiTiet="kg, cm, g" laDangChon={donVi === 'met'} biKhoa={dangLuuDonVi} onPress={() => chonDonVi('met')} />
          <ODonVi ten="Anh-Mỹ" chiTiet="lb, ft-in, oz" laDangChon={donVi === 'anh_my'} biKhoa={dangLuuDonVi} onPress={() => chonDonVi('anh_my')} />
        </View>
      </Card>

      {/* Đổi mật khẩu */}
      <Card>
        <Pressable style={({ pressed }) => [styles.dongBam, pressed ? styles.dangBam : null]} onPress={() => router.push('/auth/ChangePassword')}>
          <View style={styles.oBieuTuong}>
            <Ionicons name="key-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.chuDongBam}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </Card>

      {/* Xóa tài khoản: nút viền đỏ, để cách xa dòng bên trên */}
      <Pressable style={({ pressed }) => [styles.nutXoa, pressed ? styles.dangBam : null]} onPress={xacNhanXoaTaiKhoan}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
        <Text style={styles.chuXoa}>Xóa tài khoản</Text>
      </Pressable>
    </Screen>
  );
}

type ODonViProps = {
  ten: string;
  chiTiet: string;
  laDangChon: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Một ô chọn đơn vị: tên đậm, dòng nhỏ các đơn vị; đang chọn thì nền xanh nhạt, viền xanh
function ODonVi({ ten, chiTiet, laDangChon, biKhoa, onPress }: ODonViProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.oDonVi, laDangChon ? styles.oDonViDangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Text style={[styles.tenDonVi, laDangChon ? styles.tenDonViDangChon : null]}>{ten}</Text>
      <Text style={styles.nhanO}>{chiTiet}</Text>
    </Pressable>
  );
}

// Một ô thông tin: nhãn nhỏ xám, giá trị đậm, căn giữa ô
function OThongTin({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <View style={styles.oThongTin}>
      <Text style={styles.nhanO}>{nhan}</Text>
      <Text style={styles.giaTriO}>{giaTri}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  hangO: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oThongTin: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 10,
  },
  nhanO: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  giaTriO: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  oChuCai: {
    width: 52,
    height: 52,
    borderRadius: radius.input,
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
  dongBam: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    minHeight: 44,
  },
  oBieuTuong: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuDongBam: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nutXoa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    marginTop: spacing.xlarge * 2,
  },
  chuXoa: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.error,
  },
  oDonVi: {
    flex: 1,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 10,
  },
  oDonViDangChon: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tenDonVi: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenDonViDangChon: {
    color: colors.primary,
  },
  mo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
