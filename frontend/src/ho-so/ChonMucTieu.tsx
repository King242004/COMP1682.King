import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { vietCanNang } from '../don-vi/DoiDonVi';
import type { DonVi } from '../don-vi/DoiDonVi';
import { useDonVi } from '../don-vi/DonViContext';
import { Card } from '../shared/components/Card';
import { TextField } from '../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../shared/theme';
import type { MucTieu, TocDoGiamCan } from './HoSoApi';

type ChonMucTieuProps = {
  mucTieu: MucTieu;
  duocChonGiam: boolean;
  duocChonTang: boolean;
  nguongGiamCan: number;
  bmiLyTuong: number;
  canMucTieu: string;
  // Đơn vị đang dùng trên màn (màn thiết lập lần đầu có thể chưa lưu đơn vị)
  donVi: DonVi;
  loiCanMucTieu: string;
  tocDo: TocDoGiamCan;
  kgMoiThangVua: number;
  kgMoiThangNhanh: number;
  duocChonNhanh: boolean;
  biKhoa: boolean;
  onChonMucTieu: (muc: MucTieu) => void;
  onDoiCanMucTieu: (chu: string) => void;
  onChonTocDo: (tocDo: TocDoGiamCan) => void;
};

// Thẻ "Mục tiêu": ba ô Giảm · Giữ · Tăng (ô không hợp BMI thì mờ), mỗi mục tiêu dành cho ai, ô cân mục tiêu, tốc độ giảm
// Dùng chung ở màn thiết lập hồ sơ lần đầu và màn Lộ trình
export function ChonMucTieu(props: ChonMucTieuProps) {
  const { heSo } = useDonVi();
  const tenDonViCan = props.donVi === 'anh_my' && heSo !== null ? 'lb' : 'kg';

  return (
    <Card>
      <View style={styles.hangTieuDe}>
        <MaterialCommunityIcons name="target" size={18} color={colors.primary} />
        <Text style={styles.tieuDe}>Mục tiêu</Text>
      </View>

      {/* Ba ô mục tiêu và mỗi mục tiêu dành cho ai */}
      <View style={styles.hangNut}>
        <NutChon ten="Giảm cân" chuNho="" laDangChon={props.mucTieu === 'giam'} biKhoa={!props.duocChonGiam || props.biKhoa} onPress={() => props.onChonMucTieu('giam')} />
        <NutChon ten="Giữ cân" chuNho="" laDangChon={props.mucTieu === 'giu'} biKhoa={props.biKhoa} onPress={() => props.onChonMucTieu('giu')} />
        <NutChon ten="Tăng cân" chuNho="" laDangChon={props.mucTieu === 'tang'} biKhoa={!props.duocChonTang || props.biKhoa} onPress={() => props.onChonMucTieu('tang')} />
      </View>
      <Text style={styles.chuPhu}>• Giảm cân: dành cho BMI từ {props.nguongGiamCan.toLocaleString('vi-VN')} trở lên</Text>
      <Text style={styles.chuPhu}>• Giữ cân: dành cho mọi người</Text>
      <Text style={styles.chuPhu}>• Tăng cân: dành cho BMI dưới {props.bmiLyTuong.toLocaleString('vi-VN')}</Text>

      {/* Cân mục tiêu: chỉ khi giảm / tăng */}
      {props.mucTieu !== 'giu' ? (
        <View>
          <Text style={styles.nhan}>Cân mục tiêu ({tenDonViCan})</Text>
          <TextField label="" value={props.canMucTieu} onChangeText={props.onDoiCanMucTieu} error={props.loiCanMucTieu} isNumber isDisabled={props.biKhoa} />
        </View>
      ) : null}

      {/* Tốc độ giảm: chỉ khi giảm cân; Nhanh không bớt đủ calo mà vẫn trên mức tối thiểu thì mờ kèm lý do */}
      {props.mucTieu === 'giam' ? (
        <View>
          <Text style={styles.nhan}>Tốc độ giảm</Text>
          <View style={styles.hangNut}>
            <NutChon
              ten="Vừa"
              chuNho={`${vietCanNang(props.kgMoiThangVua, props.donVi, heSo)}/tháng`}
              laDangChon={props.tocDo === 'vua'}
              biKhoa={props.biKhoa}
              onPress={() => props.onChonTocDo('vua')}
            />
            <NutChon
              ten="Nhanh"
              chuNho={`${vietCanNang(props.kgMoiThangNhanh, props.donVi, heSo)}/tháng`}
              laDangChon={props.tocDo === 'nhanh'}
              biKhoa={!props.duocChonNhanh || props.biKhoa}
              onPress={() => props.onChonTocDo('nhanh')}
            />
          </View>
          {!props.duocChonNhanh ? (
            <Text style={styles.chuPhu}>Chọn Nhanh thì bạn phải ăn dưới mức tối thiểu của Bộ Y tế, nên chỉ chọn được Vừa.</Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

type NutChonProps = {
  ten: string;
  // Dòng nhỏ dưới tên (để trống thì không hiện)
  chuNho: string;
  laDangChon: boolean;
  biKhoa: boolean;
  onPress: () => void;
};

// Một ô chọn trong hàng: đang chọn thì nền xanh nhạt, viền và chữ xanh; bị khóa thì mờ
function NutChon({ ten, chuNho, laDangChon, biKhoa, onPress }: NutChonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.nut, laDangChon ? styles.dangChon : null, biKhoa ? styles.mo : null, pressed ? styles.dangBam : null]}
      disabled={biKhoa}
      onPress={onPress}
    >
      <Text style={[styles.chuNut, laDangChon ? styles.chuDangChon : null]}>{ten}</Text>
      {chuNho !== '' ? <Text style={[styles.chuNhoNut, laDangChon ? styles.chuDangChon : null]}>{chuNho}</Text> : null}
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
  hangNut: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  nut: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.small,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dangChon: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chuNut: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuNhoNut: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chuDangChon: {
    color: colors.primary,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 4,
  },
  nhan: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.large,
    marginBottom: spacing.small,
  },
  mo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
