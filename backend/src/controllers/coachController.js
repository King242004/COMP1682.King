const { insightModels, chatModels } = require("../config/gemini");
const { generateWithFallback } = require("../services/aiGenerate");
const { buildContext, contextToText } = require("../services/coachContext");
const { computeHealthScore } = require("../services/healthScore");
const ChatMessage = require("../models/ChatMessage");
const Meal = require("../models/Meal");
const PlanMeal = require("../models/PlanMeal");
const cloudinary = require("../config/cloudinary");

// Shared safety + style instruction injected into every coach prompt.
const SAFETY = `You are "Coach", a warm, easy-going health buddy inside an app — like a supportive friend who keeps the user on track, not a textbook or a customer-service bot.

SAFETY:
- You are NOT a doctor. For real medical concerns, gently suggest seeing a professional.
- Use ONLY the user data provided below. Never invent numbers the data does not contain.
- Always consider the user's health conditions (diabetes: watch sugar and refined carbs; hypertension: watch sodium and salty food).

STYLE (very important):
- Be SHORT by default: 2 to 3 sentences. EXCEPTION — when the user asks how to cook a dish, for a recipe, a meal plan, or a workout routine, give clear, concise NUMBERED steps.
- For a "can I eat X?" question, give a quick verdict, then ASK ONE friendly clarifying question to advise better — e.g. which type / what's in it (especially dishes with many variants like bánh mì, cơm, salad, sandwich), whether they'll cook it or buy it, or what they'll eat it with. One natural question, not an interrogation.
- Be interactive: prefer asking a short follow-up to gather info, instead of dumping all advice at once. Talk like a friend who wants details before giving the best tip.
- Do NOT greet or say the user's name every message. Greet only on the very first message of a conversation. After that, just continue naturally like a friend mid-chat.
- Talk like a REAL person in an ongoing chat — read the conversation history. If the user repeats a question you already answered, DO NOT answer again the same way: acknowledge it naturally ("Bạn hỏi lại nè 😄", "Như mình nói lúc nãy...") and add a NEW angle or ask a follow-up question.
- Be conversational and practical, not a script. When it helps, ask a short follow-up question back (like a friend would) instead of dumping all advice at once.
- When the user says they ARE eating a dish, react warmly and you may ask a quick follow-up (homemade or bought, eaten with what) to personalize the tip. Do NOT assume "dặn quán"/eating out unless they said so.
- Warm, casual, encouraging. Vary wording AND substance — never repeat the same canned advice.
- Prefer Vietnamese dishes when suggesting food.
- Plain text only: no markdown, no asterisks, no bold, no headings, no tables.`;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Meal type from the current hour (deterministic, overrides the model's guess).
function mealTypeByHour(h) {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

// Slot to SUGGEST for: start from the hour-based slot, then skip slots the user
// already logged (breakfast eaten at 10am → suggest for lunch instead).
// Mirrored in frontend utils/coach.ts nextMealSlot — keep the two in sync.
function nextSlotToSuggest(hour, eatenTypes) {
  const order = ["breakfast", "lunch", "snack", "dinner"];
  let idx = order.indexOf(mealTypeByHour(hour));
  while (idx < order.length && eatenTypes.has(order[idx])) idx++;
  return idx < order.length ? order[idx] : "snack"; // all slots eaten → light late snack
}

// Normalize requested language and build the reply-language instruction.
function langDirective(raw) {
  const lang = raw === "vi" ? "vi" : "en";
  const name = lang === "vi" ? "Vietnamese (tiếng Việt)" : "English";
  return `IMPORTANT: Write your ENTIRE response in ${name}.`;
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
{ "reply": "<your short, friendly answer in the required language>", "meal": null, "eating": false }

- "reply": 2-3 short sentences, like a friend. Do NOT greet or use the user's name unless this is the very first message. Do NOT mention logging or diaries — the app shows an "Add" button for that.
- "meal": whenever a SPECIFIC dish is discussed (asking about it, planning it, OR eating it), fill it so the app can show cooking tips + nutrition. Use null only for general talk with no dish.
  Shape: { "name": "<dish>", "calories": <kcal number>, "protein": <g>, "carbs": <g>, "fat": <g>, "mealType": "breakfast|lunch|dinner|snack" }.
  For "name", use the dish EXACTLY as the user described it. Do NOT add a cooking method they did not mention (if they said "ức gà", name it "ức gà", not "ức gà nướng").
- "eating": true ONLY if the user indicates they are eating or have already eaten this dish (e.g. "tôi ăn", "đang ăn", "vừa ăn", "có"). false if they are only ASKING or PLANNING.
- CRITICAL: if eating is true, you MUST also fill "meal" with that dish (re-state it even if it was mentioned in an earlier turn). NEVER return eating=true with meal=null.
  Pick mealType by current hour: under 11 breakfast, 11-14 lunch, 14-17 snack, 17-21 dinner, otherwise snack.

EXAMPLES (match this interactive behavior, not the exact words):
User: "Tôi ăn bánh mì được không?" => {"reply":"Được nha! Mà bánh mì gì vậy — thịt, trứng hay chay? Bạn tự làm hay mua ngoài, ăn kèm gì không? Cho mình biết để tư vấn sát hơn.","meal":{"name":"bánh mì","calories":350,"protein":12,"carbs":45,"fat":12,"mealType":"breakfast"},"eating":false}
User: "Tôi ăn phở được không?" => {"reply":"Phở ổn đó! Bạn ăn phở bò hay gà, tự nấu hay ra quán? Mình mách cho hợp.","meal":{"name":"phở","calories":450,"protein":25,"carbs":60,"fat":12,"mealType":"lunch"},"eating":false}
User: "Tôi đang ăn phở" => {"reply":"Ngon miệng nha! Bạn ăn kèm rau không? Thêm rau giá với ít nước béo là cân bằng hơn đó.","meal":{"name":"phở","calories":450,"protein":25,"carbs":60,"fat":12,"mealType":"lunch"},"eating":true}
User asks the SAME thing a 3rd time => {"reply":"Bạn hỏi lại nè 😄 Vẫn ổn như mình nói. Hay bạn đang phân vân điều gì khác về nó?","meal":{"name":"phở","calories":450,"protein":25,"carbs":60,"fat":12,"mealType":"lunch"},"eating":false}
User: "Hôm nay tôi thế nào?" => {"reply":"Bạn đang ổn, mới nạp ít calo thôi.","meal":null,"eating":false}

Always read the history first so repeated or follow-up questions feel natural, not robotic.`;

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
    // Guard: ChatMessage.text is required — an empty AI reply must not crash the save.
    const reply =
      (parsed.reply || "").trim() ||
      (req.body.language === "vi"
        ? "Mình chưa nghĩ ra câu trả lời, bạn thử hỏi lại nhé."
        : "I couldn't come up with a reply — try asking again.");

    // Suggested meal (NOT logged here — the app shows an "Add" button when eating).
    let meal = null;
    const m = parsed.meal;
    if (m && m.name && m.calories != null) {
      meal = {
        name: String(m.name).trim(),
        calories: Math.max(0, Math.round(Number(m.calories) || 0)),
        protein: Math.max(0, Math.round(Number(m.protein) || 0)),
        carbs: Math.max(0, Math.round(Number(m.carbs) || 0)),
        fat: Math.max(0, Math.round(Number(m.fat) || 0)),
        mealType: mealTypeByHour(hour), // deterministic by time; user can change with chips
      };
    }
    const eating = !!parsed.eating && !!meal; // only show "Add" when the user is actually eating it

    // Upload the photo to Cloudinary so it persists in chat history. Best-effort:
    // if it fails, we still save the text turn.
    let imageUrl = null;
    let imagePublicId = null;
    if (image) {
      try {
        const up = await cloudinary.uploader.upload(
          `data:${mimeType || "image/jpeg"};base64,${image}`,
          { folder: "healthysnap/coach", transformation: [{ width: 800, crop: "limit" }] }
        );
        imageUrl = up.secure_url;
        imagePublicId = up.public_id; // kept so clearHistory can delete the file from Cloudinary
      } catch (e) {
        console.error("Coach image upload failed:", e.message);
      }
    }

    const docs = await ChatMessage.create([
      { user: req.user.id, role: "user", text: image ? `📷 ${userText}` : userText, image: imageUrl, imagePublicId },
      { user: req.user.id, role: "coach", text: reply, meal: meal || null, mealEating: eating },
    ]);

    // messageId of the coach turn lets the app log/undo the suggested meal later
    res.json({ reply, meal, eating, image: imageUrl, messageId: docs[1]._id });
  } catch (err) {
    console.error("Coach chat error:", err.message);
    // Distinguish "out of quota" (429) so the app can show a clearer message.
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Coach is unavailable right now. Please try again." });
  }
};

// ─── "What should I eat now?" (POST /api/coach/suggest-meal) ──────────────────
// body: { language? } → 3 concrete dishes for the NEXT meal slot, sized to the
// remaining calorie budget, balancing missing macros, respecting conditions.
// One AI request per tap (the app caches per date+slot so re-taps are free).
exports.suggestMeal = async (req, res) => {
  try {
    // Context + today's pending plan fetched in parallel (independent queries)
    const [ctx, planPending] = await Promise.all([
      buildContext(req.user.id, todayKey()),
      PlanMeal.find({ user: req.user.id, date: todayKey(), done: false }),
    ]);
    const hour = new Date().getHours();
    // Skip slots already eaten so we suggest for the meal the user actually faces next
    const eatenTypes = new Set(ctx.today.meals.map((m) => m.mealType));
    const slot = nextSlotToSuggest(hour, eatenTypes);
    const remaining = ctx.profile.calorieGoal - ctx.today.totals.calories + ctx.today.totalBurned;

    // Pending planned meals today: suggestions must complement the plan, not fight it —
    // if the target slot is already planned, these become ALTERNATIVES (swap options).
    const planText = planPending.length
      ? `\nTODAY'S MEAL PLAN (planned, NOT eaten yet):\n${planPending
          .map((p) => `  - [${p.mealType}] ${p.name}: ${p.calories} kcal`)
          .join("\n")}\n`
      : "";
    const plannedForSlot = planPending.find((p) => p.mealType === slot);
    const planRule = plannedForSlot
      ? `- The plan already has "${plannedForSlot.name}" for this ${slot}. The user wants ALTERNATIVES: suggest 3 DIFFERENT dishes with a similar or better nutrition fit. NEVER repeat the planned dish.`
      : planPending.length
      ? `- Do NOT suggest dishes already in today's plan above.`
      : "";

    const prompt = `${SAFETY}
${langDirective(req.body.language)}

${contextToText(ctx)}
${planText}
Current hour: ${hour} → the NEXT meal slot is: ${slot}.
Remaining calorie budget today (goal - eaten + burned): ${remaining} kcal.

Suggest exactly 3 SPECIFIC dishes for this next ${slot}. Prefer Vietnamese dishes. Rules:
${planRule ? planRule + "\n" : ""}
- Single serving each, sized to fit the remaining budget. If the budget is small (or negative), suggest light low-calorie options and say so in the reason.
- Look at what today's meals are MISSING and balance it (e.g. little protein so far → protein-rich dishes).
- Strictly respect the health conditions above (diabetes: low sugar/refined carbs; hypertension: low sodium).
- The 3 dishes must be different in style (e.g. not three rice dishes).
- "name": max 6 words, no notes or parentheses.
- "reason": ONE short friendly sentence in the required language — why THIS dish fits right now (missing macro, remaining kcal, or their condition/goal).

Return ONLY valid JSON:
{ "suggestions": [ { "name": "<dish>", "calories": <kcal>, "protein": <g>, "carbs": <g>, "fat": <g>, "reason": "<1 sentence>" } ] }`;

    const result = await generateWithFallback(insightModels, prompt);
    const parsed = JSON.parse(result.response.text());
    const suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .filter((s) => s && s.name && s.calories != null)
      .slice(0, 3)
      .map((s) => ({
        name: String(s.name).trim(),
        calories: Math.max(0, Math.round(Number(s.calories) || 0)),
        protein: Math.max(0, Math.round(Number(s.protein) || 0)),
        carbs: Math.max(0, Math.round(Number(s.carbs) || 0)),
        fat: Math.max(0, Math.round(Number(s.fat) || 0)),
        reason: String(s.reason || "").trim(),
      }));
    if (!suggestions.length) throw new Error("Empty suggestions from AI");

    res.json({ mealType: slot, remaining, suggestions });
  } catch (err) {
    console.error("Coach suggest error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Couldn't get suggestions right now." });
  }
};

// ─── Chat History (GET /api/coach/history) ────────────────────────────────────
exports.getHistory = async (req, res) => {
  // Take the LATEST 100 then restore chronological order — sorting ascending with
  // limit would return the oldest 100 and hide new messages once history grows.
  const msgs = (await ChatMessage.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100)).reverse();
  res.json({
    messages: msgs.map((m) => ({
      id: m._id,
      role: m.role,
      text: m.text,
      image: m.image || undefined,
      meal: m.meal || null,
      eating: m.mealEating || false,
      loggedId: m.loggedMealId || null,
    })),
  });
};

// ─── Log a suggested meal from a coach message (POST /api/coach/log) ───────────
// body: { messageId, mealType? } → creates the Meal in the diary and links it.
exports.logFromMessage = async (req, res) => {
  const { messageId, mealType } = req.body;
  const msg = await ChatMessage.findOne({ _id: messageId, user: req.user.id });
  if (!msg || !msg.meal) return res.status(404).json({ message: "No suggested meal here." });
  if (msg.loggedMealId) return res.status(400).json({ message: "Already added." });

  const m = msg.meal;
  const type = ["breakfast", "lunch", "dinner", "snack"].includes(mealType) ? mealType : m.mealType;
  const meal = await Meal.create({
    user: req.user.id,
    name: m.name,
    mealType: type,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    date: todayKey(),
  });
  msg.loggedMealId = meal._id;
  await msg.save();
  res.json({ logged: { id: meal._id, name: meal.name, mealType: meal.mealType, calories: meal.calories } });
};

// ─── Undo a logged meal (POST /api/coach/unlog) ───────────────────────────────
exports.unlogFromMessage = async (req, res) => {
  const { messageId } = req.body;
  const msg = await ChatMessage.findOne({ _id: messageId, user: req.user.id });
  if (!msg) return res.status(404).json({ message: "Message not found." });
  if (msg.loggedMealId) {
    await Meal.deleteOne({ _id: msg.loggedMealId, user: req.user.id });
    msg.loggedMealId = null;
    await msg.save();
  }
  res.json({ message: "Removed." });
};

// ─── Clear History (DELETE /api/coach/history) ────────────────────────────────
// Also deletes the user's chat photos from Cloudinary so no orphan files pile up.
exports.clearHistory = async (req, res) => {
  const withImages = await ChatMessage.find({ user: req.user.id, imagePublicId: { $ne: null } }).select("imagePublicId");
  // Best-effort: a failed Cloudinary delete should not block clearing the chat
  await Promise.allSettled(withImages.map((m) => cloudinary.uploader.destroy(m.imagePublicId)));
  await ChatMessage.deleteMany({ user: req.user.id });
  res.json({ message: "Chat history cleared." });
};
