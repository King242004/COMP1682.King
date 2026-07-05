import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  getPublicProfile, getUserPosts, followUser, unfollowUser,
  type FeedPost, type PublicProfile,
} from "@/features/community/api";
import { PostTile } from "@/features/community/PostTile";
import { GOAL_LABEL, initials } from "@/features/community/helpers";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [p, ps] = await Promise.all([getPublicProfile(token, id), getUserPosts(token, id)]);
      setProfile(p);
      setPosts(ps);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [token, id]);

  // Refetch on focus so counts/follow state stay fresh after actions elsewhere
  useFocusEffect(useCallback(() => { load(); }, [load]));

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

  // Like/save/delete all live on the post-detail screen; this screen refetches
  // on focus, so counts and the grid stay in sync when the user comes back.

  // Loading / error states keep the header so the user can always go back
  if (!profile) {
    return (
      <Screen padded={false}>
        <View style={styles.stateBox}>
          <ScreenHeader title="Profile" />
          {loadError ? (
            <Card style={styles.errorCard}>
              <AppText style={styles.emptyEmoji}>📡</AppText>
              <AppText variant="h2" style={styles.centerText}>Couldn't load profile</AppText>
              <AppText variant="muted" style={styles.centerText}>Check your connection and try again.</AppText>
              <Pressable onPress={load} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
                <AppText style={styles.retryText}>Retry</AppText>
              </Pressable>
            </Card>
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </View>
      </Screen>
    );
  }

  const isMe = profile.isMe || profile.user.id === user?.id;

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.stat}>
      <AppText variant="h2" style={styles.statValue}>{value}</AppText>
      <AppText variant="subtle" style={styles.statLabel}>{label}</AppText>
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.gridColumn}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Profile" />

            {/* Header card */}
            <Card style={styles.profileCard}>
              <View style={styles.avatar}>
                {profile.user.avatar ? (
                  <Image source={{ uri: profile.user.avatar }} style={styles.avatarImg} />
                ) : (
                  <AppText variant="h1" style={styles.avatarInitials}>{initials(profile.user.name)}</AppText>
                )}
              </View>
              <View style={styles.nameBox}>
                <AppText variant="h1" style={styles.name}>{profile.user.name}</AppText>
                {profile.user.goal ? (
                  <AppText variant="muted" style={styles.goal}>🎯 {GOAL_LABEL[profile.user.goal] ?? profile.user.goal}</AppText>
                ) : null}
              </View>

              <View style={styles.statsRow}>
                <Stat label="Posts" value={profile.stats.postCount} />
                <Stat label="Followers" value={profile.stats.followers} />
                <Stat label="Following" value={profile.stats.following} />
              </View>

              {!isMe && (
                <View style={styles.followBox}>
                  <Button
                    title={profile.isFollowing ? "Following" : "Follow"}
                    variant={profile.isFollowing ? "secondary" : "primary"}
                    disabled={busy}
                    onPress={onToggleFollow}
                  />
                </View>
              )}
            </Card>

            <AppText variant="subtle" style={styles.sectionLabel}>Posts</AppText>
          </View>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <AppText variant="muted">No posts yet.</AppText>
          </Card>
        }
        renderItem={({ item }) => (
          <PostTile
            post={item}
            showAuthor={false}
            onPress={() => router.push({ pathname: "/community/post-detail" as any, params: { id: item.id } })}
          />
        )}
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
  errorCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  centerText: { textAlign: "center" },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  profileCard: { padding: theme.space.xl, alignItems: "center", gap: theme.space.md },
  avatar: {
    width: 84, height: 84, borderRadius: 30, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
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
  emptyCard: { padding: theme.space.xl, alignItems: "center" },
  pressed: { opacity: 0.7 },
});
