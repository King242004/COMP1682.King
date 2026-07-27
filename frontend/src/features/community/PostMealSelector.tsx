import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Meal } from "@/context/MealsContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { TextField } from "@/ui/components/TextField";

export type PostKind = "share" | "meal";
export type MealSource = "manual" | "diary";
export type PostMealChoice = Pick<Meal, "id" | "name" | "calories" | "protein" | "carbs" | "fat"> & {
  date?: string;
};

export function PostMealSelector({
  kind,
  onKindChange,
  source,
  onSourceChange,
  dishName,
  onDishNameChange,
  recentMeals,
  selectedMeal,
  onSelectMeal,
}: {
  kind: PostKind;
  onKindChange: (kind: PostKind) => void;
  source: MealSource;
  onSourceChange: (source: MealSource) => void;
  dishName: string;
  onDishNameChange: (name: string) => void;
  recentMeals: Meal[];
  selectedMeal: PostMealChoice | null;
  onSelectMeal: (meal: PostMealChoice) => void;
}) {
  const t = useT();
  const selectedName = selectedMeal?.name.trim().toLocaleLowerCase();
  const choices: PostMealChoice[] = selectedMeal && !recentMeals.some((meal) => meal.id === selectedMeal.id)
    ? [
        selectedMeal,
        ...recentMeals.filter((meal) => meal.name.trim().toLocaleLowerCase() !== selectedName),
      ]
    : recentMeals;

  return (
    <View style={styles.section}>
      <AppText variant="subtle" style={styles.sectionLabel}>{t.community.sharingWhat}</AppText>
      <View style={styles.kindRow}>
        <KindButton
          active={kind === "share"}
          icon="images-outline"
          label={t.community.sharePost}
          onPress={() => onKindChange("share")}
        />
        <KindButton
          active={kind === "meal"}
          icon="restaurant-outline"
          label={t.community.mealPost}
          onPress={() => onKindChange("meal")}
        />
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={theme.colors.subtle} />
        <AppText variant="subtle" style={styles.hintText}>
          {kind === "share" ? t.community.sharePostHint : t.community.mealPostHint}
        </AppText>
      </View>

      {kind === "meal" && (
        <View style={styles.mealDetails}>
          <AppText variant="subtle" style={styles.sectionLabel}>{t.community.mealDetailsMethod}</AppText>
          <View style={styles.sourceRow}>
            <SourceButton
              active={source === "manual"}
              icon="create-outline"
              label={t.community.enterDishName}
              onPress={() => onSourceChange("manual")}
            />
            <SourceButton
              active={source === "diary"}
              icon="book-outline"
              label={t.community.chooseFromDiary}
              onPress={() => onSourceChange("diary")}
            />
          </View>

          {source === "manual" ? (
            <TextField
              label={t.community.dishNameLabel}
              placeholder={t.community.dishNamePlaceholder}
              value={dishName}
              onChangeText={onDishNameChange}
              autoCapitalize="sentences"
              returnKeyType="done"
              inputProps={{ maxLength: 100 }}
            />
          ) : choices.length === 0 ? (
            <AppText variant="subtle" style={styles.emptyText}>{t.community.noLoggedMeals}</AppText>
          ) : (
            <View style={styles.mealList}>
              {choices.map((meal) => {
                const active = selectedMeal?.id === meal.id;
                return (
                  <Pressable
                    key={meal.id}
                    onPress={() => onSelectMeal(meal)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Card style={[styles.mealCard, active && styles.mealCardActive]}>
                      <View style={styles.mealIcon}>
                        <Ionicons
                          name={active ? "checkmark" : "restaurant-outline"}
                          size={18}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.mealInfo}>
                        <AppText variant="body2" style={styles.mealName}>{meal.name}</AppText>
                        <AppText variant="subtle" style={styles.mealMeta}>
                          {meal.date
                            ? t.community.mealMeta(meal.calories, meal.date)
                            : `${meal.calories} ${t.common.kcal}`}
                        </AppText>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          )}

          {source === "manual" && dishName.trim().length > 0 && dishName.trim().length < 2 && (
            <AppText style={styles.errorText}>{t.community.dishNameRequired}</AppText>
          )}
        </View>
      )}
    </View>
  );
}

function KindButton({ active, icon, label, onPress }: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.kindButton, active && styles.choiceActive, pressed && styles.pressed]}
    >
      <Ionicons name={active ? "checkmark-circle" : icon} size={21} color={theme.colors.primary} />
      <AppText style={styles.kindLabel}>{label}</AppText>
    </Pressable>
  );
}

function SourceButton({ active, icon, label, onPress }: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.sourceButton, active && styles.choiceActive, pressed && styles.pressed]}
    >
      <Ionicons name={active ? "checkmark-circle" : icon} size={18} color={theme.colors.primary} />
      <AppText style={styles.sourceLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.space.sm },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  kindRow: { flexDirection: "row", gap: theme.space.sm },
  kindButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: theme.space.sm,
  },
  choiceActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.tintSoft },
  kindLabel: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    padding: theme.space.sm,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.025)",
  },
  hintText: { flex: 1, fontSize: 11, lineHeight: 16 },
  mealDetails: { gap: theme.space.sm, paddingTop: theme.space.xs },
  sourceRow: { flexDirection: "row", gap: theme.space.sm },
  sourceButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: theme.space.xs,
  },
  sourceLabel: { color: theme.colors.text, fontSize: 12, fontWeight: "700" },
  mealList: { gap: theme.space.sm },
  mealCard: {
    padding: theme.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mealCardActive: { borderColor: theme.colors.primary },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: { flex: 1 },
  mealName: { fontWeight: "700" },
  mealMeta: { fontSize: 11 },
  emptyText: { marginLeft: 4 },
  errorText: { color: theme.colors.danger, fontSize: 12, marginLeft: 4 },
  pressed: { opacity: 0.7 },
});
