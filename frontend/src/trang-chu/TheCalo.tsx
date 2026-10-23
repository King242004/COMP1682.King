import { StyleSheet, Text, View } from 'react-native';

import { VongTienDo } from '../shared/components/VongTienDo';
import { colors, fontSizes, radius, shadows, spacing } from '../shared/theme';
import type { NhatKyNgay } from '../bua-an/BuaAnApi';

type VongChatProps = {
  ten: string;
  mau: string;
  mauNen: string;
  daAn: number;
  mucDay: number;
  chuMucTieu: string;
};

// Một ô nền nhạt cho đạm, tinh bột hoặc béo: số gam nằm giữa vòng, vòng đầy khi ăn tới mucDay, dưới vòng ghi tên chất và mục tiêu
function VongChat({ ten, mau, mauNen, daAn, mucDay, chuMucTieu }: VongChatProps) {
  // Làm tròn số gam một lần, vòng và chữ dùng chung số này (0,2 g thành 0, vòng không hiện chấm)
  const daAnLamTron = Math.round(daAn);
  let phanTram = 0;
  if (mucDay > 0) {
    phanTram = (daAnLamTron / mucDay) * 100;
  }
  return (
    <View style={[styles.oChat, { backgroundColor: mauNen }]}>
      <VongTienDo kichThuoc={56} doDay={6} phanTram={phanTram} mau={mau}>
        <Text style={[styles.soGam, { color: mau }]}>{daAnLamTron.toLocaleString('vi-VN')} g</Text>
      </VongTienDo>
      <Text style={styles.tenChat}>{ten}</Text>
      <Text style={styles.khoang}>{chuMucTieu}</Text>
    </View>
  );
}

// Thẻ calo trên trang chủ (nền xanh, chữ trắng): vòng lớn với số còn lại (hoặc đã vượt), đã ăn / mục tiêu, ba ô chất
export function TheCalo({ nhatKy }: { nhatKy: NhatKyNgay }) {
  const tongHop = nhatKy.tong_hop;
  const mucTieu = nhatKy.muc_tieu_calo ?? 0;
  const daVuot = tongHop.con_lai !== null && tongHop.con_lai < 0;

  let phanTramDaAn = 0;
  if (mucTieu > 0) {
    phanTramDaAn = (tongHop.tong_calo / mucTieu) * 100;
  }

  return (
    <View style={styles.the}>
      <View style={styles.hangTren}>
        <VongTienDo
          kichThuoc={132}
          doDay={12}
          phanTram={phanTramDaAn}
          mau={daVuot ? colors.overOnPrimary : colors.textOnPrimary}
          mauNen={colors.trackOnPrimary}
        >
          <Text style={[styles.soConLai, daVuot ? styles.chuVuot : null]}>
            {Math.abs(tongHop.con_lai ?? 0).toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.nhanConLai}>{daVuot ? 'kcal đã vượt' : 'kcal còn lại'}</Text>
        </VongTienDo>

        <View style={styles.cotSo}>
          <View style={styles.dongSo}>
            <Text style={styles.nhan}>Đã ăn</Text>
            <Text style={styles.giaTri}>
              {tongHop.tong_calo.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
            </Text>
          </View>
          <View style={styles.dongSo}>
            <Text style={styles.nhan}>Mục tiêu</Text>
            <Text style={styles.giaTri}>
              {mucTieu.toLocaleString('vi-VN')} <Text style={styles.donVi}>kcal</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Ba vòng: đạm đầy khi ăn đủ mức tối thiểu; tinh bột, béo đầy khi chạm mức cao của khoảng nên ăn */}
      {nhatKy.muc_tieu_chat ? (
        <View style={styles.hangChat}>
          <VongChat
            ten="Đạm"
            mau={colors.protein}
            mauNen={colors.proteinLight}
            daAn={tongHop.tong_dam_g}
            mucDay={nhatKy.muc_tieu_chat.dam_g_toi_thieu}
            chuMucTieu={`ít nhất ${nhatKy.muc_tieu_chat.dam_g_toi_thieu.toLocaleString('vi-VN')} g`}
          />
          <VongChat
            ten="Tinh bột"
            mau={colors.carbs}
            mauNen={colors.carbsLight}
            daAn={tongHop.tong_tinh_bot_g}
            mucDay={nhatKy.muc_tieu_chat.tinh_bot_g_cao}
            chuMucTieu={`${nhatKy.muc_tieu_chat.tinh_bot_g_thap.toLocaleString('vi-VN')}–${nhatKy.muc_tieu_chat.tinh_bot_g_cao.toLocaleString('vi-VN')} g`}
          />
          <VongChat
            ten="Béo"
            mau={colors.fat}
            mauNen={colors.fatLight}
            daAn={tongHop.tong_beo_g}
            mucDay={nhatKy.muc_tieu_chat.beo_g_cao}
            chuMucTieu={`${nhatKy.muc_tieu_chat.beo_g_thap.toLocaleString('vi-VN')}–${nhatKy.muc_tieu_chat.beo_g_cao.toLocaleString('vi-VN')} g`}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: spacing.large,
    marginBottom: spacing.large,
    ...shadows.card,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.large,
  },
  soConLai: {
    fontSize: fontSizes.bigNumber,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  chuVuot: {
    color: colors.overOnPrimary,
  },
  nhanConLai: {
    fontSize: fontSizes.label,
    color: colors.textOnPrimary,
  },
  cotSo: {
    flex: 1,
    gap: 6,
  },
  dongSo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nhan: {
    fontSize: fontSizes.secondary,
    color: colors.textOnPrimary,
  },
  giaTri: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  donVi: {
    fontSize: fontSizes.label,
    fontWeight: '400',
    color: colors.textOnPrimary,
  },
  hangChat: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.large,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.small,
    paddingHorizontal: 4,
  },
  soGam: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
  },
  tenChat: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 6,
  },
  khoang: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
});
