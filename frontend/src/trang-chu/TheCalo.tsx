import { StyleSheet, Text, View } from 'react-native';

import { VongTienDo } from '../shared/components/VongTienDo';
import { colors } from '../shared/theme';
import type { NhatKyNgay } from '../bua-an/BuaAnApi';

type VongChatProps = {
  ten: string;
  mau: string;
  daAn: number;
  mucDay: number;
  chuMucTieu: string;
};

// Một vòng nhỏ cho đạm, tinh bột hoặc béo; vòng đầy khi ăn tới mucDay, dưới vòng ghi mục tiêu bằng chữ
function VongChat({ ten, mau, daAn, mucDay, chuMucTieu }: VongChatProps) {
  let phanTram = 0;
  if (mucDay > 0) {
    phanTram = (daAn / mucDay) * 100;
  }
  return (
    <View style={styles.cotChat}>
      <VongTienDo kichThuoc={52} doDay={6} phanTram={phanTram} mau={mau} />
      <Text style={styles.soGam}>{daAn.toLocaleString('vi-VN')} g</Text>
      <Text style={styles.tenChat}>{ten}</Text>
      <Text style={styles.khoang}>{chuMucTieu}</Text>
    </View>
  );
}

// Thẻ calo trên trang chủ: vòng lớn với số còn lại (hoặc đã vượt), đã ăn / mục tiêu, ba vòng nhỏ
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
        <VongTienDo kichThuoc={132} doDay={12} phanTram={phanTramDaAn} mau={daVuot ? colors.error : colors.primary}>
          <Text style={[styles.soConLai, daVuot ? styles.chuVuot : null]}>
            {Math.abs(tongHop.con_lai ?? 0).toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.nhanConLai}>{daVuot ? 'kcal đã vượt' : 'kcal còn lại'}</Text>
        </VongTienDo>

        <View style={styles.cotSo}>
          <View style={styles.dongSo}>
            <Text style={styles.nhan}>Đã ăn</Text>
            <Text style={styles.giaTri}>{tongHop.tong_calo.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.dongSo}>
            <Text style={styles.nhan}>Mục tiêu</Text>
            <Text style={styles.giaTri}>{mucTieu.toLocaleString('vi-VN')}</Text>
          </View>
          <Text style={styles.nguon}>kcal mỗi ngày (ước tính)</Text>
        </View>
      </View>

      {/* Ba vòng: đạm đầy khi ăn đủ mức tối thiểu; tinh bột, béo đầy khi chạm mức cao của khoảng nên ăn */}
      {nhatKy.muc_tieu_chat ? (
        <View style={styles.hangChat}>
          <VongChat
            ten="Đạm"
            mau={colors.protein}
            daAn={tongHop.tong_dam_g}
            mucDay={nhatKy.muc_tieu_chat.dam_g_toi_thieu}
            chuMucTieu={`ít nhất ${nhatKy.muc_tieu_chat.dam_g_toi_thieu.toLocaleString('vi-VN')} g`}
          />
          <VongChat
            ten="Tinh bột"
            mau={colors.carbs}
            daAn={tongHop.tong_tinh_bot_g}
            mucDay={nhatKy.muc_tieu_chat.tinh_bot_g_cao}
            chuMucTieu={`${nhatKy.muc_tieu_chat.tinh_bot_g_thap.toLocaleString('vi-VN')}–${nhatKy.muc_tieu_chat.tinh_bot_g_cao.toLocaleString('vi-VN')} g`}
          />
          <VongChat
            ten="Béo"
            mau={colors.fat}
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
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  hangTren: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  soConLai: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
  },
  chuVuot: {
    color: colors.error,
  },
  nhanConLai: {
    fontSize: 12,
    color: colors.textSecondary,
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  giaTri: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  nguon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  hangChat: {
    flexDirection: 'row',
    marginTop: 16,
  },
  cotChat: {
    flex: 1,
    alignItems: 'center',
  },
  soGam: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
  },
  tenChat: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  khoang: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
