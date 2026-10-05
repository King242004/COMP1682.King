import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/auth/AuthContext';
import { layHoSo } from '../../src/ho-so/HoSoApi';
import type { HoSo } from '../../src/ho-so/HoSoApi';
import { Button } from '../../src/shared/components/Button';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { colors } from '../../src/shared/theme';

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
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.ten}>{user.ten_hien_thi}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {loi ? <ErrorBox message={loi} onRetry={taiHoSo} /> : null}
        {!hoSo && !loi ? <ActivityIndicator color={colors.primary} /> : null}

        {/* Mục tiêu calo và BMI */}
        {hoSo && hoSo.muc_tieu_calo !== null ? (
          <View style={styles.the}>
            <Text style={styles.nhan}>Mục tiêu mỗi ngày</Text>
            <Text style={styles.soCalo}>
              {hoSo.muc_tieu_calo.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
            </Text>
            <Text style={styles.nhan}>
              BMI {hoSo.bmi?.toLocaleString('vi-VN')} · {hoSo.phan_loai_bmi}
            </Text>
          </View>
        ) : null}

        {/* Thông tin hồ sơ */}
        {hoSo && hoSo.muc_tieu_calo !== null ? (
          <View style={styles.danhSach}>
            <DongThongTin nhan="Giới tính" giaTri={hoSo.gioi_tinh ? TEN_GIOI_TINH[hoSo.gioi_tinh] : ''} />
            <DongThongTin nhan="Năm sinh" giaTri={String(hoSo.nam_sinh)} />
            <DongThongTin nhan="Chiều cao" giaTri={`${hoSo.chieu_cao_cm?.toLocaleString('vi-VN')} cm`} />
            <DongThongTin nhan="Cân nặng" giaTri={`${hoSo.can_nang_kg?.toLocaleString('vi-VN')} kg`} />
            <DongThongTin nhan="Mức vận động" giaTri={hoSo.muc_van_dong ? TEN_MUC_VAN_DONG[hoSo.muc_van_dong] : ''} />
            <DongThongTin nhan="Mục tiêu" giaTri={hoSo.muc_tieu ? TEN_MUC_TIEU[hoSo.muc_tieu] : ''} />
          </View>
        ) : null}

        <View style={styles.nhomNut}>
          <Button title="Sửa hồ sơ" loadingTitle="" isLoading={false} onPress={() => router.push('/ho-so/sua')} />
          <Button title="Đổi mật khẩu" loadingTitle="" isLoading={false} isSecondary onPress={() => router.push('/auth/change-password')} />
          <Button title="Đăng xuất" loadingTitle="" isLoading={false} isSecondary onPress={logout} />
        </View>

        <Pressable style={styles.nutXoa} onPress={xacNhanXoaTaiKhoan}>
          <Text style={styles.chuXoa}>Xóa tài khoản</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  ten: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  the: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  nhan: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  soCalo: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.primary,
  },
  donVi: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  danhSach: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 20,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  nhanDong: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  giaTriDong: {
    flexShrink: 1,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  nhomNut: {
    gap: 10,
  },
  nutXoa: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  chuXoa: {
    fontSize: 15,
    color: colors.error,
  },
});
