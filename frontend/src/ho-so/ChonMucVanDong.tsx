import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../shared/components/Card';
import { colors, fontSizes, pressedOpacity, spacing } from '../shared/theme';
import type { MucVanDong } from './HoSoApi';

// Ba mức vận động, mô tả theo Bảng 5 của Chuẩn dinh dưỡng người Nhật 2025 (ThuatToan.md bước 4)
const LUA_CHON_MUC_VAN_DONG: { giaTri: MucVanDong; ten: string; moTa: string }[] = [
  { giaTri: 'nhe', ten: 'Nhẹ', moTa: 'Phần lớn thời gian ngồi, chủ yếu hoạt động tĩnh' },
  {
    giaTri: 'trung_binh',
    ten: 'Trung bình',
    moTa: 'Công việc chủ yếu ngồi, nhưng có một trong các việc: đi lại hoặc đứng làm, tiếp khách; đi bộ đi làm, đi chợ; làm việc nhà; chơi thể thao nhẹ',
  },
  { giaTri: 'nang', ten: 'Nặng', moTa: 'Công việc phải đi lại, đứng nhiều; hoặc có thói quen chơi thể thao tích cực lúc rảnh' },
];

type ChonMucVanDongProps = {
  mucVanDong: MucVanDong | null;
  duocChonNang: boolean;
  tuoiKhongCoMucNang: number;
  loi: string;
  biKhoa: boolean;
  onChon: (muc: MucVanDong) => void;
};

// Thẻ "Một ngày bình thường của bạn": ba mức vận động có mô tả; từ tuổi không còn mức nặng thì "Nặng" mờ kèm một dòng lý do
// Dùng chung ở màn thiết lập hồ sơ lần đầu và màn Lộ trình
export function ChonMucVanDong({ mucVanDong, duocChonNang, tuoiKhongCoMucNang, loi, biKhoa, onChon }: ChonMucVanDongProps) {
  return (
    <Card>
      <View style={styles.hangTieuDe}>
        <Ionicons name="walk-outline" size={18} color={colors.primary} />
        <Text style={styles.tieuDe}>Một ngày bình thường của bạn</Text>
      </View>

      {LUA_CHON_MUC_VAN_DONG.map((luaChonMuc) => (
        <LuaChonCoMoTa
          key={luaChonMuc.giaTri}
          ten={luaChonMuc.ten}
          moTa={luaChonMuc.moTa}
          laDangChon={mucVanDong === luaChonMuc.giaTri}
          biKhoa={(luaChonMuc.giaTri === 'nang' && !duocChonNang) || biKhoa}
          onPress={() => onChon(luaChonMuc.giaTri)}
        />
      ))}
      {!duocChonNang ? <Text style={styles.chuPhu}>Từ {tuoiKhongCoMucNang} tuổi chỉ chọn Nhẹ hoặc Trung bình</Text> : null}
      {loi ? <Text style={styles.chuLoi}>{loi}</Text> : null}
    </Card>
  );
}

type LuaChonCoMoTaProps = {
  ten: string;
  moTa: string;
  laDangChon: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Một mức vận động: vòng tròn chọn, tên đậm, mô tả bên dưới
function LuaChonCoMoTa({ ten, moTa, laDangChon, biKhoa, onPress }: LuaChonCoMoTaProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.luaChon, laDangChon ? styles.dangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Ionicons name={laDangChon ? 'radio-button-on' : 'radio-button-off'} size={20} color={laDangChon ? colors.primary : colors.textSecondary} />
      <View style={styles.cotChu}>
        <Text style={[styles.ten, laDangChon ? styles.chuDangChon : null]}>{ten}</Text>
        <Text style={styles.chuPhu}>{moTa}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  luaChon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.medium,
    padding: spacing.medium,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: spacing.small,
  },
  dangChon: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cotChu: {
    flex: 1,
  },
  ten: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuDangChon: {
    color: colors.primary,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
  mo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
