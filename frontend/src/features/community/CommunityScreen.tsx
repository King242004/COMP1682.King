// ═══ FILE NÀY LÀM GÌ ═══
// Màn Cộng đồng, tab thứ hai. File BẮT ĐẦU của luồng xem bài đăng.
//
// Ai gọi tới: app/tabs/community
// Nhận vào:   tab đang chọn: Đang theo dõi hay Khám phá
// Trả ra:     danh sách bài, chia trang, cuộn tới đâu tải tới đó
// Khi lỗi:    chưa theo dõi ai thì mời sang Khám phá, không hiện màn trống

// Hai tab: Đang theo dõi chỉ hiện bài của người mình theo dõi, còn Khám phá
// hiện bài của mọi người. Bài Đã lưu nằm ở màn Trang cá nhân, không ở đây.
// Các lối đi từ màn này: Tạo bài, Chi tiết bài, Trang cá nhân,
// Khám phá người dùng, và Thông báo.
//
// Nhớ: mỗi tab có bộ nhớ đệm RIÊNG, và tab kia được tải trước ở nền.
//      Nhờ vậy chuyển tab là thấy nội dung ngay, không phải chờ một lượt mạng.
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

// ══════════════════════════════════════════════════════════
// XEM FEED
//
// Đến từ tab thứ hai. Bốn bước, đọc từ trên xuống là đúng thứ tự.
// Chặng chờ mạng nằm ở BƯỚC 2, và có thể chạy hai lượt một lúc cho hai tab.
// Xong thì hiện lưới hai cột, cuộn tới cuối thì tải trang kế tiếp.
// ══════════════════════════════════════════════════════════

// XEM FEED BƯỚC 1. Dựng state, mỗi tab một bộ riêng.
// Mở tab Khám phá trước chứ không mở Đang theo dõi, vì người mới chưa theo dõi ai,
// mở feed rỗng ra là tưởng app hỏng.
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
  // Sáu ref canh chừng việc tải, mỗi ref giữ hai giá trị cho hai tab.
  // Để trong ref chứ không phải state vì hai lý do: đổi giá trị phải thấy NGAY
  // chứ không chờ nhịp vẽ sau, và mấy số này không hiện ra màn nên đổi chúng
  // cũng chẳng cần vẽ lại.
  //
  // Đang ở trang mấy, và còn trang sau hay không.
  const pageRef = useRef<Record<Tab, number>>({ feed: 1, explore: 1 });
  // Khởi đầu để true, vì chưa gọi lần nào thì cứ coi như còn bài để tải.
  const hasMoreRef = useRef<Record<Tab, boolean>>({ feed: true, explore: true });
  // Tab này đã từng tải xong lần nào chưa. Dùng để chọn kiểu tải ở BƯỚC 3.
  const loadedRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  // Hai cờ chặn tải chồng: một cho trang đầu, một cho trang tiếp theo.
  const inFlightRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  // Cờ thứ hai, riêng cho việc tải trang tiếp theo khi cuộn tới cuối.
  const loadingMoreRef = useRef<Record<Tab, boolean>>({ feed: false, explore: false });
  // Đánh số từng lượt gọi, để bỏ kết quả về muộn thay vì đè lên bản mới hơn.
  const requestIdRef = useRef<Record<Tab, number>>({ feed: 0, explore: 0 });
  // Ba lối tắt tới dữ liệu của tab ĐANG mở, cho phần JSX bên dưới đỡ dài dòng.
  const posts = tabCache[tab].posts;
  const loading = loadingByTab[tab] && posts.length === 0;
  const loadError = tabCache[tab].loadError;

  // XEM FEED BƯỚC 2. Hàm tải dùng chung cho cả hai tab và cả bốn kiểu tải.
  // Đường đi: getFeed hoặc getExplore → apiClient → GET /community/posts/...
  //           → feedController.getFeed hoặc getExplore
  // Bên đó lọc bỏ bài của tài khoản riêng tư, chia trang, và tính sẵn
  // số tim cùng hai cờ đã tim, đã lưu.
  //
  // Bốn kiểu tải, khác nhau ở chỗ hiện vòng xoay nào:
  //   load     lần đầu, vòng xoay giữa màn
  //   refresh  kéo xuống làm mới, vòng xoay ở đầu danh sách
  //   more     cuộn tới cuối, vòng xoay ở chân danh sách
  //   prefetch tải ngầm cho tab kia, KHÔNG hiện vòng xoay nào cả
  // Không bật vòng xoay kéo làm mới lúc quay về màn, vì nó hay kẹt khi chuyển màn.
  // Tải lỗi thì GIỮ bài cũ trên màn, chứ không xóa sạch feed.
  const load = useCallback(async (which: Tab, mode: LoadMode = "load") => {
    if (!token) return;
    // Không tải trang tiếp theo trước khi trang đầu hoàn tất.
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

  // XEM FEED BƯỚC 3. Tự chạy mỗi lần màn được nhìn thấy, không ai bấm.
  // Tab đang mở: đã tải rồi thì làm mới ngầm, chưa tải thì tải kiểu có vòng xoay.
  // Tab còn lại: tải ngầm nếu chưa từng tải, để chuyển tab là thấy nội dung ngay.
  useFocusEffect(useCallback(() => {
    load(tab, loadedRef.current[tab] ? "prefetch" : "load");
    const other: Tab = tab === "explore" ? "feed" : "explore";
    if (!loadedRef.current[other]) load(other, "prefetch");
  }, [tab, load]));

  // Làm mới số trên chuông khi tab được focus lại.
  useFocusEffect(useCallback(() => {
    if (token) getUnreadCount(token).then(setUnread).catch(() => {});
  }, [token]));

  // ══════════════════════════════════════════════════════════
  // BẤM TIM
  //
  // Đến từ nút tim trên một ô bài. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Xong thì tim đổi màu và số tim đổi theo, ở CẢ HAI tab.
  // ══════════════════════════════════════════════════════════

  // BẤM TIM BƯỚC 1. Sửa một bài ở CẢ HAI bộ nhớ đệm cùng lúc.
  // Phải sửa cả hai vì một bài có thể đang nằm trong cả Đang theo dõi lẫn Khám phá,
  // chỉ sửa một bên là chuyển tab thấy tim ngược lại.
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

  // BẤM TIM BƯỚC 2. Đổi tim với số tim trên màn NGAY, chưa chờ backend.
  const onLike = async (post: FeedPost) => {
    if (!token) return;
    updatePostAcrossTabs(post.id, (current) => ({
      ...current,
      isLiked: !current.isLiked,
      likeCount: current.likeCount + (current.isLiked ? -1 : 1),
    }));
    try {
      // BẤM TIM BƯỚC 3. Giờ mới gửi lệnh thật rồi CHỜ.
      // Đường đi: toggleLike → apiClient → POST /community/posts/:id/like
      //           → postController.toggleLike
      // Backend trả về số tim THẬT, nên đặt lại theo số đó chứ không giữ số mình đoán.
      // Cần vậy vì lúc mình đang bấm có thể có người khác cũng vừa bấm tim bài đó.
      const res = await toggleLike(token, post.id);
      updatePostAcrossTabs(post.id, (current) => ({
        ...current,
        isLiked: res.liked,
        likeCount: res.likeCount,
      }));
    } catch {
      // Gửi hụt thì lật ngược về đúng giá trị lúc chưa bấm.
      updatePostAcrossTabs(post.id, (current) => ({
        ...current,
        isLiked: post.isLiked,
        likeCount: post.likeCount,
      }));
    }
  };

  // XEM FEED BƯỚC 4. Chạm một ô thì sang màn Chi tiết bài, chỉ truyền mã bài.
  const openDetail = (item: FeedPost) =>
    router.push({ pathname: "/community/post-detail", params: { id: item.id } });

  // Vẽ một ô bài. Cả hai tab dùng chung lưới hai cột, có hiện thời gian dưới ô.
  // Ở đây chỉ có chạm và bấm tim. Lưu bài và xóa bài nằm ở màn Chi tiết bài.
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
