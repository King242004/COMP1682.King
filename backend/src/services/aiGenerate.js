// Shared Gemini caller: tries each (key × model) instance in order and falls back
// to the next on quota (429) or any error, so one exhausted bucket never breaks a
// feature. Used by coach, scan and plan generation.
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
  if (errors.length > 0 && errors.every(isQuotaError)) {
    throw new Error("AI_QUOTA_EXHAUSTED");
  }
  throw lastErr || new Error("AI request timed out");
}

module.exports = { generateWithFallback, withTimeout, isQuotaError };
