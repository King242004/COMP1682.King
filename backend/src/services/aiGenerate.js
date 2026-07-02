// Shared Gemini caller: tries each (key × model) instance in order and falls back
// to the next on quota (429) or any error, so one exhausted bucket never breaks a
// feature. Used by coach, scan and plan generation.
async function generateWithFallback(models, payload) {
  let lastErr;
  for (const model of models) {
    try {
      return await model.generateContent(payload);
    } catch (e) {
      lastErr = e;
      console.warn("AI model failed, trying next:", String(e?.message || "").slice(0, 140));
    }
  }
  throw lastErr;
}

module.exports = { generateWithFallback };
