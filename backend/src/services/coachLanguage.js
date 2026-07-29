const VIETNAMESE_MARKS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const VIETNAMESE_WORDS = /\b(ban|minh|hom|nay|khong|nen|thu|voi|cho|bua|nhe|nha|suc|khoe)\b/i;
const ENGLISH_WORDS = /\b(the|and|you|your|today|try|with|for|meal|health|calories|keep|choose|add|avoid|should|could|this|that|is|are|to|of)\b/i;

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
  buildCorrectionPrompt,
  mergeTextValues,
  normalizeCoachText,
};
