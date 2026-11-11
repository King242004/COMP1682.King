import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { layNhatKyNgay, themBuaAn } from '../bua-an/BuaAnApi';
import type { BuaAn } from '../bua-an/BuaAnApi';
import { BIEU_TUONG_BUA, MAU_BUA, TEN_BUA, THU_TU_BUA } from '../bua-an/TenBua';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { ErrorBox } from '../shared/components/ErrorBox';
import { Screen } from '../shared/components/Screen';
import { formatDateLabel, todayKey } from '../shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import { layThucDon, taoThucDon } from '../thuc-don/ThucDonApi';
import type { CaiDatThucDon, MonThucDon, ThucDonNgay } from '../thuc-don/ThucDonApi';
import { layTatCaMon } from '../tra-mon/TraMonApi';
import type { MonTraCuu } from '../tra-mon/TraMonApi';
import { ChiTietMon } from './ChiTietMon';
import { DanhSachDiCho } from './DanhSachDiCho';
import { CAI_DAT_MAC_DINH, TamCaiDatThucDon } from './TamCaiDatThucDon';
import { TheMonThucDon } from './TheMonThucDon';
import { TheMonVien } from './TheMonVien';

// Nhân số gam của 1 suất theo số suất, làm tròn 1 số lẻ; chất chưa có số thì giữ null
function nhanTheoSuat(soGam: number | null, soSuat: number): number | null {
  if (soGam === null) {
    return null;
  }
  return Math.round(soGam * soSuat * 10) / 10;
}

type ThucDonHomNayProps = {
  // 2 tab của Khám phá, đứng yên trên cùng
  dauMan: ReactNode;
};

// Phần "Thực đơn hôm nay" của tab Khám phá: cài đặt rồi nhờ AI lập thực đơn (món Viện đã cân, mâm cơm nhà), bấm "Đã ăn" để ghi vào nhật ký, danh sách đi chợ
export function ThucDonHomNay({ dauMan }: ThucDonHomNayProps) {
  // Thực đơn luôn là của hôm nay
  const ngay = todayKey();

  const [thucDon, setThucDon] = useState<ThucDonNgay | null>(null);
  // Các món đã có trong nhật ký hôm nay, để biết món nào trong thực đơn đã ghi
  const [monTrongNhatKy, setMonTrongNhatKy] = useState<BuaAn[]>([]);
  const [dangTao, setDangTao] = useState(false);
  // Món đang được ghi vào nhật ký (bữa + tên); rỗng là không ghi gì
  const [monDangGhi, setMonDangGhi] = useState('');
  // Số suất người dùng tự bấm cho từng món (bữa + tên); món chưa bấm là 1 suất. Chỉ nhớ lúc app đang mở
  const [soSuatTuChon, setSoSuatTuChon] = useState<Record<string, number>>({});
  const [dangMoDiCho, setDangMoDiCho] = useState(false);
  // Lựa chọn của lần tạo gần nhất, để tấm cài đặt chọn sẵn khi tạo lại (chỉ nhớ lúc app đang mở)
  const [caiDat, setCaiDat] = useState<CaiDatThucDon>(CAI_DAT_MAC_DINH);
  const [dangMoCaiDat, setDangMoCaiDat] = useState(false);
  // Món Viện đang mở chi tiết; cả bảng món tải một lần khi mở chi tiết lần đầu
  const [monDangXem, setMonDangXem] = useState<MonTraCuu | null>(null);
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [loi, setLoi] = useState('');

  // Mỗi lần mở phần này (kể cả quay lại tab sau khi sửa nhật ký ở Trang chủ) thì tải thực đơn và nhật ký hôm nay
  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, []),
  );

  async function taiDuLieu() {
    setLoi('');
    try {
      setThucDon(await layThucDon(ngay));
      const nhatKy = await layNhatKyNgay(ngay);
      setMonTrongNhatKy(nhatKy.bua_an);
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Bấm "Tạo thực đơn" trong tấm cài đặt: đóng tấm, nhớ lựa chọn, nhờ AI tạo (hoặc tạo lại) thực đơn
  async function handleTao(caiDatMoi: CaiDatThucDon) {
    setDangMoCaiDat(false);
    setCaiDat(caiDatMoi);
    setLoi('');
    setDangTao(true);
    try {
      setThucDon(await taoThucDon(ngay, caiDatMoi));
      setSoSuatTuChon({});
    } catch (loiTao) {
      setLoi((loiTao as Error).message);
    }
    setDangTao(false);
  }

  // Bấm một món Viện: tìm món trong bảng món (tải lần đầu) rồi mở chi tiết
  async function moChiTiet(mon: MonThucDon) {
    setLoi('');
    try {
      let danhSach = tatCaMon;
      if (danhSach === null) {
        danhSach = await layTatCaMon();
        setTatCaMon(danhSach);
      }
      const monTimThay = danhSach.find((monTrongBang) => monTrongBang.ma_so === mon.ma_so);
      if (monTimThay !== undefined) {
        setMonDangXem(monTimThay);
      }
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Bấm "Hỏi Coach cách nấu": đóng chi tiết, sang tab Coach với câu hỏi điền sẵn
  function hoiCoachCachNau(mon: MonTraCuu) {
    setMonDangXem(null);
    router.push({
      pathname: '/(tabs)/TuVan',
      params: { cauHoi: `Gợi ý cho mình một cách nấu món "${mon.ten_mon}" ở nhà theo hướng tốt cho sức khỏe nhé.` },
    });
  }

  // Số suất đang chọn của một món: người dùng đã bấm thì lấy số đó, chưa bấm thì 1 suất
  function laySoSuat(mon: MonThucDon): number {
    return soSuatTuChon[mon.loai_bua + mon.ten_mon] ?? 1;
  }

  // Bấm chip ½ · 1 · 2 trên thẻ món: nhớ số suất mới của món đó
  function doiSoSuat(mon: MonThucDon, soSuatMoi: number) {
    setSoSuatTuChon({ ...soSuatTuChon, [mon.loai_bua + mon.ten_mon]: soSuatMoi });
  }

  // Món đã có trong nhật ký (cùng bữa, cùng tên) thì coi là đã ghi
  function laDaGhi(mon: MonThucDon): boolean {
    return monTrongNhatKy.some((buaAn) => buaAn.loai_bua === mon.loai_bua && buaAn.ten_mon === mon.ten_mon);
  }

  // Bấm "Đã ăn": ghi món vào nhật ký hôm nay, đúng bữa, số liệu nhân theo số suất đang chọn; món Viện ghi nguồn Viện, cơm nhà ghi nguồn AI
  async function handleDaAn(mon: MonThucDon) {
    // Món Viện ghi khẩu phần "2 suất"; cơm nhà giữ các món trong mâm
    const soSuat = laySoSuat(mon);
    let khauPhan = mon.khau_phan;
    if (mon.kieu === 'mon_vien') {
      let chuSuat = String(soSuat);
      if (soSuat === 0.5) {
        chuSuat = '½';
      }
      khauPhan = `${chuSuat} suất`;
    }

    setLoi('');
    setMonDangGhi(mon.loai_bua + mon.ten_mon);
    try {
      const buaAnMoi = await themBuaAn({
        ngay: ngay,
        loai_bua: mon.loai_bua,
        ten_mon: mon.ten_mon,
        khau_phan: khauPhan,
        so_calo: Math.round(mon.so_calo * soSuat),
        dam_g: nhanTheoSuat(mon.dam_g, soSuat),
        tinh_bot_g: nhanTheoSuat(mon.tinh_bot_g, soSuat),
        beo_g: nhanTheoSuat(mon.beo_g, soSuat),
        muoi_g: nhanTheoSuat(mon.muoi_g, soSuat),
        duong_g: nhanTheoSuat(mon.duong_g, soSuat),
        beo_no_g: nhanTheoSuat(mon.beo_no_g, soSuat),
        nguon_so_lieu: mon.kieu === 'mon_vien' ? 'vien_dinh_duong' : 'ai',
      });
      setMonTrongNhatKy([...monTrongNhatKy, buaAnMoi]);
    } catch (loiGhi) {
      setLoi((loiGhi as Error).message);
    }
    setMonDangGhi('');
  }

  // Xếp món theo thứ tự bữa trong ngày: sáng, trưa, tối, phụ
  let danhSachMon: MonThucDon[] | null = null;
  if (thucDon !== null && thucDon.mon !== null) {
    danhSachMon = [...thucDon.mon].sort(
      (monTruoc, monSau) => THU_TU_BUA.indexOf(monTruoc.loai_bua) - THU_TU_BUA.indexOf(monSau.loai_bua),
    );
  }

  // Tổng calo, đạm, tinh bột, béo của cả thực đơn theo số suất đang chọn để hiện ở thẻ tổng; gom nguyên liệu (dòng giống hệt chỉ tính một lần) cho thẻ đi chợ
  let tongCalo = 0;
  let tongDam = 0;
  let tongTinhBot = 0;
  let tongBeo = 0;
  const cacNguyenLieu: string[] = [];
  if (danhSachMon !== null) {
    for (const mon of danhSachMon) {
      const soSuat = laySoSuat(mon);
      tongCalo += Math.round(mon.so_calo * soSuat);
      tongDam += mon.dam_g * soSuat;
      tongTinhBot += mon.tinh_bot_g * soSuat;
      tongBeo += mon.beo_g * soSuat;
      for (const nguyenLieu of mon.nguyen_lieu) {
        if (!cacNguyenLieu.includes(nguyenLieu)) {
          cacNguyenLieu.push(nguyenLieu);
        }
      }
    }
  }

  // Thanh ở thẻ tổng dài theo % calo cả thực đơn so với mục tiêu, đầy thì thôi
  let phanTramCalo = 0;
  if (thucDon !== null && thucDon.muc_tieu_calo !== null) {
    phanTramCalo = (tongCalo / thucDon.muc_tieu_calo) * 100;
    if (phanTramCalo > 100) {
      phanTramCalo = 100;
    }
  }

  return (
    <Screen header={dauMan} compactBottom>
      {loi ? <ErrorBox message={loi} onRetry={taiDuLieu} /> : null}
      {!thucDon && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {/* Chưa có thực đơn: biểu tượng, tiêu đề, giới thiệu, 3 dòng "sẽ có gì", nút tạo; đang tạo thì báo thời gian chờ */}
      {thucDon && danhSachMon === null ? (
        <Card>
          <View style={styles.vongBieuTuong}>
            <Ionicons name="restaurant-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.tieuDeTrong}>Chưa có thực đơn hôm nay</Text>
          <Text style={styles.chuGioiThieu}>AI chọn món theo mục tiêu calo và dị ứng trong hồ sơ của bạn.</Text>
          <View style={styles.dongSeCo}>
            <Ionicons name="restaurant-outline" size={16} color={colors.primary} />
            <Text style={styles.chuSeCo}>Món quán: số Viện Dinh dưỡng đã cân</Text>
          </View>
          <View style={styles.dongSeCo}>
            <Ionicons name="home-outline" size={16} color={colors.primary} />
            <Text style={styles.chuSeCo}>Cơm nhà theo số món bạn chọn</Text>
          </View>
          <View style={styles.dongSeCo}>
            <Ionicons name="basket-outline" size={16} color={colors.primary} />
            <Text style={styles.chuSeCo}>Có danh sách đi chợ cho cơm nhà</Text>
          </View>
          <View style={styles.khoangNut}>
            <Button
              title="Tạo thực đơn"
              loadingTitle="AI đang lập thực đơn…"
              isLoading={dangTao}
              onPress={() => setDangMoCaiDat(true)}
              iconName="sparkles-outline"
            />
          </View>
          {dangTao ? <Text style={styles.chuCho}>Thường mất dưới 20 giây, chờ tối đa 30 giây.</Text> : null}
        </Card>
      ) : null}

      {/* Có thực đơn: thẻ tổng, lời nhắc, các món, đi chợ */}
      {thucDon && danhSachMon !== null ? (
        <>
          {/* Thẻ tổng: ngày, calo cả thực đơn so với mục tiêu, thanh calo, ba ô chất, nút tạo lại ở góc */}
          <Card>
            <View style={styles.hangDauThe}>
              <View>
                <Text style={styles.chuNho}>{formatDateLabel(ngay)}</Text>
                <View style={styles.hangSoCalo}>
                  <Text style={styles.soCalo}>{tongCalo.toLocaleString('vi-VN')}</Text>
                  <Text style={styles.chuNho}>
                    {thucDon.muc_tieu_calo !== null ? `/ mục tiêu ${thucDon.muc_tieu_calo.toLocaleString('vi-VN')} kcal` : 'kcal'}
                  </Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [styles.nutTaoLai, dangTao || monDangGhi !== '' ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
                disabled={dangTao || monDangGhi !== ''}
                onPress={() => setDangMoCaiDat(true)}
              >
                <Ionicons name="refresh" size={14} color={colors.textOnPrimaryLight} />
                <Text style={styles.chuTaoLai}>{dangTao ? 'Đang tạo…' : 'Tạo lại'}</Text>
              </Pressable>
            </View>
            {/* Thanh calo so với mục tiêu; không có mục tiêu thì không có thanh */}
            {thucDon.muc_tieu_calo !== null ? (
              <View style={styles.thanhNen}>
                <View style={[styles.thanhDay, { width: `${phanTramCalo}%` }]} />
              </View>
            ) : null}
            {/* Ba ô đạm, tinh bột, béo nền nhạt theo màu từng chất: tên chất ở trên, số gam ở dưới */}
            <View style={styles.hangBaChat}>
              <View style={[styles.oChat, { backgroundColor: colors.proteinLight }]}>
                <Text style={[styles.tenChat, { color: colors.protein }]}>Đạm</Text>
                <Text style={[styles.soChat, { color: colors.protein }]}>{Math.round(tongDam)} g</Text>
              </View>
              <View style={[styles.oChat, { backgroundColor: colors.carbsLight }]}>
                <Text style={[styles.tenChat, { color: colors.carbs }]}>Tinh bột</Text>
                <Text style={[styles.soChat, { color: colors.carbs }]}>{Math.round(tongTinhBot)} g</Text>
              </View>
              <View style={[styles.oChat, { backgroundColor: colors.fatLight }]}>
                <Text style={[styles.tenChat, { color: colors.fat }]}>Béo</Text>
                <Text style={[styles.soChat, { color: colors.fat }]}>{Math.round(tongBeo)} g</Text>
              </View>
            </View>
          </Card>

          {/* Món chia theo bữa: tiêu đề bữa (biểu tượng màu và tên bữa), món nằm dưới; bữa không có món thì không hiện */}
          {THU_TU_BUA.map((loaiBua) => {
            const monCuaBua = danhSachMon.filter((mon) => mon.loai_bua === loaiBua);
            if (monCuaBua.length === 0) {
              return null;
            }
            return (
              <View key={loaiBua}>
                <View style={styles.tieuDeBua}>
                  <Ionicons name={BIEU_TUONG_BUA[loaiBua]} size={18} color={MAU_BUA[loaiBua].mau} />
                  <Text style={styles.chuTieuDeBua}>{TEN_BUA[loaiBua]}</Text>
                </View>
                {/* Món Viện thì thẻ có ảnh, bấm mở chi tiết; cơm nhà (và thực đơn cũ) thì thẻ AI ước tính có nút 📖 */}
                {monCuaBua.map((mon) =>
                  mon.kieu === 'mon_vien' ? (
                    <TheMonVien
                      key={mon.loai_bua + mon.ten_mon}
                      mon={mon}
                      soSuat={laySoSuat(mon)}
                      onDoiSoSuat={(soSuatMoi) => doiSoSuat(mon, soSuatMoi)}
                      daGhi={laDaGhi(mon)}
                      dangGhi={monDangGhi === mon.loai_bua + mon.ten_mon}
                      khoa={monDangGhi !== '' || dangTao}
                      onDaAn={() => handleDaAn(mon)}
                      onXemChiTiet={() => moChiTiet(mon)}
                    />
                  ) : (
                    <TheMonThucDon
                      key={mon.loai_bua + mon.ten_mon}
                      mon={mon}
                      daGhi={laDaGhi(mon)}
                      dangGhi={monDangGhi === mon.loai_bua + mon.ten_mon}
                      khoa={monDangGhi !== '' || dangTao}
                      onDaAn={() => handleDaAn(mon)}
                    />
                  ),
                )}
              </View>
            );
          })}

          {/* Có nguyên liệu thì có thẻ mở danh sách đi chợ: giỏ trong vòng tròn xanh nhạt, tên, số nguyên liệu, mũi tên */}
          {cacNguyenLieu.length > 0 ? (
            <Pressable style={({ pressed }) => [styles.theDiCho, pressed ? styles.dangBam : null]} onPress={() => setDangMoDiCho(true)}>
              <View style={styles.vongDiCho}>
                <Ionicons name="basket-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.cotDiCho}>
                <Text style={styles.tenDiCho}>Danh sách đi chợ</Text>
                <Text style={styles.chuPhuDiCho}>{cacNguyenLieu.length} nguyên liệu cho bữa cơm nhà</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          {dangMoDiCho ? <DanhSachDiCho danhSachMon={danhSachMon} onDong={() => setDangMoDiCho(false)} /> : null}
        </>
      ) : null}

      {/* Tấm cài đặt trước khi tạo; đã có thực đơn thì là tạo lại */}
      {dangMoCaiDat && thucDon ? (
        <TamCaiDatThucDon
          caiDatBanDau={caiDat}
          laTaoLai={danhSachMon !== null}
          mucTieuCalo={thucDon.muc_tieu_calo}
          onTao={handleTao}
          onDong={() => setDangMoCaiDat(false)}
        />
      ) : null}

      {/* Chi tiết món Viện, nút dưới cùng hỏi Coach cách nấu */}
      {monDangXem ? (
        <ChiTietMon
          mon={monDangXem}
          onDong={() => setMonDangXem(null)}
          tenNut="Hỏi Coach cách nấu"
          bieuTuongNut="chatbubble-ellipses-outline"
          onBamNut={() => hoiCoachCachNau(monDangXem)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  vongBieuTuong: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.medium,
  },
  tieuDeTrong: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  chuGioiThieu: {
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
    marginBottom: spacing.medium,
  },
  dongSeCo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  chuSeCo: {
    flex: 1,
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  khoangNut: {
    marginTop: spacing.small,
  },
  chuCho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  hangDauThe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hangSoCalo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  nutTaoLai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: spacing.small,
    borderRadius: radius.input,
    backgroundColor: colors.primaryLight,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuTaoLai: {
    fontSize: fontSizes.secondary,
    color: colors.textOnPrimaryLight,
  },
  thanhNen: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.medium,
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  hangBaChat: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  // Thẻ trắng bấm được mở danh sách đi chợ
  theDiCho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
    borderRadius: radius.card,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  vongDiCho: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cotDiCho: {
    flex: 1,
    gap: 2,
  },
  tenDiCho: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhuDiCho: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.small,
  },
  tenChat: {
    fontSize: fontSizes.label,
  },
  soChat: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  tieuDeBua: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginTop: spacing.small,
    marginBottom: spacing.small,
  },
  chuTieuDeBua: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
});
