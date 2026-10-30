import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ViewInstance } from 'react-native';

import { buaTheoGio } from '../bua-an/TenBua';
import { NhanDiUng } from '../di-ung/NhanDiUng';
import type { MonDaChon } from '../quet-mon/MonDaChon';
import { Chip } from '../shared/components/Chip';
import { ErrorBox } from '../shared/components/ErrorBox';
import { Screen } from '../shared/components/Screen';
import { todayKey } from '../shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import { layTatCaMon } from '../tra-mon/TraMonApi';
import type { MonTraCuu, NhomMon } from '../tra-mon/TraMonApi';
import { ChiTietMon } from './ChiTietMon';
import { ChonCachXep, TEN_CACH_XEP } from './ChonCachXep';
import type { CachXep } from './ChonCachXep';

// Mỗi lần hiện thêm 20 món, để không tải 382 ảnh cùng lúc; là lựa chọn giao diện
const SO_MON_MOI_LAN = 20;

// Chip nhóm món theo thứ tự trên màn; "tat_ca" là không lọc
const CHIP_NHOM: { giaTri: NhomMon | 'tat_ca'; nhan: string }[] = [
  { giaTri: 'tat_ca', nhan: 'Tất cả' },
  { giaTri: 'bun_pho', nhan: 'Bún, phở, miến' },
  { giaTri: 'com_chao_xoi', nhan: 'Cơm, cháo, xôi' },
  { giaTri: 'banh', nhan: 'Bánh' },
  { giaTri: 'che_do_uong', nhan: 'Chè, đồ uống' },
  { giaTri: 'mon_khac', nhan: 'Món khác' },
];

type DanhSachMonProps = {
  // 2 tab của Khám phá, đặt trên cùng phần đầu đứng yên
  dauMan: ReactNode;
};

// Phần "Món ăn" của tab Khám phá: phần đầu đứng yên (tab, thanh tìm, chip nhóm), lưới 2 cột món Viện Dinh dưỡng đã cân cuộn bên dưới
export function DanhSachMon({ dauMan }: DanhSachMonProps) {
  // Cả bảng món tải một lần; null là đang tải
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [tuKhoa, setTuKhoa] = useState('');
  const [nhomDangChon, setNhomDangChon] = useState<NhomMon | 'tat_ca'>('tat_ca');
  const [cachXep, setCachXep] = useState<CachXep>('ten');
  // Khoảng cách từ đỉnh màn hình tới đáy nút xếp; null là menu xếp đang đóng
  const [dinhMenuXep, setDinhMenuXep] = useState<number | null>(null);
  // Nút xếp, để đo vị trí của nó trên màn
  const nutXep = useRef<ViewInstance>(null);
  const [soMonDangHien, setSoMonDangHien] = useState(SO_MON_MOI_LAN);
  const [monDangXem, setMonDangXem] = useState<MonTraCuu | null>(null);
  const [loi, setLoi] = useState('');

  // Mở phần này là tải cả bảng món
  useEffect(() => {
    taiMon();
  }, []);

  async function taiMon() {
    setLoi('');
    try {
      setTatCaMon(await layTatCaMon());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Gõ từ khóa mới thì quay về 20 món đầu
  function doiTuKhoa(chu: string) {
    setTuKhoa(chu);
    setSoMonDangHien(SO_MON_MOI_LAN);
  }

  // Đổi nhóm thì quay về 20 món đầu
  function doiNhom(nhom: NhomMon | 'tat_ca') {
    setNhomDangChon(nhom);
    setSoMonDangHien(SO_MON_MOI_LAN);
  }

  // Bấm nút xếp: đo nút đang nằm ở đâu trên màn rồi mở menu ngay bên dưới
  function moMenuXep() {
    nutXep.current?.measureInWindow((viTriNgang, viTriDoc, chieuRong, chieuCao) => {
      setDinhMenuXep(viTriDoc + chieuCao);
    });
  }

  // Chọn cách xếp thì đóng menu và quay về 20 món đầu
  function doiCachXep(cachMoi: CachXep) {
    setCachXep(cachMoi);
    setDinhMenuXep(null);
    setSoMonDangHien(SO_MON_MOI_LAN);
  }

  // Số gam đạm trong mỗi 100 kcal của món: càng cao là ăn ít calo mà được nhiều đạm
  function damTrongMoi100Kcal(mon: MonTraCuu): number {
    return (mon.dam_g / mon.so_calo) * 100;
  }

  // Bấm "Thêm vào nhật ký": đóng chi tiết, mở màn thêm món đã điền sẵn đúng 1 suất để người dùng xem lại, sửa rồi mới lưu
  function moManThemMon(mon: MonTraCuu) {
    const monSan: MonDaChon = {
      ten_mon: mon.ten_mon,
      khau_phan: '1 suất',
      so_calo: Math.round(mon.so_calo),
      dam_g: mon.dam_g,
      tinh_bot_g: mon.tinh_bot_g,
      beo_g: mon.beo_g,
      muoi_g: mon.muoi_g,
      duong_g: null,
      beo_no_g: null,
      nguon_so_lieu: 'vien_dinh_duong',
      canh_bao_di_ung: '',
    };
    setMonDangXem(null);
    router.push({
      pathname: '/bua-an/ThemSuaBuaAn',
      params: { ngay: todayKey(), loaiBua: buaTheoGio(new Date().getHours()), monSan: JSON.stringify(monSan) },
    });
  }

  // Chỉ lấy món hiện ở Khám phá (mỗi món 1 bản), đúng nhóm đang chọn, lọc theo từ khóa: so với tên gốc, tên đầy đủ và tên không dấu
  const tuKhoaChuThuong = tuKhoa.trim().toLowerCase();
  let monPhuHop: MonTraCuu[] = [];
  if (tatCaMon !== null) {
    monPhuHop = tatCaMon.filter(
      (mon) =>
        mon.hien_o_kham_pha &&
        (nhomDangChon === 'tat_ca' || mon.nhom_mon === nhomDangChon) &&
        (mon.ten_goc.toLowerCase().includes(tuKhoaChuThuong) ||
          mon.ten_mon.toLowerCase().includes(tuKhoaChuThuong) ||
          mon.ten_khong_dau.includes(tuKhoaChuThuong)),
    );
  }

  // Xếp theo cách đang chọn; "Tên A–Z" giữ đúng thứ tự server trả (đã xếp theo tên không dấu), "Tên Z–A" đảo ngược thứ tự đó
  if (cachXep === 'ten_nguoc') {
    monPhuHop.reverse();
  } else if (cachXep === 'it_calo') {
    monPhuHop.sort((monTruoc, monSau) => monTruoc.so_calo - monSau.so_calo);
  } else if (cachXep === 'giau_dam') {
    monPhuHop.sort((monTruoc, monSau) => damTrongMoi100Kcal(monSau) - damTrongMoi100Kcal(monTruoc));
  } else if (cachXep === 'it_tinh_bot') {
    monPhuHop.sort((monTruoc, monSau) => monTruoc.tinh_bot_g - monSau.tinh_bot_g);
  }
  const monDangHien = monPhuHop.slice(0, soMonDangHien);
  const tenCachXep = TEN_CACH_XEP.find((cach) => cach.giaTri === cachXep)?.nhan;

  // Phần đầu đứng yên: 2 tab, thanh tìm và nút xếp, chip nhóm, dòng đếm
  const phanDau = (
    <View>
      {dauMan}

      {/* Thanh tìm bo tròn (gõ tới đâu lọc tới đó) và nút xếp ngay bên phải; đang xếp khác tên A–Z thì nút tô xanh nhạt */}
      <View style={styles.hangTim}>
        <View style={styles.thanhTim}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.oTim}
            value={tuKhoa}
            onChangeText={doiTuKhoa}
            placeholder="Tìm món, ví dụ: phở bò"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <Pressable
          ref={nutXep}
          style={({ pressed }) => [styles.nutXep, cachXep !== 'ten' ? styles.nutXepDangDung : null, pressed ? styles.dangBam : null]}
          onPress={moMenuXep}
        >
          <Ionicons name="swap-vertical-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Chip nhóm món, cuộn ngang, chạy sát hai mép màn hình */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuonNgang} contentContainerStyle={styles.hangChip}>
        {CHIP_NHOM.map((chip) => (
          <Chip key={chip.giaTri} label={chip.nhan} isSelected={nhomDangChon === chip.giaTri} onPress={() => doiNhom(chip.giaTri)} />
        ))}
      </ScrollView>

      {/* Số món đang có và cách đang xếp */}
      {tatCaMon ? (
        <Text style={styles.chuNho}>
          {monPhuHop.length.toLocaleString('vi-VN')} món · {tenCachXep}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen header={phanDau} compactBottom>
      {loi ? <ErrorBox message={loi} onRetry={taiMon} /> : null}
      {!tatCaMon && !loi ? <ActivityIndicator color={colors.primary} /> : null}
      {tatCaMon && monPhuHop.length === 0 ? (
        <Text style={styles.chuPhu}>
          Không thấy món này. Bảng chỉ có món Viện Dinh dưỡng đã cân (chủ yếu miền Bắc); hãy thêm bằng nút + ở trang chủ (chụp ảnh, mã vạch hoặc nút bút).
        </Text>
      ) : null}

      {/* Lưới 2 cột: mỗi ô là ảnh suất, tên gốc, calo và đạm của 1 suất; món có ghi chú suất thì thêm dòng "1 suất (…)" */}
      <View style={styles.luoi}>
        {monDangHien.map((mon) => (
          <Pressable
            key={mon.ma_so}
            style={({ pressed }) => [styles.oMon, pressed ? styles.dangBam : null]}
            onPress={() => setMonDangXem(mon)}
          >
            <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" />
            <View style={styles.thongTin}>
              <Text style={styles.tenMon} numberOfLines={2}>
                {mon.ten_goc}
              </Text>
              {/* Xếp theo calo thì số kcal tô xanh */}
              <Text style={styles.chuSoLieu}>
                <Text style={cachXep === 'it_calo' ? styles.soDangXep : null}>{Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal</Text>
                {' · '}
                đạm {Math.round(mon.dam_g)} g
              </Text>
              {/* Xếp giàu đạm hoặc ít tinh bột thì thêm một dòng xanh là số đang dùng để xếp */}
              {cachXep === 'giau_dam' ? (
                <Text style={[styles.chuSoLieu, styles.soDangXep]}>
                  {damTrongMoi100Kcal(mon).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} g đạm / 100 kcal
                </Text>
              ) : null}
              {cachXep === 'it_tinh_bot' ? (
                <Text style={[styles.chuSoLieu, styles.soDangXep]}>tinh bột {mon.tinh_bot_g.toLocaleString('vi-VN')} g</Text>
              ) : null}
              {mon.ghi_chu_suat ? <Text style={styles.chuSoLieu}>1 suất ({mon.ghi_chu_suat})</Text> : null}
              {/* Món có thứ người dùng dị ứng thì có nhãn ⚠ */}
              <NhanDiUng danhSachNhom={mon.nhom_di_ung} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* Còn món chưa hiện thì có nút nhỏ "Xem thêm" ở giữa */}
      {monPhuHop.length > soMonDangHien ? (
        <Pressable
          style={({ pressed }) => [styles.nutXemThem, pressed ? styles.dangBam : null]}
          onPress={() => setSoMonDangHien(soMonDangHien + SO_MON_MOI_LAN)}
        >
          <Text style={styles.chuXemThem}>Xem thêm</Text>
          <Ionicons name="chevron-down" size={18} color={colors.primary} />
        </Pressable>
      ) : null}

      {/* Menu chọn cách xếp, thả xuống dưới nút xếp */}
      {dinhMenuXep !== null ? (
        <ChonCachXep cachDangChon={cachXep} dinhMenu={dinhMenuXep} onChon={doiCachXep} onDong={() => setDinhMenuXep(null)} />
      ) : null}

      {/* Bấm một món thì mở màn nổi chi tiết */}
      {monDangXem ? (
        <ChiTietMon
          mon={monDangXem}
          onDong={() => setMonDangXem(null)}
          tenNut="Thêm vào nhật ký"
          bieuTuongNut="add-circle-outline"
          onBamNut={() => moManThemMon(monDangXem)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hangTim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  thanhTim: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.large,
  },
  oTim: {
    flex: 1,
    height: '100%',
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  // Kéo hàng chip ra sát hai mép màn
  cuonNgang: {
    marginHorizontal: -spacing.large,
  },
  hangChip: {
    gap: spacing.small,
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.medium,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  nutXep: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutXepDangDung: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  soDangXep: {
    color: colors.primary,
    fontWeight: '600',
  },
  luoi: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Không dùng overflow hidden ở ô vì iPhone sẽ cắt mất bóng; ảnh tự bo hai góc trên
  oMon: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
    borderRadius: radius.card,
    marginBottom: spacing.medium,
  },
  anh: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  thongTin: {
    padding: spacing.small,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuSoLieu: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Nút viên thuốc nhỏ ở giữa, nền trắng viền xám mảnh như thanh tìm
  nutXemThem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chuXemThem: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
});
