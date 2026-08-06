// Thanh tab dùng chung trong Community và hồ sơ người dùng.
// Màn cha giữ state tab; component này chỉ hiển thị lựa chọn và báo tab vừa bấm ngược lên.
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export function CommunityTabs<T extends string>({ value, options, onChange }: {
  value: T;
  options: readonly { key: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.button, active && styles.activeButton, pressed && styles.pressed]}
          >
            <AppText style={[styles.text, active && styles.activeText]}>{option.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  button: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12, backgroundColor: theme.colors.tintSoft },
  activeButton: { backgroundColor: theme.colors.primary },
  text: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  activeText: { color: "#fff" },
  pressed: { opacity: 0.7 },
});
