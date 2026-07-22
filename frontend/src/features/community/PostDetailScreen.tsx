import { useState, useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getPost, toggleLike, toggleSave, deletePost, type FeedPost } from "@/features/community/api";
import { initials, communityTime } from "@/features/community/helpers";
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

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Multi-image carousel: current page + measured page width (paging needs it)
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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Optimistic like, then sync from server
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

  // Optimistic save (WEAR-style bookmark)
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

  // "Try this meal" actions — the WEAR save-and-act loop
  const askCoachHow = () => {
    if (!post?.meal) return;
    router.push({
      pathname: "/tabs/coach" as any,
      params: {
        ask: t.community.cookQuestion(post.meal.name),
        askId: String(Date.now()), // unique per tap — consumed once on the Coach tab
      },
    });
  };

  const addToDiary = () => {
    if (!post?.meal) return;
    router.push({
      pathname: "/meals/add" as any,
      params: {
        prefillName: post.meal.name,
        prefillCalories: String(post.meal.calories),
        prefillProtein: String(post.meal.protein),
        prefillCarbs: String(post.meal.carbs),
        prefillFat: String(post.meal.fat),
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
            <Card style={styles.errorCard}>
              <AppText style={styles.emptyEmoji}>📡</AppText>
              <AppText variant="h2" style={styles.centerText}>{t.community.loadPostError}</AppText>
              <AppText variant="muted" style={styles.centerText}>{t.community.loadPostErrorSub}</AppText>
              <Pressable onPress={load} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
                <AppText style={styles.retryText}>{t.common.retry}</AppText>
              </Pressable>
            </Card>
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
                {communityTime(post.createdAt, t)}
              </AppText>
            </View>
          </Pressable>

          {!!post.caption && (
            <AppText variant="body2" style={styles.caption}>{post.caption}</AppText>
          )}

          {/* Images — single shows plain; 2+ becomes an Instagram-style swipe
              carousel with dot indicators */}
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
              {/* Instagram-style "n/total" counter, top-right over the photo */}
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
          {post.meal && (
            <View style={styles.mealChip}>
              <View style={styles.mealIcon}>
                <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.flex1}>
                <AppText variant="body2" style={styles.bold}>{post.meal.name}</AppText>
                <AppText variant="subtle" style={styles.timeText}>
                  {post.meal.calories} {t.common.kcal} · P {post.meal.protein} · C {post.meal.carbs} · F {post.meal.fat}
                </AppText>
              </View>
            </View>
          )}

          {/* Like + save (edit/delete moved to the ⋯ menu in the header) */}
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

        {/* Try this meal — save-and-act loop unique to MealMate */}
        {post.meal && (
          <View style={styles.trySection}>
            <AppText variant="subtle" style={styles.sectionLabel}>{t.community.tryThisMeal}</AppText>
            <View style={styles.tryRow}>
              <Pressable onPress={askCoachHow} style={({ pressed }) => [styles.tryBtn, pressed && styles.pressed]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
                <AppText style={styles.tryBtnText}>{t.community.howToCook}</AppText>
              </Pressable>
              <Pressable onPress={addToDiary} style={({ pressed }) => [styles.tryBtn, styles.tryBtnAccent, pressed && styles.pressed]}>
                <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent} />
                <AppText style={[styles.tryBtnText, styles.tryBtnTextAccent]}>{t.community.addToDiary}</AppText>
              </Pressable>
            </View>
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
            onPress: () => router.push({ pathname: "/community/post-edit" as any, params: { id: post.id } }),
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
  errorCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  centerText: { textAlign: "center" },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
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
  pressed: { opacity: 0.7 },
});
