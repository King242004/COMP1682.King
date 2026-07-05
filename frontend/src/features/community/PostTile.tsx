import { Image, Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { FeedPost } from "./api";

// Square lookbook tile for the 2-column grids (Explore / profile / Saved).
// Image posts show the photo; text-only posts show a tinted card so the grid
// has no holes. A kcal chip overlays when the post carries a meal snapshot.
export function PostTile({ post, onPress }: { post: FeedPost; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.fallback}>
          <AppText style={styles.fallbackEmoji}>🍽️</AppText>
          <AppText variant="body2" style={styles.fallbackText} numberOfLines={3}>
            {post.meal?.name || post.caption}
          </AppText>
        </View>
      )}
      {post.meal && (
        <View style={styles.kcalChip}>
          <AppText style={styles.kcalText}>{post.meal.calories} kcal</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1, aspectRatio: 1, borderRadius: 14, overflow: "hidden",
    backgroundColor: theme.colors.tintSoft,
    maxWidth: "50%", // odd last row: keep the lone tile half-width, not stretched
  },
  pressed: { opacity: 0.8 },
  image: { width: "100%", height: "100%" },
  fallback: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 6, padding: theme.space.md,
  },
  fallbackEmoji: { fontSize: 26 },
  fallbackText: { textAlign: "center", color: theme.colors.muted, fontWeight: "600" },
  kcalChip: {
    position: "absolute", left: 8, bottom: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.pill,
    backgroundColor: "rgba(22,78,99,0.72)",
  },
  kcalText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
