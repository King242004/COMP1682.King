import { useEffect, useState } from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import { layThanhPhanSuat } from '../tra-mon/TraMonApi';
import type { MonTraCuu, ThanhPhanSuat } from '../tra-mon/TraMonApi';

type ChiTietMonProps = {
  mon: MonTraCuu;
  onDong: () => void;
  // Bấm "Thêm vào nhật ký": danh sách mở màn thêm món đã điền sẵn để xem lại rồi mới lưu
  onThem: () => void;
};

// Viết số kiểu Việt Nam, giữ tối đa 1 số lẻ, ví dụ 268,3
function vietSo(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Màn nổi chi tiết một món Viện Dinh dưỡng đã cân: ảnh suất, 1 suất nặng bao nhiêu và gồm những gì, nút mở màn thêm món
export function ChiTietMon({ mon, onDong, onThem }: ChiTietMonProps) {
  // Bảng "Trong 1 suất có"; null là đang tải, mảng rỗng là món chưa có bảng
  const [thanhPhan, setThanhPhan] = useState<ThanhPhanSuat[] | null>(null);

  // Mở màn là tải bảng thành phần; tải lỗi thì coi như món chưa có bảng, vẫn thêm món được
  useEffect(() => {
    taiThanhPhan();
  }, []);

  async function taiThanhPhan() {
    try {
      setThanhPhan(await layThanhPhanSuat(mon.ma_so));
    } catch {
      setThanhPhan([]);
    }
  }

  // Cộng gam và kcal các dòng thành phần để ghi tổng
  let tongGam = 0;
  let tongCalo = 0;
  if (thanhPhan !== null) {
    for (const dong of thanhPhan) {
      tongGam += dong.so_gam;
      tongCalo += dong.so_calo;
    }
  }
  const coBang = thanhPhan !== null && thanhPhan.length > 0;

  return (
    <Modal visible animationType="slide" onRequestClose={onDong}>
      {/* Màn nổi cần lề an toàn riêng, nếu không nội dung sẽ đè lên giờ và pin */}
      <SafeAreaProvider>
        <Screen>
          <ScreenTitle title={mon.ten_mon} onBack={onDong} />

          {/* Ảnh suất của Viện; bấm để mở ảnh gốc mà phóng to */}
          <Pressable style={({ pressed }) => (pressed ? styles.dangBam : null)} onPress={() => Linking.openURL(mon.anh_url)}>
            <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" />
            <Text style={styles.chuLienKet}>Bấm ảnh để phóng to</Text>
          </Pressable>

          {/* 1 suất nặng bao nhiêu (khi có bảng) và số liệu của 1 suất */}
          <Card>
            <Text style={styles.soTo}>
              1 suất{coBang ? ` · ${Math.round(tongGam).toLocaleString('vi-VN')} g` : ''} · {Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal
            </Text>
            <Text style={styles.chuPhu}>
              Đạm {vietSo(mon.dam_g)} g · Tinh bột {vietSo(mon.tinh_bot_g)} g · Béo {vietSo(mon.beo_g)} g · Muối {vietSo(mon.muoi_g)} g
            </Text>
          </Card>

          {/* Bảng "Trong 1 suất có", chép từ bảng thành phần Viện in trong ảnh */}
          {thanhPhan !== null && thanhPhan.length > 0 ? (
            <Card>
              <Text style={styles.tieuDeBang}>Trong 1 suất có</Text>
              {thanhPhan.map((dong) => (
                <View key={dong.thu_tu} style={styles.dongBang}>
                  <Text style={styles.tenThanhPhan}>{dong.ten_thanh_phan}</Text>
                  <Text style={styles.soThanhPhan}>
                    {vietSo(dong.so_gam)} g · {vietSo(dong.so_calo)} kcal
                  </Text>
                </View>
              ))}
              <View style={styles.dongCong}>
                <Text style={styles.chuCong}>Cộng</Text>
                <Text style={styles.chuCong}>
                  {vietSo(tongGam)} g · {vietSo(tongCalo)} kcal
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Mở màn thêm món đã điền sẵn 1 suất; ở đó chọn bữa, sửa lượng rồi mới lưu */}
          <Button title="Thêm vào nhật ký" loadingTitle="" isLoading={false} onPress={onThem} iconName="add-circle-outline" />
          <Text style={styles.chuGiua}>Nguồn: Viện Dinh dưỡng Quốc gia</Text>
        </Screen>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  anh: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuLienKet: {
    fontSize: fontSizes.secondary,
    color: colors.primary,
    marginTop: spacing.small,
    marginBottom: spacing.medium,
  },
  soTo: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tieuDeBang: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  dongBang: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.medium,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tenThanhPhan: {
    flex: 1,
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  soThanhPhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  dongCong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.small,
  },
  chuCong: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  chuGiua: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
});
