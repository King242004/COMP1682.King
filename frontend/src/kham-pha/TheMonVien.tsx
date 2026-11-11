import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  biKhoa: boolean;
  onDaAn: () => void;
  onXemChiTiet: () => void;
};

// Thẻ một món Viện Dinh dưỡng đã cân trong thực đơn, cùng bố cục thẻ Cơm nhà: tên và nhãn nguồn, chip chọn suất, số gam và calo, ba chất, nút "Xem chi tiết" và "Đã ăn". Món đã ghi thì cả thẻ mờ
export function TheMonVien({ mon, soSuat, onDoiSoSuat, daGhi, dangGhi, biKhoa, onDaAn, onXemChiTiet }: TheMonVienProps) {
  // Dòng bên trái: "2 suất · 1.540 g"; món có dòng Viện không cân thì không có số gam
  const luaChonSuat = LUA_CHON_SUAT.find((luaChon) => luaChon.giaTri === soSuat);
  let chuSuat = `${luaChonSuat ? luaChonSuat.nhan : soSuat} suất`;
  if (mon.so_gam_1_suat !== null) {
    chuSuat = `${chuSuat} · ${Math.round(mon.so_gam_1_suat * soSuat).toLocaleString('vi-VN')} g`;
  }

  return (
    <View style={[styles.the, daGhi ? styles.theDaGhi : null]}>
      {/* Tên (gạch ngang khi đã ghi) và nhãn "Viện Dinh dưỡng" */}
      <View style={styles.hangTen}>
        <Text style={[styles.tenMon, daGhi ? styles.tenMonDaGhi : null]}>{mon.ten_mon}</Text>
        <Text style={styles.nhanVien}>Viện Dinh dưỡng</Text>
      </View>

      {/* 3 chip chọn suất; món đã ghi hoặc đang chạy việc khác thì khóa */}
      <View style={styles.hangChip}>
        {LUA_CHON_SUAT.map((luaChon) => (
          <Chip
            key={luaChon.nhan}
            label={`${luaChon.nhan} suất`}
            isSelected={soSuat === luaChon.giaTri}
            isDisabled={daGhi || dangGhi || biKhoa}
            onPress={() => onDoiSoSuat(luaChon.giaTri)}
          />
        ))}
      </View>

      {/* Nhãn ⚠ nếu có thứ người dùng dị ứng */}
      <NhanDiUng danhSachNhom={mon.nhom_di_ung} chiTiet={mon.thu_bi_bat.join(', ')} />

      {/* Số suất, số gam và calo theo số suất đang chọn */}
      <View style={styles.hangTong}>
        <Text style={styles.chuPhu}>{chuSuat}</Text>
        <Text style={styles.soTong}>{Math.round(mon.so_calo * soSuat).toLocaleString('vi-VN')} kcal</Text>
      </View>

      {/* Ba ô đạm, tinh bột, béo theo số suất, cùng màu với thẻ Cơm nhà */}
      <View style={styles.hangBaChat}>
        <View style={[styles.oChat, { backgroundColor: colors.proteinLight }]}>
          <Text style={[styles.tenChat, { color: colors.protein }]}>Đạm</Text>
          <Text style={[styles.soChat, { color: colors.protein }]}>{lamTronMotSoLe(mon.dam_g * soSuat).toLocaleString('vi-VN')} g</Text>
        </View>
        <View style={[styles.oChat, { backgroundColor: colors.carbsLight }]}>
          <Text style={[styles.tenChat, { color: colors.carbs }]}>Tinh bột</Text>
          <Text style={[styles.soChat, { color: colors.carbs }]}>{lamTronMotSoLe(mon.tinh_bot_g * soSuat).toLocaleString('vi-VN')} g</Text>
        </View>
        <View style={[styles.oChat, { backgroundColor: colors.fatLight }]}>
          <Text style={[styles.tenChat, { color: colors.fat }]}>Béo</Text>
          <Text style={[styles.soChat, { color: colors.fat }]}>{lamTronMotSoLe(mon.beo_g * soSuat).toLocaleString('vi-VN')} g</Text>
        </View>
      </View>

      {/* Hàng 2 nút chia đôi: mở chi tiết món (ảnh suất, bảng thành phần); đã ghi thì dấu tick tròn, chưa ghi thì nút "✓ Đã ăn" ghi số suất đang chọn vào nhật ký hôm nay */}
      <View style={styles.hangNut}>
        <Pressable style={({ pressed }) => [styles.nutChiTiet, pressed ? styles.dangBam : null]} onPress={onXemChiTiet}>
          <Ionicons name="image-outline" size={16} color={colors.text} />
          <Text style={styles.chuNutChiTiet}>Xem chi tiết</Text>
        </Pressable>
        {daGhi ? (
          <View style={styles.daGhi}>
            <Ionicons name="checkmark-circle" size={18} color={colors.protein} />
            <Text style={styles.chuNut}>Đã ghi</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.nut, biKhoa ? styles.nutKhoa : null, pressed ? styles.dangBam : null]}
            disabled={dangGhi || biKhoa}
            onPress={onDaAn}
          >
            {!dangGhi ? <Ionicons name="checkmark" size={16} color={colors.protein} /> : null}
            <Text style={styles.chuNut}>{dangGhi ? 'Đang ghi…' : 'Đã ăn'}</Text>
          </Pressable>
        )}
      </View>
    </View>
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
  hangTen: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  tenMonDaGhi: {
    textDecorationLine: 'line-through',
  },
  // Nhãn xanh nhỏ báo số liệu là Viện Dinh dưỡng đã cân
  nhanVien: {
    fontSize: fontSizes.label,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  hangChip: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.small,
  },
  hangTong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.medium,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  soTong: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  hangBaChat: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.small,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.small,
  },
  tenChat: {
    fontSize: fontSizes.label,
  },
  soChat: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
  },
  hangNut: {
    flexDirection: 'row',
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  // Nút "Xem chi tiết" viền xám, nửa trái
  nutChiTiet: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chuNutChiTiet: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  // Nút "Đã ăn" nền xanh lá nhạt, nửa phải
  nut: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    borderRadius: radius.input,
    backgroundColor: colors.proteinLight,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  chuNut: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.protein,
  },
  daGhi: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
  },
});
