// Màn Community, tab thứ hai. Đây là file BẮT ĐẦU của luồng xem bài đăng.
// LUỒNG XEM FEED, tự chạy khi vào tab
// 1. useFocusEffect gọi hàm tải theo tab đang chọn
// 2. getFeed hoặc getExplore hoặc getSavedPosts   (GET /community/posts/...)
// 3. backend lọc bỏ bài của tài khoản riêng tư, chia trang, tính sẵn
//    số tim và hai cờ đã tim đã lưu
// 4. danh sách hiện lên, cuộn tới cuối thì tải trang kế tiếp
// BA TAB
//   Đang theo dõi, chỉ bài của người mình theo dõi.
//   Khám phá, bài của tất cả mọi người.
//   Đã lưu, bài mình đã bấm lưu.
// Các lối đi từ màn này: Tạo bài, Chi tiết bài, Trang cá nhân,
// Khám phá người dùng, và Thông báo.
import { useState, useCallback, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { getFeed, getExplore, toggleLike, getUnreadCount, type FeedPost } from "@/features/community/communityApi";
import { PostTile } from "@/features/community/posts/PostTile";
import { CommunityTabs } from "@/features/community/CommunityTabs";
import { CommunityStateCard } from "@/features/community/CommunityStateCard";
import { initials } from "@/features/community/communityDisplay";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
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
  // Mở Explore trước để người dùng mới thấy nội dung thay vì feed trống.
  const [tab, setTab] = useState<Tab>("explore");
  const [tabCache, setTabCache] = useState<Record<Tab, TabCache>>({
    feed: { posts: [], loadError: false },
    explore: { posts: [], loadError: false },
  });
  const [loadingByTab, setLoadingByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  const [refreshingByTab, setRefreshingByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  const [loadingMoreByTab, setLoadingMoreByTab] = useState<Record<Tab, boolean>>({ feed: false, explore: false });
  // Số thông báo chưa đọc hiển thị trên biểu tượng chuông.
  const [unread, setUnread] = useState(0);
  const pageRef = useRef<Record<Tab, number>>({ feed: 1, explore: 1 });
  const hasMoreRef = useRef<Record<Tab, boolean>>({ feed: true, explore: true });
  const loadedRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const inFlightRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const loadingMoreRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  const requestIdRef = useRef<Record<Tab, number>>({ feed: 0, explore: 0 });
  const posts = tabCache[tab].posts;
  const loading = loadingByTab[tab] && posts.length === 0;
  const loadError = tabCache[tab].loadError;

  // Hàm tải dùng chung. mode quyết định loại vòng tải được hiển thị.
  // refresh điều khiển RefreshControl, các chế độ khác dùng vòng tải ở giữa.
  // Không bật refreshing khi focus vì có thể làm vòng tải bị kẹt lúc chuyển màn.
  // Nếu tải lỗi thì giữ các bài cũ thay vì xóa feed.
  const load = useCallback(async (which: Tab, mode: LoadMode = "load") => {
    if (!token) return;
    // Không tải trang tiếp theo trước khi trang đầu hoàn tất.
    // FlatList trống trên web có thể gọi onEndReached ngay và làm mất kết quả trang đầu.
    if (mode === "more" && (
      !hasMoreRef.current[which] ||
      loadingMoreRef.current[which] ||
      inFlightRef.current[which] ||
      !loadedRef.current[which]
    )) return;
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

  // Giữ kết quả gần nhất của từng tab và tải trước tab còn lại để chuyển tab ngay.
  useFocusEffect(useCallback(() => {
    load(tab, loadedRef.current[tab] ? "prefetch" : "load");
    const other: Tab = tab === "explore" ? "feed" : "explore";
    if (!loadedRef.current[other]) load(other, "prefetch");
  }, [tab, load]));

  // Làm mới số trên chuông khi tab được focus lại.
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

  // Nút tim trên một ô bài. Đổi giao diện trước rồi mới gọi mạng,
  // lỗi thì trả về như cũ.
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
      // Trả lại trạng thái cũ nếu yêu cầu thất bại.
      updatePostAcrossTabs(post.id, (current) => ({
        ...current,
        isLiked: post.isLiked,
        likeCount: post.likeCount,
      }));
    }
  };

  const openDetail = (item: FeedPost) =>
    router.push({ pathname: "/community/post-detail", params: { id: item.id } });

  // Hai tab dùng lưới hai cột và hiện thời gian dưới mỗi ô.
  // Hành động lưu và xóa nằm trong chi tiết bài viết.
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
    <CommunityStateCard
      icon="cloud-offline-outline"
      title={t.community.loadPostsError}
      subtitle={t.common.checkConnection}
      onRetry={() => load(tab)}
    />
  ) : (
    <CommunityStateCard
      icon="restaurant-outline"
      title={tab === "feed" ? t.community.feedEmptyTitle : t.community.exploreEmptyTitle}
      subtitle={tab === "feed" ? t.community.feedEmptySub : t.community.exploreEmptySub}
    />
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.gridColumn}
        contentContainerStyle={styles.listContent}
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={refreshingByTab[tab]} onRefresh={() => load(tab, "refresh")} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppText variant="h1">{t.community.title}</AppText>
              <View style={styles.titleActions}>
            {/* Tìm người dùng và xem gợi ý theo dõi. */}
                <Pressable
                  onPress={() => router.push("/community/discover")}
                  accessibilityRole="button"
                  accessibilityLabel={t.a11y.search}
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                >
                  <Ionicons name="search-outline" size={19} color={theme.colors.primary} />
                </Pressable>
            {/* Chuông thông báo kèm số chưa đọc. */}
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
            {/* Hồ sơ Community của chính người dùng. */}
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
        {/* Chuyển giữa Feed và Explore. */}
            <CommunityTabs
              value={tab}
              options={[{ key: "explore", label: t.community.explore }, { key: "feed", label: t.community.following }]}
              onChange={setTab}
            />
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
  // Khoảng trên 60 bù vùng an toàn vì màn này không còn AppHeader phía trên.
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
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  loadMoreBox: { paddingVertical: theme.space.lg, alignItems: "center" },
  pressed: { opacity: 0.7 },
});
