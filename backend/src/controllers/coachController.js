// ═══ FILE NÀY LÀM GÌ ═══
// Lo toàn bộ AI Coach: chấm điểm sức khỏe trong ngày, trò chuyện,
// gợi ý món kế tiếp, lưu và xóa lịch sử chat, ghi món từ tin nhắn vào nhật ký.
//
// Ai gọi tới: coachRoutes, tức tab Coach và thẻ điểm sức khỏe ở Trang chủ
// Nhận vào:   câu hỏi của người dùng, kèm ảnh nếu có, và ngôn ngữ đang chọn
// Trả ra:     câu trả lời của Coach, hoặc điểm sức khỏe kèm lời bình
// Khi lỗi:    AI hết lượt thì trả QUOTA và app hiện lời nhắc thử lại sau.
//             Câu hỏi ngoài phạm vi dinh dưỡng thì Coach từ chối lịch sự.
//
// Điều quan trọng nhất của file này: ĐIỂM DO CODE TÍNH, không do AI chấm.
// AI chỉ viết lời bình. Nhờ vậy AI hỏng thì vẫn còn điểm, và cùng dữ liệu
// thì luôn ra cùng một điểm chứ không đổi mỗi lần mở.
const { insightModels, nutritionModels, chatModels } = require("../config/geminiModels");
const { generateWithFallback } = require("../services/aiClient");
const { buildContext, contextToText } = require("../services/coach/coachContext");
const { filterDishes, forbiddenFor, forbiddenByTaste } = require("../services/nutrition/foodSafetyFilter");
const { computeHealthScore } = require("../services/coach/dailyHealthScore");
const { buildInsightPrompt, buildChatPrompt, buildMealSuggestionPrompt } = require("../services/coach/coachPrompt");
const { parseCoachReply, finalizeCoachReply, avoidDuplicateCoachReply, photoNotFood } = require("../services/coach/coachResponse");
const { getExternalActivity, computeBurned } = require("../config/exerciseCatalog");
const { resolveCoachScope, SUPPORTED, OUT_OF_SCOPE } = require("../services/coach/coachScope");
const ChatMessage = require("../models/ChatMessage");
const Meal = require("../models/Meal");
const cloudinary = require("../config/cloudinary");
const { validateCoachChat } = require("../validators/coachChatValidator");
const { normalizeCoachText, resolveRequestedLanguage, requestedLanguage, languageSwitchReply } = require("../services/coach/coachLanguage");
const { requestTodayKey } = require("../utils/dateUtils");

// File này lo AI Coach: chấm điểm ngày, trò chuyện, gợi ý món,
// lưu và xóa lịch sử, ghi món từ tin nhắn vào nhật ký.

// Đoán bữa đang tới dựa trên giờ hiện tại. Bản giống hệt bên frontend
// nằm ở features/meals/mealHelpers.ts, hai bên phải cho ra cùng kết quả.
function mealTypeByHour(h) {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

// Tìm bữa kế tiếp chưa ăn. Bắt đầu từ bữa hợp với giờ hiện tại rồi nhảy tiếp
// nếu bữa đó đã ghi món rồi.
function nextSlotToSuggest(hour, eatenTypes) {
  const order = ["breakfast", "lunch", "snack", "dinner"];
  let idx = order.indexOf(mealTypeByHour(hour));
  while (idx < order.length && eatenTypes.has(order[idx])) idx++;
  // Nếu đã qua tất cả bữa chính thì gợi ý một bữa phụ nhẹ.
  return idx < order.length ? order[idx] : "snack";
}

// Điểm do code tính chứ không do AI chấm, để cùng dữ liệu thì luôn ra cùng điểm.
// AI chỉ viết lời bình, nên AI hỏng cũng không làm mất điểm số.
exports.getInsight = async (req, res) => {
  const date = req.query.date || requestTodayKey(req);
  const language = req.query.language === "vi" ? "vi" : "en";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ message: "Date must be in format YYYY-MM-DD." });

  try {
    const ctx = await buildContext(req.user.id, date);

    // Ngày chưa có bữa nào thì chưa có gì để chấm. Bản cũ vẫn trả một điểm rất
    // thấp, nên người mở app lúc sáng sớm thấy mình bị chấm kém dù chưa làm gì sai.
    // Trả cờ pending để app mời ghi bữa đầu tiên, và bỏ luôn lượt gọi AI.
    if (ctx.today.meals.length === 0)
      return res.json({ date, pending: true });

    const scored = computeHealthScore(ctx);
    // Chưa có mục tiêu calo thì không chấm điểm được. Báo cho app biết
    // để màn hình mời người dùng hoàn tất hồ sơ, thay vì hiện một điểm số bịa.
    if (!scored)
      return res.status(422).json({ message: "PROFILE_INCOMPLETE" });
    const { score, breakdown, weights } = scored;
    const maxScore = weights.calorie + weights.protein + weights.activity + weights.consistency;

    const prompt = buildInsightPrompt({
      contextText: contextToText(ctx),
      language,
      score,
      maxScore,
      breakdown,
      weights,
    });

    let ai = { summary: "", tips: [], warnings: [] };
    try {
      const result = await generateWithFallback(insightModels, prompt);
      ai = JSON.parse(result.response.text());
      ai = await normalizeCoachText(ai, language, (correctionPrompt) =>
        generateWithFallback(insightModels, correctionPrompt)
      );
    } catch (e) {
      // Nhánh dự phòng. AI hỏng thì vẫn phải trả điểm cho người dùng thấy.
      console.error("Coach insight AI error:", e.message);
      ai = {
        summary: language === "vi"
          ? (score >= 70 ? "Hôm nay bạn đang làm tốt, tiếp tục nhé!" : "Mình cùng đưa hôm nay trở lại đúng hướng nhé.")
          : (score >= 70 ? "You're doing well today, keep it up!" : "Let's get today on track."),
        tips: [],
        warnings: [],
      };
    }

    res.json({
      date,
      score,
      breakdown,
      // Gửi kèm điểm tối đa từng phần để app hiện được cách chia điểm,
      // vì đây là chỉ số riêng của app chứ không phải thang đo có sẵn.
      weights,
      maxScore,
      summary: ai.summary || "",
      tips: Array.isArray(ai.tips) ? ai.tips : [],
      warnings: Array.isArray(ai.warnings) ? ai.warnings : [],
      disclaimer: language === "vi"
        ? "Hướng dẫn từ AI, không phải tư vấn y khoa. Hãy gặp chuyên gia nếu bạn lo ngại về sức khỏe."
        : "AI guidance, not medical advice. Consult a professional for health concerns.",
    });
  } catch (err) {
    console.error("Coach insight error:", err.message);
    res.status(500).json({ message: "Failed to generate insight." });
  }
};

// Cờ "đang ăn" chỉ bật khi người dùng nói họ ĐANG hoặc ĐÃ ăn, và AI cũng nhận ra món.
// Chỉ khi đó app mới hiện nút Thêm để ghi món vào nhật ký.
exports.chat = async (req, res) => {
  // Bước 1. Kiểm dữ liệu gửi lên. Sai là dừng ngay, chưa tốn lượt gọi AI.
  const validated = validateCoachChat(req.body);
  if (validated.error) return res.status(400).json({ message: validated.error });
  const { message: text, image, mimeType, source, language, localDate, localHour } = validated.value;

  try {
    // Bước 2. Gom dữ liệu thật của người dùng trong hôm nay.
    // Nhờ nó mà Coach nói đúng số liệu của từng người thay vì nói chung chung.
    const [ctx, recentDocs] = await Promise.all([
      buildContext(req.user.id, localDate),
      ChatMessage.find({ user: req.user.id, language }).sort({ createdAt: -1 }).limit(10),
    ]);
    // Ngôn ngữ trả lời do CODE quyết định, không nhờ Gemini đoán.
    // Người dùng xin đổi thì đổi ngay lượt này, không xin thì giữ ngôn ngữ
    // của lượt gần nhất, cuối cùng mới tới ngôn ngữ đang chọn trong app.
    const explicitLanguage = requestedLanguage(text);
    const responseLanguage = resolveRequestedLanguage(text, recentDocs[0]?.responseLanguage || language);
    const userText = text || (responseLanguage === "vi"
      ? "Món này có phù hợp với tôi không?"
      : "Is this dish suitable for me?");
    const history = recentDocs.reverse().map((item) => ({ role: item.role, text: item.text }));
    const hour = localHour;

    // Bước 3. CỔNG CHUNG. Mọi tin nhắn phải qua đây trước khi được phép
    // tốn một lượt Gemini để trả lời nội dung.
    // Chỉ gửi ảnh mà không gõ chữ thì luôn là câu hỏi về món trong ảnh.
    // Lượt xin đổi ngôn ngữ chỉ cần lớp từ khóa, vì backend tự trả lời câu xác nhận.
    const photoOnly = !text && Boolean(image);
    const scope = photoOnly
      ? { scope: SUPPORTED, capability: "food_choice", reason: null }
      : await resolveCoachScope(
          {
            message: userText,
            history,
            hasImage: Boolean(image),
            deterministicOnly: Boolean(explicitLanguage),
            capability: explicitLanguage ? "supported_small_talk" : null,
          },
          (scopePrompt) => generateWithFallback(nutritionModels, scopePrompt)
        );
    if (scope.scope === OUT_OF_SCOPE) console.warn("Coach gate blocked a message:", scope.reason);

    // Bước 4. Gọi AI, ép kết quả về JSON, rồi dịch lại nếu trả sai ngôn ngữ.
    // Hai nhánh đầu KHÔNG gọi Gemini: ngoài phạm vi và đổi ngôn ngữ.
    // Ngoài phạm vi được xét trước, nên câu vừa xin đổi ngôn ngữ vừa hỏi
    // nội dung ngoài phạm vi sẽ nhận câu chuyển hướng bằng ngôn ngữ mới.
    let parsed;
    if (scope.scope === OUT_OF_SCOPE) {
      parsed = { intent: "out_of_scope", reply: "", meal: null, eating: false, activity: null };
    } else if (explicitLanguage) {
      parsed = {
        intent: "small_talk",
        reply: languageSwitchReply(explicitLanguage),
        meal: null,
        eating: false,
        activity: null,
      };
    } else {
      // Builder ghép chính sách, dữ liệu thật, lịch sử và schema phản hồi.
      // Chỉ dựng câu lệnh ở nhánh này, vì hai nhánh trên không gửi gì cho Gemini.
      const prompt = buildChatPrompt({
        contextText: contextToText(ctx),
        history,
        userText,
        language: responseLanguage,
        hour,
        hasImage: Boolean(image),
        source,
      });
      const payload = image
        ? [prompt, { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } }]
        : prompt;
      const result = await generateWithFallback(chatModels, payload);
      parsed = parseCoachReply(result.response.text());
      const localizedText = await normalizeCoachText(
        {
          reply: String(parsed.reply || ""),
          mealName: parsed.meal?.name ? String(parsed.meal.name) : "",
        },
        responseLanguage,
        (correctionPrompt) => generateWithFallback(insightModels, correctionPrompt)
      );
      parsed.reply = localizedText.reply;
      if (parsed.meal?.name && localizedText.mealName) parsed.meal.name = localizedText.mealName;
    }
    let { intent, reply, meal, eating, activity } = finalizeCoachReply(parsed, {
      language: responseLanguage,
      mealType: mealTypeByHour(hour),
    });

    // Câu hỏi đã qua cổng nhưng AI báo ngoài phạm vi VÀ lượt này có ảnh,
    // nghĩa là chính tấm ảnh không có món ăn. Nói đúng lý do đó thay vì
    // câu chuyển hướng chung, để người dùng biết cần gửi lại ảnh nào.
    if (image && intent === "out_of_scope" && scope.scope === SUPPORTED) {
      reply = photoNotFood(responseLanguage);
    }

    const blockedCondition = meal ? forbiddenFor(meal.name, ctx.profile.conditions) : null;
    const blockedTaste = meal ? forbiddenByTaste(meal.name, ctx.profile.tastePreferences) : null;
    if (blockedCondition || blockedTaste) {
      meal = null;
      eating = false;
      reply = blockedTaste
        ? (responseLanguage === "vi"
          ? "Món này không phù hợp với khẩu vị hoặc thực phẩm cần tránh trong hồ sơ của bạn, nên mình không tạo thẻ dinh dưỡng cho món đó."
          : "This dish conflicts with a food preference or avoidance saved in your profile, so I have not created a nutrition card for it.")
        : (responseLanguage === "vi"
          ? "Món này có thể không phù hợp với tình trạng sức khỏe bạn đã khai báo. Mình chưa tạo thẻ dinh dưỡng cho món này, bạn nên chọn lựa chọn an toàn hơn hoặc hỏi chuyên gia."
          : "This dish may not suit a health condition you declared. I have not created a nutrition card for it; choose a safer option or ask a qualified professional.");
    }

    if (intent === "exercise" && activity) {
      const reference = getExternalActivity(activity.key);
      if (reference && ctx.profile.weight) {
        const calories = computeBurned(reference.met, activity.durationMin, ctx.profile.weight);
        reply += responseLanguage === "vi"
          ? ` Với cân nặng hiện tại của bạn, ${activity.durationMin} phút được ước tính khoảng ${calories} kcal; con số thực tế thay đổi theo cường độ.`
          : ` At your current weight, ${activity.durationMin} minutes is estimated at about ${calories} kcal; the actual value varies with intensity.`;
      }
    }
    // Câu chuyển hướng phải giữ nguyên văn kể cả khi bị hỏi lại nhiều lần,
    // nên chỉ đổi cách nói cho các câu trả lời nội dung.
    if (intent !== "out_of_scope") reply = avoidDuplicateCoachReply(reply, history, responseLanguage);

    // Bước 5. Có ảnh thì đẩy lên kho ảnh, để lần sau mở lại vẫn thấy ảnh trong hội thoại.
    // Lượt bị từ chối thì KHÔNG lưu ảnh, vì app không giữ lại thứ nó không nhận xử lý.
    let imageUrl = null;
    let imagePublicId = null;
    if (image && intent !== "out_of_scope") {
      try {
        const up = await cloudinary.uploader.upload(
          `data:${mimeType || "image/jpeg"};base64,${image}`,
          { folder: "mealmate/coach", transformation: [{ width: 800, crop: "limit" }] }
        );
        imageUrl = up.secure_url;
      // Lưu mã Cloudinary để có thể xóa ảnh khi người dùng xóa lịch sử.
      imagePublicId = up.public_id;
      } catch (e) {
        console.error("Coach image upload failed:", e.message);
      }
    }

    // Bước 6. Lưu cả tin của người dùng và tin của Coach, kèm ngôn ngữ lúc trò chuyện.
    // Nhờ trường ngôn ngữ này mà đổi sang tiếng Anh sẽ không kéo theo lịch sử tiếng Việt.
    const docs = await ChatMessage.create([
      { user: req.user.id, role: "user", language, responseLanguage, text: imageUrl ? `📷 ${userText}` : userText, image: imageUrl, imagePublicId },
      { user: req.user.id, role: "coach", language, responseLanguage, text: reply, meal: meal || null, mealEating: eating },
    ]);

    res.json({ reply, meal, eating, image: imageUrl, messageId: docs[1]._id });
  } catch (err) {
    console.error("Coach chat error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Coach is unavailable right now. Please try again." });
  }
};

// Thẻ gợi ý món ở màn Trang chủ.
// Số calo còn lại tính bằng mục tiêu trừ đã ăn cộng đã đốt,
// nên tập nhiều thì được gợi ý món nhiều calo hơn.
// Nếu kế hoạch tuần đã có món cho bữa này thì AI được dặn gợi ý món KHÁC để thay thế.
exports.suggestMeal = async (req, res) => {
  try {
    const language = req.body.language === "vi" ? "vi" : "en";
    const date = String(req.body.localDate || "");
    const hour = Number(req.body.localHour);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(hour) || hour < 0 || hour > 23)
      return res.status(400).json({ message: "Valid localDate and localHour are required." });
    const ctx = await buildContext(req.user.id, date);
    const planPending = ctx.today.planMeals.filter((meal) => !meal.done);
    const eatenTypes = new Set(ctx.today.meals.map((m) => m.mealType));
    const slot = nextSlotToSuggest(hour, eatenTypes);
    const remaining = ctx.profile.calorieGoal - ctx.today.totals.calories;

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

    const prompt = buildMealSuggestionPrompt({
      contextText: contextToText(ctx),
      planText,
      language,
      hour,
      slot,
      remaining,
      planRule,
    });

    const result = await generateWithFallback(insightModels, prompt);
    const parsed = JSON.parse(result.response.text());
    const localized = await normalizeCoachText(
      {
        suggestions: (Array.isArray(parsed.suggestions) ? parsed.suggestions : []).map((item) => ({
          name: String(item?.name || ""),
          reason: String(item?.reason || ""),
        })),
      },
      language,
      (correctionPrompt) => generateWithFallback(insightModels, correctionPrompt)
    );
    const mapped = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .filter((s) => s && s.name && s.calories != null)
      .map((s, index) => ({
        name: String(localized.suggestions?.[index]?.name || s.name).trim(),
        calories: Math.max(0, Math.round(Number(s.calories) || 0)),
        protein: Math.max(0, Math.round(Number(s.protein) || 0)),
        carbs: Math.max(0, Math.round(Number(s.carbs) || 0)),
        fat: Math.max(0, Math.round(Number(s.fat) || 0)),
        reason: String(localized.suggestions?.[index]?.reason || s.reason || "").trim(),
      }));
    // Lọc theo bệnh nền lần nữa ở server, giống bước lọc trong kế hoạch tuần.
    const { kept, removed } = filterDishes(mapped, ctx.profile.conditions);
    if (removed.length)
      console.warn("Suggest condition-filter removed:", removed.map((r) => `${r.name} (${r.condition})`).join(", "));
    const suggestions = kept.slice(0, 3);
    if (!suggestions.length) throw new Error("Empty suggestions from AI");

    res.json({ mealType: slot, remaining, suggestions });
  } catch (err) {
    console.error("Coach suggest error:", err.message);
    const quota = /429|quota|rate limit|too many requests/i.test(String(err.message || ""));
    res.status(quota ? 429 : 500).json({ message: quota ? "QUOTA" : "Couldn't get suggestions right now." });
  }
};

// Lọc theo ngôn ngữ để khi đổi ngôn ngữ, màn Coach không lẫn tin của ngôn ngữ kia.
exports.getHistory = async (req, res) => {
  const language = req.query.language === "vi" ? "vi" : "en";
  const msgs = (
    await ChatMessage.find({ user: req.user.id, language }).sort({ createdAt: -1 }).limit(100)
  ).reverse();
  res.json({
    messages: msgs.map((m) => ({
      id: m._id,
      role: m.role,
      text: m.text,
      image: m.image || undefined,
      meal: m.meal || null,
      eating: m.mealEating || false,
      loggedId: m.loggedMealId || null,
      // Frontend dùng thời gian này để chia tin nhắn theo ngày.
      createdAt: m.createdAt,
    })),
  });
};

// Nút "Thêm" trên tin nhắn Coach có kèm món.
// Ghi mã món vào tin nhắn để nút giữ đúng trạng thái sau khi thoát app mở lại,
// và để nút hoàn tác biết cần xóa món nào.
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
    date: requestTodayKey(req),
  });
  msg.loggedMealId = meal._id;
  await msg.save();
  res.json({ logged: { id: meal._id, name: meal.name, mealType: meal.mealType, calories: meal.calories } });
};

// Nút hoàn tác món vừa thêm từ tin nhắn Coach.
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

// Nút xóa lịch sử trò chuyện trong màn Coach.
// Phải xóa ảnh TRƯỚC, vì xóa tin nhắn rồi thì không còn biết
// đường dẫn ảnh nào cần dọn, ảnh sẽ nằm lại trên kho mãi mãi.
// Xóa cả hai ngôn ngữ chứ không chỉ ngôn ngữ đang xem.
exports.clearHistory = async (req, res) => {
  const withImages = await ChatMessage.find({ user: req.user.id, imagePublicId: { $ne: null } }).select("imagePublicId");
  await Promise.allSettled(withImages.map((m) => cloudinary.uploader.destroy(m.imagePublicId)));
  await ChatMessage.deleteMany({ user: req.user.id });
  res.json({ message: "Chat history cleared." });
};
