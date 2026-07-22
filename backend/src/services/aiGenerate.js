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

async function generateWithFallback(models, payload) {
  let lastErr;
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  for (const model of models) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    try {
      const result = await withTimeout(
        model.generateContent(payload),
        Math.min(ATTEMPT_TIMEOUT_MS, remainingMs)
      );
      // Succeeded on a BACKUP key → the primary key's quota is exhausted.
      // Callers may surface this as a "free AI turns running low" hint.
      result.aiQuotaLow = (model.__keyIndex ?? 0) > 0;
      return result;
    } catch (e) {
      lastErr = e;
      console.warn("AI model failed, trying next:", String(e?.message || "").slice(0, 140));
    }
  }
  throw lastErr || new Error("AI request timed out");
}

module.exports = { generateWithFallback, withTimeout };
