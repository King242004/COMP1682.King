import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getFeed, getExplore, toggleLike, type FeedPost } from "@/utils/community";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

type Tab = "feed" | "explore";

// Compact relative time, e.g. "5m", "3h", "2d"
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function initials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function CommunityScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);   // focus/initial load → centered spinner
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh only

  // Shared fetch. `mode` decides which spinner reflects this load:
  // "refresh" drives RefreshControl (user gesture), otherwise the centered loader.
  // Driving RefreshControl programmatically during a screen transition leaves its
  // spinner stuck, so focus/initial loads must NOT touch `refreshing`.
  const load = useCallback(async (which: Tab, mode: "load" | "refresh" = "load") => {
    if (!token) return;
    const setBusy = mode === "refresh" ? setRefreshing : setLoading;
    setBusy(true);
    try {
      const data = which === "feed" ? await getFeed(token) : await getExplore(token);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => { load(tab); }, [tab]);

  // Refresh when returning to the tab (e.g. after creating a post)
  useFocusEffect(useCallback(() => { load(tab); }, [tab, load]));

  // Optimistic like toggle
  const onLike = async (post: FeedPost) => {
    if (!token) return;
    setPosts((prev) => prev.map((p) =>
      p.id === post.id
        ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
        : p
    ));
    try {
      await toggleLike(token, post.id);
    } catch {
      // revert on failure
      setPosts((prev) => prev.map((p) =>
        p.id === post.id
          ? { ...p, isLiked: post.isLiked, likeCount: post.likeCount }
          : p
      ));
    }
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Author row */}
      <Pressable
        onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.author.id } })}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: theme.space.lg }}
      >
        <View style={{
          width: 40, height: 40, borderRadius: 20, overflow: "hidden",
          backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
        }}>
          {item.author.avatar ? (
            <Image source={{ uri: item.author.avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <AppText style={{ color: theme.colors.primary, fontWeight: "700" }}>{initials(item.author.name)}</AppText>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="body2" style={{ fontWeight: "700" }}>{item.author.name}</AppText>
          <AppText variant="subtle" style={{ fontSize: 11 }}>{timeAgo(item.createdAt)} ago</AppText>
        </View>
      </Pressable>

      {/* Caption */}
      {!!item.caption && (
        <AppText variant="body2" style={{ paddingHorizontal: theme.space.lg, paddingBottom: theme.space.md }}>
          {item.caption}
        </AppText>
      )}

      {/* Image */}
      {item.image && (
        <Image source={{ uri: item.image }} style={{ width: "100%", aspectRatio: 1 }} resizeMode="cover" />
      )}

      {/* Meal nutrition chip */}
      {item.meal && (
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          margin: theme.space.lg, padding: theme.space.md,
          borderRadius: theme.radius.card, backgroundColor: "rgba(8,145,178,0.06)",
        }}>
          <View style={{
            width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(8,145,178,0.10)",
            alignItems: "center", justifyContent: "center",
          }}>
            <AppText style={{ fontSize: 18 }}>🍽️</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body2" style={{ fontWeight: "700" }}>{item.meal.name}</AppText>
            <AppText variant="subtle" style={{ fontSize: 11 }}>
              {item.meal.calories} kcal · P {item.meal.protein} · C {item.meal.carbs} · F {item.meal.fat}
            </AppText>
          </View>
        </View>
      )}

      {/* Like row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md }}>
        <Pressable onPress={() => onLike(item)} hitSlop={8} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.6 : 1 })}>
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={22}
            color={item.isLiked ? theme.colors.danger : theme.colors.subtle}
          />
          <AppText variant="body2" style={{ color: item.isLiked ? theme.colors.danger : theme.colors.muted }}>
            {item.likeCount > 0 ? item.likeCount : ""}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40, gap: theme.space.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(tab, "refresh")} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={{ gap: theme.space.md, marginBottom: theme.space.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <AppText variant="h1">Community</AppText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {/* Discover: search people + follow suggestions */}
                <Pressable
                  onPress={() => router.push("/community/discover")}
                  style={({ pressed }) => ({
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: pressed ? theme.colors.tint : "rgba(8,145,178,0.06)",
                    alignItems: "center", justifyContent: "center",
                  })}
                >
                  <Ionicons name="search" size={19} color={theme.colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/community/post-create")}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99,
                    backgroundColor: pressed ? theme.colors.primary2 : theme.colors.primary,
                  })}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Post</AppText>
                </Pressable>
              </View>
            </View>
            {/* Feed / Explore toggle */}
            <View style={{ flexDirection: "row", gap: 6 }}>
              {([["feed", "Following"], ["explore", "Explore"]] as [Tab, string][]).map(([key, label]) => {
                const active = tab === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setTab(key)}
                    style={({ pressed }) => ({
                      flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12,
                      backgroundColor: active ? theme.colors.primary : "rgba(8,145,178,0.06)",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <AppText style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : theme.colors.subtle }}>
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: theme.space.xl, alignItems: "center" }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <Card style={{ padding: theme.space.xl, alignItems: "center", gap: 10 }}>
              <AppText style={{ fontSize: 40 }}>🥗</AppText>
              <AppText variant="h2" style={{ textAlign: "center" }}>
                {tab === "feed" ? "Your feed is empty" : "No posts yet"}
              </AppText>
              <AppText variant="muted" style={{ textAlign: "center" }}>
                {tab === "feed"
                  ? "Follow people in Explore, or share your first healthy meal."
                  : "Be the first to share a healthy meal!"}
              </AppText>
            </Card>
          )
        }
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
