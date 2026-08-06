// ═══ FILE NÀY LÀM GÌ ═══
// Một màn dùng cho CẢ hai danh sách: người theo dõi mình, và người mình theo dõi.
//
// Ai gọi tới: UserProfileScreen
// Nhận vào:   mã người dùng và loại danh sách cần xem
// Trả ra:     danh sách người kèm nút theo dõi
// Khi lỗi:    danh sách rỗng thì hiện thẻ trạng thái

import { useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { getFollowers, getFollowing, type DiscoverUser } from "@/features/community/communityApi";
import { CommunityUserList } from "@/features/community/users/CommunityUserList";
import { useFollowToggle } from "@/features/community/users/useFollowToggle";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function UserListScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: "followers" | "following" }>();
  const { token } = useAuth();
  const t = useT();

  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { isFollowing, toggleFollow, clearFollowOverrides } = useFollowToggle(token);

  const isFollowers = type === "followers";
  const title = isFollowers ? t.community.followers : t.community.following;

  // Tự tải danh sách người mỗi lần mở màn.
  useFocusEffect(useCallback(() => {
    if (!token || !id) return;
    const fetcher = isFollowers ? getFollowers : getFollowing;
    fetcher(token, id)
      .then((list) => { setUsers(list); clearFollowOverrides(); setLoadError(false); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [token, id, isFollowers, clearFollowOverrides]));

  return (
    <Screen padded={false}>
      <CommunityUserList
        users={users}
        header={
          <View style={styles.header}>
            <ScreenHeader title={title} />
          </View>
        }
        empty={
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
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: theme.space.sm },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  emptyCard: { padding: theme.space.xl, alignItems: "center" },
  centerText: { textAlign: "center" },
});
