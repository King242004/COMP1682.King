// AI HEALTH COACH (tab) — daily insight + context-aware chat with saved history
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, Pressable, ScrollView, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
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
  logMealFromMessage,
  unlogMealFromMessage,
  type CoachInsight,
  type ChatMessage,
} from "@/utils/coach";
import { todayKey } from "@/utils/date";
import { resolveLanguage } from "@/utils/language";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";

function scoreColor(score: number) {
  if (score >= 75) return "#1A9D58";
  if (score >= 50) return theme.colors.accent2;
  return theme.colors.danger;
}

// Resize + compress a food photo to base64 for the vision coach (smaller = faster).
async function compressToBase64(uri: string): Promise<{ uri: string; base64: string } | null> {
  try {
    const r = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return r.base64 ? { uri: r.uri, base64: r.base64 } : null;
  } catch {
    return null;
  }
}


// Animated "typing" dots shown while the coach is composing a reply
function TypingDots() {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dots]);
  return (
    <View style={{ flexDirection: "row", gap: 5, paddingVertical: 2 }}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.subtle, opacity: v }}
        />
      ))}
    </View>
  );
}

// Meal types for the quick-edit buttons on an auto-logged chip
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
      }
    : {
        add: "Add to diary", logged: "Logged", undo: "Undo", photo: "📷 Send a food photo",
        intro: "I'm Coach 👋 I can suggest and teach healthy recipes for your conditions, look at food photos, log meals, and advise workouts. Try asking:",
      };
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
      Alert.alert("Permission needed", "Allow access to attach a food photo.");
      return;
    }
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const compressed = await compressToBase64(result.assets[0].uri);
    if (compressed) setPendingImage(compressed);
    else Alert.alert("Image error", "Couldn't process that photo. Try another.");
  };

  const attachImage = () => {
    Alert.alert("Add a food photo", "Ask the coach about a meal photo.", [
      { text: "Camera", onPress: () => pickImage("camera") },
      { text: "Photo library", onPress: () => pickImage("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const loadInsight = useCallback(async () => {
    if (!token) return;
    const date = todayKey();
    // Show cached insight instantly (if any), then refresh in the background so
    // reopening the tab is not blocked by the AI call.
    const cached = await getCachedInsight(date, lang);
    if (cached) {
      setInsight(cached);
      setLoadingInsight(false);
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

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      const hist = await getChatHistory(token);
      setMessages(hist);
      // Jump to the latest message after history renders
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    } catch {
      // keep whatever is in state
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
    const userMsg: ChatMessage = { role: "user", text: (displayText ?? msg).trim(), image: img?.uri };
    setMessages([...prior, userMsg]);
    setInput("");
    setPendingImage(null);
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const { reply, meal, eating, messageId } = await chatWithCoach(token, msg, prior, lang, img ? { base64: img.base64, mimeType: "image/jpeg" } : undefined);
      setMessages((prev) => [...prev, { id: messageId ?? undefined, role: "coach", text: reply, meal, eating }]);
    } catch (e: any) {
      const quota = /quota/i.test(String(e?.message || ""));
      const errText = quota
        ? (lang === "vi" ? "Hôm nay đã hết lượt AI miễn phí, thử lại sau nhé." : "Out of free AI quota today — please try again later.")
        : (lang === "vi" ? "Xin lỗi, mình chưa trả lời được. Thử lại nhé." : "Sorry, I couldn't respond right now. Please try again.");
      setMessages((prev) => [...prev, { role: "coach", text: errText }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  // Pick meal type on the suggested-meal card (before adding) — local only.
  const setMealType = (index: number, mealType: string) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === index && m.meal ? { ...m, meal: { ...m.meal, mealType } } : m))
    );
  };

  // User taps "Add" → log the suggested meal (persisted server-side via its message id).
  const acceptLog = async (index: number) => {
    const m = messages[index];
    if (!token || !m?.id || !m.meal) return;
    try {
      const mealId = await logMealFromMessage(token, m.id, m.meal.mealType);
      setMessages((prev) => prev.map((x, i) => (i === index ? { ...x, loggedId: mealId } : x)));
      loadInsight(); // refresh Health Score to reflect the newly logged meal
    } catch {
      Alert.alert("Error", "Couldn't add to your diary.");
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
      Alert.alert("Couldn't undo", "Please remove it from your diary instead.");
    }
  };

  const onClear = () => {
    if (messages.length === 0 || !token) return;
    Alert.alert("Clear chat?", "This deletes your conversation history with the coach.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
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
      <View style={{ flex: 1, paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg }}>
        {/* Title row */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <AppText variant="h1">AI Coach</AppText>
          </View>
          {messages.length > 0 && (
            <Pressable onPress={onClear} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.subtle} />
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, gap: theme.space.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Disclaimer */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 10, padding: 10,
          }}>
            <Ionicons name="information-circle-outline" size={15} color={theme.colors.subtle} />
            <AppText variant="subtle" style={{ fontSize: 11, flex: 1 }}>
              AI guidance, not medical advice. Consult a professional for health concerns.
            </AppText>
          </View>

          {/* Daily insight */}
          {loadingInsight ? (
            <View style={{ paddingVertical: theme.space.xl, alignItems: "center" }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : insight ? (
            <Card style={{ padding: theme.space.lg, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 32,
                  borderWidth: 5, borderColor: scoreColor(insight.score),
                  alignItems: "center", justifyContent: "center",
                }}>
                  <AppText style={{ fontSize: 20, fontWeight: "800", color: scoreColor(insight.score) }}>
                    {insight.score}
                  </AppText>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="h2" style={{ fontSize: 15 }}>Health Score</AppText>
                  <AppText variant="muted" style={{ fontSize: 13 }}>{insight.summary}</AppText>
                </View>
              </View>

              {insight.warnings.map((w, i) => (
                <View key={i} style={{
                  flexDirection: "row", gap: 8, alignItems: "flex-start",
                  backgroundColor: "rgba(229,72,77,0.08)", borderRadius: 10, padding: 10,
                }}>
                  <Ionicons name="warning-outline" size={16} color={theme.colors.danger} />
                  <AppText style={{ fontSize: 13, color: theme.colors.danger, flex: 1 }}>{w}</AppText>
                </View>
              ))}

              {insight.tips.map((t, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                  <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} style={{ marginTop: 1 }} />
                  <AppText variant="body2" style={{ flex: 1 }}>{t}</AppText>
                </View>
              ))}
            </Card>
          ) : (
            <Card style={{ padding: theme.space.lg, alignItems: "center" }}>
              <AppText variant="muted" style={{ textAlign: "center" }}>
                Couldn't load today's analysis right now.
              </AppText>
            </Card>
          )}

          {/* Chat messages */}
          {messages.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor: m.role === "user" ? theme.colors.primary : theme.colors.surface,
                borderWidth: m.role === "user" ? 0 : 1,
                borderColor: theme.colors.border,
                borderRadius: 16, padding: 12,
              }}
            >
              {m.image && (
                <Image
                  source={{ uri: m.image }}
                  style={{ width: 180, height: 180, borderRadius: 10, marginBottom: m.text ? 8 : 0 }}
                  resizeMode="cover"
                />
              )}
              {!!m.text && (
                <AppText style={{ fontSize: 14, color: m.role === "user" ? "#fff" : theme.colors.text }}>
                  {m.text}
                </AppText>
              )}
              {/* Suggested meal: Add card → after adding becomes a Logged chip */}
              {m.meal && (
                m.loggedId ? (
                  <View style={{
                    marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6,
                    backgroundColor: "rgba(47,191,113,0.10)", borderRadius: 10, padding: 8,
                  }}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                    <AppText style={{ flex: 1, fontSize: 12, color: theme.colors.text }}>
                      {L.logged} {m.meal.name} ({m.meal.calories} kcal · {m.meal.mealType})
                    </AppText>
                    <Pressable onPress={() => undoLog(i)} hitSlop={6}>
                      <AppText style={{ fontSize: 12, fontWeight: "700", color: theme.colors.danger }}>{L.undo}</AppText>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{
                    marginTop: 8, gap: 8,
                    backgroundColor: "rgba(37,99,235,0.06)", borderRadius: 10, padding: 10,
                  }}>
                    <View>
                      <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.text }}>
                        {m.meal.name} · {m.meal.calories} kcal
                      </AppText>
                      <AppText variant="subtle" style={{ fontSize: 11 }}>
                        P {m.meal.protein} · C {m.meal.carbs} · F {m.meal.fat}
                      </AppText>
                    </View>
                    {/* Meal type picker — only when the user is actually eating it */}
                    {m.eating && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {MEAL_OPTS.map(([key, label]) => {
                          const active = m.meal!.mealType === key;
                          return (
                            <Pressable
                              key={key}
                              onPress={() => setMealType(i, key)}
                              style={{
                                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
                                borderWidth: 1,
                                borderColor: active ? theme.colors.primary : theme.colors.border,
                                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                              }}
                            >
                              <AppText style={{ fontSize: 11, fontWeight: "700", color: active ? "#fff" : theme.colors.subtle }}>
                                {label}
                              </AppText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                    {/* Accept button — only when the user is actually eating it */}
                    {m.eating && (
                      <Pressable
                        onPress={() => acceptLog(i)}
                        style={({ pressed }) => ({
                          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                          backgroundColor: pressed ? theme.colors.primary2 : theme.colors.primary,
                          borderRadius: 10, paddingVertical: 9,
                        })}
                      >
                        <Ionicons name="add-circle-outline" size={16} color="#fff" />
                        <AppText style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{L.add}</AppText>
                      </Pressable>
                    )}
                  </View>
                )
              )}
            </View>
          ))}

          {/* Coach "typing" bubble while composing */}
          {sending && (
            <View style={{
              alignSelf: "flex-start", maxWidth: "85%",
              backgroundColor: theme.colors.surface,
              borderWidth: 1, borderColor: theme.colors.border,
              borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
            }}>
              <TypingDots />
            </View>
          )}

          {/* Empty state: intro + example chips so users discover what Coach can do */}
          {messages.length === 0 && (
            <View style={{ gap: 10, marginTop: 4 }}>
              <AppText variant="muted" style={{ fontSize: 13 }}>{L.intro}</AppText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {suggestions.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => send(q)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
                      borderWidth: 1, borderColor: theme.colors.border,
                      backgroundColor: pressed ? theme.colors.tint : theme.colors.surface,
                    })}
                  >
                    <AppText style={{ fontSize: 12, color: theme.colors.primary }}>{q}</AppText>
                  </Pressable>
                ))}
                {/* Photo capability */}
                <Pressable
                  onPress={attachImage}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
                    borderWidth: 1, borderColor: theme.colors.border,
                    backgroundColor: pressed ? theme.colors.tint : theme.colors.surface,
                  })}
                >
                  <AppText style={{ fontSize: 12, color: theme.colors.primary }}>{L.photo}</AppText>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Pending image preview */}
        {pendingImage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8 }}>
            <View>
              <Image source={{ uri: pendingImage.uri }} style={{ width: 56, height: 56, borderRadius: 10 }} />
              <Pressable
                onPress={() => setPendingImage(null)}
                hitSlop={8}
                style={{
                  position: "absolute", top: -6, right: -6,
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: theme.colors.text,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={13} color="#fff" />
              </Pressable>
            </View>
            <AppText variant="subtle" style={{ fontSize: 12 }}>Photo attached. Ask anything about it.</AppText>
          </View>
        )}

        {/* Input bar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingBottom: 14 }}>
          {/* Attach food photo */}
          <Pressable
            onPress={attachImage}
            disabled={sending}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: pressed ? theme.colors.tint : "rgba(37,99,235,0.06)",
              alignItems: "center", justifyContent: "center",
            })}
          >
            <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach..."
            placeholderTextColor={theme.colors.subtle}
            style={{
              flex: 1, backgroundColor: theme.colors.surface,
              borderWidth: 1, borderColor: theme.colors.border,
              borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
              fontSize: 14, color: theme.colors.text,
            }}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={(!input.trim() && !pendingImage) || sending}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: (!input.trim() && !pendingImage) || sending ? theme.colors.border : theme.colors.primary,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
