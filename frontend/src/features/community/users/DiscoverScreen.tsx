// Tìm người hoặc gợi ý tài khoản phù hợp để theo dõi.
import { useState, useRef, useCallback } from "react";
import { Pressable, StyleSheet, TextInput, View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { searchUsers, getSuggestions, type DiscoverUser } from "@/features/community/communityApi";
import { CommunityUserList } from "@/features/community/users/CommunityUserList";
import { useFollowToggle } from "@/features/community/users/useFollowToggle";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { INPUT_LIMITS } from "@/config/inputLimits";

export default function DiscoverScreen() {
  const { token } = useAuth();
  const t = useT();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoverUser[]>([]);
  const [suggestions, setSuggestions] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { isFollowing, toggleFollow, clearFollowOverrides } = useFollowToggle(token);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);
  const queryRef = useRef("");

  const runSearch = useCallback(async (q: string) => {
    if (!token) return;
    const id = ++reqIdRef.current;
    try {
      const data = await searchUsers(token, q);
      // Bỏ kết quả cũ nếu người dùng đã thực hiện tìm kiếm mới hơn.
      if (id !== reqIdRef.current) return;
      setResults(data);
    } catch {
      if (id !== reqIdRef.current) return;
      setResults([]);
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }, [token]);

  // Chờ người dùng ngừng gõ để tránh gọi mạng theo từng phím.
  const onChangeQuery = (text: string) => {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = text.trim();
    if (!q) {
    // Làm cho mọi yêu cầu tìm kiếm đang chạy trở thành dữ liệu cũ.
    reqIdRef.current++;
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  // Tải lại gợi ý hoặc kết quả tìm kiếm khi quay lại màn.
  useFocusEffect(useCallback(() => {
    if (!token) return;
    getSuggestions(token)
      .then((users) => {
        setSuggestions(users);
      clearFollowOverrides();
      })
      .catch(() => {});
    const q = queryRef.current.trim();
    if (q) runSearch(q);
  }, [token, runSearch, clearFollowOverrides]));

  const showingSearch = query.trim().length > 0;
  const data = showingSearch ? results : suggestions;

  return (
    <Screen padded={false}>
      <CommunityUserList
        users={data}
        keepKeyboard
        header={
          <View style={styles.header}>
            <ScreenHeader title={t.community.discover} />
            {/* Search box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.colors.subtle} />
              <TextInput
                value={query}
                onChangeText={onChangeQuery}
                placeholder={t.community.searchPlaceholder}
                placeholderTextColor={theme.colors.subtle}
                maxLength={INPUT_LIMITS.USER_SEARCH}
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
              {showingSearch ? t.community.results : t.community.suggested}
            </AppText>
          </View>
        }
        empty={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
          ) : (
            <Card style={styles.emptyCard}>
              <AppText variant="muted" style={styles.centerText}>
                {showingSearch ? t.community.noUsersFound : t.community.noSuggestions}
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
