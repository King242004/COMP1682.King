import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import { layThucDon, taoThucDon } from '../thuc-don/ThucDonApi';
import type { CaiDatThucDon, MonThucDon, ThucDonNgay } from '../thuc-don/ThucDonApi';
import { layTatCaMon } from '../tra-mon/TraMonApi';
import type { MonTraCuu } from '../tra-mon/TraMonApi';
import { ChiTietMon } from './ChiTietMon';
import { DanhSachDiCho } from './DanhSachDiCho';
import { CAI_DAT_MAC_DINH, TamCaiDatThucDon } from './TamCaiDatThucDon';
import { TheMonThucDon } from './TheMonThucDon';
import { TheMonVien } from './TheMonVien';

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
  const [dangMoDiCho, setDangMoDiCho] = useState(false);
  // Lựa chọn của lần tạo gần nhất, để tấm cài đặt chọn sẵn khi tạo lại (chỉ nhớ lúc app đang mở)
  const [caiDat, setCaiDat] = useState<CaiDatThucDon>(CAI_DAT_MAC_DINH);
  const [dangMoCaiDat, setDangMoCaiDat] = useState(false);
  // Món Viện đang mở chi tiết; cả bảng món tải một lần khi mở chi tiết lần đầu
  const [monDangXem, setMonDangXem] = useState<MonTraCuu | null>(null);
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [loi, setLoi] = useState('');

  // Mở phần này là tải thực đơn và nhật ký hôm nay
  useEffect(() => {
    taiDuLieu();
  }, []);

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

  // Món đã có trong nhật ký (cùng bữa, cùng tên) thì coi là đã ghi
  function laDaGhi(mon: MonThucDon): boolean {
    return monTrongNhatKy.some((buaAn) => buaAn.loai_bua === mon.loai_bua && buaAn.ten_mon === mon.ten_mon);
  }

  // Bấm "Đã ăn": ghi món vào nhật ký hôm nay, đúng bữa; món Viện ghi nguồn Viện, cơm nhà ghi nguồn AI
  async function handleDaAn(mon: MonThucDon) {
    setLoi('');
    setMonDangGhi(mon.loai_bua + mon.ten_mon);
    try {
      const buaAnMoi = await themBuaAn({
        ngay: ngay,
        loai_bua: mon.loai_bua,
        ten_mon: mon.ten_mon,
        khau_phan: mon.khau_phan,
        so_calo: mon.so_calo,
        dam_g: mon.dam_g,
        tinh_bot_g: mon.tinh_bot_g,
        beo_g: mon.beo_g,
        muoi_g: mon.muoi_g,
        duong_g: mon.duong_g,
        beo_no_g: mon.beo_no_g,
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

  // Tổng đạm, tinh bột, béo của cả thực đơn để hiện ở thẻ tổng; có món có nguyên liệu thì mới có danh sách đi chợ
  let tongDam = 0;
  let tongTinhBot = 0;
  let tongBeo = 0;
  let coNguyenLieu = false;
  if (danhSachMon !== null) {
    for (const mon of danhSachMon) {
      tongDam += mon.dam_g;
      tongTinhBot += mon.tinh_bot_g;
      tongBeo += mon.beo_g;
      if (mon.nguyen_lieu.length > 0) {
        coNguyenLieu = true;
      }
    }
  }

  return (
    <Screen header={dauMan}>
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
          {/* Thẻ tổng: ngày, calo cả thực đơn so với mục tiêu, ba chất, nút tạo lại ở góc */}
          <Card>
            <View style={styles.hangDauThe}>
              <View>
                <Text style={styles.chuNho}>{formatDateLabel(ngay)}</Text>
                <View style={styles.hangSoCalo}>
                  <Text style={styles.soCalo}>{thucDon.tong_calo.toLocaleString('vi-VN')}</Text>
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
            <View style={styles.hangBaChat}>
              <Text style={[styles.chuChat, { color: colors.protein }]}>Đạm {Math.round(tongDam)} g</Text>
              <Text style={[styles.chuChat, { color: colors.carbs }]}>Tinh bột {Math.round(tongTinhBot)} g</Text>
              <Text style={[styles.chuChat, { color: colors.fat }]}>Béo {Math.round(tongBeo)} g</Text>
            </View>
          </Card>
          <Text style={styles.chuPhu}>
            Món quán là suất Viện Dinh dưỡng đã cân; cơm nhà là AI ước tính. Có dị ứng thì hãy tự kiểm thành phần.
          </Text>

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

          {/* Có món có nguyên liệu thì có nút mở danh sách đi chợ */}
          {coNguyenLieu ? (
            <Button title="Danh sách đi chợ" loadingTitle="" isLoading={false} onPress={() => setDangMoDiCho(true)} isSecondary iconName="basket-outline" />
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
  hangBaChat: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.medium,
    marginTop: spacing.small,
  },
  chuChat: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
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
