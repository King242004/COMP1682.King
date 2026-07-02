import { useEffect, useState, useRef } from "react";
import { FlatList, Image, Pressable, TextInput, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  searchUsers, getSuggestions, followUser, unfollowUser, type DiscoverUser,
} from "@/features/community/api";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose weight", gain_muscle: "Gain muscle", eat_healthy: "Eat healthy",
};

function initials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}

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

  useEffect(() => {
    if (!token) return;
    getSuggestions(token).then(setSuggestions).catch(() => setSuggestions([]));
  }, [token]);

  // Debounced search as the user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      if (!token) return;
      try {
        const data = await searchUsers(token, q);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, token]);

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

  const renderUser = ({ item }: { item: DiscoverUser }) => {
    const following = isFollowing(item);
    return (
      <Card style={{ padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.id } })}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
        >
          <View style={{ width: 46, height: 46, borderRadius: 16, overflow: "hidden", backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center" }}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <AppText style={{ color: theme.colors.primary, fontWeight: "700" }}>{initials(item.name)}</AppText>
            )}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="body2" style={{ fontWeight: "700" }}>{item.name}</AppText>
            <AppText variant="subtle" style={{ fontSize: 11 }}>
              {item.sameGoal ? "🎯 Same goal · " : ""}
              {GOAL_LABEL[item.goal] ?? item.goal}
              {typeof item.followers === "number" && item.followers > 0 ? ` · ${item.followers} followers` : ""}
            </AppText>
          </View>
        </Pressable>
        <Pressable
          onPress={() => onToggleFollow(item)}
          style={({ pressed }) => ({
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99,
            backgroundColor: following ? theme.colors.tint : theme.colors.primary,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText style={{ fontSize: 13, fontWeight: "700", color: following ? theme.colors.primary : "#fff" }}>
            {following ? "Following" : "Follow"}
          </AppText>
        </Pressable>
      </Card>
    );
  };

  const showingSearch = query.trim().length > 0;
  const data = showingSearch ? results : suggestions;

  return (
    <Screen padded={false}>
      <FlatList
        data={data}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.sm }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: theme.space.md, marginBottom: theme.space.sm }}>
            <ScreenHeader title="Discover" />
            {/* Search box */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "rgba(8,145,178,0.06)", borderRadius: theme.radius.input,
              paddingHorizontal: theme.space.lg, height: 50,
            }}>
              <Ionicons name="search" size={18} color={theme.colors.subtle} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search people by name"
                placeholderTextColor={theme.colors.subtle}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, fontSize: 15, color: theme.colors.text }}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.subtle} />
                </Pressable>
              )}
            </View>
            <AppText variant="subtle" style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 }}>
              {showingSearch ? "Results" : "Suggested for you"}
            </AppText>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <Card style={{ padding: theme.space.xl, alignItems: "center" }}>
              <AppText variant="muted" style={{ textAlign: "center" }}>
                {showingSearch ? "No users found." : "No suggestions right now."}
              </AppText>
            </Card>
          )
        }
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
