import { useState } from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { themBuaAn } from '../bua-an/BuaAnApi';
import type { LoaiBua } from '../bua-an/BuaAnApi';
import { buaTheoGio, TEN_BUA, THU_TU_BUA } from '../bua-an/TenBua';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Chip } from '../shared/components/Chip';
import { ErrorBox } from '../shared/components/ErrorBox';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { SectionTitle } from '../shared/components/SectionTitle';
import { todayKey } from '../shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { MonTraCuu } from '../tra-mon/TraMonApi';

// Người dùng ăn bao nhiêu so với 1 suất của Viện; là lựa chọn giao diện
const LUA_CHON_PHAN_AN = [
  { giaTri: 0.5, nhan: '½' },
  { giaTri: 1, nhan: '1' },
  { giaTri: 1.5, nhan: '1½' },
  { giaTri: 2, nhan: '2' },
];

type ChiTietMonProps = {
  mon: MonTraCuu;
  onDong: () => void;
  // Thêm xong thì báo cho danh sách một câu để hiện, ví dụ "Đã thêm Phở bò vào bữa trưa hôm nay."
  onDaThem: (cauBao: string) => void;
};

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

// Màn nổi chi tiết một món Viện Dinh dưỡng đã cân: ảnh suất, chọn bữa và phần, thêm vào nhật ký hôm nay
export function ChiTietMon({ mon, onDong, onDaThem }: ChiTietMonProps) {
  // Bữa mặc định đoán theo giờ, giống nút + nổi ở trang chủ
  const [loaiBua, setLoaiBua] = useState<LoaiBua>(buaTheoGio(new Date().getHours()));
  const [phanAn, setPhanAn] = useState(1);
  const [dangThem, setDangThem] = useState(false);
  const [loi, setLoi] = useState('');

  // Nhân số liệu 1 suất theo phần đã ăn rồi ghi vào nhật ký hôm nay; Viện không có số đường, béo no nên để trống
  async function themVaoNhatKy() {
    const luaChonPhan = LUA_CHON_PHAN_AN.find((luaChon) => luaChon.giaTri === phanAn);
    let khauPhan = '1 suất';
    if (phanAn !== 1 && luaChonPhan) {
      khauPhan = `${luaChonPhan.nhan} suất`;
    }

    setLoi('');
    setDangThem(true);
    try {
      await themBuaAn({
        ngay: todayKey(),
        loai_bua: loaiBua,
        ten_mon: mon.ten_mon,
        khau_phan: khauPhan,
        so_calo: Math.round(mon.so_calo * phanAn),
        dam_g: lamTronMotSoLe(mon.dam_g * phanAn),
        tinh_bot_g: lamTronMotSoLe(mon.tinh_bot_g * phanAn),
        beo_g: lamTronMotSoLe(mon.beo_g * phanAn),
        muoi_g: lamTronMotSoLe(mon.muoi_g * phanAn),
        duong_g: null,
        beo_no_g: null,
        nguon_so_lieu: 'vien_dinh_duong',
      });
      onDaThem(`Đã thêm ${mon.ten_mon} vào ${TEN_BUA[loaiBua].toLowerCase()} hôm nay.`);
    } catch (loiThem) {
      setLoi((loiThem as Error).message);
      setDangThem(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onDong}>
      {/* Màn nổi cần lề an toàn riêng, nếu không nội dung sẽ đè lên giờ và pin */}
      <SafeAreaProvider>
        <Screen>
          <ScreenTitle title={mon.ten_mon} subtitle={`Viện Dinh dưỡng · mã ${mon.ma_so}`} onBack={onDong} />

          {loi ? <ErrorBox message={loi} /> : null}

          {/* Ảnh suất của Viện có bảng nguyên liệu và số gam; bấm để mở ảnh gốc mà phóng to */}
          <Pressable style={({ pressed }) => (pressed ? styles.dangBam : null)} onPress={() => Linking.openURL(mon.anh_url)}>
            <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" />
            <Text style={styles.chuLienKet}>Bấm ảnh để phóng to, xem nguyên liệu và số gam</Text>
          </Pressable>

          {/* Chọn bữa để thêm vào */}
          <SectionTitle title="Bữa" />
          <View style={styles.hangChip}>
            {THU_TU_BUA.map((bua) => (
              <Chip key={bua} label={TEN_BUA[bua]} isSelected={loaiBua === bua} isDisabled={dangThem} onPress={() => setLoaiBua(bua)} />
            ))}
          </View>

          {/* Chọn phần đã ăn so với 1 suất */}
          <SectionTitle title="Bạn ăn bao nhiêu so với suất này?" />
          <View style={styles.hangChip}>
            {LUA_CHON_PHAN_AN.map((luaChon) => (
              <Chip
                key={luaChon.nhan}
                label={luaChon.nhan}
                isSelected={phanAn === luaChon.giaTri}
                isDisabled={dangThem}
                onPress={() => setPhanAn(luaChon.giaTri)}
              />
            ))}
          </View>

          {/* Số liệu đã nhân theo phần đang chọn */}
          <Card>
            <Text style={styles.soCalo}>{Math.round(mon.so_calo * phanAn).toLocaleString('vi-VN')} kcal</Text>
            <Text style={styles.chuPhu}>
              Đạm {lamTronMotSoLe(mon.dam_g * phanAn).toLocaleString('vi-VN')} g · tinh bột{' '}
              {lamTronMotSoLe(mon.tinh_bot_g * phanAn).toLocaleString('vi-VN')} g · béo{' '}
              {lamTronMotSoLe(mon.beo_g * phanAn).toLocaleString('vi-VN')} g · muối{' '}
              {lamTronMotSoLe(mon.muoi_g * phanAn).toLocaleString('vi-VN')} g
            </Text>
            <Text style={styles.chuPhu}>Viện chưa có số đường và béo no cho món này.</Text>
          </Card>

          <Button
            title={`Thêm vào ${TEN_BUA[loaiBua].toLowerCase()}`}
            loadingTitle="Đang thêm…"
            isLoading={dangThem}
            onPress={themVaoNhatKy}
          />
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
    backgroundColor: colors.card,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuLienKet: {
    fontSize: fontSizes.secondary,
    color: colors.primary,
    marginTop: spacing.small,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
