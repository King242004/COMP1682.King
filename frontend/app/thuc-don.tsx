import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layNhatKyNgay, themBuaAn } from '../src/bua-an/BuaAnApi';
import type { BuaAn } from '../src/bua-an/BuaAnApi';
import { THU_TU_BUA } from '../src/bua-an/TenBua';
import { Button } from '../src/shared/components/Button';
import { ErrorBox } from '../src/shared/components/ErrorBox';
import { formatDateLabel, todayKey } from '../src/shared/dateKey';
import { colors } from '../src/shared/theme';
import { DanhSachDiCho } from '../src/thuc-don/DanhSachDiCho';
import { TheMonThucDon } from '../src/thuc-don/TheMonThucDon';
import { layThucDon, taoThucDon } from '../src/thuc-don/ThucDonApi';
import type { MonThucDon, ThucDonNgay } from '../src/thuc-don/ThucDonApi';

export default function ManThucDon() {
  // Ngày lấy từ trang chủ (ngày đang xem); không có thì là hôm nay
  const thamSo = useLocalSearchParams<{ ngay?: string }>();
  const ngay = thamSo.ngay ?? todayKey();

  const [thucDon, setThucDon] = useState<ThucDonNgay | null>(null);
  // Các món đã có trong nhật ký ngày đó, để biết món nào trong thực đơn đã ghi
  const [monTrongNhatKy, setMonTrongNhatKy] = useState<BuaAn[]>([]);
  const [dangTao, setDangTao] = useState(false);
  // Món đang được ghi vào nhật ký (bữa + tên); rỗng là không ghi gì
  const [monDangGhi, setMonDangGhi] = useState('');
  const [loi, setLoi] = useState('');

  // Mở màn là tải thực đơn và nhật ký của ngày đó
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

  // Nhờ AI tạo (hoặc tạo lại) thực đơn
  async function handleTao() {
    setLoi('');
    setDangTao(true);
    try {
      setThucDon(await taoThucDon(ngay));
    } catch (loiTao) {
      setLoi((loiTao as Error).message);
    }
    setDangTao(false);
  }

  // Món đã có trong nhật ký (cùng bữa, cùng tên) thì coi là đã ghi
  function laDaGhi(mon: MonThucDon): boolean {
    return monTrongNhatKy.some((buaAn) => buaAn.loai_bua === mon.loai_bua && buaAn.ten_mon === mon.ten_mon);
  }

  // Bấm "Đã ăn": ghi món vào nhật ký đúng ngày, đúng bữa, nguồn số liệu là AI
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
        nguon_so_lieu: 'ai',
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

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tiêu đề và ngày */}
        <Text style={styles.tieuDe}>Thực đơn</Text>
        <Text style={styles.chuPhu}>{formatDateLabel(ngay)}</Text>

        {loi ? <ErrorBox message={loi} onRetry={taiDuLieu} /> : null}
        {!thucDon && !loi ? <ActivityIndicator color={colors.primary} /> : null}

        {/* Chưa có thực đơn: giới thiệu và nút tạo */}
        {thucDon && danhSachMon === null ? (
          <View style={styles.khoiTao}>
            <Text style={styles.gioiThieu}>
              AI lập thực đơn 1 ngày theo mục tiêu calo, đạm và dị ứng trong hồ sơ của bạn, ưu tiên món Việt thường ngày. Món tự nấu có cách nấu và danh sách đi chợ.
            </Text>
            <Button title="Tạo thực đơn" loadingTitle="AI đang lập thực đơn…" isLoading={dangTao} onPress={handleTao} />
          </View>
        ) : null}

        {/* Có thực đơn: tổng calo, các món theo bữa, đi chợ, tạo lại */}
        {thucDon && danhSachMon !== null ? (
          <>
            <Text style={styles.tongCalo}>
              Tổng khoảng {thucDon.tong_calo.toLocaleString('vi-VN')}
              {thucDon.muc_tieu_calo !== null ? ` / mục tiêu ${thucDon.muc_tieu_calo.toLocaleString('vi-VN')}` : ''} kcal · số do AI ước tính
            </Text>
            <Text style={styles.nhacDiUng}>Có dị ứng thì hãy tự kiểm thành phần từng món; ăn ngoài thì hỏi quán.</Text>
            {danhSachMon.map((mon) => (
              <TheMonThucDon
                key={mon.loai_bua + mon.ten_mon}
                mon={mon}
                daGhi={laDaGhi(mon)}
                dangGhi={monDangGhi === mon.loai_bua + mon.ten_mon}
                onDaAn={() => handleDaAn(mon)}
              />
            ))}
            <DanhSachDiCho danhSachMon={danhSachMon} />
            <View style={styles.khoiTaoLai}>
              <Button title="Tạo thực đơn khác" loadingTitle="AI đang lập thực đơn…" isLoading={dangTao} isSecondary onPress={handleTao} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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
  tieuDe: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  khoiTao: {
    gap: 16,
  },
  gioiThieu: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  tongCalo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nhacDiUng: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  khoiTaoLai: {
    marginTop: 16,
  },
});
