import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { initials, timeAgoParts } from "./helpers";
import type { FeedPost } from "./api";

// WEAR-style lookbook tile for the 2-column grids (feed, explore, profile, saved):
// photo with author chip overlaid bottom-left, tappable heart bottom-right,
// kcal chip top-left, optional "x ago" line under the tile (Following feed).
// Text-only posts render a tinted card so the grid has no holes.
export function PostTile({
  post,
  onPress,
  onLike,
  showAuthor = true,
  showTime = false,
}: {
  post: FeedPost;
  onPress: () => void;
  onLike?: () => void;
  showAuthor?: boolean;
  showTime?: boolean;
}) {
  const t = useT();
  return (
    <View style={styles.wrap}>
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
            <AppText style={styles.kcalText}>{post.meal.calories} {t.common.kcal}</AppText>
          </View>
        )}

        {/* Instagram-style stacked-copies badge when the post carries 2+ images */}
        {post.images && post.images.length > 1 && (
          <View style={styles.multiBadge}>
            <Ionicons name="copy" size={13} color="#fff" />
          </View>
        )}

        {showAuthor && (
          <View style={styles.authorChip}>
            <View style={styles.authorAvatar}>
              {post.author.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.authorAvatarImg} />
              ) : (
                <AppText style={styles.authorInitials}>{initials(post.author.name)}</AppText>
              )}
            </View>
            <AppText style={styles.authorName} numberOfLines={1}>{post.author.name}</AppText>
          </View>
        )}

        {onLike && (
          <Pressable onPress={onLike} hitSlop={8} style={({ pressed }) => [styles.heartBtn, pressed && styles.pressed]}>
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={17}
              color={post.isLiked ? theme.colors.danger : "#fff"}
            />
          </Pressable>
        )}
      </Pressable>

      {showTime && (
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={11} color={theme.colors.subtle} />
          <AppText variant="subtle" style={styles.timeText}>
            {(() => { const p = timeAgoParts(post.createdAt); return t.community.timeAgoText(p.n, p.unit); })()}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    maxWidth: "50%", // odd last row: keep the lone tile half-width, not stretched
    gap: 4,
  },
  tile: {
    aspectRatio: 1, borderRadius: 14, overflow: "hidden",
    backgroundColor: theme.colors.tintSoft,
  },
  pressed: { opacity: 0.8 },
  image: { width: "100%", height: "100%" },
  fallback: {
    flex: 1, alignItems: "center", justifyContent: "center",
    gap: 6, padding: theme.space.md, paddingBottom: 40, // keep text clear of the overlay chips
  },
  fallbackEmoji: { fontSize: 26 },
  fallbackText: { textAlign: "center", color: theme.colors.muted, fontWeight: "600" },
  kcalChip: {
    position: "absolute", left: 8, top: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.pill,
    backgroundColor: "rgba(22,78,99,0.72)",
  },
  kcalText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  multiBadge: {
    position: "absolute", right: 8, top: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  authorChip: {
    position: "absolute", left: 8, bottom: 8,
    maxWidth: "70%", // shrink-to-fit but never overlap the heart button
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 3, paddingLeft: 3, paddingRight: 9, borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  authorAvatar: {
    width: 22, height: 22, borderRadius: 11, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  authorAvatarImg: { width: "100%", height: "100%" },
  authorInitials: { color: theme.colors.primary, fontSize: 9, fontWeight: "700" },
  authorName: { color: "#fff", fontSize: 11, fontWeight: "700", flexShrink: 1 },
  heartBtn: {
    position: "absolute", right: 8, bottom: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center", justifyContent: "center",
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 2 },
  timeText: { fontSize: 11 },
});
