import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, radius, shadows, spacing } from '../../shared/theme';
import type { NguonSoLieu, NhatKyNgay } from '../BuaAnApi';
import { CanhBaoNenHanChe } from './CanhBaoNenHanChe';
import type { SoNenHanChe } from './CanhBaoNenHanChe';

type TheKetQuaMonProps = {
  tenMon: string;
  khauPhan: string;
  soCalo: number | null;
  dam: number | null;
  tinhBot: number | null;
  beo: number | null;
  nguonSoLieu: NguonSoLieu;
  monNay: SoNenHanChe;
  monCu: SoNenHanChe | null;
  nhatKy: NhatKyNgay | null;
};

// Số gam để hiện: chưa có hoặc gõ sai thì gạch ngang
function vietSoGam(so: number | null): string {
  if (so === null || !Number.isFinite(so)) {
    return '—';
  }
  return `${(Math.round(so * 10) / 10).toLocaleString('vi-VN')} g`;
}

type OChatProps = {
  ten: string;
  so: number | null;
  mau: string;
};

// Một ô đạm, tinh bột hoặc béo của món
function OChat({ ten, so, mau }: OChatProps) {
  return (
    <View style={styles.oChat}>
      <Text style={[styles.soChat, { color: mau }]}>{vietSoGam(so)}</Text>
      <Text style={styles.tenChat}>{ten}</Text>
    </View>
  );
}

// Thẻ tóm tắt món đang thêm hoặc sửa: tên, khẩu phần, calo, nguồn số liệu, ba chất, muối / đường / béo no
export function TheKetQuaMon({ tenMon, khauPhan, soCalo, dam, tinhBot, beo, nguonSoLieu, monNay, monCu, nhatKy }: TheKetQuaMonProps) {
  let chuCalo = '—';
  if (soCalo !== null && Number.isFinite(soCalo)) {
    chuCalo = soCalo.toLocaleString('vi-VN');
  }

  return (
    <View style={styles.the}>
      <View style={styles.hangDau}>
        <View style={styles.cotTen}>
          <Text style={styles.tenMon}>{tenMon.trim() === '' ? 'Món mới' : tenMon.trim()}</Text>
          {khauPhan.trim() !== '' ? <Text style={styles.chuPhu}>{khauPhan.trim()}</Text> : null}
        </View>
        <View style={styles.cotCalo}>
          <Text style={styles.soCalo}>{chuCalo}</Text>
          <Text style={styles.chuPhu}>kcal</Text>
        </View>
      </View>

      {/* Nói rõ số liệu từ đâu ra khi không phải tự nhập */}
      {nguonSoLieu === 'ai' ? (
        <Text style={styles.chuNguon}>Kết quả do AI ước tính, không chính xác 100%. Bạn kiểm tra và sửa lại nếu cần.</Text>
      ) : null}
      {nguonSoLieu === 'ma_vach' ? <Text style={styles.chuNguon}>Số liệu theo nhãn sản phẩm (Open Food Facts).</Text> : null}
      {nguonSoLieu === 'vien_dinh_duong' ? <Text style={styles.chuNguon}>Số liệu theo suất Viện Dinh dưỡng đã cân.</Text> : null}

      <View style={styles.hangChat}>
        <OChat ten="Đạm" so={dam} mau={colors.protein} />
        <OChat ten="Tinh bột" so={tinhBot} mau={colors.carbs} />
        <OChat ten="Béo" so={beo} mau={colors.fat} />
      </View>

      <CanhBaoNenHanChe monNay={monNay} monCu={monCu} nhatKy={nhatKy} />
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.surface,
    ...shadows.card,
    borderRadius: radius.card,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  hangDau: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.medium,
  },
  cotTen: {
    flex: 1,
  },
  tenMon: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  cotCalo: {
    alignItems: 'flex-end',
  },
  soCalo: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.primary,
  },
  chuNguon: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  hangChat: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  oChat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.input,
    padding: spacing.small,
    alignItems: 'center',
  },
  soChat: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  tenChat: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
});
