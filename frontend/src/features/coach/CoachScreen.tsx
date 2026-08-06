// ═══ FILE NÀY LÀM GÌ ═══
// Màn AI Coach. File BẮT ĐẦU của luồng trò chuyện.
//
// Ai gọi tới: app/tabs/coach
// Nhận vào:   câu hỏi người dùng gõ, và ảnh nếu có
// Trả ra:     câu trả lời của Coach, và thẻ điểm sức khỏe ở đầu màn
// Khi lỗi:    AI hết lượt thì hiện lời nhắc thử lại sau. Câu ngoài phạm vi thì Coach từ chối lịch sự

// Màn này có hai phần: thẻ điểm sức khỏe ở trên, và khung chat ở dưới.
// LUỒNG GỬI TIN NHẮN
// 1. Bấm nút gửi, chạy send ở file này
// 2. hiện ngay tin của mình cộng ba chấm đang gõ, chưa chờ mạng
// 3. chatWithCoach gửi tin cộng 16 tin gần nhất  (POST /coach/chat)
// 4. backend coachController.chat gom dữ liệu thật của người dùng
// 5. gửi cho Gemini kèm dữ liệu đó, nhận câu trả lời
// 6. backend lưu hai tin nhắn vào database rồi trả về
// 7. thay ba chấm bằng câu trả lời thật
// LUỒNG GHI MÓN TỪ TIN NHẮN
// 1. Coach nhận ra người dùng đang ăn một món, tin nhắn có nút Thêm
// 2. Bấm Thêm, gọi POST /coach/log
// 3. backend tạo một món thật trong nhật ký
// 4. nút đổi thành đã thêm, bấm lần nữa là hoàn tác
// LUỒNG XEM ĐIỂM SỨC KHỎE, tự chạy khi mở màn
// 1. loadInsight hiện bản lưu trong máy ngay
// 2. nếu bản lưu quá 10 phút thì gọi GET /coach/insight lấy bản mới
// 3. điểm do CODE tính chứ không phải AI chấm, AI chỉ viết lời nhận xét
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, Keyboard, Platform, Pressable, StyleSheet, TextInput, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useHealthDataRefresh } from "@/context/HealthDataRefreshContext";
import { getInsight, chatWithCoach, getChatHistory, clearChatHistory, getCachedInsight, cacheInsight, INSIGHT_TTL_MS, type CoachInsight, type ChatMessage } from "@/features/coach/coachApi";
import { prepareCoachImage } from "@/features/coach/coachImage";
import { TypingDots } from "@/features/coach/TypingDots";
import { InsightCard } from "@/features/coach/InsightCard";
import { ChatBubble } from "@/features/coach/ChatBubble";
import { todayKey, dateKey } from "@/utils/dateUtils";
import { aiResetWhen } from "@/utils/aiQuota";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { getErrorMessage } from "@/utils/errorUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Screen } from "@/ui/components/Screen";
import { INPUT_LIMITS } from "@/config/inputLimits";

export default function CoachScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { revision } = useHealthDataRefresh();
  const lang = resolveLanguage(user?.language);
  const t = useT();
  const suggestions = t.coach.suggestions;
  const L = t.coach;

  // Bù chiều cao AppHeader để bàn phím không che ô nhập.
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<FlatList<ChatMessage>>(null);
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ uri: string; base64: string } | null>(null);
  const [communityRecipeNotice, setCommunityRecipeNotice] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showJump, setShowJump] = useState(false);

  // Các ref này bỏ kết quả cũ, tránh xử lý lặp và chặn hai lần chạm.
  const insightRequestIdRef = useRef(0);
  const handledRevisionRef = useRef(0);
  const consumedAskRef = useRef<string | null>(null);

  const scrollToLatest = useCallback((animated = true) => {
    scrollRef.current?.scrollToEnd({ animated });
  }, []);

  // Tự cuộn xuống tin mới nhất khi bàn phím bật lên,
  // để bàn phím không che mất tin đang đọc. Gỡ lắng nghe khi thoát màn.
  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => scrollToLatest(true));
    });
    return () => subscription.remove();
  }, [scrollToLatest]);

  // Đổi sang base64 vì tin nhắn Coach gửi ảnh kèm trong JSON,
  // khác luồng Quét ảnh vốn gửi file riêng.
  const pickImage = async (source: "camera" | "library") => {
    const perm = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(L.permTitle, L.permMsg);
      return;
    }
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: "images", quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.7 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
      const compressed = await prepareCoachImage(result.assets[0].uri);
    if (compressed) setPendingImage(compressed);
    else Alert.alert(L.imgErrTitle, L.imgErrMsg);
  };

  const attachImage = () => {
    Alert.alert(L.photoTitle, L.photoMsg, [
      { text: L.camera, onPress: () => pickImage("camera") },
      { text: L.library, onPress: () => pickImage("library") },
      { text: L.cancel, style: "cancel" },
    ]);
  };

  // insightRequestIdRef đánh số từng lần gọi, kết quả về muộn hơn lần mới nhất
  // sẽ bị bỏ, tránh dữ liệu cũ đè lên dữ liệu mới.
  const loadInsight = useCallback(async (force = false) => {
    if (!token) return;
    const requestId = ++insightRequestIdRef.current;
    const date = todayKey();
    const cached = await getCachedInsight(date, lang);
    if (requestId !== insightRequestIdRef.current) return;
    if (cached) {
      setInsight(cached.insight);
      setLoadingInsight(false);
      // Không gọi AI lại khi insight trong bộ nhớ đệm vẫn còn mới.
      if (!force && Date.now() - cached.at < INSIGHT_TTL_MS) return;
    } else {
      setLoadingInsight(true);
    }
    try {
      const fresh = await getInsight(token, date, lang);
      if (requestId !== insightRequestIdRef.current) return;
      setInsight(fresh);
      setProfileIncomplete(false);
      cacheInsight(date, lang, fresh);
    } catch (error) {
      setProfileIncomplete(getErrorMessage(error) === "PROFILE_INCOMPLETE");
      if (requestId === insightRequestIdRef.current && !cached) setInsight(null);
    } finally {
      if (requestId === insightRequestIdRef.current) setLoadingInsight(false);
    }
  }, [token, lang]);

  // Lọc theo ngôn ngữ nên đổi sang tiếng Anh sẽ không lẫn tin tiếng Việt cũ.
  // historyLoaded phải bật kể cả khi lỗi, vì câu hỏi gửi từ màn khác chờ cờ này.
  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoaded(false);
    try {
      const hist = await getChatHistory(token, lang);
      setMessages(hist);
      // Cuộn tới tin mới nhất sau khi lịch sử hiển thị.
      setTimeout(() => scrollToLatest(false), 150);
    } catch {
    // Giữ nguyên dữ liệu đang có nếu tải lịch sử thất bại.
    } finally {
      setHistoryLoaded(true);
    }
  }, [lang, scrollToLatest, token]);

  // Lịch sử chỉ tải một lần để đổi tab không ghi đè cuộc trò chuyện đang diễn ra.
  // Insight được làm mới riêng khi dữ liệu sức khỏe thay đổi.
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Tự động làm mới điểm khi quay lại tab này, không do ai bấm.
  // Chỉ gọi AI lại khi dữ liệu sức khỏe thật sự đổi, để đỡ tốn lượt gọi.
  // Chờ 350 mili giây khi có thay đổi, để backend kịp ghi xong món vừa thêm.
  useFocusEffect(
    useCallback(() => {
      const changed = revision !== handledRevisionRef.current;
      handledRevisionRef.current = revision;
      const timer = setTimeout(() => loadInsight(changed), changed ? 350 : 0);
      return () => clearTimeout(timer);
    }, [loadInsight, revision])
  );

  // Nút gửi tin nhắn, điểm bắt đầu của luồng trò chuyện.
  // Hiện tin của mình trước khi gọi mạng; backend tự đọc lịch sử từ database.
  const send = useCallback(async (text: string, displayText?: string, source?: "community") => {
    const msg = text.trim();
    const img = pendingImage;
    if ((!msg && !img) || sending || !token) return;
    const prior = messages;
    const userMsg: ChatMessage = { role: "user", text: (displayText ?? msg).trim(), image: img?.uri, createdAt: new Date().toISOString() };
    setMessages([...prior, userMsg]);
    setInput("");
    setPendingImage(null);
    setSending(true);
    setTimeout(() => scrollToLatest(true), 50);
    try {
      const { reply, meal, eating, messageId } = await chatWithCoach(
        token,
        msg,
        lang,
        img ? { base64: img.base64, mimeType: "image/jpeg" } : undefined,
        source
      );
      setMessages((prev) => [...prev, { id: messageId ?? undefined, role: "coach", text: reply, meal, eating, createdAt: new Date().toISOString() }]);
    } catch (error: unknown) {
      const quota = /quota/i.test(getErrorMessage(error));
      const errText = quota
        ? t.coach.quotaMsg(aiResetWhen(t))
        : t.coach.replyFail;
      setMessages((prev) => [...prev, { role: "coach", text: errText, createdAt: new Date().toISOString() }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollToLatest(true), 50);
    }
  }, [lang, messages, pendingImage, scrollToLatest, sending, t, token]);

  const askAboutTip = (tip: string) =>
    send(t.coach.askTip(tip));

  // Tự động gửi câu hỏi đến từ màn khác, không do người dùng gõ tại đây.
  // Nơi gọi: nút hỏi cách nấu ở Kế hoạch tuần, và nút xem cách làm ở bài Community.
  // consumedAskRef nhớ mã đã xử lý, để quay lại tab này không gửi lại câu hỏi cũ.
  const { ask, askId, recipeNotice } = useLocalSearchParams<{
    ask?: string;
    askId?: string;
    recipeNotice?: string;
  }>();
  // Tự động gửi câu hỏi đến từ màn khác. Chỉ chạy khi lịch sử đã tải xong
  // và chưa gửi tin nào khác, để bong bóng câu hỏi không bị ghi đè.
  useEffect(() => {
    if (!ask || !askId || consumedAskRef.current === askId) return;
    // Chờ lịch sử và yêu cầu đang gửi hoàn tất để bong bóng câu hỏi không bị ghi đè.
    if (!token || sending || !historyLoaded) return;
    consumedAskRef.current = askId;
    const isCommunityRecipe = recipeNotice === "community";
    setCommunityRecipeNotice(isCommunityRecipe);
    send(String(ask), undefined, isCommunityRecipe ? "community" : undefined);
  }, [ask, askId, recipeNotice, token, sending, historyLoaded, send]);

  // Chọn loại bữa cho món gợi ý trước khi thêm. Thay đổi này chỉ ở máy.
  const reviewMeal = (m: ChatMessage) => {
    if (!m.meal) return;
    router.push({
      pathname: "/meals/add",
      params: {
        mealType: m.meal.mealType,
        prefillName: m.meal.name,
        prefillCalories: String(m.meal.calories),
        prefillProtein: String(m.meal.protein),
        prefillCarbs: String(m.meal.carbs),
        prefillFat: String(m.meal.fat),
        source: "coach",
      },
    });
  };

  // Nút "Thêm" trên tin nhắn Coach có kèm món.
  // loggingRef chặn bấm hai lần, tránh ghi trùng món.

  // Nút hoàn tác món vừa thêm.

  const dayLabelFor = (iso?: string) => {
    const d = iso ? dateKey(new Date(iso)) : todayKey();
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d === dateKey(now)) return t.meals.today;
    if (d === dateKey(yesterday)) return t.meals.yesterday;
    return new Date(d + "T00:00:00").toLocaleDateString(localeTag(lang), { month: "short", day: "numeric" });
  };
  const msgDay = (m: ChatMessage) => (m.createdAt ? dateKey(new Date(m.createdAt)) : todayKey());

  // Hiện nút tới tin mới nhất khi người dùng cuộn lên đọc tin cũ.
  const onChatScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 150;
    setShowJump(!nearBottom && messages.length > 0);
  };

  // Nút xóa lịch sử trò chuyện.
  const onClear = () => {
    if (messages.length === 0 || !token) return;
    Alert.alert(L.clearTitle, L.clearMsg, [
      { text: L.cancel, style: "cancel" },
      {
        text: L.clear,
        style: "destructive",
        onPress: async () => {
          setMessages([]);
          try {
            await clearChatHistory(token);
          } catch {
          loadHistory();
          }
        },
      },
    ]);
  };

  return (
    <Screen
      padded={false}
      keyboard
      keyboardOffset={headerHeight}
      dismissKeyboardOnTap={false}
    >
      <View style={styles.container}>
        {/* Thanh đầu màu chính đậm và chữ sáng, cùng phong cách với Home. */}
        <View style={styles.header}>
          <View style={styles.titleLeft}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <AppText variant="h1" style={styles.title}>AI Coach</AppText>
          </View>
          {messages.length > 0 && (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.a11y.clearChat}
              style={({ pressed }) => pressed && styles.dim}
            >
              <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.85)" />
            </Pressable>
          )}
        </View>

        <View style={styles.chatArea}>
          {/* Cho phép kéo nhẹ cả khi danh sách trống để màn hình không có cảm giác bị đứng. */}
          <FlatList
            ref={scrollRef}
            data={messages}
            style={styles.flex1}
            contentContainerStyle={styles.chatContent}
            alwaysBounceVertical
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
            onScroll={onChatScroll}
            scrollEventThrottle={100}
            keyExtractor={(item, index) => `${item.id ?? item.createdAt ?? item.role}-${index}`}
            ListHeaderComponent={(
              <View style={styles.listSection}>
                {/* Insight sức khỏe trong ngày. */}
                <InsightCard
                  insight={insight}
                  loading={loadingInsight}
                  sending={sending}
                  failText={L.insightFail}
                  profileIncomplete={profileIncomplete}
                  onCompleteProfile={() => router.push("/profile/edit")}
                  onLogMeal={() => router.push("/meals/add")}
                  onAskTip={askAboutTip}
                />
              </View>
            )}

          renderItem={({ item: m, index: i }) => {
            const showSeparator = i === 0 || msgDay(m) !== msgDay(messages[i - 1]);
            return (
              <View style={styles.msgBlock}>
                {showSeparator && (
                  <View style={styles.daySep}>
                    <View style={styles.daySepLine} />
                    <AppText variant="subtle" style={styles.daySepText}>{dayLabelFor(m.createdAt)}</AppText>
                    <View style={styles.daySepLine} />
                  </View>
                )}
                <ChatBubble
                  m={m}
                  labels={L}
                  onReviewMeal={() => reviewMeal(m)}
                />
              </View>
            );
          }}

          ListFooterComponent={sending ? (
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          ) : null}

          ListEmptyComponent={(
            <View style={styles.emptyBlock}>
              <AppText variant="muted" style={styles.introText}>{L.intro}</AppText>
              <View style={styles.chipWrap}>
                {suggestions.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => send(q)}
                    style={({ pressed }) => [styles.suggestChip, pressed && styles.suggestChipPressed]}
                  >
                    <AppText style={styles.suggestChipText}>{q}</AppText>
                  </Pressable>
                ))}
                {/* Hành động gửi ảnh món ăn. */}
                <Pressable
                  onPress={attachImage}
                  style={({ pressed }) => [styles.suggestChip, pressed && styles.suggestChipPressed]}
                >
                  <AppText style={styles.suggestChipText}>{L.photo}</AppText>
                </Pressable>
              </View>
            </View>
          )}
          />

          {/* Hiện nút tới tin mới nhất khi người dùng đang đọc tin cũ. */}
          {showJump && (
            <Pressable
              onPress={() => scrollToLatest(true)}
              style={({ pressed }) => [styles.jumpBtn, pressed && styles.pressedFaint]}
            >
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        {communityRecipeNotice && (
          <View style={styles.communityRecipeNotice}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            <View style={styles.communityRecipeTextWrap}>
              <AppText variant="body2" style={styles.communityRecipeText}>
                {t.community.recipeReferenceNotice}
              </AppText>
              <AppText variant="subtle" style={styles.communityNutritionText}>
                {t.community.nutritionMayVary}
              </AppText>
            </View>
            <Pressable
              onPress={() => setCommunityRecipeNotice(false)}
              hitSlop={8}
              accessibilityRole="button"
              style={({ pressed }) => pressed && styles.dim}
            >
              <Ionicons name="close" size={18} color={theme.colors.subtle} />
            </Pressable>
          </View>
        )}

        {/* Xem trước ảnh đang chờ gửi. */}
        {pendingImage && (
          <View style={styles.pendingRow}>
            <View>
              <Image source={{ uri: pendingImage.uri }} style={styles.pendingThumb} />
              <Pressable onPress={() => setPendingImage(null)} hitSlop={8} style={styles.pendingClose}>
                <Ionicons name="close" size={13} color="#fff" />
              </Pressable>
            </View>
            <AppText variant="subtle" style={styles.pendingText}>{L.photoAttached}</AppText>
          </View>
        )}

        {/* Đặt cảnh báo y tế sát ô nhập để luôn thấy phía trên bàn phím. */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={15} color={theme.colors.subtle} />
          <AppText variant="subtle" style={styles.disclaimerText}>{L.disclaimer}</AppText>
        </View>

        {/* Thanh nhập tin nhắn. */}
        <View style={styles.inputBar}>
          {/* Đính kèm ảnh món ăn. */}
          <Pressable
            onPress={attachImage}
            disabled={sending}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.attachPhoto}
            style={({ pressed }) => [styles.cameraBtn, pressed && styles.cameraBtnPressed]}
          >
            <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={L.placeholder}
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
            maxLength={INPUT_LIMITS.COACH_MESSAGE}
            onFocus={() => scrollToLatest(true)}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={(!input.trim() && !pendingImage) || sending}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.send}
            style={({ pressed }) => [
              styles.sendBtn,
              ((!input.trim() && !pendingImage) || sending) && styles.sendBtnDisabled,
              pressed && styles.pressedFaint,
            ]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.5 },
  pressedFaint: { opacity: 0.8 },
  container: { flex: 1, paddingHorizontal: theme.space.lg },

  // Thanh đầu tràn hết chiều ngang và dùng màu chính đậm giống Home.
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: -theme.space.lg,
    paddingHorizontal: theme.space.lg,
    paddingTop: Platform.OS === "ios" ? 52 : 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.primary,
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#fff" },

  chatArea: { flex: 1 },
  // Đệm đáy vừa đủ để tin nhắn cuối không dính mép, phần tách khỏi dòng
  // cảnh báo đã do marginTop của chính dòng cảnh báo lo.
  chatContent: { paddingTop: theme.space.sm, paddingBottom: 14, gap: theme.space.md },
  listSection: { gap: theme.space.md },
  msgBlock: { gap: theme.space.md },
  daySep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  daySepLine: { flex: 1, height: 1, backgroundColor: "rgba(22,78,99,0.15)" },
  daySepText: { fontSize: 11, fontWeight: "700" },
  jumpBtn: {
    // Nâng cao hơn mép dưới vùng chat để nút này không nằm sát ô nhập,
    // tránh bấm nhầm khi định chạm vào ô nhập tin nhắn.
    position: "absolute", right: 4, bottom: 36,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: theme.colors.shadow, shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5,
  },
  disclaimer: {
    flexDirection: "row", alignItems: "center", gap: 6,
    flexShrink: 0,
    backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, marginTop: 12,
  },
  disclaimerText: { fontSize: 11, flex: 1 },

  typingBubble: {
    alignSelf: "flex-start", maxWidth: "85%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
  },

  emptyBlock: { gap: 10, marginTop: 4 },
  introText: { fontSize: 13 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  suggestChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  suggestChipPressed: { backgroundColor: theme.colors.tint },
  // lineHeight và includeFontPadding giữ chữ có dấu nằm giữa theo chiều dọc.
  suggestChipText: { fontSize: 12, lineHeight: 16, includeFontPadding: false, color: theme.colors.primary },

  pendingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8 },
  pendingThumb: { width: 56, height: 56, borderRadius: 10 },
  pendingClose: {
    position: "absolute", top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: theme.colors.text,
    alignItems: "center", justifyContent: "center",
  },
  pendingText: { fontSize: 12 },

  communityRecipeNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    padding: theme.space.md,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.tintSoft,
  },
  communityRecipeTextWrap: { flex: 1, gap: 4 },
  communityRecipeText: { fontSize: 12, lineHeight: 18 },
  communityNutritionText: { fontSize: 11, lineHeight: 16 },

  inputBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingBottom: 14 },
  cameraBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(8,145,178,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  cameraBtnPressed: { backgroundColor: theme.colors.tint },
  input: {
    flex: 1, backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: theme.colors.text,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: theme.colors.border },
});
