import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/api";
import type { Lang } from "@/utils/language";

const AI_TIMEOUT_MS = 120_000;

export type CoachInsight = {
  date: string;
  score: number;
  breakdown: { calorie: number; protein: number; activity: number; consistency: number };
  summary: string;
  tips: string[];
  warnings: string[];
  disclaimer: string;
};

// Món Coach nhận ra từ hội thoại hoặc ảnh chỉ được ghi khi người dùng chạm thêm.
// Sau đó mã món đã tạo được lưu trong loggedId.
export type SuggestedMeal = { name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string };

export type ChatMessage = {
  id?: string;
  role: "user" | "coach";
  text: string;
  image?: string;
  meal?: SuggestedMeal | null;
  // Chỉ hiện nút thêm món khi người dùng xác nhận họ đang ăn món này.
  eating?: boolean;
  loggedId?: string | null;
  // Thời gian ISO dùng để chia tin nhắn theo ngày.
  createdAt?: string;
};
type RawChatMessage = ChatMessage;

export function stripMarkdown(s: string): string {
  return (s || "")
    .replace(/\*\*/g, "")
    // Xóa các dấu sao Markdown còn sót lại.
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    // Bỏ ký hiệu tiêu đề Markdown.
    .replace(/^\s*#{1,6}\s*/gm, "")
    // Đổi gạch đầu dòng Markdown thành dấu chấm tròn.
    .replace(/^\s*[-]\s+/gm, "• ")
    // Gộp các khoảng trắng liên tiếp.
    .replace(/[ \t]{2,}/g, " ")
    // Bỏ khoảng trắng thừa trước dấu câu.
    .replace(/ +([,.!?:])/g, "$1")
    .trim();
}

export async function getInsight(token: string, date: string, language: Lang): Promise<CoachInsight> {
  const data = await apiRequest(
    `/coach/insight?date=${date}&language=${language}`,
    "GET",
    undefined,
    token,
    { timeoutMs: AI_TIMEOUT_MS }
  );
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
  image?: { base64: string; mimeType: string },
  source?: "community"
): Promise<{ reply: string; meal: SuggestedMeal | null; eating: boolean; messageId: string | null }> {
  // Chỉ gửi phần hội thoại gần đây vì dữ liệu hồ sơ và sức khỏe luôn lấy lại từ DB.
  // Gửi toàn bộ 100 tin sẽ tốn token và tăng thời gian chờ.
  // Lịch sử chỉ gửi role và text, ảnh hiện tại được gửi riêng bằng base64.
  const slimHistory = history.slice(-16).map((h) => ({ role: h.role, text: h.text }));
  const data = await apiRequest(
    "/coach/chat",
    "POST",
    { message, history: slimHistory, language, image: image?.base64, mimeType: image?.mimeType, source },
    token,
    { timeoutMs: AI_TIMEOUT_MS }
  );
  return {
    reply: stripMarkdown(data.reply || ""),
    meal: data.meal || null,
    eating: !!data.eating,
    messageId: data.messageId || null,
  };
}

// Ghi món được gợi ý trong tin Coach và trả về mã món đã tạo.
export async function logMealFromMessage(token: string, messageId: string, mealType: string): Promise<string> {
  const data = await apiRequest("/coach/log", "POST", { messageId, mealType }, token);
  return data.logged?.id || "";
}

// Hoàn tác món đã ghi từ tin nhắn Coach.
export async function unlogMealFromMessage(token: string, messageId: string): Promise<void> {
  await apiRequest("/coach/unlog", "POST", { messageId }, token);
}

export async function getChatHistory(token: string, language: Lang): Promise<ChatMessage[]> {
  const data = await apiRequest<{ messages: RawChatMessage[] }>(
    `/coach/history?language=${language}`,
    "GET",
    undefined,
    token
  );
// Xóa Markdown và giữ dữ liệu hành động để các nút vẫn còn sau khi tải lại.
  return (data.messages || []).map((m) => ({
    id: m.id,
    role: m.role,
    text: stripMarkdown(m.text),
    image: m.image,
    meal: m.meal || null,
    eating: !!m.eating,
    loggedId: m.loggedId || null,
    createdAt: m.createdAt,
  }));
}

export async function clearChatHistory(token: string): Promise<void> {
  await apiRequest("/coach/history", "DELETE", undefined, token);
}


const insightKey = (date: string, language: Lang) => `coach_insight_v2_${date}_${language}`;

// Dữ liệu insight trong bộ nhớ đệm còn mới trong 10 phút.
export const INSIGHT_TTL_MS = 10 * 60 * 1000;

export type CachedInsight = { insight: CoachInsight; at: number };

export async function getCachedInsight(date: string, language: Lang): Promise<CachedInsight | null> {
  try {
    const raw = await AsyncStorage.getItem(insightKey(date, language));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.insight) return parsed as CachedInsight;
    // Dữ liệu cũ không có thời gian lưu nên phải xem là đã hết hạn.
    if (parsed?.score != null) return { insight: parsed as CoachInsight, at: 0 };
    return null;
  } catch {
    return null;
  }
}

export async function cacheInsight(date: string, language: Lang, insight: CoachInsight): Promise<void> {
  try {
    await AsyncStorage.setItem(insightKey(date, language), JSON.stringify({ insight, at: Date.now() }));
  } catch {
  }
}
