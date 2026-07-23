const { GoogleGenerativeAI } = require("@google/generative-ai");

// Collect one or more API keys. Add extra keys in .env as:
//   GEMINI_API_KEY=key1
//   GEMINI_API_KEY_2=key2
//   GEMINI_API_KEY_3=key3
// (or a comma-separated list in any of them). Gemini quotas are project-scoped,
// not key-scoped; extra keys are credential fallbacks unless they belong to
// separate projects.
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
// Chat quality must stay CONSISTENT (health advice) → no lite fallback here.
// gemini-flash-latest is an alias of the newest flash, so quality is identical.
const CHAT_MODELS = ["gemini-2.5-flash", "gemini-flash-latest"];

// Build one model instance for every (key × model name) combo, in order.
function buildModels(names, generationConfig) {
  return clients.flatMap((client) =>
    names.map((model) => client.getGenerativeModel({ model, generationConfig }))
  );
}

// Gemini 2.5 models "think" before answering by default, which adds 5-15s of
// latency. Structured JSON tasks (scan, insight, suggest, plan, grocery) don't
// need it — disable to answer fast. Chat keeps thinking for reply quality.
const NO_THINKING = { thinkingConfig: { thinkingBudget: 0 } };

// Scan (image → JSON nutrition).
const visionModels = buildModels(VISION_MODELS, { temperature: 0.2, responseMimeType: "application/json", ...NO_THINKING });

// Coach daily analysis / suggestions / plan generation — strict JSON, speed first.
const insightModels = buildModels(TEXT_MODELS, { temperature: 0.3, responseMimeType: "application/json", ...NO_THINKING });

// Coach conversation — JSON { reply, meal } (also handles attached food photos).
const chatModels = buildModels(CHAT_MODELS, { temperature: 0.75, responseMimeType: "application/json" });

module.exports = { visionModels, insightModels, chatModels };
