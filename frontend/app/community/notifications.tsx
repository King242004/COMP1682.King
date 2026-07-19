import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markNotificationsRead, type Notification } from "@/features/community/api";
import { initials, timeAgoParts } from "@/features/community/helpers";
import { dateKey } from "@/utils/date";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

// In-app activity list: likes + follows. Opening the screen marks everything
// read (clears the Community bell badge). Rows deep-link to the post or actor.
export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async (mode: "load" | "refresh" = "load") => {
    if (!token) return;
    const setBusy = mode === "refresh" ? setRefreshing : setLoading;
    setBusy(true);
    try {
      const data = await getNotifications(token);
      setItems(data);
      setLoadError(false);
      // Clear the badge once the list is on screen
      markNotificationsRead(token).catch(() => {});
    } catch {
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openTarget = (n: Notification) => {
    if (n.type === "like" && n.postId) {
      router.push({ pathname: "/community/post-detail" as any, params: { id: n.postId } });
    } else {
      router.push({ pathname: "/community/user-profile", params: { id: n.actor.id } });
    }
  };

  // Match the app's own date style (Coach, meal history): granular for recent,
  // then "Yesterday", then a real date — never a large day count like "45d".
  const timeLabel = (iso: string) => {
    const p = timeAgoParts(iso);
    if (p.unit !== "d") return t.community.timeAgoText(p.n, p.unit);
    const d = new Date(iso);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateKey(d) === dateKey(yesterday)) return t.meals.yesterday;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const renderItem = ({ item }: { item: Notification }) => {
    return (
      <Pressable
        onPress={() => openTarget(item)}
        style={({ pressed }) => [styles.row, !item.read && styles.rowUnread, pressed && styles.pressed]}
      >
        <Pressable
          onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.actor.id } })}
          style={styles.avatar}
        >
          {item.actor.avatar ? (
            <Image source={{ uri: item.actor.avatar }} style={styles.avatarImg} />
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
            {timeLabel(item.createdAt)}
          </AppText>
        </View>

        {item.type === "like" && item.postThumb ? (
          <Image source={{ uri: item.postThumb }} style={styles.thumb} />
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
    <Card style={styles.emptyCard}>
      <AppText style={styles.emptyEmoji}>📡</AppText>
      <AppText variant="h2" style={styles.centerText}>{t.community.loadPostsError}</AppText>
      <AppText variant="muted" style={styles.centerText}>{t.common.checkConnection}</AppText>
      <Pressable onPress={() => load()} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
        <AppText style={styles.retryText}>{t.common.retry}</AppText>
      </Pressable>
    </Card>
  ) : (
    <Card style={styles.emptyCard}>
      <AppText style={styles.emptyEmoji}>🔔</AppText>
      <AppText variant="h2" style={styles.centerText}>{t.community.notifEmptyTitle}</AppText>
      <AppText variant="muted" style={styles.centerText}>{t.community.notifEmptySub}</AppText>
    </Card>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
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
