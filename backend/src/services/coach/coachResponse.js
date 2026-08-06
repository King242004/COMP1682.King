function parseCoachReply(rawText) {
  const text = String(rawText || "").trim();
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : { reply: text, meal: null, eating: false };
  } catch {
    // A plain-text model response is still useful; only the structured action is lost.
    return { reply: text, meal: null, eating: false };
  }
}

function nonNegativeInteger(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

const INTENTS = new Set(["meal_advice", "meal_log", "cooking", "exercise", "personal_status", "small_talk", "out_of_scope"]);
const MEAL_INTENTS = new Set(["meal_advice", "meal_log", "cooking"]);

// Câu chuyển hướng CỐ ĐỊNH cho mọi yêu cầu ngoài phạm vi, kể cả câu dụ phá luật.
// Không nhắc lại nội dung người dùng hỏi, để không vô tình trả lời một phần,
// và cũng để người thử không biết mình đã chạm đúng chỗ nào.
function genericOutOfScope(language) {
  return language === "vi"
    ? "Mình chưa giúp được việc này. Bạn hỏi mình về món ăn, cách nấu, vận động hoặc số liệu hôm nay của bạn nhé."
    : "I can't help with that. Ask me about meals, cooking, exercise, or your numbers for today.";
}

// Câu riêng cho ảnh không có đồ ăn. Phải nói đúng điều kiện thật là KHÔNG THẤY món,
// đừng nói ảnh mờ hay mình không dám đoán, vì người dùng sẽ đi chụp lại cho nét
// trong khi vấn đề nằm ở nội dung ảnh.
function photoNotFood(language) {
  return language === "vi"
    ? "Mình không thấy món ăn, đồ uống hay thực đơn nào trong ảnh này. Bạn gửi ảnh món ăn để mình xem nhé."
    : "I can't see any food, drink or menu in this photo. Send a photo of a meal and I'll take a look.";
}

function normalizeForComparison(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function avoidDuplicateCoachReply(reply, history, language) {
  const normalized = normalizeForComparison(reply);
  const repeated = normalized && history.filter((item) => item.role === "coach").slice(-3)
    .some((item) => normalizeForComparison(item.text) === normalized);
  if (!repeated) return reply;
  return language === "vi"
    ? "Mình đã trả lời ý này ở trên rồi. Bạn muốn mình nói rõ hơn về khẩu phần, cách chế biến hay mức phù hợp với mục tiêu của bạn?"
    : "I answered that point above. Would you like more detail about the portion, preparation, or how it fits your goal?";
}

function finalizeCoachReply(parsed, { language, mealType }) {
  const intent = INTENTS.has(parsed?.intent) ? parsed.intent : "small_talk";
  const reply = intent === "out_of_scope" ? genericOutOfScope(language) : String(parsed?.reply || "").trim() || (language === "vi"
    ? "Mình chưa nghĩ ra câu trả lời, bạn thử hỏi lại nhé."
    : "I couldn't come up with a reply. Try asking again.");

  const source = MEAL_INTENTS.has(intent) ? parsed?.meal : null;
  const name = String(source?.name || "").trim();
  const meal = source && name && source.calories != null
    ? {
        name,
        calories: nonNegativeInteger(source.calories),
        protein: nonNegativeInteger(source.protein),
        carbs: nonNegativeInteger(source.carbs),
        fat: nonNegativeInteger(source.fat),
        mealType,
      }
    : null;

  const activitySource = intent === "exercise" ? parsed?.activity : null;
  const durationMin = Math.round(Number(activitySource?.durationMin));
  const activity = activitySource && typeof activitySource.key === "string" && durationMin >= 1 && durationMin <= 600
    ? { key: activitySource.key, durationMin }
    : null;

  return { intent, reply, meal, eating: Boolean(intent === "meal_log" && parsed?.eating && meal), activity };
}

module.exports = { parseCoachReply, finalizeCoachReply, avoidDuplicateCoachReply, genericOutOfScope, photoNotFood };
