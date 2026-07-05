import { useState, useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getSavedPosts, type FeedPost } from "@/features/community/api";
import { PostTile } from "@/features/community/PostTile";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

// Private bookmark list (WEAR-style): meals saved from the community to try later.
export default function SavedPostsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Refetch on focus — unsaving inside post-detail must reflect here on return
  useFocusEffect(useCallback(() => {
    if (!token) return;
    getSavedPosts(token)
      .then((data) => { setPosts(data); setLoadError(false); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [token]));

  return (
    <Screen padded={false}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Saved" />
            <AppText variant="muted" style={styles.hint}>
              Meals you bookmarked to try later. Only you can see this list.
            </AppText>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText style={styles.emptyEmoji}>🔖</AppText>
              <AppText variant="h2" style={styles.centerText}>
                {loadError ? "Couldn't load saved posts" : "Nothing saved yet"}
              </AppText>
              <AppText variant="muted" style={styles.centerText}>
                {loadError
                  ? "Check your connection and try again."
                  : "Tap the bookmark on any post to keep it here."}
              </AppText>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <PostTile
            post={item}
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
  column: { gap: theme.space.sm },
  header: { gap: theme.space.xs, marginBottom: theme.space.sm },
  hint: { fontSize: 13 },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  emptyCard: { padding: theme.space.xl, alignItems: "center", gap: 10 },
  emptyEmoji: { fontSize: 40 },
  centerText: { textAlign: "center" },
});
