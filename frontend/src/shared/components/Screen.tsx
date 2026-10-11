import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type ScreenProps = {
  children: ReactNode;
};

// Khung chung của mọi màn: chừa đúng phần tai thỏ ở trên, nền xanh nhạt, cuộn được, lề 16
export function Screen({ children }: ScreenProps) {
  // Chiều cao vùng tai thỏ và thanh trạng thái; phần đáy không chừa vì thanh tab đã chừa sẵn
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Chừa chỗ dưới cùng để nút + nổi ở trang chủ và thanh home của iPhone không che món cuối
  content: {
    padding: spacing.large,
    paddingBottom: spacing.xlarge * 4,
  },
});
