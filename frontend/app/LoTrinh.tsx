import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lamTronCanNangXuong, docCanNang, doiKgRaDonVi } from '../src/don-vi/DoiDonVi';
import { useDonVi } from '../src/don-vi/DonViContext';
import { ChonMucTieu } from '../src/ho-so/ChonMucTieu';
import { ChonMucVanDong } from '../src/ho-so/ChonMucVanDong';
import { layHoSo, layLuaChonHoSo, luuHoSo } from '../src/ho-so/HoSoApi';
import type { HoSo, HoSoGuiLen, LuaChonHoSo, MucTieu, MucVanDong, TocDoGiamCan } from '../src/ho-so/HoSoApi';
import { BanDangODau } from '../src/lo-trinh/BanDangODau';
import { CacMocThang } from '../src/lo-trinh/CacMocThang';
import { CanHomNay } from '../src/lo-trinh/CanHomNay';
import { KhoangGiuCan } from '../src/lo-trinh/KhoangGiuCan';
import { layLoTrinh } from '../src/lo-trinh/LoTrinhApi';
import type { LoTrinh as LoTrinhDuLieu } from '../src/lo-trinh/LoTrinhApi';
import { UuTien } from '../src/lo-trinh/UuTien';
import { Button } from '../src/shared/components/Button';
import { ErrorBox } from '../src/shared/components/ErrorBox';
import { Screen } from '../src/shared/components/Screen';
import { ScreenTitle } from '../src/shared/components/ScreenTitle';
import { ageOnDate, todayKey } from '../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, spacing } from '../src/shared/theme';

export default function LoTrinh() {
  const { donVi, heSo } = useDonVi();
  const insets = useSafeAreaInsets();

  // Dữ liệu tải từ server
  const [loTrinh, setLoTrinh] = useState<LoTrinhDuLieu | null>(null);
  const [hoSo, setHoSo] = useState<HoSo | null>(null);
  const [luaChon, setLuaChon] = useState<LuaChonHoSo | null>(null);
  const [loi, setLoi] = useState('');
  // Lỗi khi bấm "Lưu thay đổi": hiện ngay trên nút, vì khung lỗi đầu màn nằm xa nút
  const [loiLuu, setLoiLuu] = useState('');

  // Bản nháp các lựa chọn trên màn; khác hồ sơ đã lưu thì hiện thanh "Lưu thay đổi"
  const [mucTieu, setMucTieu] = useState<MucTieu>('giu');
  const [mucVanDong, setMucVanDong] = useState<MucVanDong | null>(null);
  const [canMucTieu, setCanMucTieu] = useState('');
  const [tocDo, setTocDo] = useState<TocDoGiamCan>('vua');
  const [dangLuu, setDangLuu] = useState(false);

  // Mỗi lần mở màn thì tải lại
  useFocusEffect(
    useCallback(() => {
      taiLoTrinh();
    }, []),
  );

  async function taiLoTrinh() {
    setLoi('');
    try {
      setLuaChon(await layLuaChonHoSo());
      const hoSoMoi = await layHoSo();
      setHoSo(hoSoMoi);
      huyThayDoi(hoSoMoi);
      setLoTrinh(await layLoTrinh());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Ghi cân xong: tải lại hồ sơ và lộ trình để thấy mốc mới, nhưng giữ các lựa chọn người dùng chưa lưu
  async function taiLaiSauKhiGhiCan() {
    try {
      setHoSo(await layHoSo());
      setLoTrinh(await layLoTrinh());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Bản nháp quay về đúng hồ sơ đã lưu (lúc tải xong, lúc bấm "Hủy")
  function huyThayDoi(hoSoDaLuu: HoSo) {
    setLoiLuu('');
    setMucTieu(hoSoDaLuu.muc_tieu ?? 'giu');
    setMucVanDong(hoSoDaLuu.muc_van_dong);
    setTocDo(hoSoDaLuu.toc_do_giam_can ?? 'vua');
    setCanMucTieu(vietCanMucTieuDaLuu(hoSoDaLuu));
  }

  // Cân mục tiêu đã lưu viết theo đơn vị đang dùng; chưa có thì để trống
  function vietCanMucTieuDaLuu(hoSoDaLuu: HoSo): string {
    if (hoSoDaLuu.can_muc_tieu_kg === null) {
      return '';
    }
    return String(doiKgRaDonVi(hoSoDaLuu.can_muc_tieu_kg, donVi, heSo)).replace('.', ',');
  }

  // Đổi mức vận động sang mức không cho chọn Nhanh thì tốc độ về Vừa
  const duocChonNhanh = hoSo !== null && mucVanDong !== null ? hoSo.duoc_chon_nhanh_theo_muc[mucVanDong] : true;
  useEffect(() => {
    if (tocDo === 'nhanh' && !duocChonNhanh) {
      setTocDo('vua');
    }
  }, [duocChonNhanh]);

  // Đang tải, hoặc tải lỗi
  if (hoSo === null || luaChon === null || loTrinh === null) {
    return (
      <Screen compactBottom>
        <ScreenTitle title="Lộ trình của bạn" onBack={() => router.back()} />
        {loi ? <ErrorBox message={loi} onRetry={taiLoTrinh} /> : <ActivityIndicator color={colors.primary} />}
      </Screen>
    );
  }

  // Có gì khác hồ sơ đã lưu không (tốc độ chỉ tính khi đang chọn giảm cân)
  const coThayDoi =
    mucTieu !== hoSo.muc_tieu ||
    mucVanDong !== hoSo.muc_van_dong ||
    canMucTieu !== vietCanMucTieuDaLuu(hoSo) ||
    (mucTieu === 'giam' && tocDo !== (hoSo.toc_do_giam_can ?? 'vua'));

  // Ngưỡng BMI giảm cân để ghi dưới ba ô mục tiêu: người cao tuổi có ngưỡng riêng
  let nguongGiamCan = luaChon.bmi_thieu_can;
  if (hoSo.ngay_sinh !== null && ageOnDate(hoSo.ngay_sinh, todayKey()) >= luaChon.tuoi_cao_tuoi) {
    nguongGiamCan = luaChon.bmi_thieu_can_cao_tuoi;
  }

  // Bấm một mục tiêu; giảm / tăng mà ô cân mục tiêu còn trống thì điền sẵn cân lý tưởng (làm tròn xuống để luôn hợp lệ)
  function chonMucTieu(mucTieuMoi: MucTieu) {
    setMucTieu(mucTieuMoi);
    if (hoSo === null || canMucTieu.trim() !== '' || hoSo.can_ly_tuong_kg === null || hoSo.can_nang_kg === null) {
      return;
    }
    if (mucTieuMoi === 'tang' || (mucTieuMoi === 'giam' && hoSo.can_ly_tuong_kg < hoSo.can_nang_kg)) {
      setCanMucTieu(String(lamTronCanNangXuong(hoSo.can_ly_tuong_kg, donVi, heSo)).replace('.', ','));
    }
  }

  // Gửi hồ sơ đã lưu kèm các lựa chọn mới; lỗi từ server hiện trong khung đỏ
  async function luuThayDoi() {
    if (hoSo === null || hoSo.gioi_tinh === null || hoSo.ngay_sinh === null || hoSo.chieu_cao_cm === null || hoSo.can_nang_kg === null || mucVanDong === null) {
      return;
    }

    // Ô cân mục tiêu vẫn đúng số đã lưu (ô chỉ hiện 1 số lẻ) thì gửi đúng số đã lưu, để server không coi là đổi cân mục tiêu
    let canMucTieuKg = docCanNang(canMucTieu, donVi, heSo);
    if (canMucTieu === vietCanMucTieuDaLuu(hoSo)) {
      canMucTieuKg = hoSo.can_muc_tieu_kg;
    }

    const hoSoGuiLen: HoSoGuiLen = {
      gioi_tinh: hoSo.gioi_tinh,
      ngay_sinh: hoSo.ngay_sinh,
      chieu_cao_cm: hoSo.chieu_cao_cm,
      can_nang_kg: hoSo.can_nang_kg,
      muc_van_dong: mucVanDong,
      muc_tieu: mucTieu,
      ma_nhom_di_ung: hoSo.nhom_di_ung_da_chon.map((nhom) => nhom.ma),
      di_ung_kieng_an: hoSo.di_ung_kieng_an,
      can_muc_tieu_kg: null,
    };
    if (mucTieu !== 'giu') {
      hoSoGuiLen.can_muc_tieu_kg = canMucTieuKg;
    }
    if (mucTieu === 'giam') {
      hoSoGuiLen.toc_do_giam_can = tocDo;
    }

    setLoiLuu('');
    setDangLuu(true);
    try {
      await luuHoSo(hoSoGuiLen);
      await taiLoTrinh();
    } catch (loiKhiLuu) {
      setLoiLuu((loiKhiLuu as Error).message);
    }
    setDangLuu(false);
  }

  return (
    <View style={styles.khung}>
      <Screen compactBottom avoidKeyboard>
        <ScreenTitle title="Lộ trình của bạn" onBack={() => router.back()} />

        {loi ? <ErrorBox message={loi} /> : null}

        <BanDangODau loTrinh={loTrinh} />

        {/* Mục tiêu và mức vận động: sửa ngay trên màn, bấm "Lưu thay đổi" ở đáy màn */}
        <ChonMucTieu
          mucTieu={mucTieu}
          duocChonGiam={hoSo.duoc_chon_giam}
          duocChonTang={hoSo.duoc_chon_tang}
          nguongGiamCan={nguongGiamCan}
          bmiLyTuong={luaChon.bmi_ly_tuong}
          canMucTieu={canMucTieu}
          donVi={donVi}
          loiCanMucTieu=""
          tocDo={tocDo}
          kgMoiThangVua={luaChon.giam_can_kg_moi_thang_thap}
          kgMoiThangNhanh={luaChon.giam_can_kg_moi_thang_cao}
          duocChonNhanh={duocChonNhanh}
          biKhoa={dangLuu}
          onChonMucTieu={chonMucTieu}
          onDoiCanMucTieu={setCanMucTieu}
          onChonTocDo={setTocDo}
        />
        <ChonMucVanDong
          mucVanDong={mucVanDong}
          duocChonNang={hoSo.duoc_chon_nang}
          tuoiKhongCoMucNang={luaChon.tuoi_khong_co_muc_nang}
          loi=""
          biKhoa={dangLuu}
          onChon={setMucVanDong}
        />

        {/* Ghi cân hôm nay; ghi xong tải lại để thấy mốc và tiến độ mới */}
        <CanHomNay canGanNhatKg={loTrinh.can_gan_nhat_kg} onDaGhi={taiLaiSauKhiGhiCan} />

        {/* Thẻ "Lộ trình" chỉ có khi giảm / tăng và đã đặt cân mục tiêu */}
        {loTrinh.tien_do !== null ? <CacMocThang loTrinh={loTrinh} /> : null}
        {/* Thẻ "Giữ cân" chỉ có khi giữ cân */}
        {loTrinh.khoang_giu !== null ? <KhoangGiuCan loTrinh={loTrinh} /> : null}
        <UuTien loTrinh={loTrinh} />
      </Screen>

      {/* Có thay đổi chưa lưu thì ghim thanh "Lưu thay đổi" và "Hủy" ở đáy màn */}
      {coThayDoi ? (
        <View style={[styles.thanhDuoi, { paddingBottom: insets.bottom + spacing.small }]}>
          {loiLuu ? <Text style={styles.chuLoi}>{loiLuu}</Text> : null}
          <Button title="Lưu thay đổi" loadingTitle="Đang lưu…" isLoading={dangLuu} onPress={luuThayDoi} />
          <Pressable style={({ pressed }) => [styles.nutHuy, pressed ? styles.dangBam : null]} disabled={dangLuu} onPress={() => huyThayDoi(hoSo)}>
            <Text style={styles.chuHuy}>Hủy</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
    backgroundColor: colors.background,
  },
  thanhDuoi: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  nutHuy: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  chuHuy: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginBottom: spacing.small,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
