import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Card } from '../../shared/components/Card';
import { colors, fontSizes, spacing } from '../../shared/theme';
import type { BaoCaoDinhDuong } from '../BaoCaoApi';

type BaChatProps = {
  baoCao: BaoCaoDinhDuong;
  ghiChu: string;
};

type DongChatProps = {
  mau: string;
  chu: string;
  dat: boolean | null;
};

// Một dòng chất: chấm màu, chữ, rồi ✓ khi đạt hoặc ⚠ khi ngoài khuyến nghị (chữ vàng); chưa có số thì không có dấu nào
function DongChat({ mau, chu, dat }: DongChatProps) {
  return (
    <View style={styles.dong}>
      <View style={[styles.cham, { backgroundColor: mau }]} />
      <Text style={[styles.chuDong, dat === false ? styles.chuNgoaiKhoang : null]}>{chu}</Text>
      {dat === true ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
      {dat === false ? <Ionicons name="warning-outline" size={16} color={colors.warning} /> : null}
    </View>
  );
}

// Thẻ "Đạm, tinh bột, béo": vòng chia 3 màu theo % năng lượng của từng chất, và 3 dòng so với khuyến nghị
export function BaChat({ baoCao, ghiChu }: BaChatProps) {
  const tomTat = baoCao.tom_tat;

  // Vòng tròn rộng 96, dày 16
  const kichThuoc = 96;
  const doDay = 16;
  const tam = kichThuoc / 2;
  const banKinh = (kichThuoc - doDay) / 2;
  const chuVi = 2 * Math.PI * banKinh;

  // Chưa có số chất nào thì % là null: chỉ vẽ vòng nền xám
  const phanTramDam = tomTat.phan_tram_dam ?? 0;
  const phanTramTinhBot = tomTat.phan_tram_tinh_bot ?? 0;
  const phanTramBeo = tomTat.phan_tram_beo ?? 0;

  // Mỗi cung bắt đầu ở chỗ cung trước kết thúc, tính từ đỉnh vòng (-90 độ): đạm, rồi tinh bột, rồi béo
  const gocDam = -90;
  const gocTinhBot = gocDam + (phanTramDam / 100) * 360;
  const gocBeo = gocTinhBot + (phanTramTinhBot / 100) * 360;

  // Chữ của 3 dòng; chưa có số thì ghi "—"
  let chuDam = 'Đạm —';
  let chuTinhBot = 'Tinh bột —';
  let chuBeo = 'Béo —';
  if (tomTat.phan_tram_dam !== null && tomTat.dam_g_trung_binh !== null) {
    chuDam = `Đạm ${tomTat.phan_tram_dam}% · ${tomTat.dam_g_trung_binh} g`;
  }
  if (tomTat.phan_tram_tinh_bot !== null) {
    chuTinhBot = `Tinh bột ${tomTat.phan_tram_tinh_bot}% · nên ${baoCao.ty_le_tinh_bot_thap}–${baoCao.ty_le_tinh_bot_cao}%`;
  }
  if (tomTat.phan_tram_beo !== null) {
    chuBeo = `Béo ${tomTat.phan_tram_beo}% · nên ${baoCao.ty_le_beo_thap}–${baoCao.ty_le_beo_cao}%`;
  }

  return (
    <Card>
      {/* Tiêu đề và ghi chú trung bình */}
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Đạm, tinh bột, béo</Text>
        <Text style={styles.chuNho}>{ghiChu}</Text>
      </View>

      <View style={styles.hangNoiDung}>
        {/* Vòng 3 màu: vòng nền xám, rồi 3 cung nối tiếp nhau */}
        <Svg width={kichThuoc} height={kichThuoc}>
          <Circle cx={tam} cy={tam} r={banKinh} stroke={colors.border} strokeWidth={doDay} fill="none" />
          <Circle
            cx={tam}
            cy={tam}
            r={banKinh}
            stroke={colors.protein}
            strokeWidth={doDay}
            fill="none"
            strokeDasharray={`${(chuVi * phanTramDam) / 100} ${chuVi}`}
            rotation={gocDam}
            origin={`${tam}, ${tam}`}
          />
          <Circle
            cx={tam}
            cy={tam}
            r={banKinh}
            stroke={colors.carbs}
            strokeWidth={doDay}
            fill="none"
            strokeDasharray={`${(chuVi * phanTramTinhBot) / 100} ${chuVi}`}
            rotation={gocTinhBot}
            origin={`${tam}, ${tam}`}
          />
          <Circle
            cx={tam}
            cy={tam}
            r={banKinh}
            stroke={colors.fat}
            strokeWidth={doDay}
            fill="none"
            strokeDasharray={`${(chuVi * phanTramBeo) / 100} ${chuVi}`}
            rotation={gocBeo}
            origin={`${tam}, ${tam}`}
          />
        </Svg>

        {/* 3 dòng chất */}
        <View style={styles.cotDong}>
          <DongChat mau={colors.protein} chu={chuDam} dat={tomTat.dam_dat} />
          <DongChat mau={colors.carbs} chu={chuTinhBot} dat={tomTat.tinh_bot_dat} />
          <DongChat mau={colors.fat} chu={chuBeo} dat={tomTat.beo_dat} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.medium,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  hangNoiDung: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.large,
  },
  cotDong: {
    flex: 1,
    gap: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cham: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chuDong: {
    flex: 1,
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  chuNgoaiKhoang: {
    color: colors.warningText,
  },
});
