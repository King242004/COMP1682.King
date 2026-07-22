// One meal-type selector for Add + Edit (they used to ship two different
// designs for the same action). Style follows the Soft UI tint pattern.
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { MEAL_TYPE_META, type MealTypeKey } from "@/ui/mealTypes";

export function MealTypeSelector({ value, onChange }: {
  value: MealTypeKey;
  onChange: (t: MealTypeKey) => void;
}) {
  const t = useT();
  return (
    <View style={styles.row}>
      {MEAL_TYPE_META.map((mt) => {
        const active = value === mt.key;
        return (
          <Pressable
            key={mt.key}
            onPress={() => onChange(mt.key)}
            style={({ pressed }) => [styles.btn, active && styles.btnActive, pressed && styles.pressed]}
          >
            <Ionicons name={mt.icon as any} size={18} color={active ? mt.color : theme.colors.subtle} />
            <AppText style={[styles.label, active && styles.labelActive]}>{t.labels.mealType[mt.key]}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 10, borderRadius: 12, gap: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  btnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tint },
  pressed: { opacity: 0.7 },
  label: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  labelActive: { color: theme.colors.primary },
});
