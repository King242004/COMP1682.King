const { insightModels, chatModels } = require("../config/gemini");
const { buildContext, contextToText } = require("../services/coachContext");
const { computeHealthScore } = require("../services/healthScore");
const ChatMessage = require("../models/ChatMessage");

// Shared safety + style instruction injected into every coach prompt.
const SAFETY = `You are "Coach", a warm, easy-going health buddy inside an app — like a supportive friend who keeps the user on track, not a textbook or a customer-service bot.

SAFETY:
- You are NOT a doctor. For real medical concerns, gently suggest seeing a professional.
- Use ONLY the user data provided below. Never invent numbers the data does not contain.
- Always consider the user's health conditions (diabetes: watch sugar and refined carbs; hypertension: watch sodium and salty food).

STYLE (very important):
- Be SHORT by default: 2 to 3 sentences. EXCEPTION — when the user asks how to cook a dish, for a recipe, a meal plan, or a workout routine, give clear, concise NUMBERED steps.
- For a yes/no question (e.g. "can I eat this?"), start with a clear verdict ("Yes", "Not really", "Yes, but..."), then ONE short reason.
- Do NOT greet or say the user's name every message. Greet only on the very first message of a conversation. After that, just continue naturally like a friend mid-chat.
- Warm, casual, encouraging. Vary your wording, do not repeat the same canned advice.
- Prefer Vietnamese dishes when suggesting food.
- Plain text only: no markdown, no asterisks, no bold, no headings, no tables.`;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Normalize requested language and build the reply-language instruction.
function langDirective(raw) {
  const lang = raw === "vi" ? "vi" : "en";
  const name = lang === "vi" ? "Vietnamese (tiếng Việt)" : "English";
  return `IMPORTANT: Write your ENTIRE response in ${name}.`;
}

// Try each model in order. Each model name has its own free-tier daily quota, so
// when one is exhausted (429 quota) or errors, we fall back to the next one.
async function generateWithFallback(models, payload) {
  let lastErr;
  for (const model of models) {
    try {
      return await model.generateContent(payload);
    } catch (e) {
      lastErr = e;
      console.warn("Coach model failed, trying next:", String(e?.message || "").slice(0, 140));
    }
  }
  throw lastErr;
}

// ─── Daily Insight (GET /api/coach/insight?date=) ─────────────────────────────
// Health Score is computed in code; the AI only writes summary/tips/warnings.
exports.getInsight = async (req, res) => {
  const date = req.query.date || todayKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  try {
    const ctx = await buildContext(req.user.id, date);
    const { score, breakdown } = computeHealthScore(ctx);

    const prompt = `${SAFETY}
${langDirective(req.query.language)}

${contextToText(ctx)}

The app already computed today's Health Score = ${score}/100
(breakdown: calorie ${breakdown.calorie}/40, protein ${breakdown.protein}/20, activity ${breakdown.activity}/20, consistency ${breakdown.consistency}/20).

Write a short daily analysis for this user. Return ONLY valid JSON:
{
  "summary": "1-2 sentence friendly overview of how today is going",
  "tips": ["2-3 short, actionable tips tailored to their goal and remaining calories"],
  "warnings": ["0-2 warnings ONLY if relevant to their health conditions or a clear imbalance; empty array if none"]
}`;

    let ai = { summary: "", tips: [], warnings: [] };
    try {
      const result = await generateWithFallback(insightModels, prompt);
      ai = JSON.parse(result.response.text());
    } catch (e) {
      console.error("Coach insight AI error:", e.message);
      // Graceful fallback so the score still shows even if AI/quota fails
      ai = {
        summary: score >= 70 ? "You're doing well today — keep it up!" : "Let's get today on track.",
        tips: [],
        warnings: [],
      };
    }

    res.json({
      date,
      score,
      breakdown,
      summary: ai.summary || "",
      tips: Array.isArray(ai.tips) ? ai.tips : [],
      warnings: Array.isArray(ai.warnings) ? ai.warnings : [],
      disclaimer: "AI guidance, not medical advice. Consult a professional for health concerns.",
    });
  } catch (err) {
    console.error("Coach insight error:", err.message);
    res.status(500).json({ message: "Failed to generate insight." });
  }
};

// ─── Chat (POST /api/coach/chat) ──────────────────────────────────────────────
// body: { message?, history?, language?, image?(base64), mimeType? }
// If an image is attached, the coach analyzes the food photo together with the
// user's personal context (conditions, goal, what they ate today).
exports.chat = async (req, res) => {
  const { message, history, image, mimeType } = req.body;
  const text = (message || "").trim();
  if (!text && !image)
    return res.status(400).json({ message: "Message or image is required." });

  // Default question when the user sends only a photo
  const userText = text || "Is this dish suitable for me?";

  try {
    const ctx = await buildContext(req.user.id, todayKey());

    // Flatten recent history (cap at last 10 turns) into the prompt
    const historyText = Array.isArray(history)
      ? history
          .slice(-10)
          .map((h) => `${h.role === "user" ? "User" : "Coach"}: ${h.text}`)
          .join("\n")
      : "";

    const imageNote = image
      ? "\nThe user sent a food PHOTO. Briefly name the dish and a short verdict on whether it suits them today. 2-3 sentences."
      : "";

    const hour = new Date().getHours();

    const prompt = `${SAFETY}
${langDirective(req.body.language)}${imageNote}

${contextToText(ctx)}

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ""}Current hour: ${hour}.

YOU ARE A FULL HEALTH COMPANION. You can:
- Cooking guide: for a specific dish, explain how to COOK it at home with simple Vietnamese-friendly ingredients, ADJUSTED to the user's conditions (less salt/sodium for hypertension, less sugar/refined carbs for diabetes), OR how to ORDER it at a restaurant healthily. If the user has not said which and it's relevant, you may briefly ask whether they will cook it or eat out.
- Exercise: when asked, suggest practical workouts suited to the user's condition and goal.
- Status: the user may ask about their own situation — answer from the data above.

The user just said: "${userText}"

Respond with ONLY valid JSON:
{ "reply": "<your short, friendly answer in the required language>", "meal": null }

- "reply": 2-3 short sentences, like a friend. Do NOT greet or use the user's name unless this is the very first message. Do NOT mention logging or diaries — the app shows an "Add" button for that.
- "meal": whenever the user mentions, eats, or asks about a SPECIFIC dish, fill it with your best nutrition estimate so the app can offer to log it. Use null only for general talk.
  Shape: { "name": "<dish>", "calories": <kcal number>, "protein": <g>, "carbs": <g>, "fat": <g>, "mealType": "breakfast|lunch|dinner|snack" }.
  For "name", use the dish EXACTLY as the user described it. Do NOT add a cooking method or detail they did not mention (if they said "ức gà", name it "ức gà", not "ức gà nướng").
  Pick mealType by current hour: under 11 breakfast, 11-14 lunch, 14-17 snack, 17-21 dinner, otherwise snack.`;

    // Multimodal payload when an image is present (Gemini 2.5-flash is vision-capable)
    const payload = image
      ? [prompt, { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } }]
      : prompt;

    const result = await generateWithFallback(chatModels, payload);

    // Parse the JSON contract; fall back to raw text if parsing fails.
    let parsed = { reply: "", meal: null };
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      parsed = { reply: result.response.text().trim(), meal: null };
    }
    const reply = (parsed.reply || "").trim();

    // Suggested meal (NOT logged here — the app shows an "Add" button the user taps).
    let meal = null;
    const m = parsed.meal;
    if (m && m.name && m.calories != null) {
      const mealType = ["breakfast", "lunch", "dinner", "snack"].includes(m.mealType) ? m.mealType : "snack";
      meal = {
        name: String(m.name).trim(),
        calories: Math.max(0, Math.round(Number(m.calories) || 0)),
        protein: Math.max(0, Math.round(Number(m.protein) || 0)),
        carbs: Math.max(0, Math.round(Number(m.carbs) || 0)),
        fat: Math.max(0, Math.round(Number(m.fat) || 0)),
        mealType,
      };
    }

    // Persist text only (image not stored).
    await ChatMessage.create([
      { user: req.user.id, role: "user", text: image ? `📷 ${userText}` : userText },
      { user: req.user.id, role: "coach", text: reply },
    ]);

    res.json({ reply, meal });
  } catch (err) {
    console.error("Coach chat error:", err.message);
    res.status(500).json({ message: "Coach is unavailable right now. Please try again." });
  }
};

// ─── Chat History (GET /api/coach/history) ────────────────────────────────────
exports.getHistory = async (req, res) => {
  const msgs = await ChatMessage.find({ user: req.user.id }).sort({ createdAt: 1 }).limit(100);
  res.json({ messages: msgs.map((m) => ({ role: m.role, text: m.text })) });
};

// ─── Clear History (DELETE /api/coach/history) ────────────────────────────────
exports.clearHistory = async (req, res) => {
  await ChatMessage.deleteMany({ user: req.user.id });
  res.json({ message: "Chat history cleared." });
};
