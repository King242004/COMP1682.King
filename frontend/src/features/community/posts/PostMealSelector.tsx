// Khối chọn món để đính vào bài đăng, dùng chung cho màn Tạo bài và màn Sửa bài.
// legacyDishName là để đọc lại các bài đăng ĐỜI CŨ, loại chỉ lưu tên món mà
// không kèm số dinh dưỡng. Bài mới luôn đính cả bản ghi món.
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Meal } from "@/features/meals/MealsContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { mealPortionLabel } from "../communityDisplay";

export type PostMealChoice = Pick<
  Meal,
  | "id"
  | "name"
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "portionAmount"
  | "portionUnit"
  | "portionText"
  | "nutritionSource"
> & { date?: string };

export function PostMealSelector({
  attached,
  legacyDishName,
  onRemove,
  recentMeals,
  selectedMeal,
  onSelectMeal,
}: {
  attached: boolean;
  legacyDishName?: string;
  onRemove: () => void;
  recentMeals: Meal[];
  selectedMeal: PostMealChoice | null;
  onSelectMeal: (meal: PostMealChoice) => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const selectedName = selectedMeal?.name.trim().toLocaleLowerCase();
  const choices: PostMealChoice[] = selectedMeal && !recentMeals.some((meal) => meal.id === selectedMeal.id)
    ? [selectedMeal, ...recentMeals.filter((meal) => meal.name.trim().toLocaleLowerCase() !== selectedName)]
    : recentMeals;

  const selectMeal = (meal: PostMealChoice) => {
    onSelectMeal(meal);
    setExpanded(false);
  };

  return (
    <View style={styles.section}>
      <View style={[styles.toggleRow, expanded && styles.toggleRowExpanded]}>
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.toggleMain, pressed && styles.pressed]}
        >
          <View style={styles.toggleLeft}>
            <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
            <AppText style={styles.toggleText}>{attached ? t.community.attachedMeal : t.community.attachMeal}</AppText>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.subtle} />
        </Pressable>
        {attached && (
          <Pressable onPress={onRemove} hitSlop={6} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
            <AppText style={styles.removeText}>{t.community.removeAttachedMeal}</AppText>
          </Pressable>
        )}
      </View>

      {selectedMeal ? (
        <Card style={styles.selectedCard}>
          <View style={styles.mealIcon}>
            <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.mealInfo}>
            <AppText variant="body2" style={styles.mealName}>{selectedMeal.name}</AppText>
            <AppText variant="subtle" style={styles.mealMeta}>
              {mealPortionLabel(selectedMeal) || t.community.portionMissing} · {selectedMeal.calories} {t.common.kcal}
            </AppText>
            <AppText variant="subtle" style={styles.mealMeta}>
              {t.labels.protein} {selectedMeal.protein ?? 0} g · {t.labels.carbs} {selectedMeal.carbs ?? 0} g · {t.labels.fat} {selectedMeal.fat ?? 0} g
            </AppText>
            <AppText variant="subtle" style={styles.estimateText}>{t.community.nutritionFromDiary}</AppText>
          </View>
        </Card>
      ) : legacyDishName ? (
        <Card style={styles.selectedCard}>
          <View style={styles.mealIcon}>
            <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.mealInfo}>
            <AppText variant="body2" style={styles.mealName}>{legacyDishName}</AppText>
            <AppText variant="subtle" style={styles.mealMeta}>{t.community.nutritionMissing}</AppText>
          </View>
        </Card>
      ) : null}

      {expanded && (
        choices.length === 0 ? (
          <AppText variant="subtle" style={styles.emptyText}>{t.community.noLoggedMeals}</AppText>
        ) : (
          <View style={styles.mealList}>
            <AppText variant="subtle" style={styles.sectionLabel}>{t.community.chooseFromDiary}</AppText>
            {choices.map((meal) => {
              const active = selectedMeal?.id === meal.id;
              return (
                <Pressable key={meal.id} onPress={() => selectMeal(meal)} accessibilityRole="button" accessibilityState={{ selected: active }}>
                  <Card style={[styles.mealCard, active && styles.mealCardActive]}>
                    <View style={styles.mealIcon}>
                      <Ionicons name={active ? "checkmark" : "restaurant-outline"} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.mealInfo}>
                      <AppText variant="body2" style={styles.mealName}>{meal.name}</AppText>
                      <AppText variant="subtle" style={styles.mealMeta}>
                        {mealPortionLabel(meal) || t.community.portionMissing} · {meal.calories} {t.common.kcal}
                      </AppText>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.space.sm },
  toggleRow: {
    minHeight: 56,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.tintSoft,
    flexDirection: "row",
    alignItems: "center",
  },
  toggleRowExpanded: { borderStyle: "solid", borderColor: theme.colors.primary },
  toggleMain: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: theme.space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
  toggleText: { color: theme.colors.primary, fontWeight: "700" },
  removeButton: { paddingHorizontal: theme.space.md, paddingVertical: theme.space.sm },
  removeText: { color: theme.colors.danger, fontSize: 12, fontWeight: "700" },
  selectedCard: { padding: theme.space.md, flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1.5, borderColor: theme.colors.primary },
  mealList: { gap: theme.space.sm },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  mealCard: { padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: "transparent" },
  mealCardActive: { borderColor: theme.colors.primary },
  mealIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center" },
  mealInfo: { flex: 1, gap: 2 },
  mealName: { fontWeight: "700" },
  mealMeta: { fontSize: 11 },
  estimateText: { fontSize: 11, marginTop: 4 },
  emptyText: { marginLeft: 4 },
  pressed: { opacity: 0.7 },
});
