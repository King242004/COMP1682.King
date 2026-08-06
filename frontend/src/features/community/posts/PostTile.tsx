// ═══ FILE NÀY LÀM GÌ ═══
// Một ô bài đăng trong danh sách, hoặc một ô trong lưới trang cá nhân.
//
// Ai gọi tới: CommunityScreen, UserProfileScreen
// Nhận vào:   dữ liệu một bài đăng
// Trả ra:     ô bài kèm ảnh, tim và lượt lưu
// Khi lỗi:    ảnh hỏng thì hiện khung xám, không làm vỡ cả danh sách

import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { initials, communityTime } from "../communityDisplay";
import type { FeedPost } from "../communityApi";

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
  const { user } = useAuth();
  const locale = localeTag(resolveLanguage(user?.language));
  return (
    <View style={styles.wrap}>
      <View style={styles.tile}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={post.caption || post.dishName || post.meal?.name || t.a11y.openPost}
          style={({ pressed }) => [styles.tilePress, pressed && styles.pressed]}
        >
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            accessible={false}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="restaurant-outline" size={26} color={theme.colors.primary} />
            <AppText variant="body2" style={styles.fallbackText} numberOfLines={3}>
              {post.dishName || post.meal?.name || post.caption}
            </AppText>
          </View>
        )}

        {post.meal && (
          <View style={styles.kcalChip}>
            <Ionicons name="restaurant-outline" size={11} color="#fff" />
            <AppText style={styles.kcalText}>{post.meal.calories} {t.common.kcal}</AppText>
          </View>
        )}

        {!post.meal && post.dishName && (
          <View style={styles.kcalChip}>
            <Ionicons name="restaurant-outline" size={11} color="#fff" />
            <AppText style={styles.kcalText}>{t.community.mealBadge}</AppText>
          </View>
        )}

        {post.images && post.images.length > 1 && (
          <View style={styles.multiBadge}>
            <Ionicons name="copy" size={14} color="#fff" />
          </View>
        )}

        {showAuthor && (
          <View style={styles.authorChip}>
            <View style={styles.authorAvatar}>
              {post.author.avatar ? (
                <Image
                  source={{ uri: post.author.avatar }}
                  style={styles.authorAvatarImg}
                  cachePolicy="memory-disk"
                  accessible={false}
                />
              ) : (
                <AppText style={styles.authorInitials}>{initials(post.author.name)}</AppText>
              )}
            </View>
            <AppText style={styles.authorName} numberOfLines={1}>{post.author.name}</AppText>
          </View>
        )}

        </Pressable>

        {onLike && (
          <Pressable
            onPress={onLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={post.isLiked ? t.a11y.unlikePost : t.a11y.likePost}
            accessibilityState={{ selected: post.isLiked }}
            style={({ pressed }) => [styles.heartBtn, pressed && styles.pressed]}
          >
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={17}
              color={post.isLiked ? theme.colors.danger : "#fff"}
            />
          </Pressable>
        )}
      </View>

      {showTime && (
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={11} color={theme.colors.subtle} />
          <AppText variant="subtle" style={styles.timeText}>
            {communityTime(post.createdAt, t, locale)}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    // Ô cuối của hàng lẻ vẫn giữ nửa chiều rộng, không kéo giãn cả hàng.
    maxWidth: "50%",
    gap: 4,
  },
  tile: {
    aspectRatio: 1, borderRadius: 14, overflow: "hidden",
    backgroundColor: theme.colors.tintSoft,
  },
  tilePress: { flex: 1 },
  pressed: { opacity: 0.8 },
  image: { width: "100%", height: "100%" },
  fallback: {
    flex: 1, alignItems: "center", justifyContent: "center",
    // Chừa khoảng dưới để chữ không bị các nhãn nổi che mất.
    gap: 6, padding: theme.space.md, paddingBottom: 40,
  },
  fallbackText: { textAlign: "center", color: theme.colors.muted, fontWeight: "600" },
  kcalChip: {
    position: "absolute", left: 8, top: 8,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.pill,
    backgroundColor: "rgba(22,78,99,0.72)",
  },
  kcalText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  multiBadge: {
    position: "absolute", right: 8, top: 8,
    width: 26, height: 26, borderRadius: 13,
    // Nền tối giúp biểu tượng nhiều ảnh vẫn rõ trên ảnh sáng.
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  authorChip: {
    position: "absolute", left: 8, bottom: 8,
    // Giới hạn chiều rộng để nhãn tác giả không đè lên nút tim.
    maxWidth: "70%",
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
