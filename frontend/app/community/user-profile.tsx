import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  getPublicProfile, getUserPosts, getSavedPosts, followUser, unfollowUser,
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

type ProfileTab = "posts" | "saved";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();

  // Whether this is my own community profile — decided locally so the Saved tab
  // and its fetch don't wait on the server profile to load.
  const viewingSelf = !!user && id === user.id;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [saved, setSaved] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      // Saved is private → only fetched (and shown) on my own profile
      const [p, ps, sv] = await Promise.all([
        getPublicProfile(token, id),
        getUserPosts(token, id),
        viewingSelf ? getSavedPosts(token) : Promise.resolve([] as FeedPost[]),
      ]);
      setProfile(p);
      setPosts(ps);
      setSaved(sv);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [token, id, viewingSelf]);

  // Refetch on focus so counts, follow state and the saved list stay fresh
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

  const isMe = viewingSelf || profile.isMe;
  const showSaved = isMe && tab === "saved";
  const postsHidden = profile.postsHidden; // private profile viewed by someone else
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
    router.push({ pathname: "/community/user-list" as any, params: { id: profile.user.id, type: listType } });

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
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
                {/* A private profile's follow lists are locked to non-owners */}
                <Stat label="Followers" value={profile.stats.followers} onPress={postsHidden ? undefined : () => openList("followers")} />
                <Stat label="Following" value={profile.stats.following} onPress={postsHidden ? undefined : () => openList("following")} />
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

            {/* My posts / Saved tabs (own profile only, WEAR-style) */}
            {isMe ? (
              <View style={styles.tabRow}>
                {([["posts", "My posts"], ["saved", "Saved"]] as const).map(
                  ([key, label]) => {
                    const active = tab === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => setTab(key)}
                        style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}
                      >
                        <AppText style={[styles.tabText, active && styles.tabTextActive]}>{label}</AppText>
                      </Pressable>
                    );
                  }
                )}
              </View>
            ) : !postsHidden ? (
              <AppText variant="subtle" style={styles.sectionLabel}>Posts</AppText>
            ) : null}

            {/* Private profile viewed by someone else — grid replaced with a lock */}
            {postsHidden && (
              <Card style={styles.lockCard}>
                <Ionicons name="lock-closed" size={30} color={theme.colors.subtle} />
                <AppText variant="h2" style={styles.centerText}>This profile is private</AppText>
                <AppText variant="muted" style={styles.centerText}>
                  {profile.user.name} keeps their posts private.
                </AppText>
              </Card>
            )}
          </View>
        }
        ListEmptyComponent={
          postsHidden ? null : ( // lock card already shown in the header
            <Card style={styles.emptyCard}>
              <AppText style={styles.emptyEmoji}>{showSaved ? "🔖" : "📷"}</AppText>
              <AppText variant="muted" style={styles.centerText}>
                {showSaved
                  ? "Nothing saved yet. Tap the bookmark on any post to keep it here."
                  : isMe
                  ? "You haven't posted yet. Share your first healthy meal!"
                  : "No posts yet."}
              </AppText>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <PostTile
            post={item}
            showAuthor={showSaved} // saved posts come from various people; my own grid doesn't need my name
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
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12,
    backgroundColor: theme.colors.tintSoft,
  },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  lockCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  pressed: { opacity: 0.7 },
});
