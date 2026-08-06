// ═══ FILE NÀY LÀM GÌ ═══
// Cửa DUY NHẤT để gọi AI. Mọi tính năng AI của app đều đi qua đây.
//
// Ai gọi tới: scanController, coachController, planController
// Nhận vào:   một bộ model đã dựng sẵn, và câu lệnh cần hỏi
// Trả ra:     câu trả lời của model đầu tiên chạy được
// Khi lỗi:    thử hết mọi cách gọi mà vẫn hỏng thì ném AI_QUOTA_EXHAUSTED,
//             controller bắt và trả QUOTA cho app
//
// Hai mốc thời gian: mỗi lần thử chờ tối đa 12 giây, cả lượt chờ tối đa 40 giây.
// Có hạn để một câu hỏi hỏng không treo người dùng mãi.
//
// File này là cửa duy nhất để gọi AI. Mọi tính năng AI đều đi qua đây.
// Vì sao cần thử nhiều model: Gemini bản miễn phí giới hạn lượt gọi mỗi ngày.
// Có nhiều khóa và nhiều model thì hết cái này còn cái kia.
const ATTEMPT_TIMEOUT_MS = 12_000;
const TOTAL_TIMEOUT_MS = 40_000;

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("AI request timed out")), timeoutMs);
    timer.unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function isQuotaError(error) {
  return /429|quota|resource[_\s-]?exhausted|rate limit|too many requests/i.test(
    String(error?.message || "")
  );
}

async function generateWithFallback(models, payload) {
  let lastErr;
  const errors = [];
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  for (const model of models) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    try {
      const result = await withTimeout(
        model.generateContent(payload),
        Math.min(ATTEMPT_TIMEOUT_MS, remainingMs)
      );
      return result;
    } catch (e) {
      lastErr = e;
      errors.push(e);
      console.warn("AI model failed, trying next:", String(e?.message || "").slice(0, 140));
    }
  }
  // Chỉ báo hết lượt khi TẤT CẢ model đều lỗi vì hết lượt.
  // Nếu có model lỗi vì lý do khác thì đó là lỗi kỹ thuật, không phải hết lượt.
  if (errors.length > 0 && errors.every(isQuotaError)) {
    throw new Error("AI_QUOTA_EXHAUSTED");
  }
  throw lastErr || new Error("AI request timed out");
}

module.exports = { generateWithFallback, withTimeout };
