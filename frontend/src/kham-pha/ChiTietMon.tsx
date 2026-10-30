import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { vietKhoiLuong } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import { layThanhPhanSuat } from '../tra-mon/TraMonApi';
import type { MonTraCuu, ThanhPhanSuat } from '../tra-mon/TraMonApi';

type ChiTietMonProps = {
  mon: MonTraCuu;
  onDong: () => void;
  // Nút dưới cùng do nơi mở truyền vào: Khám phá là "Thêm vào nhật ký", thực đơn là "Hỏi Coach cách nấu"
  tenNut: string;
  bieuTuongNut: ComponentProps<typeof Ionicons>['name'];
  onBamNut: () => void;
};

type OChatProps = {
  ten: string;
  bieuTuong: ComponentProps<typeof MaterialCommunityIcons>['name'];
  mau: string;
  mauNen: string;
  soGam: number;
};

// Viết số kiểu Việt Nam, giữ tối đa 1 số lẻ, ví dụ 268,3
function vietSo(so: number): string {
  return (Math.round(so * 10) / 10).toLocaleString('vi-VN');
}

// Một ô màu nhạt cho đạm, tinh bột hoặc béo: biểu tượng, tên chất, số gam
function OChat({ ten, bieuTuong, mau, mauNen, soGam }: OChatProps) {
  return (
    <View style={[styles.oChat, { backgroundColor: mauNen }]}>
      <MaterialCommunityIcons name={bieuTuong} size={20} color={mau} />
      <Text style={styles.tenChat}>{ten}</Text>
      <Text style={[styles.soGam, { color: mau }]}>{vietSo(soGam)} g</Text>
    </View>
  );
}

// Màn nổi chi tiết một món Viện Dinh dưỡng đã cân: ảnh suất, 1 suất nặng bao nhiêu và gồm những gì, nút dưới cùng
export function ChiTietMon({ mon, onDong, tenNut, bieuTuongNut, onBamNut }: ChiTietMonProps) {
  const { donVi, heSo } = useDonVi();
  // Bảng "Trong 1 suất có"; null là đang tải, mảng rỗng là món chưa có bảng
  const [thanhPhan, setThanhPhan] = useState<ThanhPhanSuat[] | null>(null);
  // Người dùng có chọn nhóm dị ứng nào không, để hiện câu nói rõ giới hạn cuối bảng
  const [coChonNhomDiUng, setCoChonNhomDiUng] = useState(false);

  // Mở màn là tải bảng thành phần; tải lỗi thì coi như món chưa có bảng, vẫn thêm món được
  useEffect(() => {
    taiThanhPhan();
  }, []);

  async function taiThanhPhan() {
    try {
      const bangThanhPhan = await layThanhPhanSuat(mon.ma_so);
      setThanhPhan(bangThanhPhan.thanh_phan);
      setCoChonNhomDiUng(bangThanhPhan.co_chon_nhom_di_ung);
    } catch {
      setThanhPhan([]);
    }
  }

  // Cộng gam và kcal các dòng có số để ghi tổng; dòng Viện để trống (không cân) thì không cộng
  let tongGam = 0;
  let tongCalo = 0;
  let coDongTrong = false;
  if (thanhPhan !== null) {
    for (const dong of thanhPhan) {
      if (dong.so_gam === null || dong.so_calo === null) {
        coDongTrong = true;
      } else {
        tongGam += dong.so_gam;
        tongCalo += dong.so_calo;
      }
    }
  }
  const coBang = thanhPhan !== null && thanhPhan.length > 0;

  return (
    <Modal visible animationType="slide" onRequestClose={onDong}>
      {/* Màn nổi cần lề an toàn riêng, nếu không nội dung sẽ đè lên giờ và pin */}
      <SafeAreaProvider>
        <Screen>
          <ScreenTitle title={mon.ten_mon} onBack={onDong} />

          {/* Ảnh suất của Viện, dưới là nguồn số liệu */}
          <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" />
          <Text style={styles.chuNguon}>Nguồn: Viện Dinh dưỡng Quốc gia</Text>

          {/* 1 suất nặng bao nhiêu (khi có bảng đủ số) và số kcal to ở giữa */}
          <Card>
            <View style={styles.giua}>
              <Text style={styles.chuPhu}>1 suất{coBang && !coDongTrong ? ` · ${vietKhoiLuong(Math.round(tongGam), donVi, heSo)}` : ''}</Text>
              <Text style={styles.soCalo}>{Math.round(mon.so_calo).toLocaleString('vi-VN')}</Text>
              <Text style={styles.chuPhu}>kcal</Text>
              {/* Món có thứ người dùng dị ứng (dò theo tên món và các dòng thành phần) */}
              {mon.nhom_di_ung.length > 0 ? <Text style={styles.chuDiUng}>⚠ Món này có: {mon.nhom_di_ung.join(' · ')}</Text> : null}
            </View>
          </Card>

          {/* Ba ô đạm, tinh bột, béo của 1 suất (cùng thứ tự Trang chủ), dưới là muối */}
          <View style={styles.hangChat}>
            <OChat ten="Đạm" bieuTuong="food-steak" mau={colors.protein} mauNen={colors.proteinLight} soGam={mon.dam_g} />
            <OChat ten="Tinh bột" bieuTuong="barley" mau={colors.carbs} mauNen={colors.carbsLight} soGam={mon.tinh_bot_g} />
            <OChat ten="Béo" bieuTuong="water-outline" mau={colors.fat} mauNen={colors.fatLight} soGam={mon.beo_g} />
          </View>
          <Text style={styles.chuMuoi}>Muối {vietSo(mon.muoi_g)} g</Text>

          {/* Bảng "Trong 1 suất có", chép từ bảng thành phần Viện in trong ảnh */}
          {thanhPhan !== null && thanhPhan.length > 0 ? (
            <Card>
              <Text style={styles.tieuDeBang}>Trong 1 suất có</Text>
              {thanhPhan.map((dong) => (
                <View key={dong.thu_tu} style={styles.dongBang}>
                  {/* Dòng có thứ người dùng dị ứng thì thêm ⚠ và đổi màu */}
                  {dong.nhom_di_ung.length > 0 ? (
                    <Text style={[styles.tenThanhPhan, styles.tenThanhPhanDiUng]}>⚠ {dong.ten_thanh_phan}</Text>
                  ) : (
                    <Text style={styles.tenThanhPhan}>{dong.ten_thanh_phan}</Text>
                  )}
                  {/* Dòng Viện để trống thì không ghi số */}
                  {dong.so_gam !== null && dong.so_calo !== null ? (
                    <Text style={styles.soThanhPhan}>
                      {vietKhoiLuong(dong.so_gam, donVi, heSo)} · {vietSo(dong.so_calo)} kcal
                    </Text>
                  ) : null}
                </View>
              ))}
              <View style={styles.dongCong}>
                <Text style={styles.chuCong}>Cộng</Text>
                <Text style={styles.chuCong}>
                  {vietKhoiLuong(tongGam, donVi, heSo)} · {vietSo(tongCalo)} kcal
                </Text>
              </View>
              {coDongTrong ? <Text style={styles.chuPhu}>Dòng để trống: Viện không cân, chưa tính vào tổng.</Text> : null}
              {coChonNhomDiUng ? (
                <Text style={styles.chuPhu}>
                  App kiểm theo tên thành phần Viện ghi. Nước dùng, nước chấm, nước sốt không ghi nấu từ gì nên chưa kiểm được.
                </Text>
              ) : null}
            </Card>
          ) : null}

          {/* Nút dưới cùng do nơi mở truyền vào */}
          <Button title={tenNut} loadingTitle="" isLoading={false} onPress={onBamNut} iconName={bieuTuongNut} />
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
  chuNguon: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: spacing.small,
    marginBottom: spacing.medium,
  },
  giua: {
    alignItems: 'center',
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '700',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  hangChat: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.medium,
    paddingHorizontal: 4,
  },
  tenChat: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  soGam: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  chuMuoi: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
    marginBottom: spacing.medium,
  },
  tieuDeBang: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dongBang: {
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tenThanhPhan: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenThanhPhanDiUng: {
    color: colors.warningText,
  },
  chuDiUng: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.warningText,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  soThanhPhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
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
});
