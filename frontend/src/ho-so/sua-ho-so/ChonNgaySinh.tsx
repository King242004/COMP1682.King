import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatFullDate, fromDateKey, toDateKey, todayKey } from '../../shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

// Chỉ cho chọn ngày sinh của người từ 18 đến 100 tuổi (giống luật ở backend)
const TUOI_TOI_THIEU = 18;
const TUOI_TOI_DA = 100;
// Chưa có ngày sinh thì bánh xe mở sẵn ở người 25 tuổi; là lựa chọn giao diện, không phải luật
const TUOI_MO_SAN = 25;

type ChonNgaySinhProps = {
  ngaySinh: string | null;
  onChon: (ngaySinh: string) => void;
  loi: string;
  // Khóa ô khi màn đang lưu
  isDisabled?: boolean;
};

// Ngày cách hôm nay một số năm về trước
function luiNam(soNam: number): Date {
  const ngay = fromDateKey(todayKey());
  ngay.setFullYear(ngay.getFullYear() - soNam);
  return ngay;
}

// Ô ngày sinh: bấm vào thì tấm có bánh xe ngày của iPhone trượt lên; bấm "Xong" mới chọn, bấm vùng tối là bỏ
export function ChonNgaySinh({ ngaySinh, onChon, loi, isDisabled }: ChonNgaySinhProps) {
  const [dangMo, setDangMo] = useState(false);
  // Ngày đang quay trên bánh xe, chưa chọn cho tới khi bấm "Xong"
  const [ngayDangQuay, setNgayDangQuay] = useState<Date>(luiNam(TUOI_MO_SAN));

  // Mở tấm: bánh xe đứng ở ngày đã chọn, chưa chọn thì ở người 25 tuổi
  function moTam() {
    setNgayDangQuay(ngaySinh ? fromDateKey(ngaySinh) : luiNam(TUOI_MO_SAN));
    setDangMo(true);
  }

  // Bánh xe quay tới ngày nào thì nhớ ngày đó
  function khiQuay(suKien: DateTimePickerEvent, ngay?: Date) {
    if (suKien.type === 'set' && ngay) {
      setNgayDangQuay(ngay);
    }
  }

  // Bấm "Xong": chọn ngày đang quay rồi đóng tấm
  function xong() {
    onChon(toDateKey(ngayDangQuay));
    setDangMo(false);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.nhan}>Ngày sinh</Text>
      <Pressable
        style={({ pressed }) => [styles.o, loi ? styles.oLoi : null, isDisabled ? styles.oKhoa : null, pressed ? styles.dangBam : null]}
        disabled={isDisabled}
        onPress={moTam}
      >
        <Text style={ngaySinh ? styles.giaTri : styles.goiY}>{ngaySinh ? formatFullDate(ngaySinh) : 'Chọn ngày sinh'}</Text>
      </Pressable>
      {loi ? <Text style={styles.chuLoi}>{loi}</Text> : null}

      <Modal visible={dangMo} animationType="slide" transparent onRequestClose={() => setDangMo(false)}>
        <View style={styles.nenMo}>
          {/* Bấm vùng tối phía trên là đóng, không chọn */}
          <Pressable style={styles.vungToi} onPress={() => setDangMo(false)} />
          <View style={styles.tam}>
            <View style={styles.dauTam}>
              <Text style={styles.tieuDeTam}>Chọn ngày sinh</Text>
              <Pressable style={({ pressed }) => [styles.nutXong, pressed ? styles.dangBam : null]} onPress={xong}>
                <Text style={styles.chuXong}>Xong</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={ngayDangQuay}
              mode="date"
              display="spinner"
              locale="vi-VN"
              themeVariant="light"
              maximumDate={luiNam(TUOI_TOI_THIEU)}
              minimumDate={luiNam(TUOI_TOI_DA)}
              onChange={khiQuay}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.medium,
  },
  nhan: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  o: {
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    justifyContent: 'center',
  },
  oKhoa: {
    opacity: 0.5,
  },
  oLoi: {
    borderColor: colors.error,
  },
  giaTri: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  goiY: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: 4,
  },
  nenMo: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  vungToi: {
    flex: 1,
  },
  tam: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    paddingBottom: spacing.xlarge,
  },
  dauTam: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tieuDeTam: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nutXong: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chuXong: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
