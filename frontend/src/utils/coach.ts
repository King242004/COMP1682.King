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
  id?: string;            // server ChatMessage id (for log/undo of the suggested meal)
  role: "user" | "coach";
  text: string;
  image?: string;
  meal?: SuggestedMeal | null;
  eating?: boolean;       // user is actually eating the dish → show "Add" button
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
): Promise<{ reply: string; meal: SuggestedMeal | null; eating: boolean; messageId: string | null }> {
  // Only send role+text of history (strip local image uris). Image sent as base64.
  const slimHistory = history.map((h) => ({ role: h.role, text: h.text }));
  const data = await apiRequest(
    "/coach/chat",
    "POST",
    { message, history: slimHistory, language, image: image?.base64, mimeType: image?.mimeType },
    token
  );
  return { reply: stripMarkdown(data.reply || ""), meal: data.meal || null, eating: !!data.eating, messageId: data.messageId || null };
}

// Log the meal suggested in a coach message (persisted server-side). Returns the created meal id.
export async function logMealFromMessage(token: string, messageId: string, mealType: string): Promise<string> {
  const data = await apiRequest("/coach/log", "POST", { messageId, mealType }, token);
  return data.logged?.id || "";
}

// Undo a meal logged from a coach message.
export async function unlogMealFromMessage(token: string, messageId: string): Promise<void> {
  await apiRequest("/coach/unlog", "POST", { messageId }, token);
}

export async function getChatHistory(token: string): Promise<ChatMessage[]> {
  const data = await apiRequest("/coach/history", "GET", undefined, token);
  // Clean markdown; carry id/meal/loggedId/image so action buttons persist on reload.
  return (data.messages || []).map((m: any) => ({
    id: m.id,
    role: m.role,
    text: stripMarkdown(m.text),
    image: m.image,
    meal: m.meal || null,
    eating: !!m.eating,
    loggedId: m.loggedId || null,
  }));
}

export async function clearChatHistory(token: string): Promise<void> {
  await apiRequest("/coach/history", "DELETE", undefined, token);
}

// "What should I eat now?" logic moved to src/plan/suggest.ts (feature module
// with SuggestMealCard) — this file keeps chat/insight/history only.

// ─── Insight cache (AsyncStorage) ─────────────────────────────────────────────
// Cache today's insight so reopening the Coach tab is instant, WITH a timestamp so
// callers can skip the Gemini refresh while the cache is still fresh (saves quota:
// Home refetches on every focus otherwise). Keyed by date + language.
const insightKey = (date: string, language: Lang) => `coach_insight_${date}_${language}`;

export const INSIGHT_TTL_MS = 10 * 60 * 1000; // consider the cached insight fresh for 10 minutes

export type CachedInsight = { insight: CoachInsight; at: number };

export async function getCachedInsight(date: string, language: Lang): Promise<CachedInsight | null> {
  try {
    const raw = await AsyncStorage.getItem(insightKey(date, language));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.insight) return parsed as CachedInsight;
    if (parsed?.score != null) return { insight: parsed as CoachInsight, at: 0 }; // legacy entry → treat as stale
    return null;
  } catch {
    return null;
  }
}

export async function cacheInsight(date: string, language: Lang, insight: CoachInsight): Promise<void> {
  try {
    await AsyncStorage.setItem(insightKey(date, language), JSON.stringify({ insight, at: Date.now() }));
  } catch {
    // ignore cache write failures
  }
}
