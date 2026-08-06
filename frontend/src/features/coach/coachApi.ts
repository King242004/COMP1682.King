// ═══ FILE NÀY LÀM GÌ ═══
// Chặng giữa màn Coach và backend.
//
// Ai gọi tới: CoachScreen, InsightCard
// Nhận vào:   câu hỏi, ảnh, ngôn ngữ, và ngày cần chấm điểm
// Trả ra:     câu trả lời của Coach, hoặc điểm sức khỏe
// Khi lỗi:    AI hết lượt thì trả QUOTA, màn hiện lời nhắc thử lại sau

// Ngoài gọi mạng, nó còn lo hai việc phụ:
//   xóa ký hiệu Markdown khỏi câu trả lời AI, vì app hiện chữ thuần.
//   lưu tạm điểm sức khỏe theo ngày và ngôn ngữ, để đỡ tốn lượt gọi AI.
// Mọi lệnh gọi AI ở đây chờ tới 120 giây, vì Gemini chạy lâu hơn
// các request thường, nhất là lần đầu khi Render vừa ngủ dậy.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/utils/apiClient";
import type { Lang } from "@/utils/languageUtils";
import { todayKey } from "@/utils/dateUtils";

const AI_TIMEOUT_MS = 120_000;

export type CoachInsight = {
  date: string;
  // Ngày chưa có bữa nào thì backend trả cờ này thay cho điểm.
  pending?: boolean;
  score: number;
  breakdown: { calorie: number; protein: number; activity: number; consistency: number };
  weights: { calorie: number; protein: number; activity: number; consistency: number };
  maxScore: number;
  summary: string;
  tips: string[];
  warnings: string[];
  disclaimer: string;
};

// Món Coach nhận ra từ hội thoại hoặc ảnh được đưa sang màn xem lại trước khi lưu.
export type SuggestedMeal = { name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string };

export type ChatMessage = {
  id?: string;
  role: "user" | "coach";
  text: string;
  image?: string;
  meal?: SuggestedMeal | null;
  // Chỉ hiện nút thêm món khi người dùng xác nhận họ đang ăn món này.
  eating?: boolean;
  // Giữ trạng thái của các tin lịch sử từng được ghi trực tiếp từ Coach.
  loggedId?: string | null;
  // Thời gian ISO dùng để chia tin nhắn theo ngày.
  createdAt?: string;
};
// Cần hàm này vì app hiện chữ thuần, không dựng Markdown.
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

// Lấy điểm sức khỏe và lời nhận xét. Gọi GET /coach/insight.
// Điểm do backend TÍNH bằng công thức, AI chỉ viết lời bình.
// Xóa Markdown khỏi mọi câu chữ trước khi trả về.
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

// Gửi một tin nhắn cho Coach. Gọi POST /coach/chat.
// Backend tự đọc hồ sơ, số liệu sức khỏe và lịch sử từ database.
// Frontend chỉ gửi tin hiện tại, ngôn ngữ, giờ địa phương và ảnh nếu có.
export async function chatWithCoach(
  token: string,
  message: string,
  language: Lang,
  image?: { base64: string; mimeType: string },
  source?: "community"
): Promise<{ reply: string; meal: SuggestedMeal | null; eating: boolean; messageId: string | null }> {
  const data = await apiRequest(
    "/coach/chat",
    "POST",
    { message, language, image: image?.base64, mimeType: image?.mimeType, source, localDate: todayKey(), localHour: new Date().getHours() },
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

// Tải lại tin nhắn cũ. Gọi GET /coach/history kèm ngôn ngữ.
// Backend chỉ trả tin của đúng ngôn ngữ đó.
// Giữ nguyên phần món và trạng thái đã ghi, để các nút còn đúng sau khi mở lại.
export async function getChatHistory(token: string, language: Lang): Promise<ChatMessage[]> {
  const data = await apiRequest<{ messages: ChatMessage[] }>(
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

// Xóa hết lịch sử. Gọi DELETE /coach/history.
// Backend xóa cả ảnh trên kho ảnh và tin của CẢ HAI ngôn ngữ.
export async function clearChatHistory(token: string): Promise<void> {
  await apiRequest("/coach/history", "DELETE", undefined, token);
}


// Đổi lên v3 khi cách chấm điểm thay đổi, để bỏ bản cũ đang nằm trong máy.
const insightKey = (date: string, language: Lang) => `coach_insight_v3_${date}_${language}`;

// Dữ liệu insight trong bộ nhớ đệm còn mới trong 10 phút.
export const INSIGHT_TTL_MS = 10 * 60 * 1000;

export type CachedInsight = { insight: CoachInsight; at: number };

// Đọc điểm sức khỏe đã lưu trong máy, để hiện ngay khi mở màn.
// Bản lưu kiểu cũ không có thời điểm lưu nên bị coi là đã hết hạn.
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

// Lưu điểm sức khỏe vào máy theo ngày và ngôn ngữ.
export async function cacheInsight(date: string, language: Lang, insight: CoachInsight): Promise<void> {
  try {
    await AsyncStorage.setItem(insightKey(date, language), JSON.stringify({ insight, at: Date.now() }));
  } catch {
  }
}
