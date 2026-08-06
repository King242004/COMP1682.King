// Màn Trang cá nhân của một người trong Community.
// LUỒNG MỞ TRANG CÁ NHÂN
// 1. Chạm tên hoặc ảnh của ai đó, mở màn này kèm mã người đó
// 2. api.getPublicProfile         (GET /community/users/:id)
//    backend trả tên, ảnh, ba con số thống kê, và ba cờ trạng thái
// 3. api.getUserPosts             (GET /community/posts/user/:id)
//    backend trả lưới bài, hoặc trả rỗng kèm cờ riêng tư
// 4. màn hiện thông tin và lưới bài
// Ba cờ quyết định giao diện: isMe thì ẩn nút Theo dõi,
// isFollowing đổi chữ trên nút, postsHidden thì thay lưới bài
// bằng dòng báo tài khoản riêng tư.
// Chạm số người theo dõi sẽ mở màn danh sách người.
import { useState, useCallback, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { getPublicProfile, getUserPosts, getSavedPosts, followUser, unfollowUser, type FeedPost, type PublicProfile } from "@/features/community/communityApi";
import { PostTile } from "@/features/community/posts/PostTile";
import { CommunityTabs } from "@/features/community/CommunityTabs";
import { CommunityStateCard } from "@/features/community/CommunityStateCard";
import { initials } from "@/features/community/communityDisplay";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

type ProfileTab = "posts" | "saved";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();

  const viewingSelf = !!user && id === user.id;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [saved, setSaved] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const postsPageRef = useRef(1);
  const savedPageRef = useRef(1);
  const postsHasMoreRef = useRef(false);
  const savedHasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    postsHasMoreRef.current = false;
    savedHasMoreRef.current = false;
    try {
      // Bài đã lưu là riêng tư nên chỉ tải và hiện trong hồ sơ của chính mình.
      const [p, ps, sv] = await Promise.all([
        getPublicProfile(token, id),
        getUserPosts(token, id),
        viewingSelf
          ? getSavedPosts(token)
          : Promise.resolve({ posts: [] as FeedPost[], page: 1, hasMore: false }),
      ]);
      setProfile(p);
      setPosts(ps.posts);
      setSaved(sv.posts);
      postsPageRef.current = ps.page;
      savedPageRef.current = sv.page;
      postsHasMoreRef.current = ps.hasMore;
      savedHasMoreRef.current = sv.hasMore;
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [token, id, viewingSelf]);

  // Tải lại khi màn được mở để số lượng, theo dõi và bài đã lưu luôn mới.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const loadMore = useCallback(async () => {
    if (!token || !id || loadingMoreRef.current) return;
    const savedTab = viewingSelf && tab === "saved";
    const hasMore = savedTab ? savedHasMoreRef.current : postsHasMoreRef.current;
    if (!hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = (savedTab ? savedPageRef.current : postsPageRef.current) + 1;
      const result = savedTab
        ? await getSavedPosts(token, nextPage)
        : await getUserPosts(token, id, nextPage);
      const setItems = savedTab ? setSaved : setPosts;
      setItems((previous) => {
        const merged = new Map(previous.map((post) => [post.id, post]));
        result.posts.forEach((post) => merged.set(post.id, post));
        return [...merged.values()];
      });
      if (savedTab) {
        savedPageRef.current = result.page;
        savedHasMoreRef.current = result.hasMore;
      } else {
        postsPageRef.current = result.page;
        postsHasMoreRef.current = result.hasMore;
      }
    } catch {
    // Giữ trang đã tải trên màn hình. Kéo đến cuối lần nữa sẽ thử tải lại an toàn.
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [token, id, tab, viewingSelf]);

  // Nút Theo dõi ở đầu trang cá nhân.
  // Đổi cả chữ trên nút lẫn số người theo dõi trước rồi mới gọi mạng.
  const onToggleFollow = async () => {
    if (!token || !id || !profile) return;
    const wasFollowing = profile.isFollowing;
    // Cập nhật giao diện trước để thao tác có phản hồi ngay.
    setProfile({
      ...profile,
      isFollowing: !wasFollowing,
      stats: { ...profile.stats, followers: profile.stats.followers + (wasFollowing ? -1 : 1) },
    });
    setBusy(true);
    try {
      if (wasFollowing) await unfollowUser(token, id);
      else await followUser(token, id);
    } catch {
      load();
    } finally {
      setBusy(false);
    }
  };

  // Thích, lưu và xóa được xử lý ở chi tiết bài. Màn này tải lại khi quay về
  // để số lượng và lưới bài viết luôn đồng bộ.

  // Khi tải hoặc lỗi vẫn giữ phần đầu để người dùng luôn có thể quay lại.
  if (!profile) {
    return (
      <Screen padded={false}>
        <View style={styles.stateBox}>
          <ScreenHeader title={t.community.profile} />
          {loadError ? (
            <CommunityStateCard
              icon="cloud-offline-outline"
              title={t.community.loadProfileError}
              subtitle={t.common.checkConnection}
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

  const isMe = viewingSelf || profile.isMe;
  const showSaved = isMe && tab === "saved";
  // Ẩn bài viết khi người xem không có quyền xem tài khoản riêng tư.
  const postsHidden = profile.postsHidden;
  const data = postsHidden ? [] : showSaved ? saved : posts;

  const Stat = ({ label, value, onPress }: { label: string; value: number; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.stat, pressed && onPress && styles.pressed]}
    >
      <AppText variant="h2" style={styles.statValue}>{value}</AppText>
      <AppText variant="subtle" style={styles.statLabel}>{label}</AppText>
    </Pressable>
  );

  const openList = (listType: "followers" | "following") =>
    router.push({ pathname: "/community/user-list", params: { id: profile.user.id, type: listType } });

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.gridColumn}
        contentContainerStyle={styles.listContent}
        alwaysBounceVertical
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title={t.community.profile} />

      {/* Thẻ thông tin đầu trang. */}
            <Card style={styles.profileCard}>
              <View style={styles.avatar}>
                {profile.user.avatar ? (
                  <Image source={{ uri: profile.user.avatar }} style={styles.avatarImg} cachePolicy="memory-disk" accessible={false} />
                ) : (
                  <AppText variant="h1" style={styles.avatarInitials}>{initials(profile.user.name)}</AppText>
                )}
              </View>
              <View style={styles.nameBox}>
                <AppText variant="h1" style={styles.name}>{profile.user.name}</AppText>
                {profile.user.goal ? (
                  <View style={styles.goalRow}>
                    <Ionicons name="flag-outline" size={14} color={theme.colors.muted} />
                    <AppText variant="muted" style={styles.goal}>{t.labels.goal[profile.user.goal] ?? profile.user.goal}</AppText>
                  </View>
                ) : null}
              </View>

              <View style={styles.statsRow}>
                <Stat label={t.community.posts} value={profile.stats.postCount} />
      {/* Người ngoài không được xem danh sách theo dõi của tài khoản riêng tư. */}
                <Stat label={t.community.followers} value={profile.stats.followers} onPress={postsHidden ? undefined : () => openList("followers")} />
                <Stat label={t.community.following} value={profile.stats.following} onPress={postsHidden ? undefined : () => openList("following")} />
              </View>

              {!isMe && (
                <View style={styles.followBox}>
                  <Button
                    title={profile.isFollowing ? t.community.following : t.community.follow}
                    variant={profile.isFollowing ? "secondary" : "primary"}
                    disabled={busy}
                    onPress={onToggleFollow}
                  />
                </View>
              )}
            </Card>

      {/* Tab bài của tôi và bài đã lưu chỉ có trong hồ sơ chính mình. */}
            {isMe ? (
              <CommunityTabs
                value={tab}
                options={[{ key: "posts", label: t.community.myPosts }, { key: "saved", label: t.community.saved }]}
                onChange={setTab}
              />
            ) : !postsHidden ? (
              <AppText variant="subtle" style={styles.sectionLabel}>{t.community.posts}</AppText>
            ) : null}

      {/* Hồ sơ riêng tư được người khác xem sẽ hiện khóa thay cho lưới bài. */}
            {postsHidden && (
              <Card style={styles.lockCard}>
                <Ionicons name="lock-closed" size={30} color={theme.colors.subtle} />
                <AppText variant="h2" style={styles.centerText}>{t.community.privateTitle}</AppText>
                <AppText variant="muted" style={styles.centerText}>{t.community.privateSub(profile.user.name)}</AppText>
              </Card>
            )}
          </View>
        }
        ListEmptyComponent={
          // Không hiện trạng thái trống vì phần đầu đã có thẻ báo tài khoản bị khóa.
          postsHidden ? null : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={showSaved ? "bookmark-outline" : "camera-outline"}
                  size={28}
                  color={theme.colors.primary}
                />
              </View>
              <AppText variant="muted" style={styles.centerText}>
                {showSaved
                  ? t.community.savedEmpty
                  : isMe
                  ? t.community.noPostsSelfEmpty
                  : t.community.noPostsEmpty}
              </AppText>
            </Card>
          )
        }
        renderItem={({ item }) => (
          /* Bài đã lưu có thể thuộc nhiều người nên cần hiện tên tác giả. */
          <PostTile
            post={item}
            showAuthor={showSaved}
            onPress={() => router.push({ pathname: "/community/post-detail", params: { id: item.id } })}
          />
        )}
        ListFooterComponent={loadingMore ? (
          <View style={styles.loadMoreBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.sm },
  gridColumn: { gap: theme.space.sm },
  header: { gap: theme.space.lg, marginBottom: theme.space.sm },
  stateBox: { paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  loadMoreBox: { paddingVertical: theme.space.lg, alignItems: "center" },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  centerText: { textAlign: "center" },
  profileCard: { padding: theme.space.xl, alignItems: "center", gap: theme.space.md },
  avatar: {
    width: 84, height: 84, borderRadius: 30, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: { color: theme.colors.primary },
  nameBox: { alignItems: "center", gap: 2 },
  name: { fontSize: 20 },
  goal: { fontSize: 13 },
  statsRow: { flexDirection: "row", alignSelf: "stretch", paddingVertical: theme.space.sm },
  stat: { alignItems: "center", flex: 1, gap: 2 },
  statValue: { color: theme.colors.primary },
  statLabel: { fontSize: 11 },
  followBox: { alignSelf: "stretch" },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  lockCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  pressed: { opacity: 0.7 },
});
