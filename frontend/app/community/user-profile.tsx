import { useEffect, useState, useCallback } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import {
  getPublicProfile, getUserPosts, followUser, unfollowUser,
  type FeedPost, type PublicProfile,
} from "../utils/community";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";

function initials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose weight", gain_muscle: "Gain muscle", eat_healthy: "Eat healthy",
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [p, ps] = await Promise.all([getPublicProfile(token, id), getUserPosts(token, id)]);
      setProfile(p);
      setPosts(ps);
    } catch {
      setProfile(null);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  const onToggleFollow = async () => {
    if (!token || !id || !profile) return;
    const wasFollowing = profile.isFollowing;
    // optimistic
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
      load(); // revert from server on failure
    } finally {
      setBusy(false);
    }
  };

  if (!profile) {
    return (
      <Screen style={{ alignItems: "center", justifyContent: "center" }}>
        <AppText variant="muted">Loading profile...</AppText>
      </Screen>
    );
  }

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <View style={{ alignItems: "center", flex: 1, gap: 2 }}>
      <AppText variant="h2" style={{ color: theme.colors.primary }}>{value}</AppText>
      <AppText variant="subtle" style={{ fontSize: 11 }}>{label}</AppText>
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.md }}
        ListHeaderComponent={
          <View style={{ gap: theme.space.lg, marginBottom: theme.space.sm }}>
            {/* Back */}
            <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", opacity: pressed ? 0.6 : 1 })}>
              <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
              <AppText style={{ color: theme.colors.primary, fontWeight: "600" }}>Back</AppText>
            </Pressable>

            {/* Header card */}
            <Card style={{ padding: theme.space.xl, alignItems: "center", gap: theme.space.md }}>
              <View style={{ width: 84, height: 84, borderRadius: 30, overflow: "hidden", backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center" }}>
                {profile.user.avatar ? (
                  <Image source={{ uri: profile.user.avatar }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <AppText variant="h1" style={{ color: theme.colors.primary }}>{initials(profile.user.name)}</AppText>
                )}
              </View>
              <View style={{ alignItems: "center", gap: 2 }}>
                <AppText variant="h1" style={{ fontSize: 20 }}>{profile.user.name}</AppText>
                {profile.user.goal ? (
                  <AppText variant="muted" style={{ fontSize: 13 }}>🎯 {GOAL_LABEL[profile.user.goal] ?? profile.user.goal}</AppText>
                ) : null}
              </View>

              <View style={{ flexDirection: "row", alignSelf: "stretch", paddingVertical: theme.space.sm }}>
                <Stat label="Posts" value={profile.stats.postCount} />
                <Stat label="Followers" value={profile.stats.followers} />
                <Stat label="Following" value={profile.stats.following} />
              </View>

              {!profile.isMe && (
                <View style={{ alignSelf: "stretch" }}>
                  <Button
                    title={profile.isFollowing ? "Following" : "Follow"}
                    variant={profile.isFollowing ? "secondary" : "primary"}
                    disabled={busy}
                    onPress={onToggleFollow}
                  />
                </View>
              )}
            </Card>

            <AppText variant="subtle" style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 }}>
              Posts
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <Card style={{ padding: theme.space.xl, alignItems: "center" }}>
            <AppText variant="muted">No posts yet.</AppText>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {!!item.caption && (
              <AppText variant="body2" style={{ padding: theme.space.lg, paddingBottom: item.image ? theme.space.md : theme.space.lg }}>
                {item.caption}
              </AppText>
            )}
            {item.image && <Image source={{ uri: item.image }} style={{ width: "100%", aspectRatio: 1 }} resizeMode="cover" />}
            {item.meal && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: theme.space.md }}>
                <AppText style={{ fontSize: 16 }}>🍽️</AppText>
                <AppText variant="subtle" style={{ fontSize: 12 }}>
                  {item.meal.name} · {item.meal.calories} kcal
                </AppText>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md }}>
              <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={18} color={item.isLiked ? theme.colors.danger : theme.colors.subtle} />
              <AppText variant="subtle">{item.likeCount > 0 ? item.likeCount : ""}</AppText>
            </View>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
