import { useState, useRef, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  searchUsers, getSuggestions, followUser, unfollowUser, type DiscoverUser,
} from "@/features/community/api";
import { UserRow } from "@/features/community/UserRow";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function DiscoverScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoverUser[]>([]);
  const [suggestions, setSuggestions] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  // Track per-user follow state locally for instant button feedback
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Monotonic id so a slow, older search response can't overwrite a newer one
  const reqIdRef = useRef(0);
  // Mirror of `query` for the focus effect — keeps its deps stable so it only
  // runs on real focus events, not on every keystroke
  const queryRef = useRef("");

  const runSearch = useCallback(async (q: string) => {
    if (!token) return;
    const id = ++reqIdRef.current;
    try {
      const data = await searchUsers(token, q);
      if (id !== reqIdRef.current) return; // stale response — a newer search superseded it
      setResults(data);
    } catch {
      if (id !== reqIdRef.current) return;
      setResults([]);
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }, [token]);

  // Debounced search as the user types
  const onChangeQuery = (text: string) => {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = text.trim();
    if (!q) {
      reqIdRef.current++; // invalidate any in-flight search
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  // Refresh on focus: suggestions exclude people you follow, and search results carry
  // fresh isFollowing — so follow changes made on the profile screen show up on return.
  useFocusEffect(useCallback(() => {
    if (!token) return;
    getSuggestions(token)
      .then((users) => {
        setSuggestions(users);
        setFollowed({}); // fresh server data is authoritative — drop optimistic overrides
      })
      .catch(() => {});
    const q = queryRef.current.trim();
    if (q) runSearch(q);
  }, [token, runSearch]));

  const isFollowing = (u: DiscoverUser) =>
    followed[u.id] ?? u.isFollowing ?? false;

  const onToggleFollow = async (u: DiscoverUser) => {
    if (!token) return;
    const next = !isFollowing(u);
    setFollowed((prev) => ({ ...prev, [u.id]: next }));
    try {
      if (next) await followUser(token, u.id);
      else await unfollowUser(token, u.id);
    } catch {
      setFollowed((prev) => ({ ...prev, [u.id]: !next })); // revert
    }
  };

  const showingSearch = query.trim().length > 0;
  const data = showingSearch ? results : suggestions;

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Discover" />
            {/* Search box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.colors.subtle} />
              <TextInput
                value={query}
                onChangeText={onChangeQuery}
                placeholder="Search people by name"
                placeholderTextColor={theme.colors.subtle}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable onPress={() => onChangeQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.subtle} />
                </Pressable>
              )}
            </View>
            <AppText variant="subtle" style={styles.sectionLabel}>
              {showingSearch ? "Results" : "Suggested for you"}
            </AppText>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
          ) : (
            <Card style={styles.emptyCard}>
              <AppText variant="muted" style={styles.centerText}>
                {showingSearch ? "No users found." : "No suggestions right now."}
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
  header: { gap: theme.space.md, marginBottom: theme.space.sm },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.colors.tintSoft, borderRadius: theme.radius.input,
    paddingHorizontal: theme.space.lg, height: 50,
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.colors.text },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  loader: { marginTop: 20 },
  emptyCard: { padding: theme.space.xl, alignItems: "center" },
  centerText: { textAlign: "center" },
});
