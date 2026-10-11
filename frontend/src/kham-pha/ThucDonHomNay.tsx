import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { layNhatKyNgay, themBuaAn } from '../bua-an/BuaAnApi';
import type { BuaAn } from '../bua-an/BuaAnApi';
import { THU_TU_BUA } from '../bua-an/TenBua';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { ErrorBox } from '../shared/components/ErrorBox';
import { todayKey } from '../shared/dateKey';
import { colors, fontSizes, spacing } from '../shared/theme';
import { layThucDon, taoThucDon } from '../thuc-don/ThucDonApi';
import type { MonThucDon, ThucDonNgay } from '../thuc-don/ThucDonApi';
import { DanhSachDiCho } from './DanhSachDiCho';
import { TheMonThucDon } from './TheMonThucDon';

// Phần "Thực đơn hôm nay" của tab Khám phá: AI lập thực đơn, bấm "Đã ăn" để ghi vào nhật ký, danh sách đi chợ
export function ThucDonHomNay() {
  // Thực đơn luôn là của hôm nay
  const ngay = todayKey();

  const [thucDon, setThucDon] = useState<ThucDonNgay | null>(null);
  // Các món đã có trong nhật ký hôm nay, để biết món nào trong thực đơn đã ghi
  const [monTrongNhatKy, setMonTrongNhatKy] = useState<BuaAn[]>([]);
  const [dangTao, setDangTao] = useState(false);
  // Món đang được ghi vào nhật ký (bữa + tên); rỗng là không ghi gì
  const [monDangGhi, setMonDangGhi] = useState('');
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

  // Bấm "Đã ăn": ghi món vào nhật ký hôm nay, đúng bữa, nguồn số liệu là AI
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
    <View>
      {loi ? <ErrorBox message={loi} onRetry={taiDuLieu} /> : null}
      {!thucDon && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {/* Chưa có thực đơn: giới thiệu và nút tạo */}
      {thucDon && danhSachMon === null ? (
        <Card>
          <Text style={styles.gioiThieu}>
            AI lập thực đơn hôm nay theo mục tiêu calo, đạm và dị ứng trong hồ sơ của bạn, ưu tiên món Việt thường ngày. Món tự nấu có cách nấu và danh sách đi chợ.
          </Text>
          <Button title="Tạo thực đơn" loadingTitle="AI đang lập thực đơn…" isLoading={dangTao} onPress={handleTao} />
        </Card>
      ) : null}

      {/* Có thực đơn: tổng calo, các món theo bữa, đi chợ, tạo lại */}
      {thucDon && danhSachMon !== null ? (
        <>
          <Text style={styles.chuPhu}>
            Tổng khoảng {thucDon.tong_calo.toLocaleString('vi-VN')}
            {thucDon.muc_tieu_calo !== null ? ` / mục tiêu ${thucDon.muc_tieu_calo.toLocaleString('vi-VN')}` : ''} kcal · số do AI ước tính
          </Text>
          <Text style={styles.chuPhu}>Có dị ứng thì hãy tự kiểm thành phần từng món; ăn ngoài thì hỏi quán.</Text>
          {danhSachMon.map((mon) => (
            <TheMonThucDon
              key={mon.loai_bua + mon.ten_mon}
              mon={mon}
              daGhi={laDaGhi(mon)}
              dangGhi={monDangGhi === mon.loai_bua + mon.ten_mon}
              khoa={monDangGhi !== '' || dangTao}
              onDaAn={() => handleDaAn(mon)}
            />
          ))}
          <DanhSachDiCho danhSachMon={danhSachMon} />
          <Button
            title="Tạo thực đơn khác"
            loadingTitle="AI đang lập thực đơn…"
            isLoading={dangTao}
            isDisabled={monDangGhi !== ''}
            isSecondary
            onPress={handleTao}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gioiThieu: {
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.large,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
});
