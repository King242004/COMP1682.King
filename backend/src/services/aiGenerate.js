// Shared Gemini caller: tries each (key × model) instance in order and falls back
// to the next on quota (429) or any error, so one exhausted bucket never breaks a
// feature. Used by coach, scan and plan generation.
async function generateWithFallback(models, payload) {
  let lastErr;
  for (const model of models) {
    try {
      const result = await model.generateContent(payload);
      // Succeeded on a BACKUP key → the primary key's quota is exhausted.
      // Callers may surface this as a "free AI turns running low" hint.
      result.aiQuotaLow = (model.__keyIndex ?? 0) > 0;
      return result;
    } catch (e) {
      lastErr = e;
      console.warn("AI model failed, trying next:", String(e?.message || "").slice(0, 140));
    }
  }
  throw lastErr;
}

module.exports = { generateWithFallback };
