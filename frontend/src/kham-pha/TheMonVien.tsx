import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { NhanDiUng } from '../di-ung/NhanDiUng';
import { Chip } from '../shared/components/Chip';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import type { MonThucDon } from '../thuc-don/ThucDonApi';

// Số suất chọn được, giống chip ở thẻ Tìm món; là lựa chọn giao diện
const LUA_CHON_SUAT = [
  { giaTri: 0.5, nhan: '½' },
  { giaTri: 1, nhan: '1' },
  { giaTri: 2, nhan: '2' },
];

// Làm tròn 1 số lẻ cho số gam
function lamTronMotSoLe(so: number): number {
  return Math.round(so * 10) / 10;
}

type TheMonVienProps = {
  mon: MonThucDon;
  // Số suất đang chọn (mặc định 1, người dùng bấm chip để đổi)
  soSuat: number;
  onDoiSoSuat: (soSuat: number) => void;
  daGhi: boolean;
  dangGhi: boolean;
  // Đang ghi món khác hoặc đang tạo thực đơn mới thì khóa nút "Đã ăn"
  khoa: boolean;
  onDaAn: () => void;
  onXemChiTiet: () => void;
};

// Thẻ một món Viện Dinh dưỡng đã cân trong thực đơn: ảnh suất to ở trên, dưới là tên, số suất và số liệu đã nhân theo số suất, chip chọn suất, nút "Đã ăn"; bấm thẻ mở chi tiết món. Món đã ghi thì cả thẻ mờ
export function TheMonVien({ mon, soSuat, onDoiSoSuat, daGhi, dangGhi, khoa, onDaAn, onXemChiTiet }: TheMonVienProps) {
  // Dòng số liệu: "2 suất · 1.190 g · 950 kcal · đạm …"; món có dòng Viện không cân thì không có số gam
  const luaChonSuat = LUA_CHON_SUAT.find((luaChon) => luaChon.giaTri === soSuat);
  let chuSoLieu = `${luaChonSuat ? luaChonSuat.nhan : soSuat} suất`;
  if (mon.so_gam_1_suat !== null) {
    chuSoLieu = `${chuSoLieu} · ${Math.round(mon.so_gam_1_suat * soSuat).toLocaleString('vi-VN')} g`;
  }
  chuSoLieu = `${chuSoLieu} · ${Math.round(mon.so_calo * soSuat).toLocaleString('vi-VN')} kcal · đạm ${lamTronMotSoLe(mon.dam_g * soSuat).toLocaleString('vi-VN')} g · tinh bột ${lamTronMotSoLe(mon.tinh_bot_g * soSuat).toLocaleString('vi-VN')} g · béo ${lamTronMotSoLe(mon.beo_g * soSuat).toLocaleString('vi-VN')} g`;

  return (
    <Pressable style={({ pressed }) => [styles.the, daGhi ? styles.theDaGhi : null, pressed ? styles.dangBam : null]} onPress={onXemChiTiet}>
      {/* Ảnh suất của Viện rộng hết thẻ, hiện trọn cả ảnh */}
      {mon.anh_url !== null ? <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="contain" /> : null}

      {/* Dưới ảnh: chữ bên trái, nút bên phải */}
      <View style={styles.hangDuoiAnh}>
        {/* Tên món (gạch ngang khi đã ghi); số suất, số gam, calo và 3 chất theo số suất; nhãn ⚠ nếu có thứ người dùng dị ứng */}
        <View style={styles.cotGiua}>
          <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
          <Text style={styles.chuPhu}>{chuSoLieu}</Text>
          <NhanDiUng danhSachNhom={mon.nhom_di_ung} chiTiet={mon.thu_bi_bat.join(', ')} />
        </View>

        {/* Đã ghi thì hiện dấu tick tròn; chưa ghi thì nút "✓ Đã ăn" ghi số suất đang chọn vào nhật ký hôm nay */}
        {daGhi ? (
          <View style={styles.daGhi}>
            <Ionicons name="checkmark-circle" size={18} color={colors.protein} />
            <Text style={styles.chuDaGhi}>Đã ghi</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.nut, khoa ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
            disabled={dangGhi || khoa}
            onPress={onDaAn}
          >
            {!dangGhi ? <Ionicons name="checkmark" size={16} color={colors.protein} /> : null}
            <Text style={styles.chuNut}>{dangGhi ? 'Đang ghi…' : 'Đã ăn'}</Text>
          </Pressable>
        )}
      </View>

      {/* 3 chip chọn suất; món đã ghi hoặc đang chạy việc khác thì khóa */}
      <View style={styles.hangChip}>
        {LUA_CHON_SUAT.map((luaChon) => (
          <Chip
            key={luaChon.nhan}
            label={`${luaChon.nhan} suất`}
            isSelected={soSuat === luaChon.giaTri}
            isDisabled={daGhi || dangGhi || khoa}
            onPress={() => onDoiSoSuat(luaChon.giaTri)}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  the: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
    borderRadius: radius.card,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  theDaGhi: {
    opacity: 0.55,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  anh: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    marginBottom: spacing.small,
  },
  hangDuoiAnh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  cotGiua: {
    flex: 1,
  },
  hangChip: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.small,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenMonDaGhi: {
    textDecorationLine: 'line-through',
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: spacing.small,
    borderRadius: radius.input,
    backgroundColor: colors.proteinLight,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  chuNut: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.protein,
  },
  daGhi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chuDaGhi: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.protein,
  },
});
