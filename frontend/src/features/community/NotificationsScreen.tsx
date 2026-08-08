// ═══ FILE NÀY LÀM GÌ ═══
// Màn Thông báo, hiện ai đã tim bài hoặc theo dõi mình.
//
// Ai gọi tới: CommunityScreen, qua biểu tượng chuông
// Nhận vào:   không nhận gì, tự tải khi mở màn
// Trả ra:     danh sách thông báo, mở màn là đánh dấu đã đọc
// Khi lỗi:    chưa có thông báo nào thì hiện lời nhắc, không hiện màn trống

// Chỉ có HAI loại thông báo: có người tim bài, và có người theo dõi mình.
//
// Nhớ: backend trả tối đa 50 thông báo, và đã bỏ sẵn mấy mục có người gửi
//      đã xóa tài khoản hoặc bài đã bị xóa. Màn này không phải lọc lại.
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { getNotifications, markNotificationsRead, type Notification } from "@/features/community/communityApi";
import { initials, communityTime } from "@/features/community/communityDisplay";
import { CommunityStateCard } from "@/features/community/CommunityStateCard";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

// ══════════════════════════════════════════════════════════
// XEM THÔNG BÁO
//
// Đến từ nút chuông ở thanh đầu Trang chủ và ở màn Cộng đồng.
// Ba bước, đọc từ trên xuống là đúng thứ tự. Chặng chờ mạng ở BƯỚC 1.
// Xong thì chấm đỏ trên chuông tắt mà người dùng không phải bấm nút nào.
// ══════════════════════════════════════════════════════════

export default function NotificationsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();
  const locale = localeTag(resolveLanguage(user?.language));

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // XEM THÔNG BÁO BƯỚC 1. Tải danh sách rồi ĐÁNH DẤU ĐÃ ĐỌC luôn trong cùng một lượt.
  // Đường đi: getNotifications → apiClient → GET /community/notifications
  //           → notificationController.getNotifications
  // Đường đi: markNotificationsRead → apiClient → POST /community/notifications/read
  //           → notificationController.markNotificationsRead
  // mode chỉ quyết định hiện vòng xoay nào: giữa màn, hay ở đầu danh sách khi kéo làm mới.
  const load = useCallback(async (mode: "load" | "refresh" = "load") => {
    if (!token) return;
    const setBusy = mode === "refresh" ? setRefreshing : setLoading;
    setBusy(true);
    try {
      const data = await getNotifications(token);
      setItems(data);
      setLoadError(false);
      // Đánh dấu đã đọc NGAY sau khi danh sách hiện lên, không chờ người dùng bấm gì.
      // Cố ý KHÔNG await và nuốt lỗi: đánh dấu hụt thì chỉ là chấm đỏ còn đó,
      // không đáng để chặn cả màn.
      // Nhớ: dòng này không xóa dấu chưa đọc trên từng dòng đang hiện, nên lần mở này
      //      người dùng vẫn thấy dòng nào là mới. Lần mở sau mới hết dấu.
      markNotificationsRead(token).catch(() => {});
    } catch {
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  }, [token]);

  // Tự chạy mỗi lần màn được nhìn thấy, không ai bấm.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // XEM THÔNG BÁO BƯỚC 2. Chạm một dòng thì đi đâu tùy loại thông báo.
  // Thông báo tim thì mở bài đó, còn lại, tức thông báo theo dõi, thì mở trang người đó.
  const openTarget = (n: Notification) => {
    if (n.type === "like" && n.postId) {
      router.push({ pathname: "/community/post-detail", params: { id: n.postId } });
    } else {
      router.push({ pathname: "/community/user-profile", params: { id: n.actor.id } });
    }
  };

  // XEM THÔNG BÁO BƯỚC 3. Vẽ một dòng thông báo. Có HAI vùng chạm lồng nhau:
  // chạm ảnh đại diện thì luôn mở trang người đó, chạm phần còn lại thì đi theo openTarget.
  const renderItem = ({ item }: { item: Notification }) => {
    return (
      <Pressable
        onPress={() => openTarget(item)}
        style={({ pressed }) => [styles.row, !item.read && styles.rowUnread, pressed && styles.pressed]}
      >
        <Pressable
          onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.actor.id } })}
          accessibilityRole="button"
          accessibilityLabel={t.a11y.openProfile(item.actor.name)}
          style={styles.avatar}
        >
          {item.actor.avatar ? (
            <Image source={{ uri: item.actor.avatar }} style={styles.avatarImg} cachePolicy="memory-disk" accessible={false} />
          ) : (
            <AppText style={styles.avatarInitials}>{initials(item.actor.name)}</AppText>
          )}
        </Pressable>

        <View style={styles.textCol}>
          <AppText variant="body2" style={styles.text}>
            <AppText variant="body2" style={styles.bold}>{item.actor.name}</AppText>
            {item.type === "like" ? t.community.notifLiked : t.community.notifFollowed}
          </AppText>
          <AppText variant="subtle" style={styles.time}>
            {communityTime(item.createdAt, t, locale)}
          </AppText>
        </View>

        {item.type === "like" && item.postThumb ? (
          <Image source={{ uri: item.postThumb }} style={styles.thumb} cachePolicy="memory-disk" accessible={false} />
        ) : (
          <View style={styles.typeIcon}>
            <Ionicons
              name={item.type === "like" ? "heart" : "person-add"}
              size={16}
              color={item.type === "like" ? theme.colors.danger : theme.colors.primary}
            />
          </View>
        )}
      </Pressable>
    );
  };

  const empty = loading ? (
    <View style={styles.loadingBox}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  ) : loadError ? (
    <CommunityStateCard
      icon="cloud-offline-outline"
      title={t.community.loadPostsError}
      subtitle={t.common.checkConnection}
      onRetry={() => load()}
    />
  ) : (
    <CommunityStateCard
      icon="notifications-outline"
      title={t.community.notifEmptyTitle}
      subtitle={t.community.notifEmptySub}
    />
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load("refresh")} tintColor={theme.colors.primary} />}
        ListHeaderComponent={<ScreenHeader title={t.community.notifTitle} />}
        ListEmptyComponent={empty}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.sm },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: theme.space.md, borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
  },
  rowUnread: { backgroundColor: theme.colors.tintSoft },
  avatar: {
    width: 44, height: 44, borderRadius: 22, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: { color: theme.colors.primary, fontWeight: "700" },
  textCol: { flex: 1, gap: 2 },
  text: { lineHeight: 19 },
  bold: { fontWeight: "700" },
  time: { fontSize: 11 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  typeIcon: {
    width: 44, height: 44, borderRadius: 8, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  pressed: { opacity: 0.7 },
});
