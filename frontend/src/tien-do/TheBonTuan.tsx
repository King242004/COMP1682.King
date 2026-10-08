import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../shared/theme';
import type { TienDo } from './TienDoApi';

type TheBonTuanProps = {
  tienDo: TienDo;
  onHoiCoach: () => void;
};

// Số kg thay đổi có dấu, ví dụ "−1 kg", "+0,4 kg"; chưa đủ dữ liệu thì "—"
function vietThayDoi(soKg: number | null): string {
  if (soKg === null) {
    return '—';
  }
  const soDuong = Math.abs(soKg).toLocaleString('vi-VN');
  if (soKg < 0) {
    return `−${soDuong} kg`;
  }
  if (soKg > 0) {
    return `+${soDuong} kg`;
  }
  return '0 kg';
}

// Thẻ "4 tuần qua": calo trung bình, số ngày có ghi, cân thay đổi mỗi tháng (giảm nhanh hơn QĐ 2892 thì ô vàng)
export function TheBonTuan({ tienDo, onHoiCoach }: TheBonTuanProps) {
  const tomTat = tienDo.tom_tat;
  const giamNhanhQua = tomTat.danh_gia_toc_do === 'nhanh_qua';

  // Dòng phụ của ô calo: có mục tiêu thì ghi kèm
  let chuPhuCalo = 'kcal/ngày';
  if (tienDo.muc_tieu_calo !== null) {
    chuPhuCalo = `kcal/ngày\nmục tiêu ${tienDo.muc_tieu_calo.toLocaleString('vi-VN')}`;
  }

  // Dòng phụ của ô cân: đang giảm cân thì nhắc mức nên có
  let chuPhuCan = 'mỗi tháng';
  if (tienDo.muc_tieu === 'giam') {
    chuPhuCan = `mỗi tháng\nnên ${tienDo.giam_can_kg_moi_thang_thap}–${tienDo.giam_can_kg_moi_thang_cao} kg`;
  }

  return (
    <View>
      <View style={styles.hangTieuDe}>
        <Text style={styles.tieuDe}>{tomTat.so_ngay / 7} tuần qua</Text>
        <Pressable style={styles.nutHoiCoach} onPress={onHoiCoach}>
          <Text style={styles.chuHoiCoach}>Hỏi coach ›</Text>
        </Pressable>
      </View>
      <View style={styles.hangO}>
        <View style={styles.o}>
          <Text style={styles.so}>{tomTat.calo_trung_binh === null ? '—' : tomTat.calo_trung_binh.toLocaleString('vi-VN')}</Text>
          <Text style={styles.chuPhu}>{chuPhuCalo}</Text>
        </View>
        <View style={styles.o}>
          <Text style={styles.so}>
            {tomTat.so_ngay_co_ghi}/{tomTat.so_ngay}
          </Text>
          <Text style={styles.chuPhu}>{'ngày\ncó ghi'}</Text>
        </View>
        <View style={[styles.o, giamNhanhQua ? styles.oCanhBao : null]}>
          <Text style={[styles.so, giamNhanhQua ? styles.chuCanhBao : null]}>{vietThayDoi(tomTat.thay_doi_kg_moi_thang)}</Text>
          <Text style={[styles.chuPhu, giamNhanhQua ? styles.chuCanhBao : null]}>{chuPhuCan}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tieuDe: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nutHoiCoach: {
    minHeight: 44,
    justifyContent: 'center',
  },
  chuHoiCoach: {
    fontSize: 14,
    color: colors.primary,
  },
  hangO: {
    flexDirection: 'row',
    gap: 8,
  },
  o: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  oCanhBao: {
    backgroundColor: colors.warningBackground,
  },
  so: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chuCanhBao: {
    color: colors.warningText,
  },
});
