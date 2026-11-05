import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';

type ThemGioNhacProps = {
  // Giờ đã chọn, dạng "08:00"
  onThem: (gio: string) => void;
  onDong: () => void;
};

// Thêm số 0 phía trước cho đủ 2 chữ số, ví dụ 8 thành "08"
function haiChuSo(so: number): string {
  return String(so).padStart(2, '0');
}

// Tấm nổi từ dưới lên có bánh xe giờ : phút của iPhone; bấm "Thêm" mới chọn, "Hủy" hoặc vùng tối là bỏ
export function ThemGioNhac({ onThem, onDong }: ThemGioNhacProps) {
  // Giờ đang quay trên bánh xe, mở ra đứng ở giờ hiện tại
  const [gioDangQuay, setGioDangQuay] = useState(new Date());

  // Bánh xe quay tới giờ nào thì nhớ giờ đó
  function khiQuay(suKien: DateTimePickerEvent, gio?: Date) {
    if (suKien.type === 'set' && gio) {
      setGioDangQuay(gio);
    }
  }

  // Bấm "Thêm": đổi giờ đang quay ra dạng "08:00"
  function them() {
    onThem(`${haiChuSo(gioDangQuay.getHours())}:${haiChuSo(gioDangQuay.getMinutes())}`);
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDong}>
      <View style={styles.nenToi}>
        {/* Vùng tối phía trên tấm: bấm vào thì đóng, không thêm */}
        <Pressable style={styles.vungToi} onPress={onDong} />
        <View style={styles.tam}>
          {/* Hàng đầu: Hủy, tiêu đề, Thêm */}
          <View style={styles.dauTam}>
            <Pressable style={({ pressed }) => [styles.nutChu, pressed ? styles.dangBam : null]} onPress={onDong}>
              <Text style={styles.chuHuy}>Hủy</Text>
            </Pressable>
            <Text style={styles.tieuDe}>Thêm giờ nhắc</Text>
            <Pressable style={({ pressed }) => [styles.nutChu, styles.nutThem, pressed ? styles.dangBam : null]} onPress={them}>
              <Text style={styles.chuThem}>Thêm</Text>
            </Pressable>
          </View>
          <DateTimePicker
            style={styles.banhXe}
            value={gioDangQuay}
            mode="time"
            display="spinner"
            locale="vi-VN"
            themeVariant="light"
            onChange={khiQuay}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nenToi: {
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
  tieuDe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  nutChu: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  nutThem: {
    alignItems: 'flex-end',
  },
  banhXe: {
    alignSelf: 'center',
  },
  chuHuy: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuThem: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
