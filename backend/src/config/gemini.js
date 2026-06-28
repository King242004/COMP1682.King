const { GoogleGenerativeAI } = require("@google/generative-ai");

// Collect one or more API keys. Add extra keys in .env as:
//   GEMINI_API_KEY=key1
//   GEMINI_API_KEY_2=key2
//   GEMINI_API_KEY_3=key3
// (or a comma-separated list in any of them). Each key has its OWN daily free
// quota, so more keys = more total requests/day.
const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
]
  .filter(Boolean)
  .flatMap((k) => k.split(",").map((s) => s.trim()))
  .filter(Boolean);

if (KEYS.length === 0) {
  console.warn("⚠️  No GEMINI_API_KEY set in .env — AI features will not work");
} else {
  console.log(`Gemini: ${KEYS.length} API key(s) loaded`);
}

const clients = KEYS.map((k) => new GoogleGenerativeAI(k));

// Each model name has its own quota bucket per key. We list several model names
// so the caller can fall back across BOTH models and keys when one is exhausted.
// flash first = smarter replies; fall back to the lighter lite model when the
// flash quota is exhausted.
const TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
const VISION_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];

// Build one model instance for every (key × model name) combo, in order.
function buildModels(names, generationConfig) {
  return clients.flatMap((client) =>
    names.map((model) => client.getGenerativeModel({ model, generationConfig }))
  );
}

// Scan (image → JSON nutrition).
const visionModels = buildModels(VISION_MODELS, { temperature: 0.2, responseMimeType: "application/json" });

// Coach daily analysis — strict JSON.
const insightModels = buildModels(TEXT_MODELS, { temperature: 0.3, responseMimeType: "application/json" });

// Coach conversation — JSON { reply, meal } (also handles attached food photos).
const chatModels = buildModels(TEXT_MODELS, { temperature: 0.4, responseMimeType: "application/json" });

// Backwards-compatible single handles (first available model).
const visionModel = visionModels[0];
const insightModel = insightModels[0];
const chatModel = chatModels[0];

module.exports = {
  visionModel, insightModel, chatModel,
  visionModels, insightModels, chatModels,
};
