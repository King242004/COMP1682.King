import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  getFollowers, getFollowing, followUser, unfollowUser, type DiscoverUser,
} from "@/features/community/api";
import { UserRow } from "@/features/community/UserRow";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

// Danh sách người theo dõi hoặc đang theo dõi, mở từ thống kê hồ sơ.
export default function UserListScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: "followers" | "following" }>();
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();

  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Cập nhật trạng thái theo dõi trên máy trước để nút phản hồi ngay.
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const isFollowers = type === "followers";
  const title = isFollowers ? t.community.followers : t.community.following;

  useFocusEffect(useCallback(() => {
    if (!token || !id) return;
    const fetcher = isFollowers ? getFollowers : getFollowing;
    fetcher(token, id)
      .then((list) => { setUsers(list); setFollowed({}); setLoadError(false); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [token, id, isFollowers]));

  const isFollowing = (u: DiscoverUser) => followed[u.id] ?? u.isFollowing ?? false;

  const onToggleFollow = async (u: DiscoverUser) => {
    if (!token) return;
    const next = !isFollowing(u);
    setFollowed((prev) => ({ ...prev, [u.id]: next }));
    try {
      if (next) await followUser(token, u.id);
      else await unfollowUser(token, u.id);
    } catch {
      // Trả lại trạng thái cũ nếu yêu cầu theo dõi thất bại.
      setFollowed((prev) => ({ ...prev, [u.id]: !next }));
    }
  };

  return (
    <Screen padded={false}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.listContent}
        alwaysBounceVertical
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title={title} />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText variant="muted" style={styles.centerText}>
                {loadError
                  ? t.community.loadListError
                  : isFollowers
                  ? t.community.noFollowers
                  : t.community.noFollowing}
              </AppText>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <UserRow
            user={item}
            following={isFollowing(item)}
            onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.id } })}
            onToggleFollow={() => onToggleFollow(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.sm },
  header: { marginBottom: theme.space.sm },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  emptyCard: { padding: theme.space.xl, alignItems: "center" },
  centerText: { textAlign: "center" },
});
