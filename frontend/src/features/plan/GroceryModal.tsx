// AI grocery list bottom sheet — tickable rows (state persisted per week
// together with the list, see plan api cacheGrocery).
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { GroceryGroup } from "@/features/plan/api";

export function GroceryModal({ visible, groups, checked, onToggle, onClose }: {
  visible: boolean;
  groups: GroceryGroup[] | null;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  const title = useT().plan.groceryTitle;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <AppText variant="h2">{title}</AppText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.colors.subtle} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {(groups || []).map((g) => (
              <View key={g.name} style={styles.group}>
                <AppText style={styles.groupName}>{g.name}</AppText>
                {g.items.map((it, idx) => {
                  // Tick state keyed by group+item text (stable across reopenings)
                  const key = `${g.name}|${it}`;
                  const isChecked = !!checked[key];
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => onToggle(key)}
                      style={({ pressed }) => [styles.itemRow, pressed && styles.dim]}
                    >
                      <Ionicons
                        name={isChecked ? "checkbox" : "square-outline"}
                        size={19}
                        color={isChecked ? theme.colors.accent : theme.colors.subtle}
                      />
                      <AppText variant="body2" style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                        {it}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.6 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: theme.space.xl, maxHeight: "80%", gap: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  list: { gap: 14, paddingBottom: 20 },
  group: { gap: 6 },
  groupName: { fontSize: 13, fontWeight: "800", color: theme.colors.primary },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  itemText: { flex: 1, fontSize: 13, color: theme.colors.text },
  itemTextChecked: { textDecorationLine: "line-through", color: theme.colors.subtle },
});
