import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dayOfMonth, shiftDateKey, shortWeekdayName, todayKey, weekDateKeys } from '../shared/dateKey';
import { colors } from '../shared/theme';

type DaiNgayProps = {
  ngay: string;
  onChon: (ngayMoi: string) => void;
};

// Dải 7 ngày của tuần đang xem; ‹ › lùi hoặc tiến một tuần; ngày tương lai không bấm được
export function DaiNgay({ ngay, onChon }: DaiNgayProps) {
  const homNay = todayKey();
  const cacNgay = weekDateKeys(ngay);

  // Chủ nhật của tuần này đã qua thì mới cho tiến sang tuần sau
  const choTien = cacNgay[6] < homNay;

  // Lùi hoặc tiến 7 ngày; rơi vào tương lai thì về hôm nay
  function doiTuan(soNgay: number) {
    let ngayMoi = shiftDateKey(ngay, soNgay);
    if (ngayMoi > homNay) {
      ngayMoi = homNay;
    }
    onChon(ngayMoi);
  }

  return (
    <View style={styles.hang}>
      <Pressable style={styles.nutTuan} onPress={() => doiTuan(-7)}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
      </Pressable>

      {cacNgay.map((ngayCuaO) => {
        const dangChon = ngayCuaO === ngay;
        const laTuongLai = ngayCuaO > homNay;
        return (
          <Pressable
            key={ngayCuaO}
            style={[styles.oNgay, dangChon ? styles.oNgayDangChon : null]}
            disabled={laTuongLai}
            onPress={() => onChon(ngayCuaO)}
          >
            <Text style={[styles.chuThu, dangChon ? styles.chuDangChon : null, laTuongLai ? styles.chuTuongLai : null]}>
              {shortWeekdayName(ngayCuaO)}
            </Text>
            <Text style={[styles.chuSo, dangChon ? styles.chuDangChon : null, laTuongLai ? styles.chuTuongLai : null]}>
              {dayOfMonth(ngayCuaO)}
            </Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.nutTuan} disabled={!choTien} onPress={() => doiTuan(7)}>
        <Ionicons name="chevron-forward" size={20} color={choTien ? colors.primary : colors.border} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hang: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutTuan: {
    width: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oNgay: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  oNgayDangChon: {
    backgroundColor: colors.primary,
  },
  chuThu: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chuSo: {
    fontSize: 15,
    color: colors.text,
  },
  chuDangChon: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  chuTuongLai: {
    color: colors.border,
  },
});
