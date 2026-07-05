import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getFeed, getExplore, toggleLike, type FeedPost } from "@/features/community/api";
import { PostTile } from "@/features/community/PostTile";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

type Tab = "feed" | "explore";

export default function CommunityScreen() {
  const router = useRouter();
  const { token } = useAuth();
  // Explore first (WEAR-style): new users land on content, not an empty feed
  const [tab, setTab] = useState<Tab>("explore");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);   // focus/initial load → centered spinner
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh only
  const [loadError, setLoadError] = useState(false);

  // Shared fetch. `mode` decides which spinner reflects this load:
  // "refresh" drives RefreshControl (user gesture), otherwise the centered loader.
  // Driving RefreshControl programmatically during a screen transition leaves its
  // spinner stuck, so focus/initial loads must NOT touch `refreshing`.
  // On failure we KEEP the previous posts (an error shouldn't wipe the feed).
  const load = useCallback(async (which: Tab, mode: "load" | "refresh" = "load") => {
    if (!token) return;
    const setBusy = mode === "refresh" ? setRefreshing : setLoading;
    setBusy(true);
    try {
      const data = which === "feed" ? await getFeed(token) : await getExplore(token);
      setPosts(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  }, [token]);

  // Single fetch trigger: fires on focus AND whenever `tab` changes while focused
  useFocusEffect(useCallback(() => { load(tab); }, [tab, load]));

  // Optimistic like toggle, then sync count/state from the server response
  const onLike = async (post: FeedPost) => {
    if (!token) return;
    setPosts((prev) => prev.map((p) =>
      p.id === post.id
        ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
        : p
    ));
    try {
      const res = await toggleLike(token, post.id);
      setPosts((prev) => prev.map((p) =>
        p.id === post.id ? { ...p, isLiked: res.liked, likeCount: res.likeCount } : p
      ));
    } catch {
      // revert on failure
      setPosts((prev) => prev.map((p) =>
        p.id === post.id ? { ...p, isLiked: post.isLiked, likeCount: post.likeCount } : p
      ));
    }
  };

  const openDetail = (item: FeedPost) =>
    router.push({ pathname: "/community/post-detail" as any, params: { id: item.id } });

  // WEAR-style lookbook: both tabs are 2-column grids with time-ago under tiles;
  // save/delete live in post-detail.
  const renderPost = ({ item }: { item: FeedPost }) => (
    <PostTile
      post={item}
      onPress={() => openDetail(item)}
      onLike={() => onLike(item)}
      showTime
    />
  );

  const emptyState = loading ? (
    <View style={styles.loadingBox}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  ) : loadError ? (
    <Card style={styles.emptyCard}>
      <AppText style={styles.emptyEmoji}>📡</AppText>
      <AppText variant="h2" style={styles.centerText}>Couldn't load posts</AppText>
      <AppText variant="muted" style={styles.centerText}>Check your connection and try again.</AppText>
      <Pressable onPress={() => load(tab)} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
        <AppText style={styles.retryText}>Retry</AppText>
      </Pressable>
    </Card>
  ) : (
    <Card style={styles.emptyCard}>
      <AppText style={styles.emptyEmoji}>🥗</AppText>
      <AppText variant="h2" style={styles.centerText}>
        {tab === "feed" ? "Your feed is empty" : "No posts yet"}
      </AppText>
      <AppText variant="muted" style={styles.centerText}>
        {tab === "feed"
          ? "Follow people in Explore to see their meals here."
          : "Be the first to share a healthy meal!"}
      </AppText>
    </Card>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.gridColumn}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(tab, "refresh")} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppText variant="h1">Community</AppText>
              <View style={styles.titleActions}>
                {/* Saved: my private bookmark list */}
                <Pressable
                  onPress={() => router.push("/community/saved" as any)}
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                >
                  <Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} />
                </Pressable>
                {/* Discover: search people + follow suggestions */}
                <Pressable
                  onPress={() => router.push("/community/discover")}
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                >
                  <Ionicons name="search" size={19} color={theme.colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/community/post-create")}
                  style={({ pressed }) => [styles.postBtn, pressed && styles.postBtnPressed]}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <AppText style={styles.postBtnText}>Post</AppText>
                </Pressable>
              </View>
            </View>
            {/* Feed / Explore toggle */}
            <View style={styles.tabRow}>
              {([["explore", "Explore"], ["feed", "Following"]] as [Tab, string][]).map(([key, label]) => {
                const active = tab === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setTab(key)}
                    style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}
                  >
                    <AppText style={[styles.tabText, active && styles.tabTextActive]}>{label}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={emptyState}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40, gap: theme.space.sm },
  gridColumn: { gap: theme.space.sm },
  header: { gap: theme.space.md, marginBottom: theme.space.sm },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.tintSoft,
    alignItems: "center", justifyContent: "center",
  },
  searchBtnPressed: { backgroundColor: theme.colors.tint },
  postBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  postBtnPressed: { backgroundColor: theme.colors.primary2 },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: {
    flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12,
    backgroundColor: theme.colors.tintSoft,
  },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  centerText: { textAlign: "center" },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  pressed: { opacity: 0.7 },
});
