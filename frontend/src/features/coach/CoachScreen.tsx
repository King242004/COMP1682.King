// AI HEALTH COACH (tab) — daily insight + context-aware chat with saved history.
// Flow/state lives here; InsightCard, ChatBubble, TypingDots are in src/features/coach.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { aiResetWhen } from "@/utils/aiQuota";
import { resolveLanguage } from "@/utils/language";
import { getErrorMessage } from "@/utils/errors";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Screen } from "@/ui/components/Screen";

const MEAL_KEYS = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function CoachTab() {
  const { token, user } = useAuth();
  const lang = resolveLanguage(user?.language);
  const t = useT();
  const suggestions = t.coach.suggestions;
  const L = t.coach;
  const mealOpts: [string, string][] = MEAL_KEYS.map((k) => [k, t.coach.mealShort[k]]);

  const headerHeight = useHeaderHeight(); // bù chiều cao AppHeader của tab cho keyboard
  const scrollRef = useRef<FlatList<ChatMessage>>(null);
  const scrollToLatest = useCallback((animated = true) => {
    scrollRef.current?.scrollToEnd({ animated });
  }, []);

  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ uri: string; base64: string } | null>(null);
  // True once a reply had to come from a backup API key → show the slim
  // "free AI turns running low" strip (real signal, not a guess)
  const [quotaLow, setQuotaLow] = useState(false);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => scrollToLatest(true));
    });
    return () => subscription.remove();
  }, [scrollToLatest]);

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
      ? await ImagePicker.launchCameraAsync({ mediaTypes: "images", quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.7 });
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
      setTimeout(() => scrollToLatest(false), 150);
    } catch {
      // keep whatever is in state
    } finally {
      setHistoryLoaded(true);
    }
  }, [scrollToLatest, token]);

  // Load insight + history ONCE when the tab first mounts (token ready).
  // We intentionally don't reload on every focus — that re-spammed Gemini and
  // overwrote the in-progress conversation when switching tabs.
  useEffect(() => {
    loadInsight();
    loadHistory();
  }, [loadInsight, loadHistory]);

  const send = useCallback(async (text: string, displayText?: string) => {
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
    setTimeout(() => scrollToLatest(true), 50);
    try {
      const { reply, meal, eating, messageId, aiQuotaLow } = await chatWithCoach(token, msg, prior, lang, img ? { base64: img.base64, mimeType: "image/jpeg" } : undefined);
      if (aiQuotaLow) setQuotaLow(true);
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

  // Tap an insight tip/warning → ask the coach to elaborate on it in chat
  const askAboutTip = (tip: string) =>
    send(t.coach.askTip(tip));

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
  }, [ask, askId, token, sending, historyLoaded, send]);

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
    if (d === dateKey(now)) return t.meals.today;
    if (d === dateKey(yesterday)) return t.meals.yesterday;
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const msgDay = (m: ChatMessage) => (m.createdAt ? dateKey(new Date(m.createdAt)) : todayKey());

  // "Jump to latest" appears once the user scrolls up away from the newest message
  const [showJump, setShowJump] = useState(false);
  const onChatScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
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
    <Screen
      padded={false}
      keyboard
      keyboardOffset={headerHeight}
      dismissKeyboardOnTap={false}
    >
      <View style={styles.container}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <AppText variant="h1">AI Coach</AppText>
          </View>
          {messages.length > 0 && (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.a11y.clearChat}
              style={({ pressed }) => pressed && styles.dim}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.subtle} />
            </Pressable>
          )}
        </View>

        {/* Slim heads-up when today's free AI quota is running low (backup key in use) */}
        {quotaLow && (
          <View style={styles.quotaLowStrip}>
            <AppText style={styles.quotaLowText}>{t.coach.quotaLowBanner}</AppText>
          </View>
        )}

        <View style={styles.chatArea}>
          <FlatList
            ref={scrollRef}
            data={messages}
            style={styles.flex1}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
            onScroll={onChatScroll}
            scrollEventThrottle={100}
            keyExtractor={(item, index) => `${item.id ?? item.createdAt ?? item.role}-${index}`}
            ListHeaderComponent={(
              <View style={styles.listSection}>
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
                  mealOpts={mealOpts}
                  onSetMealType={(t) => setMealType(i, t)}
                  onAcceptLog={() => acceptLog(i)}
                  onUndoLog={() => undoLog(i)}
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
          />

        {/* Jump to latest — shown when the user scrolled up into older messages */}
          {showJump && (
            <Pressable
              onPress={() => scrollToLatest(true)}
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
  // paddingTop 60 = safe-area top (Coach got its ~90px back — no AppHeader above)
  container: { flex: 1, paddingHorizontal: theme.space.lg, paddingTop: 60 },

  titleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: theme.space.md,
  },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },

  chatArea: { flex: 1 },
  chatContent: { paddingBottom: 20, gap: theme.space.md },
  listSection: { gap: theme.space.md },
  msgBlock: { gap: theme.space.md },
  daySep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  daySepLine: { flex: 1, height: 1, backgroundColor: "rgba(22,78,99,0.15)" },
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
  quotaLowStrip: {
    backgroundColor: "rgba(255,138,61,0.10)",
    borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
    marginBottom: theme.space.sm,
  },
  quotaLowText: { fontSize: 11, fontWeight: "600", color: theme.colors.accent2, textAlign: "center" },
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
