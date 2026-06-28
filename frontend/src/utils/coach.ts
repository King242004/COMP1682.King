import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";
import type { Lang } from "./language";

export type CoachInsight = {
  date: string;
  score: number;
  breakdown: { calorie: number; protein: number; activity: number; consistency: number };
  summary: string;
  tips: string[];
  warnings: string[];
  disclaimer: string;
};

// A meal the coach identified from the conversation/photo. Not logged until the
// user taps "Add" — then we store the created meal id in `loggedId`.
export type SuggestedMeal = { name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string };

// `image` is a LOCAL uri kept only for display in the current session (not saved to history).
// `meal` = suggested meal (shows an Add card). `loggedId` = id once the user added it (shows ✓ + Undo).
export type ChatMessage = {
  role: "user" | "coach";
  text: string;
  image?: string;
  meal?: SuggestedMeal | null;
  loggedId?: string | null;
};

// Strip leftover markdown so chat/insight read as natural text (no **, *, #, `).
export function stripMarkdown(s: string): string {
  return (s || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")               // lone asterisks
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/^\s*#{1,6}\s*/gm, "")   // headings
    .replace(/^\s*[-]\s+/gm, "• ")    // bullet markers → bullet dot
    .replace(/[ \t]{2,}/g, " ")       // gộp khoảng trắng đôi
    .replace(/ +([,.!?:])/g, "$1")    // bỏ space thừa trước dấu câu
    .trim();
}

export async function getInsight(token: string, date: string, language: Lang): Promise<CoachInsight> {
  const data = await apiRequest(`/coach/insight?date=${date}&language=${language}`, "GET", undefined, token);
  return {
    ...data,
    summary: stripMarkdown(data.summary || ""),
    tips: (data.tips || []).map(stripMarkdown),
    warnings: (data.warnings || []).map(stripMarkdown),
  };
}

export async function chatWithCoach(
  token: string,
  message: string,
  history: ChatMessage[],
  language: Lang,
  image?: { base64: string; mimeType: string }
): Promise<{ reply: string; meal: SuggestedMeal | null }> {
  // Only send role+text of history (strip local image uris). Image sent as base64.
  const slimHistory = history.map((h) => ({ role: h.role, text: h.text }));
  const data = await apiRequest(
    "/coach/chat",
    "POST",
    { message, history: slimHistory, language, image: image?.base64, mimeType: image?.mimeType },
    token
  );
  return { reply: stripMarkdown(data.reply || ""), meal: data.meal || null };
}

export async function getChatHistory(token: string): Promise<ChatMessage[]> {
  const data = await apiRequest("/coach/history", "GET", undefined, token);
  // Clean any markdown stored in older messages so they display naturally.
  return (data.messages || []).map((m: ChatMessage) => ({ ...m, text: stripMarkdown(m.text) }));
}

export async function clearChatHistory(token: string): Promise<void> {
  await apiRequest("/coach/history", "DELETE", undefined, token);
}

// ─── Insight cache (AsyncStorage) ─────────────────────────────────────────────
// Cache today's insight so reopening the Coach tab is instant. Keyed by date +
// language so switching language or day fetches fresh.
const insightKey = (date: string, language: Lang) => `coach_insight_${date}_${language}`;

export async function getCachedInsight(date: string, language: Lang): Promise<CoachInsight | null> {
  try {
    const raw = await AsyncStorage.getItem(insightKey(date, language));
    return raw ? (JSON.parse(raw) as CoachInsight) : null;
  } catch {
    return null;
  }
}

export async function cacheInsight(date: string, language: Lang, insight: CoachInsight): Promise<void> {
  try {
    await AsyncStorage.setItem(insightKey(date, language), JSON.stringify(insight));
  } catch {
    // ignore cache write failures
  }
}
