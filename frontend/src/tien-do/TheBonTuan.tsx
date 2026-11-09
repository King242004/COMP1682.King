import { Pressable, StyleSheet, Text, View } from 'react-native';

import { vietCanNang, vietThayDoiCanNang } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { TienDo } from './TienDoApi';

type TheBonTuanProps = {
  tienDo: TienDo;
  onHoiCoach: () => void;
};

// Thẻ "Kết quả 4 tuần": hàng calo trung bình có thanh so với mục tiêu, 2 ô số ngày ghi và cân thay đổi mỗi tháng (giảm nhanh hơn QĐ 2892 thì ô vàng)
export function TheBonTuan({ tienDo, onHoiCoach }: TheBonTuanProps) {
  const { donVi, heSo } = useDonVi();
  const tomTat = tienDo.tom_tat;
  const giamNhanhQua = tomTat.danh_gia_toc_do === 'nhanh_qua';

  // Chữ nhỏ sau số calo: có mục tiêu thì ghi kèm mục tiêu
  let chuSauSoCalo = ' kcal/ngày';
  if (tienDo.muc_tieu_calo !== null) {
    chuSauSoCalo = ` / mục tiêu ${tienDo.muc_tieu_calo.toLocaleString('vi-VN')} kcal`;
  }

  // Độ dài thanh calo: trung bình chia mục tiêu, ăn quá mục tiêu thì đầy thanh; thiếu một trong hai số thì không vẽ thanh
  let phanTramCalo: number | null = null;
  if (tomTat.calo_trung_binh !== null && tienDo.muc_tieu_calo !== null) {
    phanTramCalo = (tomTat.calo_trung_binh / tienDo.muc_tieu_calo) * 100;
    if (phanTramCalo > 100) {
      phanTramCalo = 100;
    }
  }

  // Dòng phụ của ô cân: đang giảm cân thì nhắc mức nên có
  let chuPhuCan = 'mỗi tháng';
  if (tienDo.muc_tieu === 'giam') {
    chuPhuCan = `mỗi tháng\nnên ${vietCanNang(tienDo.giam_can_kg_moi_thang_thap, donVi, heSo)}–${vietCanNang(tienDo.giam_can_kg_moi_thang_cao, donVi, heSo)}`;
  }

  return (
    <Card>
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>Kết quả {tomTat.so_ngay / 7} tuần</Text>
        <Pressable style={({ pressed }) => [styles.nutHoiCoach, pressed ? styles.dangBam : null]} onPress={onHoiCoach}>
          <Text style={styles.chuHoiCoach}>Hỏi coach ›</Text>
        </Pressable>
      </View>

      {/* Hàng calo rộng hết thẻ: nhãn bên trái, số đậm và mục tiêu bên phải, thanh ở dưới */}
      <View style={styles.oCalo}>
        <View style={styles.hangCalo}>
          <Text style={styles.nhan}>Nạp trung bình</Text>
          <Text style={styles.chuPhu}>
            <Text style={styles.soCalo}>{tomTat.calo_trung_binh === null ? '—' : tomTat.calo_trung_binh.toLocaleString('vi-VN')}</Text>
            {chuSauSoCalo}
          </Text>
        </View>
        {phanTramCalo !== null ? (
          <View style={styles.thanhNen}>
            <View style={[styles.thanhDay, { width: `${phanTramCalo}%` }]} />
          </View>
        ) : null}
      </View>

      {/* 2 ô: nhãn nhỏ ở trên, số to ở giữa, dòng phụ ở dưới */}
      <View style={styles.hangO}>
        <View style={styles.o}>
          <Text style={styles.nhan}>Số ngày ghi</Text>
          <Text style={styles.so}>
            {tomTat.so_ngay_co_ghi}/{tomTat.so_ngay}
          </Text>
        </View>
        <View style={[styles.o, giamNhanhQua ? styles.oCanhBao : null]}>
          <Text style={[styles.nhan, giamNhanhQua ? styles.chuCanhBao : null]}>Cân thay đổi</Text>
          <Text style={[styles.so, giamNhanhQua ? styles.chuCanhBao : null]}>{tomTat.thay_doi_kg_moi_thang === null ? '—' : vietThayDoiCanNang(tomTat.thay_doi_kg_moi_thang, donVi, heSo)}</Text>
          <Text style={[styles.chuPhu, giamNhanhQua ? styles.chuCanhBao : null]}>{chuPhuCan}</Text>
        </View>
      </View>

      {/* Dòng xám cuối thẻ: calo trung bình chỉ tính ngày có ghi món */}
      <Text style={styles.chuThich}>Trung bình chỉ tính những ngày có ghi món.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  nutHoiCoach: {
    minHeight: 44,
    justifyContent: 'center',
  },
  chuHoiCoach: {
    fontSize: fontSizes.body,
    color: colors.primary,
  },
  oCalo: {
    backgroundColor: colors.card,
    borderRadius: radius.input,
    padding: spacing.small,
    marginBottom: spacing.small,
  },
  hangCalo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.small,
  },
  soCalo: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  thanhNen: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginTop: spacing.small,
  },
  thanhDay: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  hangO: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  o: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.input,
    padding: spacing.small,
    gap: 2,
  },
  oCanhBao: {
    backgroundColor: colors.warningBackground,
  },
  nhan: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  so: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  chuCanhBao: {
    color: colors.warningText,
  },
  chuThich: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
