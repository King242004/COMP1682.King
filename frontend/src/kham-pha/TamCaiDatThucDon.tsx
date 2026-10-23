import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { BIEU_TUONG_BUA } from '../bua-an/TenBua';
import { Button } from '../shared/components/Button';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { BuaChinh, CaiDatThucDon, ThuTrongMam, UuTien } from '../thuc-don/ThucDonApi';
import type { NhomMon } from '../tra-mon/TraMonApi';

type TenBieuTuong = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Ghi chú dài nhất, bằng ô dị ứng trong hồ sơ; là lựa chọn giao diện
const GHI_CHU_DAI_NHAT = 200;

// Mâm cơm nhà từ 2 đến 5 món, không tính cơm; là lựa chọn giao diện
const CAC_SO_MON = [2, 3, 4, 5];

// Cài đặt khi mở tấm lần đầu: không chọn sẵn gì (không cơm gia đình, không bữa phụ, nhóm nào cũng được, không ưu tiên)
export const CAI_DAT_MAC_DINH: CaiDatThucDon = {
  bua_com_nha: [],
  so_mon_com_nha: 3,
  thu_trong_mam: [],
  co_bua_phu: false,
  nhom_mon: [],
  uu_tien: 'khong',
  ghi_chu: '',
};

// Chữ trên các ô, theo thứ tự trên tấm
const O_BUA: { giaTri: BuaChinh; nhan: string }[] = [
  { giaTri: 'sang', nhan: 'Sáng' },
  { giaTri: 'trua', nhan: 'Trưa' },
  { giaTri: 'toi', nhan: 'Tối' },
];
const O_THU_TRONG_MAM: { giaTri: ThuTrongMam; nhan: string }[] = [
  { giaTri: 'ca', nhan: 'Cá' },
  { giaTri: 'thit_heo', nhan: 'Thịt heo' },
  { giaTri: 'thit_bo', nhan: 'Thịt bò' },
  { giaTri: 'ga', nhan: 'Gà' },
  { giaTri: 'tom', nhan: 'Tôm' },
  { giaTri: 'trung', nhan: 'Trứng' },
  { giaTri: 'dau_phu', nhan: 'Đậu phụ' },
  { giaTri: 'rau', nhan: 'Rau' },
  { giaTri: 'canh', nhan: 'Canh' },
];
const O_NHOM: { giaTri: NhomMon; nhan: string; bieuTuong: TenBieuTuong; mau: string; nen: string }[] = [
  { giaTri: 'bun_pho', nhan: 'Bún, phở, miến', bieuTuong: 'noodles', mau: colors.primary, nen: colors.primaryLight },
  { giaTri: 'com_chao_xoi', nhan: 'Cơm, cháo, xôi', bieuTuong: 'rice', mau: colors.carbs, nen: colors.carbsLight },
  { giaTri: 'banh', nhan: 'Bánh', bieuTuong: 'bread-slice-outline', mau: colors.protein, nen: colors.proteinLight },
  { giaTri: 'mon_khac', nhan: 'Món khác', bieuTuong: 'dots-horizontal', mau: colors.textSecondary, nen: colors.card },
];
const O_UU_TIEN: { giaTri: UuTien; nhan: string; mauCham: string }[] = [
  { giaTri: 'giau_dam', nhan: 'Giàu đạm', mauCham: colors.protein },
  { giaTri: 'it_calo', nhan: 'Ít calo', mauCham: colors.carbs },
];

// Biểu tượng của từng thứ trong mâm (bộ MaterialCommunityIcons); tôm không có trong bộ này nên vẽ riêng
const BIEU_TUONG_THU_TRONG_MAM: Record<Exclude<ThuTrongMam, 'tom'>, TenBieuTuong> = {
  ca: 'fish',
  thit_heo: 'pig-variant-outline',
  thit_bo: 'cow',
  ga: 'food-drumstick-outline',
  trung: 'egg-outline',
  dau_phu: 'cube-outline',
  rau: 'leaf',
  canh: 'pot-steam-outline',
};

type BieuTuongThuTrongMamProps = {
  thu: ThuTrongMam;
  mau: string;
};

// Vẽ biểu tượng một thứ trong mâm; tôm lấy từ bộ FontAwesome6
function BieuTuongThuTrongMam({ thu, mau }: BieuTuongThuTrongMamProps) {
  if (thu === 'tom') {
    return <FontAwesome6 name="shrimp" size={12} color={mau} />;
  }
  return <MaterialCommunityIcons name={BIEU_TUONG_THU_TRONG_MAM[thu]} size={14} color={mau} />;
}

type TamCaiDatThucDonProps = {
  caiDatBanDau: CaiDatThucDon;
  // Đã có thực đơn: tiêu đề "Tạo thực đơn khác" và dòng báo thực đơn sẽ bị thay
  laTaoLai: boolean;
  mucTieuCalo: number | null;
  onTao: (caiDat: CaiDatThucDon) => void;
  onDong: () => void;
};

// Tấm "Tạo thực đơn hôm nay" trượt từ dưới lên (theo bản Stitch): không chọn sẵn gì, bấm lại để bỏ chọn; thân tấm cuộn được, nút "Tạo thực đơn" ghim ở đáy; bấm ✕ hoặc vùng tối thì đóng
export function TamCaiDatThucDon({ caiDatBanDau, laTaoLai, mucTieuCalo, onTao, onDong }: TamCaiDatThucDonProps) {
  const [buaComNha, setBuaComNha] = useState<BuaChinh[]>(caiDatBanDau.bua_com_nha);
  const [soMon, setSoMon] = useState(caiDatBanDau.so_mon_com_nha);
  const [thuTrongMam, setThuTrongMam] = useState<ThuTrongMam[]>(caiDatBanDau.thu_trong_mam);
  const [coBuaPhu, setCoBuaPhu] = useState(caiDatBanDau.co_bua_phu);
  const [nhomMon, setNhomMon] = useState<NhomMon[]>(caiDatBanDau.nhom_mon);
  const [uuTien, setUuTien] = useState<UuTien>(caiDatBanDau.uu_tien);
  const [ghiChu, setGhiChu] = useState(caiDatBanDau.ghi_chu);

  // Bấm một bữa: chưa chọn thì thêm, đã chọn thì bỏ (bỏ hết là không ăn cơm gia đình)
  function doiBuaComNha(bua: BuaChinh) {
    if (buaComNha.includes(bua)) {
      setBuaComNha(buaComNha.filter((buaCu) => buaCu !== bua));
    } else {
      setBuaComNha([...buaComNha, bua]);
    }
  }

  // Đổi số món: những thứ đã chọn nhiều hơn số món mới thì bỏ bớt từ cuối
  function doiSoMon(soMoi: number) {
    setSoMon(soMoi);
    setThuTrongMam(thuTrongMam.slice(0, soMoi));
  }

  // Bấm một thứ trong mâm: chưa chọn thì thêm, đã chọn thì bỏ
  function doiThuTrongMam(thu: ThuTrongMam) {
    if (thuTrongMam.includes(thu)) {
      setThuTrongMam(thuTrongMam.filter((thuCu) => thuCu !== thu));
    } else {
      setThuTrongMam([...thuTrongMam, thu]);
    }
  }

  // Bấm một nhóm món: chưa chọn thì thêm, đã chọn thì bỏ
  function doiNhomMon(nhom: NhomMon) {
    if (nhomMon.includes(nhom)) {
      setNhomMon(nhomMon.filter((nhomCu) => nhomCu !== nhom));
    } else {
      setNhomMon([...nhomMon, nhom]);
    }
  }

  // Bấm một ưu tiên: đang chọn thì bỏ (không ưu tiên), chưa chọn thì chọn
  function doiUuTien(uuTienMoi: UuTien) {
    if (uuTien === uuTienMoi) {
      setUuTien('khong');
    } else {
      setUuTien(uuTienMoi);
    }
  }

  // Bấm "Tạo thực đơn": gửi các lựa chọn cho màn thực đơn
  function handleTao() {
    onTao({
      bua_com_nha: buaComNha,
      so_mon_com_nha: soMon,
      thu_trong_mam: thuTrongMam,
      co_bua_phu: coBuaPhu,
      nhom_mon: nhomMon,
      uu_tien: uuTien,
      ghi_chu: ghiChu,
    });
  }

  const mamDaDu = thuTrongMam.length >= soMon;
  // Cả 3 bữa đều ăn cơm nhà thì không còn bữa nào ăn món Viện, câu chọn nhóm món không còn tác dụng
  const caBaBuaComNha = buaComNha.length === O_BUA.length;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDong}>
      <KeyboardAvoidingView style={styles.nenToi} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Vùng tối phía trên tấm: bấm vào thì đóng */}
        <Pressable style={styles.vungToi} onPress={onDong} />

        <View style={styles.tam}>
          {/* Đầu tấm nền trắng: thanh kéo, tiêu đề, nút ✕, dòng nhắc mục tiêu calo */}
          <View style={styles.dauTam}>
            <View style={styles.thanhKeo} />
            <View style={styles.hangTieuDe}>
              <Text style={styles.tieuDe}>{laTaoLai ? 'Tạo thực đơn khác' : 'Tạo thực đơn hôm nay'}</Text>
              <Pressable style={({ pressed }) => [styles.nutDong, pressed ? styles.dangBam : null]} hitSlop={6} onPress={onDong}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            {mucTieuCalo !== null ? (
              <Text style={styles.chuPhu}>
                Mục tiêu <Text style={styles.chuDam}>{mucTieuCalo.toLocaleString('vi-VN')} kcal</Text> mỗi ngày
              </Text>
            ) : null}
          </View>

          {/* Thân tấm nền kem, cuộn được khi mở thêm phần cơm nhà */}
          <ScrollView style={styles.thanTam} contentContainerStyle={styles.noiDung} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* 1. Bữa nào ăn cơm nhà: 3 ô lớn có biểu tượng bữa như Trang chủ */}
            <View>
              <Text style={[styles.cauHoi, styles.khoangDuoi]}>Hôm nay bạn ăn cơm nhà bữa nào?</Text>
              <View style={styles.hangBa}>
                {O_BUA.map((o) => {
                  const daChon = buaComNha.includes(o.giaTri);
                  return (
                    <Pressable
                      key={o.giaTri}
                      style={({ pressed }) => [styles.oBua, daChon ? styles.oDaChon : null, pressed ? styles.dangBam : null]}
                      onPress={() => doiBuaComNha(o.giaTri)}
                    >
                      <View style={[styles.vongBieuTuong, daChon ? styles.vongDaChon : null]}>
                        <Ionicons name={BIEU_TUONG_BUA[o.giaTri]} size={16} color={daChon ? colors.textOnPrimary : colors.textSecondary} />
                      </View>
                      <Text style={[styles.chuO, daChon ? styles.chuODaChon : null]}>{o.nhan}</Text>
                      {daChon ? (
                        <View style={styles.dauTichGoc}>
                          <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {/* Chưa chọn bữa nào thì có khối xám nhắc bỏ qua; có bữa cơm nhà thì hiện thẻ chỉnh mâm cơm */}
              {buaComNha.length === 0 ? (
                <View style={styles.oNhac}>
                  <Text style={styles.chuNhac}>Nếu hôm nay bạn không ăn cơm nhà, hãy bỏ qua</Text>
                </View>
              ) : (
                <View style={styles.theMam}>
                  {/* Mâm cơm bao nhiêu món: dải 4 ô liền 2 · 3 · 4 · 5 */}
                  <View style={[styles.hangCauHoi, styles.vienDuoi]}>
                    <View>
                      <Text style={styles.cauHoiCon}>Mâm cơm bao nhiêu món?</Text>
                      <Text style={styles.chuNho}>Không tính cơm</Text>
                    </View>
                    <View style={styles.daiSo}>
                      {CAC_SO_MON.map((so) => (
                        <Pressable
                          key={so}
                          style={({ pressed }) => [styles.oSo, soMon === so ? styles.oSoDaChon : null, pressed ? styles.dangBam : null]}
                          hitSlop={6}
                          onPress={() => doiSoMon(so)}
                        >
                          <Text style={[styles.chuSo, soMon === so ? styles.chuSoDaChon : null]}>{so}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Mâm có gì: lưới 3 cột, đủ số món thì các ô còn lại mờ */}
                  <View style={styles.hangCauHoi}>
                    <Text style={styles.cauHoiCon}>Mâm có gì?</Text>
                    <Text style={mamDaDu ? styles.nhanDaDu : styles.chuNho}>
                      {mamDaDu ? `Đã chọn đủ ${soMon}/${soMon}` : `Chọn tối đa ${soMon}`}
                    </Text>
                  </View>
                  <View style={styles.luoiBa}>
                    {O_THU_TRONG_MAM.map((o) => {
                      const daChon = thuTrongMam.includes(o.giaTri);
                      const biMo = !daChon && mamDaDu;
                      return (
                        <Pressable
                          key={o.giaTri}
                          style={({ pressed }) => [styles.oMam, daChon ? styles.oDaChon : null, biMo ? styles.biMo : null, pressed ? styles.dangBam : null]}
                          disabled={biMo}
                          onPress={() => doiThuTrongMam(o.giaTri)}
                        >
                          <View style={[styles.oBieuTuongNho, daChon ? styles.vongDaChon : null]}>
                            <BieuTuongThuTrongMam thu={o.giaTri} mau={daChon ? colors.textOnPrimary : colors.textSecondary} />
                          </View>
                          <Text style={[styles.chuMam, daChon ? styles.chuODaChon : null]}>{o.nhan}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* 2. Thêm bữa phụ: thẻ có biểu tượng cốc và công tắc */}
            <View style={styles.theBuaPhu}>
              <View style={styles.oBieuTuongVang}>
                <Ionicons name="cafe-outline" size={20} color={colors.carbs} />
              </View>
              <View style={styles.cotGiua}>
                <Text style={styles.cauHoi}>Thêm bữa phụ</Text>
                <Text style={styles.chuNho}>Chè, sữa chua, đồ uống hoặc bánh</Text>
              </View>
              <Switch value={coBuaPhu} onValueChange={setCoBuaPhu} trackColor={{ true: colors.primary, false: colors.border }} />
            </View>

            {/* 3. Các bữa còn lại thích ăn gì: 4 thẻ 2×2 có biểu tượng; cả 3 bữa là cơm nhà thì thay 4 thẻ bằng khối xám giải thích (lựa chọn cũ vẫn giữ) */}
            <View>
              <Text style={[styles.cauHoi, styles.khoangDuoi]}>Các bữa còn lại thích ăn gì?</Text>
              {caBaBuaComNha ? (
                <View style={styles.oThongBao}>
                  <Ionicons name="home-outline" size={16} color={colors.primary} />
                  <Text style={styles.chuThongBao}>Bạn đã chọn cơm nhà 3 bữa, không cần chọn phần này!</Text>
                </View>
              ) : (
                <View style={styles.luoiHai}>
                  {O_NHOM.map((o) => {
                    const daChon = nhomMon.includes(o.giaTri);
                    return (
                      <Pressable
                        key={o.giaTri}
                        style={({ pressed }) => [styles.theNhom, daChon ? styles.oDaChon : null, pressed ? styles.dangBam : null]}
                        onPress={() => doiNhomMon(o.giaTri)}
                      >
                        <View style={[styles.oBieuTuongNhom, { backgroundColor: daChon ? colors.primary : o.nen }]}>
                          <MaterialCommunityIcons name={o.bieuTuong} size={18} color={daChon ? colors.textOnPrimary : o.mau} />
                        </View>
                        <Text style={[styles.chuNhom, daChon ? styles.chuODaChon : null]}>{o.nhan}</Text>
                        {daChon ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 4. Ưu tiên: 2 ô ngang, bấm lại để bỏ */}
            <View>
              <Text style={[styles.cauHoi, styles.khoangDuoi]}>Ưu tiên</Text>
              <View style={styles.hangHai}>
                {O_UU_TIEN.map((o) => {
                  const daChon = uuTien === o.giaTri;
                  return (
                    <Pressable
                      key={o.giaTri}
                      style={({ pressed }) => [styles.oUuTien, daChon ? styles.oDaChon : null, pressed ? styles.dangBam : null]}
                      onPress={() => doiUuTien(o.giaTri)}
                    >
                      <View style={[styles.cham, { backgroundColor: o.mauCham }]} />
                      <Text style={[styles.chuO, daChon ? styles.chuODaChon : null]}>{o.nhan}</Text>
                      {daChon ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 5. Ghi chú cho AI, không bắt buộc; tiêu đề in đậm như các câu hỏi khác */}
            <View>
              <Text style={[styles.cauHoi, styles.khoangDuoi]}>
                Ghi chú cho AI <Text style={styles.chuNho}>(không bắt buộc)</Text>
              </Text>
              <TextInput
                style={styles.oGhiChu}
                value={ghiChu}
                onChangeText={setGhiChu}
                placeholder="Ví dụ: thích cá, sáng ăn nhẹ"
                placeholderTextColor={colors.textSecondary}
                maxLength={GHI_CHU_DAI_NHAT}
              />
              <Text style={[styles.chuNho, styles.khoangTren]}>AI sẽ tránh những món bạn dị ứng trong hồ sơ.</Text>
            </View>
          </ScrollView>

          {/* Đáy tấm nền trắng: tạo lại thì nhắc thực đơn sẽ bị thay; nút chính ghim ở đây */}
          <View style={styles.dayTam}>
            {laTaoLai ? <Text style={styles.chuDo}>Thực đơn hôm nay sẽ được thay bằng thực đơn mới.</Text> : null}
            <Button title="Tạo thực đơn" loadingTitle="" isLoading={false} onPress={handleTao} iconName="sparkles-outline" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nenToi: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  vungToi: {
    flex: 1,
  },
  // Tấm cao tối đa 90% màn hình; thân tấm bên trong tự cuộn
  tam: {
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    overflow: 'hidden',
  },
  dauTam: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thanhKeo: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.medium,
  },
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Tiêu đề to và màu xanh chính cho nổi
  tieuDe: {
    fontSize: fontSizes.screenTitle,
    fontWeight: '700',
    color: colors.primary,
  },
  nutDong: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuPhu: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  chuDam: {
    fontWeight: '600',
    color: colors.text,
  },
  thanTam: {
    flexGrow: 0,
  },
  noiDung: {
    padding: spacing.large,
    gap: spacing.xlarge,
  },
  hangCauHoi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  cauHoi: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.text,
  },
  cauHoiCon: {
    fontSize: fontSizes.secondary,
    fontWeight: '700',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  khoangDuoi: {
    marginBottom: spacing.small,
  },
  khoangTren: {
    marginTop: 6,
  },
  // Ô được chọn dùng chung một kiểu: viền xanh dày, nền xanh nhạt
  oDaChon: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chuODaChon: {
    color: colors.primary,
    fontWeight: '700',
  },
  biMo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  hangBa: {
    flexDirection: 'row',
    gap: 10,
  },
  oBua: {
    flex: 1,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  vongBieuTuong: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vongDaChon: {
    backgroundColor: colors.primary,
  },
  chuO: {
    fontSize: fontSizes.secondary,
    fontWeight: '500',
    color: colors.text,
  },
  dauTichGoc: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Khối xám viền gạch đứt nhắc bỏ qua khi không ăn cơm nhà
  oNhac: {
    marginTop: spacing.medium,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chuNhac: {
    fontSize: fontSizes.label,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  theMam: {
    marginTop: spacing.medium,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
    gap: spacing.small,
  },
  vienDuoi: {
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daiSo: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.input,
    backgroundColor: colors.card,
  },
  // Ô số nhìn nhỏ 32 nhưng vùng bấm nới thêm 6 mỗi bên (hitSlop) cho đủ 44; ô trong mâm cao ít nhất 44
  oSo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oSoDaChon: {
    backgroundColor: colors.primary,
  },
  chuSo: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chuSoDaChon: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  nhanDaDu: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  luoiBa: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  // 3 ô mỗi hàng giãn đều cho kín bề ngang (9 ô vừa đủ 3 hàng)
  oMam: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.small,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  oBieuTuongNho: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuMam: {
    flexShrink: 1,
    fontSize: fontSizes.label,
    color: colors.text,
  },
  theBuaPhu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  oBieuTuongVang: {
    width: 38,
    height: 38,
    borderRadius: radius.input,
    backgroundColor: colors.carbsLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cotGiua: {
    flex: 1,
    gap: 2,
  },
  luoiHai: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  // Khối báo nền trắng viền xanh, biểu tượng ngôi nhà, chữ xanh (thay 4 thẻ nhóm món khi cả 3 bữa là cơm nhà)
  oThongBao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  chuThongBao: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: fontSizes.secondary,
    color: colors.primary,
  },
  // 2 thẻ mỗi hàng giãn đều cho kín bề ngang
  theNhom: {
    flexBasis: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.medium,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  oBieuTuongNhom: {
    width: 32,
    height: 32,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chuNhom: {
    flex: 1,
    fontSize: fontSizes.secondary,
    fontWeight: '500',
    color: colors.text,
  },
  hangHai: {
    flexDirection: 'row',
    gap: 10,
  },
  oUuTien: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cham: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  oGhiChu: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  dayTam: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.medium,
    paddingBottom: spacing.xlarge,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.small,
  },
  chuDo: {
    fontSize: fontSizes.secondary,
    color: colors.errorText,
  },
});
