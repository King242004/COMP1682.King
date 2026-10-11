import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { layHoSo } from '../../src/ho-so/HoSoApi';
import type { HoSo } from '../../src/ho-so/HoSoApi';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { colors, fontSizes, pressedOpacity, spacing } from '../../src/shared/theme';

// Chữ hiển thị cho các giá trị lưu trong database
const TEN_MUC_VAN_DONG = { nhe: 'Nhẹ', trung_binh: 'Trung bình', nang: 'Nặng' };
const TEN_MUC_TIEU = { giam: 'Giảm cân', giu: 'Giữ cân', tang: 'Tăng cân' };
const TEN_GIOI_TINH = { nam: 'Nam', nu: 'Nữ' };

export default function ManHoSo() {
  const { user, logout, deleteAccount } = useAuth();
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

  // Hỏi lại trước khi xóa, vì không khôi phục được
  function xacNhanXoaTaiKhoan() {
    Alert.alert('Xóa tài khoản?', 'Toàn bộ dữ liệu của bạn sẽ bị xóa và không khôi phục được.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (loiXoa) {
            setLoi((loiXoa as Error).message);
          }
        },
      },
    ]);
  }

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <ScreenTitle title="Hồ sơ" />

      {/* Tên và email */}
      <Card>
        <Text style={styles.ten}>{user.ten_hien_thi}</Text>
        <Text style={styles.nhan}>{user.email}</Text>
      </Card>

      {loi ? <ErrorBox message={loi} onRetry={taiHoSo} /> : null}
      {!hoSo && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {/* Mục tiêu calo, BMI và thông tin hồ sơ */}
      {hoSo && hoSo.muc_tieu_calo !== null ? (
        <Card>
          <Text style={styles.nhan}>Mục tiêu mỗi ngày</Text>
          <Text style={styles.soCalo}>
            {hoSo.muc_tieu_calo.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
          </Text>
          <Text style={styles.nhan}>
            BMI {hoSo.bmi?.toLocaleString('vi-VN')} · {hoSo.phan_loai_bmi}
          </Text>
          <View style={styles.danhSach}>
            <DongThongTin nhan="Giới tính" giaTri={hoSo.gioi_tinh ? TEN_GIOI_TINH[hoSo.gioi_tinh] : ''} />
            <DongThongTin nhan="Năm sinh" giaTri={String(hoSo.nam_sinh)} />
            <DongThongTin nhan="Chiều cao" giaTri={`${hoSo.chieu_cao_cm?.toLocaleString('vi-VN')} cm`} />
            <DongThongTin nhan="Cân nặng" giaTri={`${hoSo.can_nang_kg?.toLocaleString('vi-VN')} kg`} />
            <DongThongTin nhan="Mức vận động" giaTri={hoSo.muc_van_dong ? TEN_MUC_VAN_DONG[hoSo.muc_van_dong] : ''} />
            <DongThongTin nhan="Mục tiêu" giaTri={hoSo.muc_tieu ? TEN_MUC_TIEU[hoSo.muc_tieu] : ''} />
            <DongThongTin nhan="Dị ứng, kiêng ăn" giaTri={hoSo.di_ung_kieng_an === '' ? 'Không có' : hoSo.di_ung_kieng_an} />
          </View>
        </Card>
      ) : null}

      {/* Lối vào màn Tiến độ (ghi cân, biểu đồ, 4 tuần qua); cần có hồ sơ trước */}
      {hoSo && hoSo.muc_tieu_calo !== null ? (
        <Card>
          <DongBam
            nhan="Tiến độ cân nặng"
            giaTri={`${hoSo.can_nang_kg?.toLocaleString('vi-VN')} kg`}
            onPress={() => router.push('/tien-do')}
          />
        </Card>
      ) : null}

      {/* Tài khoản */}
      <Card>
        <DongBam nhan="Sửa hồ sơ" giaTri="" onPress={() => router.push('/ho-so/sua')} />
        <DongBam nhan="Đổi mật khẩu" giaTri="" onPress={() => router.push('/auth/change-password')} />
        <DongBam nhan="Đăng xuất" giaTri="" onPress={logout} />
      </Card>

      <Pressable style={({ pressed }) => [styles.nutXoa, pressed ? styles.dangBam : null]} onPress={xacNhanXoaTaiKhoan}>
        <Text style={styles.chuXoa}>Xóa tài khoản</Text>
      </Pressable>
    </Screen>
  );
}

// Một dòng "nhãn: giá trị" trong danh sách thông tin
function DongThongTin({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <View style={styles.dong}>
      <Text style={styles.nhanDong}>{nhan}</Text>
      <Text style={styles.giaTriDong}>{giaTri}</Text>
    </View>
  );
}

// Một dòng bấm được: nhãn bên trái, giá trị và dấu › bên phải
function DongBam({ nhan, giaTri, onPress }: { nhan: string; giaTri: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.dongBam, pressed ? styles.dangBam : null]} onPress={onPress}>
      <Text style={styles.chuDongBam}>{nhan}</Text>
      <View style={styles.benPhai}>
        <Text style={styles.nhanDong}>{giaTri}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ten: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  nhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.primary,
  },
  donVi: {
    fontSize: fontSizes.body,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  danhSach: {
    marginTop: spacing.medium,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.medium,
  },
  nhanDong: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  giaTriDong: {
    flexShrink: 1,
    fontSize: fontSizes.body,
    color: colors.text,
    textAlign: 'right',
  },
  dongBam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  chuDongBam: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  benPhai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nutXoa: {
    marginTop: spacing.xlarge,
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  chuXoa: {
    fontSize: fontSizes.body,
    color: colors.error,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
