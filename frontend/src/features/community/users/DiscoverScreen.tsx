// ═══ FILE NÀY LÀM GÌ ═══
// Màn Khám phá người dùng: tìm theo tên, hoặc xem gợi ý nên theo dõi ai.
//
// Ai gọi tới: CommunityScreen
// Nhận vào:   từ khóa tìm kiếm
// Trả ra:     danh sách người tìm được, hoặc danh sách gợi ý
// Khi lỗi:    không tìm thấy ai thì hiện thẻ trạng thái

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

// ══════════════════════════════════════════════════════════
// TÌM NGƯỜI
//
// Đến từ màn Cộng đồng. Bốn bước, đọc từ trên xuống là đúng thứ tự.
// Chặng chờ mạng ở BƯỚC 4, nhưng chỉ chạy sau khi người dùng ngừng gõ 350 ms.
// Xong thì hiện danh sách người, mỗi dòng có nút Theo dõi.
// ══════════════════════════════════════════════════════════

// TÌM NGƯỜI BƯỚC 1. Ô tìm trống thì hiện danh sách gợi ý, gõ vào thì hiện kết quả tìm.
export default function DiscoverScreen() {
  const { token } = useAuth();
  const t = useT();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoverUser[]>([]);
  const [suggestions, setSuggestions] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { isFollowing, toggleFollow, clearFollowOverrides } = useFollowToggle(token);
  // Ba ref canh chừng việc gõ và việc gọi mạng, không phải dữ liệu để hiện.
  // Mã của bộ đếm giờ đang chờ, giữ để lát nữa còn hủy được.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Đánh số từng lượt tìm, để bỏ kết quả về muộn thay vì đè lên bản mới hơn.
  const reqIdRef = useRef(0);
  // Bản sao chữ đang gõ, cho mấy hàm chạy trễ đọc được giá trị mới nhất.
  const queryRef = useRef("");

  // TÌM NGƯỜI BƯỚC 4. Gửi đi rồi ĐỨNG ĐÂY CHỜ.
  // Đường đi: searchUsers → apiClient → GET /community/users/search?q=...
  //           → socialController.searchUsers
  // Nằm dưới chỗ gọi ở BƯỚC 3, nhưng chạy sau, vì BƯỚC 3 hẹn giờ mới gọi tới đây.
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

  // TÌM NGƯỜI BƯỚC 3. Mỗi phím gõ vào đây, nhưng KHÔNG gọi mạng ngay.
  // Hủy hẹn giờ cũ rồi hẹn lại 350 ms, nên gõ liên tục thì chỉ lượt cuối được gọi.
  // Không có bước này là gõ "Nam" bắn ba lượt gọi mạng.
  const onChangeQuery = (text: string) => {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = text.trim();
    if (!q) {
      // Xóa trắng ô tìm thì tăng số thứ tự, để mọi lượt đang bay coi như đã cũ.
      // Không làm vậy là kết quả cũ về sau và đè lên danh sách gợi ý.
      reqIdRef.current++;
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  // TÌM NGƯỜI BƯỚC 2. Tải danh sách gợi ý mỗi lần màn được nhìn thấy.
  // Đường đi: getSuggestions → apiClient → GET /community/suggestions
  //           → socialController.getSuggestions
  // clearFollowOverrides xóa mấy nút Theo dõi đang giữ trạng thái tạm,
  // vì danh sách vừa tải về đã mang trạng thái thật rồi.
  // Đang có chữ trong ô tìm thì tìm lại luôn, để kết quả không bị cũ.
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
