// File này là lớp chắn ngôn ngữ cho Coach.
// Vấn đề: app để tiếng Anh nhưng AI vẫn có lúc trả lời tiếng Việt, và ngược lại.
// Cách chặn: dò kết quả, nếu thấy lẫn ngôn ngữ thì gọi AI thêm một lượt để dịch lại.

// Ba bộ dấu hiệu để đoán ngôn ngữ. Dấu tiếng Việt, từ tiếng Việt không dấu,
// và các từ tiếng Anh hay gặp.
const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const VIETNAMESE_WORDS = /\b(ban|minh|hom|nay|khong|nen|thu|voi|cho|bua|nhe|nha|suc|khoe)\b/i;
const ENGLISH_WORDS = /\b(the|and|you|your|today|try|with|for|meal|health|calories|keep|choose|add|avoid|should|could|this|that|is|are|to|of)\b/i;

// Người dùng xin đổi ngôn ngữ theo rất nhiều kiểu nói, nên cần hai dấu hiệu.
// TARGET là tên ngôn ngữ. Phần loại trừ phía sau bỏ qua các cụm chỉ món ăn hoặc
// phong cách như "Vietnamese food", vì đó là câu hỏi về đồ ăn chứ không phải xin đổi tiếng.
const LANGUAGE_TARGET = /\b(tieng anh|english|tieng viet|vietnamese)\b(?! (?:food|dish|dishes|cuisine|restaurant|breakfast|coffee|people|style))/g;
// MARKERS là các từ cho thấy người dùng đang nói VỀ ngôn ngữ trò chuyện,
// gồm động từ nói năng, lời nhờ vả và mốc thời gian.
const LANGUAGE_MARKERS = /\b(tra loi|noi chuyen|noi|nhan tin|chat|talk|speak|reply|answer|respond|write|viet|use|dung|switch|change|chuyen|doi|prefer|want|please|lam on|giup|nhe|nha|thoi|di|luon|tu gio|from now|instead|can we|could we|shall we|lets|let us)\b/;

// Bỏ dấu và bỏ ký tự lạ để so khớp không phụ thuộc cách gõ có dấu hay không.
function normalizeLanguageText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Lấy tên ngôn ngữ CUỐI CÙNG trong câu, vì đích đến thường đứng sau,
// ví dụ "từ tiếng Việt sang tiếng Anh".
// Việc đổi ngôn ngữ do backend quyết định bằng luật cố định chứ không hỏi Gemini,
// nên câu xác nhận luôn đúng ngôn ngữ người dùng vừa chọn.
function requestedLanguage(message) {
  const text = normalizeLanguageText(message);
  const targets = text.match(LANGUAGE_TARGET);
  if (!targets) return null;
  const onlyTarget = targets.length === 1 && text === targets[0];
  if (!onlyTarget && !LANGUAGE_MARKERS.test(text)) return null;
  return /anh|english/.test(targets[targets.length - 1]) ? "en" : "vi";
}

function resolveRequestedLanguage(message, fallback) {
  return requestedLanguage(message) || (fallback === "vi" ? "vi" : "en");
}

function languageSwitchReply(language) {
  return language === "vi"
    ? "Được, từ giờ mình sẽ trả lời bằng tiếng Việt."
    : "Sure, I'll reply in English from now on.";
}

// Gom hết chuỗi chữ nằm ở mọi tầng của một object hoặc mảng vào một danh sách.
function collectText(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectText(item, output));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectText(item, output));
  }
  return output;
}

function hasLanguageMismatch(value, language) {
  const text = collectText(value).join(" ");
  if (!text) return false;
  if (language === "vi") return ENGLISH_WORDS.test(text);
  return VIETNAMESE_MARKS.test(text) || VIETNAMESE_WORDS.test(text);
}

function buildCorrectionPrompt(value, language) {
  const languageName = language === "vi" ? "Vietnamese" : "English";
  const rule = language === "vi"
    ? "Translate every string into natural Vietnamese."
    : "Translate every string into natural English. Do not keep Vietnamese words or diacritics.";

  return `Rewrite every string value in this JSON in ${languageName}.
${rule}
- Preserve the exact JSON shape, keys, array lengths and order.
- Do not add or remove information.
- Return only valid JSON.

Input JSON:
${JSON.stringify(value)}`;
}

// Chỉ thay chữ để mọi con số dinh dưỡng giữ nguyên như lượt đầu, không bị AI tính lại.
function mergeTextValues(original, corrected) {
  if (typeof original === "string") {
    return typeof corrected === "string" && corrected.trim() ? corrected.trim() : original;
  }
  if (Array.isArray(original)) {
    return original.map((item, index) => mergeTextValues(item, corrected?.[index]));
  }
  if (original && typeof original === "object") {
    return Object.fromEntries(
      Object.entries(original).map(([key, value]) => [
        key,
        mergeTextValues(value, corrected?.[key]),
      ])
    );
  }
  return original;
}

// Hàm chính của file, coachController gọi hàm này.
async function normalizeCoachText(value, language, generate) {
  if (!hasLanguageMismatch(value, language)) return value;
  try {
    const result = await generate(buildCorrectionPrompt(value, language));
    const corrected = JSON.parse(result.response.text());
    return mergeTextValues(value, corrected);
  } catch (error) {
    console.warn("Could not normalize Coach language:", error.message);
    return value;
  }
}

module.exports = {
  hasLanguageMismatch,
  mergeTextValues,
  normalizeCoachText,
  resolveRequestedLanguage,
  requestedLanguage,
  languageSwitchReply,
};
