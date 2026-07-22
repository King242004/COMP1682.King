// One chat bubble (user or coach), including the suggested-meal card:
// meal-type chips + Add button while eating, Logged chip + Undo afterwards.
import { Image, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { ChatMessage } from "@/features/coach/api";

export function ChatBubble({ m, labels, mealOpts, onSetMealType, onAcceptLog, onUndoLog }: {
  m: ChatMessage;
  labels: { add: string; logged: string; undo: string };
  mealOpts: [string, string][];
  onSetMealType: (mealType: string) => void;
  onAcceptLog: () => void;
  onUndoLog: () => void;
}) {
  const isUser = m.role === "user";

  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
      {m.image && (
        <Image
          source={{ uri: m.image }}
          style={[styles.image, m.text ? styles.imageWithText : null]}
          resizeMode="cover"
        />
      )}
      {!!m.text && (
        <AppText style={[styles.text, isUser && styles.textUser]}>{m.text}</AppText>
      )}

      {/* Suggested meal: Add card → after adding becomes a Logged chip */}
      {m.meal && (
        m.loggedId ? (
          <View style={styles.loggedChip}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
            <AppText style={styles.loggedText}>
              {labels.logged} {m.meal.name} ({m.meal.calories} kcal · {m.meal.mealType})
            </AppText>
            <Pressable onPress={onUndoLog} hitSlop={6}>
              <AppText style={styles.undoText}>{labels.undo}</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.mealCard}>
            <View>
              <AppText style={styles.mealName}>
                {m.meal.name} · {m.meal.calories} kcal
              </AppText>
              <AppText variant="subtle" style={styles.mealMacros}>
                P {m.meal.protein} · C {m.meal.carbs} · F {m.meal.fat}
              </AppText>
            </View>
            {/* Meal type picker — only when the user is actually eating it */}
            {m.eating && (
              <View style={styles.chipRow}>
                {mealOpts.map(([key, label]) => {
                  const active = m.meal!.mealType === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSetMealType(key)}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                    >
                      <AppText style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {/* Accept button — only when the user is actually eating it */}
            {m.eating && (
              <Pressable
                onPress={onAcceptLog}
                style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
              >
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <AppText style={styles.addText}>{labels.add}</AppText>
              </Pressable>
            )}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12 },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: theme.colors.primary },
  bubbleCoach: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  image: { width: 180, height: 180, borderRadius: 10 },
  imageWithText: { marginBottom: 8 },
  text: { fontSize: 14, color: theme.colors.text },
  textUser: { color: "#fff" },

  loggedChip: {
    marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(5,150,105,0.10)", borderRadius: 10, padding: 8,
  },
  loggedText: { flex: 1, fontSize: 12, color: theme.colors.text },
  undoText: { fontSize: 12, fontWeight: "700", color: theme.colors.danger },

  mealCard: {
    marginTop: 8, gap: 8,
    backgroundColor: "rgba(8,145,178,0.06)", borderRadius: 10, padding: 10,
  },
  mealName: { fontSize: 13, fontWeight: "700", color: theme.colors.text },
  mealMacros: { fontSize: 11 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  typeChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  typeChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  typeChipText: { fontSize: 11, fontWeight: "700", color: theme.colors.subtle },
  typeChipTextActive: { color: "#fff" },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 10, paddingVertical: 9,
  },
  addBtnPressed: { backgroundColor: theme.colors.primary2 },
  addText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
