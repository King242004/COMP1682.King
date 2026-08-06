// ═══ FILE NÀY LÀM GÌ ═══
// Màn Chi tiết bài đăng, xem đầy đủ ảnh và các hành động trên bài.
//
// Ai gọi tới: CommunityScreen, PostTile, UserProfileScreen
// Nhận vào:   mã bài cần xem
// Trả ra:     nội dung bài, kèm nút tim, lưu, và hai nút riêng của bài món ăn
// Khi lỗi:    bài đã bị xóa thì hiện thẻ trạng thái thay vì màn trắng

// LUỒNG MỞ CHI TIẾT
// 1. Chạm một bài ở feed, mở màn này kèm mã bài
// 2. api.getPost                    (GET /community/posts/:id)
// 3. backend kiểm quyền xem rồi trả bài
// 4. hiện ảnh, chú thích, và các nút
// CÁC NÚT TRONG MÀN
//   Tim, gọi POST /community/posts/:id/like, backend tạo hoặc gỡ thông báo cho chủ bài.
//   Lưu bài, gọi POST /community/posts/:id/save, không tạo thông báo.
//   Hỏi Coach cách làm, chỉ có ở bài món ăn, chuyển sang tab Coach kèm câu hỏi.
//     Coach được báo nguồn là community để nói rõ đây chỉ là cách nấu tham khảo,
//     không phải công thức của người đăng.
//   Thêm vào nhật ký, chỉ có ở bài món ăn, sang màn Thêm món điền sẵn tên.
//   Sửa và Xóa, chỉ chủ bài mới thấy.
import { useState, useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { getPost, toggleLike, toggleSave, deletePost, type FeedPost } from "@/features/community/communityApi";
import { initials, communityTime, mealPortionLabel } from "@/features/community/communityDisplay";
import { CommunityStateCard } from "@/features/community/CommunityStateCard";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { ActionSheet } from "@/ui/components/ActionSheet";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();
  const locale = localeTag(resolveLanguage(user?.language));

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      setPost(await getPost(token, id));
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [token, id]);

  // Tự tải lại bài mỗi lần quay về màn, để số tim và nội dung
  // luôn khớp sau khi sửa bài hoặc người khác bấm tim.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Nút tim. Đổi giao diện trước rồi gọi mạng, lỗi thì trả về như cũ.
  // Backend tự tạo thông báo cho chủ bài, hoặc gỡ khi bỏ tim.
  const onLike = async () => {
    if (!token || !post) return;
    const prev = post;
    setPost({ ...post, isLiked: !post.isLiked, likeCount: post.likeCount + (post.isLiked ? -1 : 1) });
    try {
      const res = await toggleLike(token, post.id);
      setPost((p) => (p ? { ...p, isLiked: res.liked, likeCount: res.likeCount } : p));
    } catch {
      setPost(prev);
    }
  };

  // Nút lưu bài. Khác nút tim ở chỗ không tạo thông báo cho ai.
  const onSave = async () => {
    if (!token || !post) return;
    const prev = post;
    setPost({ ...post, isSaved: !post.isSaved });
    try {
      const res = await toggleSave(token, post.id);
      setPost((p) => (p ? { ...p, isSaved: res.saved } : p));
    } catch {
      setPost(prev);
    }
  };

  // Nút Xóa, chỉ chủ bài thấy.
  // Hỏi xác nhận rồi gọi DELETE, backend xóa cả ảnh trên kho
  // và các thông báo trỏ tới bài này.
  const onDelete = () => {
    Alert.alert(t.community.deletePostTitle, t.community.deletePostMsg, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          if (!token || !post) return;
          try {
            await deletePost(token, post.id);
            router.back();
          } catch {
            Alert.alert(t.community.couldntDelete, t.common.tryAgain);
          }
        },
      },
    ]);
  };

  const askCoachHow = () => {
    const dishName = post?.dishName || post?.meal?.name;
    if (!dishName) return;
    router.push({
      pathname: "/tabs/coach",
      params: {
        ask: t.community.cookQuestion(dishName),
        recipeNotice: "community",
        // Mỗi lần chạm có một mã riêng để tab Coach chỉ xử lý yêu cầu một lần.
        askId: String(Date.now()),
      },
    });
  };

  const addToDiary = () => {
    const dishName = post?.dishName || post?.meal?.name;
    if (!dishName) return;
    router.push({
      pathname: "/meals/add",
      params: {
        prefillName: dishName,
        ...(post.meal
          ? {
              prefillCalories: String(post.meal.calories),
              prefillProtein: String(post.meal.protein),
              prefillCarbs: String(post.meal.carbs),
              prefillFat: String(post.meal.fat),
              ...(post.meal.portionAmount != null ? { prefillAmount: String(post.meal.portionAmount) } : {}),
              ...(post.meal.portionUnit ? { prefillUnit: post.meal.portionUnit } : {}),
              ...(post.meal.portionText ? { prefillPortion: post.meal.portionText } : {}),
            }
          : {}),
        source: "community",
      },
    });
  };

  if (!post) {
    return (
      <Screen padded={false}>
        <View style={styles.stateBox}>
          <ScreenHeader title={t.community.postDetailTitle} />
          {loadError ? (
            <CommunityStateCard
              icon="cloud-offline-outline"
              title={t.community.loadPostError}
              subtitle={t.community.loadPostErrorSub}
              onRetry={load}
            />
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </View>
      </Screen>
    );
  }

  const isMine = post.author.id === user?.id;
  const dishName = post.dishName || post.meal?.name || null;
  const portion = post.meal ? mealPortionLabel(post.meal) : null;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t.community.postDetailTitle}
          right={
            isMine ? (
              <Pressable onPress={() => setMenuOpen(true)} hitSlop={10} style={({ pressed }) => [pressed && styles.pressed]}>
                <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
              </Pressable>
            ) : undefined
          }
        />

        <Card style={styles.card}>
          {/* Author row */}
          <Pressable
            onPress={() => router.push({ pathname: "/community/user-profile", params: { id: post.author.id } })}
            style={styles.authorRow}
          >
            <View style={styles.avatar}>
              {post.author.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.avatarImg} cachePolicy="memory-disk" accessible={false} />
              ) : (
                <AppText style={styles.avatarInitials}>{initials(post.author.name)}</AppText>
              )}
            </View>
            <View style={styles.flex1}>
              <AppText variant="body2" style={styles.bold}>{post.author.name}</AppText>
              <AppText variant="subtle" style={styles.timeText}>
                {communityTime(post.createdAt, t, locale)}
              </AppText>
            </View>
          </Pressable>

          <View style={[styles.typePill, dishName ? styles.mealTypePill : styles.shareTypePill]}>
            <Ionicons
              name={dishName ? "restaurant-outline" : "images-outline"}
              size={14}
              color={dishName ? theme.colors.primary : theme.colors.muted}
            />
            <AppText style={[styles.typePillText, !dishName && styles.shareTypeText]}>
              {dishName ? t.community.mealBadge : t.community.shareBadge}
            </AppText>
          </View>

          {!!post.caption && (
            <AppText variant="body2" style={styles.caption}>{post.caption}</AppText>
          )}

          {post.images && post.images.length > 1 ? (
            <View onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}>
              {carouselWidth > 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) =>
                  setImageIndex(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, e.nativeEvent.layoutMeasurement.width)))
                }
              >
                {post.images.map((uri) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={[styles.postImage, { width: carouselWidth }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                    accessible={false}
                  />
                ))}
              </ScrollView>
              )}
              <View style={styles.countPill}>
                <AppText style={styles.countText}>{imageIndex + 1}/{post.images.length}</AppText>
              </View>
              <View style={styles.dotRow}>
                {post.images.map((uri, i) => (
                  <View key={uri} style={[styles.dot, i === imageIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          ) : post.image ? (
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              accessible={false}
            />
          ) : null}

          {/* Nutrition snapshot */}
          {dishName && (
            <View style={styles.mealChip}>
              <View style={styles.mealIcon}>
                <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.flex1}>
                <AppText variant="body2" style={styles.bold}>{dishName}</AppText>
                <AppText variant="subtle" style={styles.timeText}>
                  {post.meal
                    ? `${portion || t.community.portionMissing} · ${post.meal.calories} ${t.common.kcal}`
                    : t.community.nutritionMissing}
                </AppText>
                {post.meal && (
                  <>
                    <AppText variant="subtle" style={styles.timeText}>
                      {t.labels.protein} {post.meal.protein} g · {t.labels.carbs} {post.meal.carbs} g · {t.labels.fat} {post.meal.fat} g
                    </AppText>
                    <AppText variant="subtle" style={styles.estimateText}>{t.community.nutritionFromDiary}</AppText>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.footerRow}>
            <Pressable
              onPress={onLike}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={post.isLiked ? t.a11y.unlikePost : t.a11y.likePost}
              accessibilityState={{ selected: post.isLiked }}
              style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}
            >
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={post.isLiked ? theme.colors.danger : theme.colors.subtle}
              />
              <AppText variant="body2" style={post.isLiked ? styles.likeCountLiked : styles.likeCount}>
                {post.likeCount > 0 ? post.likeCount : ""}
              </AppText>
            </Pressable>
            <View style={styles.footerActions}>
              <Pressable
                onPress={onSave}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={post.isSaved ? t.a11y.unsavePost : t.a11y.savePost}
                accessibilityState={{ selected: post.isSaved }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Ionicons
                  name={post.isSaved ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={post.isSaved ? theme.colors.primary : theme.colors.subtle}
                />
              </Pressable>
            </View>
          </View>
        </Card>

        {dishName ? (
          <View style={styles.trySection}>
            <AppText variant="subtle" style={styles.sectionLabel}>{t.community.tryThisMeal}</AppText>
            <View style={styles.referenceNote}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.subtle} />
              <AppText variant="subtle" style={styles.referenceNoteText}>{t.community.communityActionHint}</AppText>
            </View>
            <View style={styles.tryRow}>
              <Pressable
                onPress={askCoachHow}
                accessibilityRole="button"
                style={({ pressed }) => [styles.tryBtn, pressed && styles.pressed]}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
                <AppText style={styles.tryBtnText}>{t.community.howToCook}</AppText>
              </Pressable>
              <Pressable
                onPress={addToDiary}
                accessibilityRole="button"
                style={({ pressed }) => [styles.tryBtn, styles.tryBtnAccent, pressed && styles.pressed]}
              >
                <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent} />
                <AppText style={[styles.tryBtnText, styles.tryBtnTextAccent]}>{t.community.addToDiary}</AppText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.generalInfo}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.subtle} />
            <AppText variant="subtle" style={styles.generalInfoText}>{t.community.generalPostInfo}</AppText>
          </View>
        )}
      </ScrollView>

      <ActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          {
            label: t.community.editPost,
            icon: "create-outline",
            onPress: () => router.push({ pathname: "/community/post-edit", params: { id: post.id } }),
          },
          { label: t.community.deletePost, icon: "trash-outline", destructive: true, onPress: onDelete },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  stateBox: { paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  card: { padding: 0, overflow: "hidden" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: theme.space.lg },
  avatar: {
    width: 40, height: 40, borderRadius: 20, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: { color: theme.colors.primary, fontWeight: "700" },
  flex1: { flex: 1 },
  bold: { fontWeight: "700" },
  timeText: { fontSize: 11 },
  caption: { paddingHorizontal: theme.space.lg, paddingBottom: theme.space.md },
  typePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  mealTypePill: { backgroundColor: theme.colors.tint },
  shareTypePill: { backgroundColor: "rgba(0,0,0,0.04)" },
  typePillText: { color: theme.colors.primary, fontSize: 11, fontWeight: "700" },
  shareTypeText: { color: theme.colors.muted },
  postImage: { width: "100%", aspectRatio: 1 },
  countPill: {
    position: "absolute", right: 10, top: 10,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  dotRow: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.border },
  dotActive: { backgroundColor: theme.colors.primary },
  mealChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: theme.space.lg, marginBottom: 0, padding: theme.space.md,
    borderRadius: theme.radius.card, backgroundColor: theme.colors.tintSoft,
  },
  mealIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  footerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeCount: { color: theme.colors.muted },
  likeCountLiked: { color: theme.colors.danger },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 18 },
  trySection: { gap: theme.space.sm },
  referenceNote: { flexDirection: "row", alignItems: "flex-start", gap: 7, paddingHorizontal: 4 },
  referenceNoteText: { flex: 1, fontSize: 11, lineHeight: 16 },
  estimateText: { fontSize: 11, marginTop: 3 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  tryRow: { flexDirection: "row", gap: theme.space.sm },
  tryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 12, borderRadius: theme.radius.button,
    backgroundColor: theme.colors.tint,
  },
  tryBtnAccent: { backgroundColor: "rgba(5,150,105,0.10)" },
  tryBtnText: { fontSize: 13, fontWeight: "700", color: theme.colors.primary },
  tryBtnTextAccent: { color: theme.colors.accent },
  generalInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: theme.space.md,
    borderRadius: theme.radius.card,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  generalInfoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.7 },
});
