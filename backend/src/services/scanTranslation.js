// ═══ FILE NÀY LÀM GÌ ═══
// Lớp chắn ngôn ngữ cho Quét ảnh, chạy SAU khi AI đã nhận diện xong.
//
// Ai gọi tới: scanController, sau khi Gemini trả danh sách món
// Nhận vào:   danh sách món AI đoán được, và ngôn ngữ app đang chọn
// Trả ra:     danh sách đã đúng ngôn ngữ
// Khi lỗi:    dịch lại thất bại thì giữ nguyên kết quả gốc
//
// Điểm quan trọng: lượt dịch lại CHỈ đổi tên món và mô tả khẩu phần,
// giữ nguyên toàn bộ con số dinh dưỡng và độ tin cậy của lượt đầu.
// Nếu để nó tính lại số thì hai lượt sẽ cho hai kết quả khác nhau.
//
// File này là lớp chắn ngôn ngữ cho Quét ảnh, làm cùng việc như coachLanguage
// nhưng dò theo từ về món ăn và khẩu phần thay vì từ hội thoại.

// Ba bộ dấu hiệu: dấu tiếng Việt, tên món tiếng Việt không dấu,
// và từ tiếng Anh hay gặp khi mô tả món và khẩu phần.
const VIETNAMESE_DIACRITICS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const VIETNAMESE_FOOD_WORDS = /\b(com|ga|bo|heo|lon|ca|tom|bun|pho|mi|dau|hu|chien|xao|nuong|luoc|hap|sot|canh|chen|to|dia|phan|mieng)\b/i;
const ENGLISH_FOOD_WORDS = /\b(small|medium|large|bowl|plate|serving|piece|pieces|cup|fried|spicy|with|sauce|tofu|rice|chicken|beef|pork|fish|noodle|noodles|soup|grilled|steamed|roasted)\b/i;

function candidateText(candidates) {
  return candidates
    .flatMap((candidate) => [candidate?.name, candidate?.portionDescription])
    .filter((value) => typeof value === "string")
    .join(" ");
}

function hasLanguageMismatch(candidates, language) {
  const text = candidateText(Array.isArray(candidates) ? candidates : []);
  if (!text) return false;

  if (language === "vi") return ENGLISH_FOOD_WORDS.test(text);
  return VIETNAMESE_DIACRITICS.test(text) || VIETNAMESE_FOOD_WORDS.test(text);
}

// Soạn câu lệnh nhờ AI dịch lại. Dặn rõ giữ nguyên thứ tự, số lượng món,
// và CHÉP y nguyên mọi con số chứ không được tính lại.
function buildLanguageCorrectionPrompt(candidates, language) {
  const languageName = language === "vi" ? "Vietnamese" : "English";
  const extraRule = language === "vi"
    ? "Translate English dish names and portion units into natural Vietnamese."
    : "Translate Vietnamese dish names into natural English. Do not keep Vietnamese words or diacritics.";

  return `Normalize the human-readable text in this food scan result to ${languageName}.
${extraRule}
- Translate every candidate name and portionDescription.
- Keep the same candidate order and count.
- Copy every numeric value exactly without recalculating it.
- Return only valid JSON with the same shape.

Input JSON:
${JSON.stringify({ candidates })}`;
}

// Đây là chỗ bảo đảm lượt dịch không làm sai lệch con số calo của lượt đầu.
function mergeLocalizedText(originalCandidates, localizedCandidates) {
  if (!Array.isArray(localizedCandidates)) return originalCandidates;

  return originalCandidates.map((candidate, index) => {
    const localized = localizedCandidates[index];
    if (!localized || typeof localized !== "object") return candidate;

    return {
      ...candidate,
      name: typeof localized.name === "string" && localized.name.trim()
        ? localized.name.trim()
        : candidate.name,
      portionDescription:
        typeof localized.portionDescription === "string" && localized.portionDescription.trim()
          ? localized.portionDescription.trim()
          : candidate.portionDescription,
    };
  });
}

module.exports = {
  hasLanguageMismatch,
  buildLanguageCorrectionPrompt,
  mergeLocalizedText,
};
