import { useState, useCallback } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getPost, toggleLike, toggleSave, deletePost, type FeedPost } from "@/features/community/api";
import { initials, timeAgo } from "@/features/community/helpers";
import { resolveLanguage } from "@/utils/language";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const lang = resolveLanguage(user?.language);

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);

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
    Alert.alert("Delete post?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token || !post) return;
          try {
            await deletePost(token, post.id);
            router.back();
          } catch {
            Alert.alert("Couldn't delete", "Please try again.");
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
        ask: lang === "vi"
          ? `Hướng dẫn mình cách làm "${post.meal.name}" tốt cho sức khoẻ nhé`
          : `How do I cook "${post.meal.name}" in a healthy way?`,
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
          <ScreenHeader title="Post" />
          {loadError ? (
            <Card style={styles.errorCard}>
              <AppText style={styles.emptyEmoji}>📡</AppText>
              <AppText variant="h2" style={styles.centerText}>Couldn't load post</AppText>
              <AppText variant="muted" style={styles.centerText}>It may have been deleted, or check your connection.</AppText>
              <Pressable onPress={load} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
                <AppText style={styles.retryText}>Retry</AppText>
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
        <ScreenHeader title="Post" />

        <Card style={styles.card}>
          {/* Author row */}
          <Pressable
            onPress={() => router.push({ pathname: "/community/user-profile", params: { id: post.author.id } })}
            style={styles.authorRow}
          >
            <View style={styles.avatar}>
              {post.author.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.avatarImg} />
              ) : (
                <AppText style={styles.avatarInitials}>{initials(post.author.name)}</AppText>
              )}
            </View>
            <View style={styles.flex1}>
              <AppText variant="body2" style={styles.bold}>{post.author.name}</AppText>
              <AppText variant="subtle" style={styles.timeText}>{timeAgo(post.createdAt)} ago</AppText>
            </View>
          </Pressable>

          {!!post.caption && (
            <AppText variant="body2" style={styles.caption}>{post.caption}</AppText>
          )}

          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
          )}

          {/* Nutrition snapshot */}
          {post.meal && (
            <View style={styles.mealChip}>
              <View style={styles.mealIcon}>
                <AppText style={styles.mealEmoji}>🍽️</AppText>
              </View>
              <View style={styles.flex1}>
                <AppText variant="body2" style={styles.bold}>{post.meal.name}</AppText>
                <AppText variant="subtle" style={styles.timeText}>
                  {post.meal.calories} kcal · P {post.meal.protein} · C {post.meal.carbs} · F {post.meal.fat}
                </AppText>
              </View>
            </View>
          )}

          {/* Like + save + delete */}
          <View style={styles.footerRow}>
            <Pressable onPress={onLike} hitSlop={8} style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}>
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
              <Pressable onPress={onSave} hitSlop={8} style={({ pressed }) => [pressed && styles.pressed]}>
                <Ionicons
                  name={post.isSaved ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={post.isSaved ? theme.colors.primary : theme.colors.subtle}
                />
              </Pressable>
              {isMine && (
                <Pressable
                  onPress={() => router.push({ pathname: "/community/post-edit" as any, params: { id: post.id } })}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <Ionicons name="create-outline" size={21} color={theme.colors.subtle} />
                </Pressable>
              )}
              {isMine && (
                <Pressable onPress={onDelete} hitSlop={8} style={({ pressed }) => [pressed && styles.pressed]}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.subtle} />
                </Pressable>
              )}
            </View>
          </View>
        </Card>

        {/* Try this meal — save-and-act loop unique to MealMate */}
        {post.meal && (
          <View style={styles.trySection}>
            <AppText variant="subtle" style={styles.sectionLabel}>Try this meal</AppText>
            <View style={styles.tryRow}>
              <Pressable onPress={askCoachHow} style={({ pressed }) => [styles.tryBtn, pressed && styles.pressed]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
                <AppText style={styles.tryBtnText}>How to cook?</AppText>
              </Pressable>
              <Pressable onPress={addToDiary} style={({ pressed }) => [styles.tryBtn, styles.tryBtnAccent, pressed && styles.pressed]}>
                <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent} />
                <AppText style={[styles.tryBtnText, styles.tryBtnTextAccent]}>Add to diary</AppText>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
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
