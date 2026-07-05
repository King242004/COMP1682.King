import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { initials, timeAgo } from "./helpers";
import type { FeedPost } from "./api";

// One post card, shared by the feed and the user-profile screens.
// The author row is optional (a profile page already says who posted).
// `onOpen` makes the caption/image tappable → post detail.
export function PostCard({
  post,
  showAuthor = true,
  onPressAuthor,
  onOpen,
  onLike,
  onSave,
  onDelete,
}: {
  post: FeedPost;
  showAuthor?: boolean;
  onPressAuthor?: () => void;
  onOpen?: () => void;
  onLike?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card style={styles.card}>
      {showAuthor && (
        <Pressable onPress={onPressAuthor} disabled={!onPressAuthor} style={styles.authorRow}>
          <View style={styles.avatar}>
            {post.author.avatar ? (
              <Image source={{ uri: post.author.avatar }} style={styles.avatarImg} />
            ) : (
              <AppText style={styles.avatarInitials}>{initials(post.author.name)}</AppText>
            )}
          </View>
          <View style={styles.authorInfo}>
            <AppText variant="body2" style={styles.bold}>{post.author.name}</AppText>
            <AppText variant="subtle" style={styles.timeText}>{timeAgo(post.createdAt)} ago</AppText>
          </View>
        </Pressable>
      )}

      <Pressable onPress={onOpen} disabled={!onOpen}>
        {!!post.caption && (
          <AppText variant="body2" style={[styles.caption, !showAuthor && styles.captionNoAuthor]}>
            {post.caption}
          </AppText>
        )}

        {post.image && (
          <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
        )}
      </Pressable>

      {post.meal && (
        <View style={styles.mealChip}>
          <View style={styles.mealIcon}>
            <AppText style={styles.mealEmoji}>🍽️</AppText>
          </View>
          <View style={styles.authorInfo}>
            <AppText variant="body2" style={styles.bold}>{post.meal.name}</AppText>
            <AppText variant="subtle" style={styles.timeText}>
              {post.meal.calories} kcal · P {post.meal.protein} · C {post.meal.carbs} · F {post.meal.fat}
            </AppText>
          </View>
        </View>
      )}

      {/* Footer: like on the left; save bookmark + delete (own posts) on the right */}
      <View style={styles.footerRow}>
        <Pressable
          onPress={onLike}
          disabled={!onLike}
          hitSlop={8}
          style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={22}
            color={post.isLiked ? theme.colors.danger : theme.colors.subtle}
          />
          <AppText variant="body2" style={post.isLiked ? styles.likeCountLiked : styles.likeCount}>
            {post.likeCount > 0 ? post.likeCount : ""}
          </AppText>
        </Pressable>
        <View style={styles.footerActions}>
          {onSave && (
            <Pressable onPress={onSave} hitSlop={8} style={({ pressed }) => [pressed && styles.pressed]}>
              <Ionicons
                name={post.isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={post.isSaved ? theme.colors.primary : theme.colors.subtle}
              />
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={8} style={({ pressed }) => [pressed && styles.pressed]}>
              <Ionicons name="trash-outline" size={19} color={theme.colors.subtle} />
            </Pressable>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: "hidden" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: theme.space.lg },
  avatar: {
    width: 40, height: 40, borderRadius: 20, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: { color: theme.colors.primary, fontWeight: "700" },
  authorInfo: { flex: 1 },
  bold: { fontWeight: "700" },
  timeText: { fontSize: 11 },
  caption: { paddingHorizontal: theme.space.lg, paddingBottom: theme.space.md },
  captionNoAuthor: { paddingTop: theme.space.lg },
  postImage: { width: "100%", aspectRatio: 1 },
  mealChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: theme.space.lg, marginBottom: 0, padding: theme.space.md,
    borderRadius: theme.radius.card, backgroundColor: theme.colors.tintSoft,
  },
  mealIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  mealEmoji: { fontSize: 18 },
  footerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  likeCount: { color: theme.colors.muted },
  likeCountLiked: { color: theme.colors.danger },
  pressed: { opacity: 0.6 },
});
