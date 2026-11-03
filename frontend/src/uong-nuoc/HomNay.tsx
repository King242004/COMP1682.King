import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../shared/components/Button';
import { colors, fontSizes, radius, spacing } from '../shared/theme';
import type { UongNuocNgay } from './UongNuocApi';

type HomNayProps = {
  uongNuoc: UongNuocNgay;
  dangGhi: boolean;
  onThem: () => void;
  onBot: () => void;
};

// Thẻ "Hôm nay": bình nước tô theo % đã uống, số ml so với mục tiêu, nút − và + theo số ml mỗi lần ghi
export function HomNay({ uongNuoc, dangGhi, onThem, onBot }: HomNayProps) {
  // Phần nước trong bình: % đã uống so với mục tiêu, đầy thì thôi
  let phanTram = (uongNuoc.so_ml / uongNuoc.muc_tieu_ml) * 100;
  if (phanTram > 100) {
    phanTram = 100;
  }

  // Dòng dưới số ml: còn bao nhiêu, hoặc đã đủ
  const conLai = uongNuoc.muc_tieu_ml - uongNuoc.so_ml;
  let chuConLai = 'đã đủ mục tiêu';
  if (conLai > 0) {
    chuConLai = `còn ${conLai.toLocaleString('vi-VN')} ml`;
  }

  return (
    <View style={styles.the}>
      <Text style={styles.tieuDe}>Hôm nay</Text>

      {/* Bình nước và số ml */}
      <View style={styles.hangBinh}>
        <View style={styles.binh}>
          <View style={[styles.nuoc, { height: `${phanTram}%` }]} />
        </View>
        <View style={styles.cotSo}>
          <Text style={styles.soTo}>
            {uongNuoc.so_ml.toLocaleString('vi-VN')} ml <Text style={styles.chuNho}>/ {uongNuoc.muc_tieu_ml.toLocaleString('vi-VN')} ml</Text>
          </Text>
          <Text style={styles.chuConLai}>{chuConLai}</Text>
        </View>
      </View>

      {/* Nút − nhỏ và nút + lớn; − mờ khi chưa uống gì */}
      <View style={styles.hangNut}>
        <View style={styles.nutBot}>
          <Button
            title={`− ${uongNuoc.nuoc_ml_moi_lan} ml`}
            loadingTitle=""
            isLoading={false}
            isDisabled={dangGhi || uongNuoc.so_ml === 0}
            onPress={onBot}
            isSecondary
          />
        </View>
        <View style={styles.nutThem}>
          <Button title={`+ ${uongNuoc.nuoc_ml_moi_lan} ml`} loadingTitle="" isLoading={false} isDisabled={dangGhi} onPress={onThem} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.card,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  hangBinh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.large,
    marginBottom: spacing.large,
  },
  // Bình nước: khung bo tròn viền màu chính, nước tô từ đáy lên
  binh: {
    width: 56,
    height: 88,
    borderRadius: radius.input,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  nuoc: {
    backgroundColor: colors.primary,
  },
  cotSo: {
    flex: 1,
    gap: 4,
  },
  soTo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.textOnPrimaryLight,
  },
  chuNho: {
    fontSize: fontSizes.secondary,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  chuConLai: {
    fontSize: fontSizes.secondary,
    color: colors.textOnPrimaryLight,
  },
  hangNut: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  nutBot: {
    flex: 1,
  },
  nutThem: {
    flex: 2,
  },
});
