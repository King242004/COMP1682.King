const { GoogleGenerativeAI } = require("@google/generative-ai");

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

const TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
const VISION_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
// Chat giữ flash ở đầu vì câu trả lời cần model mạnh nhất. flash-lite nằm giữa
// làm chỗ lui khi flash hết lượt, vì flash-latest hay chạm trần thời gian chờ.
const CHAT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];

function buildModels(names, generationConfig) {
  return clients.flatMap((client) =>
    names.map((model) => client.getGenerativeModel({ model, generationConfig }))
  );
}

// Tắt bước suy nghĩ để AI trả lời nhanh hơn, vì các việc này đã có khuôn JSON sẵn.
const NO_THINKING = { thinkingConfig: { thinkingBudget: 0 } };

const visionModels = buildModels(VISION_MODELS, { temperature: 0.2, responseMimeType: "application/json", ...NO_THINKING });

const insightModels = buildModels(TEXT_MODELS, { temperature: 0.3, responseMimeType: "application/json", ...NO_THINKING });

const nutritionModels = buildModels(TEXT_MODELS, { temperature: 0, responseMimeType: "application/json", ...NO_THINKING });

const chatModels = buildModels(CHAT_MODELS, { temperature: 0.75, responseMimeType: "application/json", ...NO_THINKING });

module.exports = { visionModels, insightModels, nutritionModels, chatModels };
