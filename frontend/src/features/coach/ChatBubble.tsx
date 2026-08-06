// Một bong bóng tin nhắn trong màn Coach. Chỉ vẽ, không gọi mạng, không giữ state.
// Tin nhắn của Coach có thể kèm một món ăn AI gợi ý. Lúc đó bong bóng hiện thêm
// thẻ dinh dưỡng cùng nút mở màn Thêm món, và đổi thành nhãn đã ghi sau khi lưu.
import { Image, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { ChatMessage } from "@/features/coach/coachApi";

export function ChatBubble({ m, labels, onReviewMeal }: {
  m: ChatMessage;
  labels: { reviewMeal: string; estimatedNutrition: string; logged: string };
  onReviewMeal: () => void;
}) {
  const isUser = m.role === "user";
  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
      {m.image && <Image source={{ uri: m.image }} style={[styles.image, m.text ? styles.imageWithText : null]} resizeMode="cover" />}
      {!!m.text && <AppText style={[styles.text, isUser && styles.textUser]}>{m.text}</AppText>}
      {m.meal && (
        <View style={styles.mealCard}>
          <AppText variant="subtle" style={styles.estimateLabel}>{labels.estimatedNutrition}</AppText>
          <AppText style={styles.mealName}>{m.meal.name} · {m.meal.calories} kcal</AppText>
          <AppText variant="subtle" style={styles.mealMacros}>P {m.meal.protein}g · C {m.meal.carbs}g · F {m.meal.fat}g</AppText>
          {m.loggedId ? (
            <View style={styles.loggedChip}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
              <AppText style={styles.loggedText}>{labels.logged}</AppText>
            </View>
          ) : (
            <Pressable onPress={onReviewMeal} style={({ pressed }) => [styles.reviewBtn, pressed && styles.pressed]}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <AppText style={styles.reviewText}>{labels.reviewMeal}</AppText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12 },
  // Dùng màu xanh đậm của bảng màu thay vì màu chính, vì màu chính trùng
  // với thanh đầu màn nên hai khối dính vào nhau khi nhìn.
  bubbleUser: { alignSelf: "flex-end", backgroundColor: theme.colors.text },
  bubbleCoach: { alignSelf: "flex-start", backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  image: { width: 180, height: 180, borderRadius: 10 },
  imageWithText: { marginBottom: 8 },
  text: { fontSize: 14, color: theme.colors.text },
  textUser: { color: "#fff" },
  mealCard: { marginTop: 8, gap: 7, backgroundColor: "rgba(8,145,178,0.06)", borderRadius: 10, padding: 10 },
  estimateLabel: { fontSize: 10, textTransform: "uppercase", fontWeight: "700" },
  mealName: { fontSize: 13, fontWeight: "700", color: theme.colors.text },
  mealMacros: { fontSize: 11 },
  reviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 9 },
  reviewText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  loggedChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(5,150,105,0.10)", borderRadius: 10, padding: 8 },
  loggedText: { fontSize: 12, color: theme.colors.accent, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
