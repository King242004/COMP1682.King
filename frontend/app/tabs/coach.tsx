// AI HEALTH COACH (tab) — daily insight + context-aware chat with saved history.
// Flow/state lives here; InsightCard, ChatBubble, TypingDots are in src/features/coach.
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  getInsight,
  chatWithCoach,
  getChatHistory,
  clearChatHistory,
  getCachedInsight,
  cacheInsight,
  INSIGHT_TTL_MS,
  logMealFromMessage,
  unlogMealFromMessage,
  type CoachInsight,
  type ChatMessage,
} from "@/features/coach/api";
import { compressToBase64 } from "@/features/coach/image";
import { TypingDots } from "@/features/coach/TypingDots";
import { InsightCard } from "@/features/coach/InsightCard";
import { ChatBubble } from "@/features/coach/ChatBubble";
import { todayKey, dateKey } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Screen } from "@/ui/components/Screen";

// Meal types for the quick-edit buttons on a suggested-meal card
const MEAL_OPTS: [string, string][] = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
  ["snack", "Snack"],
];

export default function CoachTab() {
  const { token, user } = useAuth();
  const lang = resolveLanguage(user?.language);
  const suggestions = lang === "vi"
    ? ["Tối nay nên ăn gì?", "Cách làm ức gà healthy", "Tôi nên tập gì hôm nay?"]
    : ["What should I eat tonight?", "How to cook healthy chicken breast", "What workout suits me?"];
  const L = lang === "vi"
    ? {
        add: "Thêm vào nhật ký", logged: "Đã ghi", undo: "Hoàn tác", photo: "📷 Gửi ảnh món ăn",
        intro: "Mình là Coach 👋 Mình có thể gợi ý và chỉ cách nấu món healthy hợp tình trạng của bạn, xem ảnh món ăn, ghi nhật ký, và khuyên bài tập. Thử hỏi mình nhé:",
        placeholder: "Hỏi Coach điều gì đó...",
        disclaimer: "Lời khuyên từ AI, không thay thế ý kiến bác sĩ. Có vấn đề sức khỏe hãy đi khám nhé.",
        insightFail: "Chưa tải được phân tích hôm nay.",
        photoAttached: "Đã đính kèm ảnh. Hỏi gì về món này cũng được.",
        photoTitle: "Thêm ảnh món ăn", photoMsg: "Hỏi Coach về một món qua ảnh.",
        camera: "Máy ảnh", library: "Thư viện ảnh", cancel: "Huỷ",
        permTitle: "Cần quyền truy cập", permMsg: "Cho phép truy cập để đính kèm ảnh món ăn.",
        imgErrTitle: "Lỗi ảnh", imgErrMsg: "Không xử lý được ảnh này, thử ảnh khác nhé.",
        clearTitle: "Xoá đoạn chat?", clearMsg: "Toàn bộ lịch sử trò chuyện với Coach sẽ bị xoá.", clear: "Xoá",
        addErr: "Chưa thêm được vào nhật ký.", undoErrTitle: "Chưa hoàn tác được", undoErrMsg: "Bạn xoá món trong nhật ký giúp mình nhé.",
        error: "Lỗi",
      }
    : {
        add: "Add to diary", logged: "Logged", undo: "Undo", photo: "📷 Send a food photo",
        intro: "I'm Coach 👋 I can suggest and teach healthy recipes for your conditions, look at food photos, log meals, and advise workouts. Try asking:",
        placeholder: "Ask your coach...",
        disclaimer: "AI guidance, not medical advice. Consult a professional for health concerns.",
        insightFail: "Couldn't load today's analysis right now.",
        photoAttached: "Photo attached. Ask anything about it.",
        photoTitle: "Add a food photo", photoMsg: "Ask the coach about a meal photo.",
        camera: "Camera", library: "Photo library", cancel: "Cancel",
        permTitle: "Permission needed", permMsg: "Allow access to attach a food photo.",
        imgErrTitle: "Image error", imgErrMsg: "Couldn't process that photo. Try another.",
        clearTitle: "Clear chat?", clearMsg: "This deletes your conversation history with the coach.", clear: "Clear",
        addErr: "Couldn't add to your diary.", undoErrTitle: "Couldn't undo", undoErrMsg: "Please remove it from your diary instead.",
        error: "Error",
      };
  const mealOpts: [string, string][] = lang === "vi"
    ? [["breakfast", "Sáng"], ["lunch", "Trưa"], ["dinner", "Tối"], ["snack", "Phụ"]]
    : MEAL_OPTS;

  const headerHeight = useHeaderHeight(); // bù chiều cao AppHeader của tab cho keyboard
  const scrollRef = useRef<ScrollView>(null);

  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ uri: string; base64: string } | null>(null);

  // Pick a food photo from camera or library, then compress to base64
  const pickImage = async (source: "camera" | "library") => {
    const perm = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(L.permTitle, L.permMsg);
      return;
    }
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const compressed = await compressToBase64(result.assets[0].uri);
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

  // Show cached insight instantly; only hit Gemini when the cache is stale (TTL)
  // or when forced (e.g. right after logging a meal) — saves free-tier quota.
  const loadInsight = useCallback(async (force = false) => {
    if (!token) return;
    const date = todayKey();
    const cached = await getCachedInsight(date, lang);
    if (cached) {
      setInsight(cached.insight);
      setLoadingInsight(false);
      if (!force && Date.now() - cached.at < INSIGHT_TTL_MS) return; // still fresh → skip AI call
    } else {
      setLoadingInsight(true);
    }
    try {
      const fresh = await getInsight(token, date, lang);
      setInsight(fresh);
      cacheInsight(date, lang, fresh);
    } catch {
      if (!cached) setInsight(null);
    } finally {
      setLoadingInsight(false);
    }
  }, [token, lang]);

  // Deep-linked questions must wait for this — sending while history is still
  // loading would get overwritten when setMessages(hist) replaces the state.
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      const hist = await getChatHistory(token);
      setMessages(hist);
      // Jump to the latest message after history renders
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    } catch {
      // keep whatever is in state
    } finally {
      setHistoryLoaded(true);
    }
  }, [token]);

  // Load insight + history ONCE when the tab first mounts (token ready).
  // We intentionally don't reload on every focus — that re-spammed Gemini and
  // overwrote the in-progress conversation when switching tabs.
  useEffect(() => {
    loadInsight();
    loadHistory();
  }, [loadInsight, loadHistory]);

  const send = async (text: string, displayText?: string) => {
    const msg = text.trim();
    const img = pendingImage;
    if ((!msg && !img) || sending || !token) return;
    const prior = messages; // history to send (before adding this turn — avoids duplication)
    // Quick-action buttons show a short label in the bubble but send the full question to the AI.
    const userMsg: ChatMessage = { role: "user", text: (displayText ?? msg).trim(), image: img?.uri, createdAt: new Date().toISOString() };
    setMessages([...prior, userMsg]);
    setInput("");
    setPendingImage(null);
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const { reply, meal, eating, messageId } = await chatWithCoach(token, msg, prior, lang, img ? { base64: img.base64, mimeType: "image/jpeg" } : undefined);
      setMessages((prev) => [...prev, { id: messageId ?? undefined, role: "coach", text: reply, meal, eating, createdAt: new Date().toISOString() }]);
    } catch (e: any) {
      const quota = /quota/i.test(String(e?.message || ""));
      const errText = quota
        ? (lang === "vi" ? "Hôm nay đã hết lượt AI miễn phí, thử lại sau nhé." : "Out of free AI quota today — please try again later.")
        : (lang === "vi" ? "Xin lỗi, mình chưa trả lời được. Thử lại nhé." : "Sorry, I couldn't respond right now. Please try again.");
      setMessages((prev) => [...prev, { role: "coach", text: errText, createdAt: new Date().toISOString() }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  // Tap an insight tip/warning → ask the coach to elaborate on it in chat
  const askAboutTip = (tip: string) =>
    send(lang === "vi" ? `Nói rõ hơn giúp mình: "${tip}"` : `Tell me more about this: "${tip}"`);

  // Deep-link question (e.g. tapping a plan dish → "how do I cook X?").
  // `askId` makes each tap unique; the ref consumes it once so switching back to
  // the tab later doesn't re-send the same question (tab params persist).
  const { ask, askId } = useLocalSearchParams<{ ask?: string; askId?: string }>();
  const consumedAskRef = useRef<string | null>(null);
  useEffect(() => {
    if (!ask || !askId || consumedAskRef.current === askId) return;
    // Wait for history to finish loading (else setMessages(hist) would wipe the
    // question bubble) and for any in-flight send. Effect re-runs as these settle.
    if (!token || sending || !historyLoaded) return;
    consumedAskRef.current = askId;
    send(String(ask));
  }, [ask, askId, token, sending, historyLoaded]);

  // Pick meal type on the suggested-meal card (before adding) — local only.
  const setMealType = (index: number, mealType: string) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === index && m.meal ? { ...m, meal: { ...m.meal, mealType } } : m))
    );
  };

  // User taps "Add" → log the suggested meal (persisted server-side via its message id).
  const loggingRef = useRef(false); // in-flight guard: double-tap must not log twice
  const acceptLog = async (index: number) => {
    const m = messages[index];
    if (!token || !m?.id || !m.meal || loggingRef.current) return;
    loggingRef.current = true;
    try {
      const mealId = await logMealFromMessage(token, m.id, m.meal.mealType);
      setMessages((prev) => prev.map((x, i) => (i === index ? { ...x, loggedId: mealId } : x)));
      loadInsight(true); // force-refresh Health Score to reflect the newly logged meal
    } catch {
      Alert.alert(L.error, L.addErr);
    } finally {
      loggingRef.current = false;
    }
  };

  // Undo: delete the logged meal and show the Add card again.
  const undoLog = async (index: number) => {
    const m = messages[index];
    if (!token || !m?.id) return;
    try {
      await unlogMealFromMessage(token, m.id);
      setMessages((prev) => prev.map((x, i) => (i === index ? { ...x, loggedId: null } : x)));
    } catch {
      Alert.alert(L.undoErrTitle, L.undoErrMsg);
    }
  };

  // Day separator label for the chat stream ("Today" / "Yesterday" / short date)
  const dayLabelFor = (iso?: string) => {
    const d = iso ? dateKey(new Date(iso)) : todayKey();
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d === dateKey(now)) return lang === "vi" ? "Hôm nay" : "Today";
    if (d === dateKey(yesterday)) return lang === "vi" ? "Hôm qua" : "Yesterday";
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const msgDay = (m: ChatMessage) => (m.createdAt ? dateKey(new Date(m.createdAt)) : todayKey());

  // "Jump to latest" appears once the user scrolls up away from the newest message
  const [showJump, setShowJump] = useState(false);
  const onChatScroll = (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 150;
    setShowJump(!nearBottom && messages.length > 0);
  };

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
            loadHistory(); // resync if it failed
          }
        },
      },
    ]);
  };

  return (
    <Screen padded={false} keyboard keyboardOffset={headerHeight}>
      <View style={styles.container}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <AppText variant="h1">AI Coach</AppText>
          </View>
          {messages.length > 0 && (
            <Pressable onPress={onClear} hitSlop={8} style={({ pressed }) => pressed && styles.dim}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.subtle} />
            </Pressable>
          )}
        </View>

        <View style={styles.chatArea}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex1}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onChatScroll}
          scrollEventThrottle={100}
        >
          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={15} color={theme.colors.subtle} />
            <AppText variant="subtle" style={styles.disclaimerText}>{L.disclaimer}</AppText>
          </View>

          {/* Daily insight */}
          <InsightCard
            insight={insight}
            loading={loadingInsight}
            sending={sending}
            failText={L.insightFail}
            onAskTip={askAboutTip}
          />

          {/* Chat messages — with a day separator whenever the calendar day changes */}
          {messages.map((m, i) => {
            const showSeparator = i === 0 || msgDay(m) !== msgDay(messages[i - 1]);
            return (
              <View key={i} style={styles.msgBlock}>
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
                  mealOpts={mealOpts}
                  onSetMealType={(t) => setMealType(i, t)}
                  onAcceptLog={() => acceptLog(i)}
                  onUndoLog={() => undoLog(i)}
                />
              </View>
            );
          })}

          {/* Coach "typing" bubble while composing */}
          {sending && (
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          )}

          {/* Empty state: intro + example chips so users discover what Coach can do */}
          {messages.length === 0 && (
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
                {/* Photo capability */}
                <Pressable
                  onPress={attachImage}
                  style={({ pressed }) => [styles.suggestChip, pressed && styles.suggestChipPressed]}
                >
                  <AppText style={styles.suggestChipText}>{L.photo}</AppText>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Jump to latest — shown when the user scrolled up into older messages */}
        {showJump && (
          <Pressable
            onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
            style={({ pressed }) => [styles.jumpBtn, pressed && styles.pressedFaint]}
          >
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </Pressable>
        )}
        </View>

        {/* Pending image preview */}
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

        {/* Input bar */}
        <View style={styles.inputBar}>
          {/* Attach food photo */}
          <Pressable
            onPress={attachImage}
            disabled={sending}
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
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={(!input.trim() && !pendingImage) || sending}
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
  container: { flex: 1, paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg },

  titleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: theme.space.md,
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },

  chatArea: { flex: 1 },
  chatContent: { paddingBottom: 20, gap: theme.space.md },
  msgBlock: { gap: theme.space.md },
  daySep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  daySepLine: { flex: 1, height: 0.5, backgroundColor: theme.colors.border },
  daySepText: { fontSize: 11, fontWeight: "700" },
  jumpBtn: {
    position: "absolute", right: 4, bottom: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: theme.colors.shadow, shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5,
  },
  disclaimer: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 10, padding: 10,
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
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  suggestChipPressed: { backgroundColor: theme.colors.tint },
  suggestChipText: { fontSize: 12, color: theme.colors.primary },

  pendingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8 },
  pendingThumb: { width: 56, height: 56, borderRadius: 10 },
  pendingClose: {
    position: "absolute", top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: theme.colors.text,
    alignItems: "center", justifyContent: "center",
  },
  pendingText: { fontSize: 12 },

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
