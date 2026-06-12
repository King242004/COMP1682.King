const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set in .env — AI scan will not work");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// gemini-2.5-flash = stable flagship Flash model (June 2025 release)
// Multimodal vision-capable, 1M token context, free tier eligible.
// Fallback options if quota hits: gemini-2.5-flash-lite, gemini-flash-latest
const visionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json",
  },
});

module.exports = { visionModel };
