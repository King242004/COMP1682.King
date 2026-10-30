import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type ScreenProps = {
  children: ReactNode;
  // Phần đầu đứng yên (không cuộn), ví dụ tab và thanh tìm ở Khám phá; không có thì cả màn cuộn
  header?: ReactNode;
  // Màn trong thanh tab mà không có nút + nổi (ví dụ Hồ sơ): đáy chỉ chừa 16, vì thanh tab đã chừa phần thanh home
  compactBottom?: boolean;
};

// Khung chung của mọi màn: chừa đúng phần tai thỏ ở trên, nền kem, cuộn được, lề 16
export function Screen({ children, header, compactBottom }: ScreenProps) {
  // Chiều cao vùng tai thỏ và thanh trạng thái; phần đáy không chừa vì thanh tab đã chừa sẵn
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      {/* Bàn phím mở thì tự chừa chỗ để ô đang gõ không bị che */}
      <ScrollView
        contentContainerStyle={[styles.content, header ? styles.contentUnderHeader : null, compactBottom ? styles.contentCompactBottom : null]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
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
  header: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
  },
  // Chừa chỗ dưới cùng vừa bằng nút + nổi ở trang chủ (cao 60, cách đáy 16) để nó không che món cuối; cũng đủ cho thanh home của iPhone
  content: {
    padding: spacing.large,
    paddingBottom: 60 + spacing.large,
  },
  contentUnderHeader: {
    paddingTop: 0,
  },
  contentCompactBottom: {
    paddingBottom: spacing.large,
  },
});
