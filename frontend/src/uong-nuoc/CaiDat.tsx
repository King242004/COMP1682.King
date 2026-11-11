import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../shared/components/Card';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import { SuaLuongNuoc } from './cai-dat/SuaLuongNuoc';
import { ThemGioNhac } from './cai-dat/ThemGioNhac';
import type { CaiDatNuoc, UongNuocNgay } from './UongNuocApi';

// Số giờ nhắc tối đa, giống backend (UongNuocService.ts)
const SO_GIO_NHAC_TOI_DA = 12;

type CaiDatProps = {
  uongNuoc: UongNuocNgay;
  dangLuu: boolean;
  // Câu báo khi iPhone không cho gửi thông báo; rỗng là không có lỗi
  loiQuyen: string;
  onLuu: (caiDat: CaiDatNuoc) => void;
};

// Thẻ "Cài đặt": mỗi lần ghi, mục tiêu, công tắc nhắc và các giờ nhắc; sửa xong là lưu ngay
export function CaiDat({ uongNuoc, dangLuu, loiQuyen, onLuu }: CaiDatProps) {
  // Tấm nổi đang mở: sửa lượng nước (mỗi lần ghi và mục tiêu), thêm giờ, hoặc không mở tấm nào
  const [tamDangMo, setTamDangMo] = useState<'luong-nuoc' | 'gio' | null>(null);

  // Cài đặt đang có, để mỗi lần sửa chỉ đổi một thứ rồi gửi cả bộ lên server
  let mucTieuTuDat: number | null = null;
  if (uongNuoc.la_muc_tieu_tu_dat) {
    mucTieuTuDat = uongNuoc.muc_tieu_ml;
  }
  const caiDat: CaiDatNuoc = {
    nuoc_ml_moi_lan: uongNuoc.nuoc_ml_moi_lan,
    muc_tieu_ml: mucTieuTuDat,
    nhac_uong_nuoc: uongNuoc.nhac_uong_nuoc,
    gio_nhac: uongNuoc.gio_nhac,
  };

  // Lưu số ml mỗi lần ghi và mục tiêu; mục tiêu null là dùng gợi ý
  function luuLuongNuoc(mlMoiLan: number, mucTieu: number | null) {
    setTamDangMo(null);
    onLuu({ ...caiDat, nuoc_ml_moi_lan: mlMoiLan, muc_tieu_ml: mucTieu });
  }

  // Thêm một giờ nhắc; giờ đã có thì chỉ đóng tấm
  function themGio(gio: string) {
    setTamDangMo(null);
    if (!caiDat.gio_nhac.includes(gio)) {
      onLuu({ ...caiDat, gio_nhac: [...caiDat.gio_nhac, gio] });
    }
  }

  // Bỏ một giờ nhắc
  function boGio(gio: string) {
    onLuu({ ...caiDat, gio_nhac: caiDat.gio_nhac.filter((gioKhac) => gioKhac !== gio) });
  }

  return (
    <Card>
      <Text style={styles.tieuDe}>Cài đặt</Text>

      {/* Mỗi lần ghi */}
      <Pressable
        style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
        disabled={dangLuu}
        onPress={() => setTamDangMo('luong-nuoc')}
      >
        <Text style={[styles.nhan, styles.cotNhan]}>Mỗi lần ghi</Text>
        <Text style={styles.giaTri}>{uongNuoc.nuoc_ml_moi_lan.toLocaleString('vi-VN')} ml</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
      <View style={styles.duongKe} />

      {/* Mục tiêu, dòng nhỏ cho biết đang dùng gợi ý hay tự đặt */}
      <Pressable
        style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
        disabled={dangLuu}
        onPress={() => setTamDangMo('luong-nuoc')}
      >
        <View style={styles.cotNhan}>
          <Text style={styles.nhan}>Mục tiêu</Text>
          <Text style={styles.chuNho}>{uongNuoc.la_muc_tieu_tu_dat ? 'Bạn tự đặt' : 'Gợi ý theo cân nặng'}</Text>
        </View>
        <Text style={styles.giaTri}>{uongNuoc.muc_tieu_ml.toLocaleString('vi-VN')} ml</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
      <View style={styles.duongKe} />

      {/* Công tắc nhắc uống nước; iPhone không cho gửi thông báo thì hiện chữ đỏ */}
      <View style={styles.dong}>
        <Text style={[styles.nhan, styles.cotNhan]}>Nhắc uống nước</Text>
        <Switch
          value={uongNuoc.nhac_uong_nuoc}
          disabled={dangLuu}
          trackColor={{ true: colors.primary, false: colors.border }}
          onValueChange={(batNhac) => onLuu({ ...caiDat, nhac_uong_nuoc: batNhac })}
        />
      </View>
      {loiQuyen ? <Text style={styles.chuLoi}>{loiQuyen}</Text> : null}

      {/* Các giờ nhắc, chỉ hiện khi bật nhắc: bấm × để bỏ; đủ số giờ tối đa thì không còn nút thêm */}
      {uongNuoc.nhac_uong_nuoc ? (
        <View style={styles.hangGio}>
          {uongNuoc.gio_nhac.map((gio) => (
            <Pressable
              key={gio}
              style={({ pressed }) => [styles.vienGio, pressed ? styles.dangBam : null]}
              hitSlop={4}
              disabled={dangLuu}
              onPress={() => boGio(gio)}
            >
              <Text style={styles.chuGio}>{gio}</Text>
              <Ionicons name="close" size={14} color={colors.textOnPrimaryLight} />
            </Pressable>
          ))}
          {uongNuoc.gio_nhac.length < SO_GIO_NHAC_TOI_DA ? (
            <Pressable
              style={({ pressed }) => [styles.vienThem, pressed ? styles.dangBam : null]}
              hitSlop={4}
              disabled={dangLuu}
              onPress={() => setTamDangMo('gio')}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={styles.chuThem}>Thêm giờ</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Tấm nổi đang mở */}
      {tamDangMo === 'luong-nuoc' ? (
        <SuaLuongNuoc
          mlMoiLanDau={uongNuoc.nuoc_ml_moi_lan}
          mucTieuDau={uongNuoc.muc_tieu_ml}
          mucTieuGoiY={uongNuoc.muc_tieu_goi_y_ml}
          laMucTieuTuDat={uongNuoc.la_muc_tieu_tu_dat}
          onLuu={luuLuongNuoc}
          onDong={() => setTamDangMo(null)}
        />
      ) : null}
      {tamDangMo === 'gio' ? <ThemGioNhac onThem={themGio} onDong={() => setTamDangMo(null)} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  dong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    minHeight: 48,
    paddingVertical: spacing.small,
  },
  cotNhan: {
    flex: 1,
  },
  nhan: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  giaTri: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuNho: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
  },
  duongKe: {
    height: 1,
    backgroundColor: colors.border,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginBottom: spacing.small,
  },
  hangGio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  vienGio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  chuGio: {
    fontSize: fontSizes.secondary,
    color: colors.textOnPrimaryLight,
  },
  vienThem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chuThem: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
