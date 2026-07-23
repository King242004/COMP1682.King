import { useState, useCallback, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { getFeed, getExplore, toggleLike, getUnreadCount, type FeedPost } from "@/features/community/api";
import { PostTile } from "@/features/community/PostTile";
import { initials } from "@/features/community/helpers";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

type Tab = "feed" | "explore";
type LoadMode = "load" | "refresh" | "more" | "prefetch";
type TabCache = {
  posts: FeedPost[];
  loadError: boolean;
};

export default function CommunityScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();
  // Explore first (WEAR-style): new users land on content, not an empty feed
  const [tab, setTab] = useState<Tab>("explore");
  const [tabCache, setTabCache] = useState<Record<Tab, TabCache>>({
    feed: { posts: [], loadError: false },
    explore: { posts: [], loadError: false },
  });
  const [loadingByTab, setLoadingByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  const [refreshingByTab, setRefreshingByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  const [loadingMoreByTab, setLoadingMoreByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  const [unread, setUnread] = useState(0); // notification bell badge
  const pageRef = useRef<Record<Tab, number>>({ feed: 1, explore: 1 });
  const hasMoreRef = useRef<Record<Tab, boolean>>({ feed: true, explore: true });
  const loadedRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const inFlightRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const loadingMoreRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const requestIdRef = useRef<Record<Tab, number>>({ feed: 0, explore: 0 });
  const posts = tabCache[tab].posts;
  const loading = loadingByTab[tab] && posts.length === 0;
  const loadError = tabCache[tab].loadError;

  // Shared fetch. `mode` decides which spinner reflects this load:
  // "refresh" drives RefreshControl (user gesture), otherwise the centered loader.
  // Driving RefreshControl programmatically during a screen transition leaves its
  // spinner stuck, so focus/initial loads must NOT touch `refreshing`.
  // On failure we KEEP the previous posts (an error shouldn't wipe the feed).
  const load = useCallback(async (which: Tab, mode: LoadMode = "load") => {
    if (!token) return;
    if (mode === "more" && (!hasMoreRef.current[which] || loadingMoreRef.current[which])) return;
    if (mode !== "more" && inFlightRef.current[which]) return;

    const requestId = ++requestIdRef.current[which];
    const targetPage = mode === "more" ? pageRef.current[which] + 1 : 1;
    if (mode === "refresh") {
      inFlightRef.current[which] = true;
      setRefreshingByTab((current) => ({ ...current, [which]: true }));
    } else if (mode === "more") {
      loadingMoreRef.current[which] = true;
      setLoadingMoreByTab((current) => ({ ...current, [which]: true }));
    } else {
      inFlightRef.current[which] = true;
      setLoadingByTab((current) => ({ ...current, [which]: true }));
    }
    try {
      const data = which === "feed"
        ? await getFeed(token, targetPage)
        : await getExplore(token, targetPage);
      if (requestId !== requestIdRef.current[which]) return;

      setTabCache((current) => {
        const previous = current[which].posts;
        const nextPosts = mode !== "more"
          ? data.posts
          : (() => {
              const merged = new Map(previous.map((post) => [post.id, post]));
              data.posts.forEach((post) => merged.set(post.id, post));
              return [...merged.values()];
            })();
        return {
          ...current,
          [which]: { posts: nextPosts, loadError: false },
        };
      });
      loadedRef.current[which] = true;
      pageRef.current[which] = data.page;
      hasMoreRef.current[which] = data.hasMore;
    } catch {
      if (requestId === requestIdRef.current[which] && mode !== "more") {
        setTabCache((current) => ({
          ...current,
          [which]: { ...current[which], loadError: true },
        }));
      }
    } finally {
      if (requestId !== requestIdRef.current[which]) return;
      if (mode === "refresh") {
        inFlightRef.current[which] = false;
        setRefreshingByTab((current) => ({ ...current, [which]: false }));
      } else if (mode === "more") {
        loadingMoreRef.current[which] = false;
        setLoadingMoreByTab((current) => ({ ...current, [which]: false }));
      } else {
        inFlightRef.current[which] = false;
        setLoadingByTab((current) => ({ ...current, [which]: false }));
      }
    }
  }, [token]);

  // Keep each tab's last result and prefetch the other tab. Switching tabs then
  // changes the content immediately instead of waiting on Render/network latency.
  useFocusEffect(useCallback(() => {
    load(tab, loadedRef.current[tab] ? "prefetch" : "load");
    const other: Tab = tab === "explore" ? "feed" : "explore";
    if (!loadedRef.current[other]) load(other, "prefetch");
  }, [tab, load]));

  // Refresh the bell badge whenever the tab regains focus (e.g. back from the
  // notifications screen, which marks everything read)
  useFocusEffect(useCallback(() => {
    if (token) getUnreadCount(token).then(setUnread).catch(() => {});
  }, [token]));

  const updatePostAcrossTabs = (postId: string, update: (post: FeedPost) => FeedPost) => {
    setTabCache((current) => ({
      feed: {
        ...current.feed,
        posts: current.feed.posts.map((post) => post.id === postId ? update(post) : post),
      },
      explore: {
        ...current.explore,
        posts: current.explore.posts.map((post) => post.id === postId ? update(post) : post),
      },
    }));
  };

  // Optimistic like toggle, then sync count/state from the server response
  const onLike = async (post: FeedPost) => {
    if (!token) return;
    updatePostAcrossTabs(post.id, (current) => ({
      ...current,
      isLiked: !current.isLiked,
      likeCount: current.likeCount + (current.isLiked ? -1 : 1),
    }));
    try {
      const res = await toggleLike(token, post.id);
      updatePostAcrossTabs(post.id, (current) => ({
        ...current,
        isLiked: res.liked,
        likeCount: res.likeCount,
      }));
    } catch {
      // revert on failure
      updatePostAcrossTabs(post.id, (current) => ({
        ...current,
        isLiked: post.isLiked,
        likeCount: post.likeCount,
      }));
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
      <View style={styles.emptyIcon}>
        <Ionicons name="cloud-offline-outline" size={28} color={theme.colors.primary} />
      </View>
      <AppText variant="h2" style={styles.centerText}>{t.community.loadPostsError}</AppText>
      <AppText variant="muted" style={styles.centerText}>{t.common.checkConnection}</AppText>
      <Pressable onPress={() => load(tab)} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
        <AppText style={styles.retryText}>{t.common.retry}</AppText>
      </Pressable>
    </Card>
  ) : (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name="restaurant-outline" size={28} color={theme.colors.primary} />
      </View>
      <AppText variant="h2" style={styles.centerText}>
        {tab === "feed" ? t.community.feedEmptyTitle : t.community.exploreEmptyTitle}
      </AppText>
      <AppText variant="muted" style={styles.centerText}>
        {tab === "feed" ? t.community.feedEmptySub : t.community.exploreEmptySub}
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
        refreshControl={<RefreshControl refreshing={refreshingByTab[tab]} onRefresh={() => load(tab, "refresh")} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppText variant="h1">{t.community.title}</AppText>
              <View style={styles.titleActions}>
                {/* Discover: search people + follow suggestions */}
                <Pressable
                  onPress={() => router.push("/community/discover")}
                  accessibilityRole="button"
                  accessibilityLabel={t.a11y.search}
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                >
                  <Ionicons name="search" size={19} color={theme.colors.primary} />
                </Pressable>
                {/* Notifications bell with unread badge */}
                <Pressable
                  onPress={() => { setUnread(0); router.push("/community/notifications"); }}
                  accessibilityRole="button"
                  accessibilityLabel={t.a11y.notifications}
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                >
                  <Ionicons name="notifications-outline" size={19} color={theme.colors.primary} />
                  {unread > 0 && (
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{unread > 9 ? "9+" : unread}</AppText>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => router.push("/community/post-create")}
                  accessibilityRole="button"
                  accessibilityLabel={t.a11y.createPost}
                  style={({ pressed }) => [styles.postBtn, pressed && styles.postBtnPressed]}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                </Pressable>
                {/* My community profile (own lookbook) — avatar on the right, WEAR-style */}
                {user && (
                  <Pressable
                    onPress={() => router.push({ pathname: "/community/user-profile", params: { id: user.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={t.a11y.myProfile}
                    style={({ pressed }) => [styles.myAvatar, pressed && styles.pressed]}
                  >
                    {user.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.myAvatarImg}
                        cachePolicy="memory-disk"
                        accessible={false}
                      />
                    ) : (
                      <AppText style={styles.myAvatarInitials}>{initials(user.name)}</AppText>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
            {/* Feed / Explore toggle */}
            <View style={styles.tabRow}>
              {([["explore", t.community.explore], ["feed", t.community.following]] as [Tab, string][]).map(([key, label]) => {
                const active = tab === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setTab(key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
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
        ListFooterComponent={loadingMoreByTab[tab] ? (
          <View style={styles.loadMoreBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
        renderItem={renderPost}
        onEndReached={() => load(tab, "more")}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // paddingTop 60 = safe-area top (no tab header above anymore) — same value
  // every pushed screen uses
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.sm },
  gridColumn: { gap: theme.space.sm },
  header: { gap: theme.space.md, marginBottom: theme.space.sm },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.tintSoft,
    alignItems: "center", justifyContent: "center",
  },
  searchBtnPressed: { backgroundColor: theme.colors.tint },
  badge: {
    position: "absolute", top: -2, right: -2,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: theme.colors.danger,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: theme.colors.bg,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  postBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  postBtnPressed: { backgroundColor: theme.colors.primary2 },
  myAvatar: {
    width: 40, height: 40, borderRadius: 20, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: theme.colors.primary,
  },
  myAvatarImg: { width: "100%", height: "100%" },
  myAvatarInitials: { color: theme.colors.primary, fontSize: 13, fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: {
    flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12,
    backgroundColor: theme.colors.tintSoft,
  },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  loadMoreBox: { paddingVertical: theme.space.lg, alignItems: "center" },
  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  centerText: { textAlign: "center" },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  pressed: { opacity: 0.7 },
});
