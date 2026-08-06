const { visionModels, nutritionModels } = require("../config/geminiModels");
const { generateWithFallback } = require("../services/aiClient");
const { hasLanguageMismatch, buildLanguageCorrectionPrompt, mergeLocalizedText } = require("../services/scanTranslation");
const { buildNutritionEstimatePrompt, normalizeEstimatedNutrition, nutritionEstimateKey } = require("../services/nutrition/nutritionEstimator");
const NutritionEstimateCache = require("../models/NutritionEstimateCache");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");

const NUTRITION_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
const BARCODE_LOOKUP_TIMEOUT_MS = 10_000;

// Nhận diện món từ ảnh và tra cứu barcode. Ảnh chỉ dùng cho request, không được lưu.
// Lượt dịch lại chỉ đổi chữ, giữ nguyên mọi con số dinh dưỡng của lượt đầu.
exports.scanPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });

  try {
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    const language = req.body.language === "vi" ? "vi" : "en";
    const languageName = language === "vi" ? "Vietnamese (tiếng Việt)" : "English";

    const prompt = `You are a nutrition expert specializing in Vietnamese and international cuisine.
Analyze this food photo and return the top 3 most likely food matches.

Required output language: ${languageName}.

For each candidate, provide:
- name: dish name in ${languageName}
- confidence: 0.0 to 1.0 (higher = more sure)
- calories: estimated kcal for the visible portion
- protein: grams
- carbs: grams
- fat: grams
- portionDescription: short description of portion size in ${languageName}

Rules:
- Every human-readable text value must use ${languageName}
- ${language === "vi"
  ? "Translate all English dish names and portion units into natural Vietnamese"
  : "Translate Vietnamese dish names into natural English; never keep Vietnamese words or diacritics"}
- Be realistic with portion sizes based on what you SEE in the photo
- Sum of confidences should sum to ~1.0
- If you can only identify 1 food clearly, still try to provide 2-3 alternatives
- If the image is not food, return: { "candidates": [], "error": "No food detected" }

Return ONLY valid JSON in this exact format:
{
  "candidates": [
    { "name": "...", "confidence": 0.9, "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "portionDescription": "..." },
    { "name": "...", "confidence": 0.07, "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "portionDescription": "..." },
    { "name": "...", "confidence": 0.03, "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "portionDescription": "..." }
  ]
}`;

    const result = await generateWithFallback(visionModels, [
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const text = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.error("Gemini returned non-JSON:", text);
      return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    if (parsed.error) {
      return res.status(422).json({ message: parsed.error, candidates: [] });
    }

    let candidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];

    // Lớp chắn ngôn ngữ. AI đôi khi vẫn trả tiếng Việt khi app đang để tiếng Anh.
    if (hasLanguageMismatch(candidates, language)) {
      try {
        const correction = await generateWithFallback(
          visionModels,
          buildLanguageCorrectionPrompt(candidates, language)
        );
        const corrected = JSON.parse(correction.response.text());
        candidates = mergeLocalizedText(candidates, corrected.candidates);
      } catch (languageErr) {
        // Dịch lại thất bại thì vẫn trả kết quả gốc, thà sai ngôn ngữ còn hơn không có gì.
        console.warn("Could not normalize scan result language:", languageErr.message);
      }
    }

    res.json({
      message: "Food recognized successfully.",
      candidates,
    });
  } catch (err) {
    console.error("Gemini scan error:", err.message);
    res.status(500).json({ message: "AI scan failed. Please try again." });
  }
};

exports.estimateNutrition = async (req, res) => {
  const items = Array.isArray(req.body.items)
    ? req.body.items.map((item) => ({
        name: String(item?.name || "").trim(),
        portion: String(item?.portion || "").trim(),
        details: String(item?.details || "").trim(),
      }))
    : [];
  const language = req.body.language === "vi" ? "vi" : "en";

  if (items.length < 1 || items.length > 8)
    return res.status(400).json({ message: "Enter between 1 and 8 meal items." });
  // Trần lịch sử, cùng bộ với mealInputValidator, vì màn Thêm món có thể gửi lại
  // đúng chuỗi đã lưu của một bản ghi cũ để ước tính lại dinh dưỡng.
  if (items.some((item) => item.name.length < 2 || item.name.length > LEGACY_LIMITS.MEAL_NAME))
    return res.status(400).json({ message: "Enter a valid name for every item." });
  if (items.some((item) => item.portion.length < 1 || item.portion.length > LEGACY_LIMITS.PORTION_TEXT))
    return res.status(400).json({ message: "Enter a valid consumed portion for every item." });
  if (items.some((item) => item.details.length > LEGACY_LIMITS.MEAL_DETAILS))
    return res.status(400).json({ message: "Ingredients and cooking details are too long." });

  try {
    const key = nutritionEstimateKey({ items, language });
    const cached = await NutritionEstimateCache.findOne({
      user: req.user.id,
      key,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (cached) {
      return res.json({ estimate: normalizeEstimatedNutrition({ items: cached.items }, items), cached: true });
    }

    const prompt = buildNutritionEstimatePrompt({ items, language });
    const result = await generateWithFallback(nutritionModels, prompt);
    const estimate = normalizeEstimatedNutrition(JSON.parse(result.response.text()), items);
    const cachedItems = estimate.items.map(({ calories, protein, carbs, fat, portionDescription }) => ({
      calories, protein, carbs, fat, portionDescription,
    }));
    await NutritionEstimateCache.findOneAndUpdate(
      { user: req.user.id, key },
      { $set: { items: cachedItems, expiresAt: new Date(Date.now() + NUTRITION_CACHE_MS) } },
      { upsert: true }
    ).catch((cacheError) => console.warn("Could not cache nutrition estimate:", cacheError.message));
    res.json({ estimate });
  } catch (err) {
    if (err.message === "AI_QUOTA_EXHAUSTED")
      return res.status(429).json({ message: "AI quota exhausted.", code: "QUOTA" });
    console.error("Nutrition estimate error:", err.message);
    res.status(500).json({ message: "Could not estimate nutrition. Please try again." });
  }
};

// Barcode dùng Open Food Facts và quy dinh dưỡng 100g về khẩu phần trên bao bì.
exports.scanBarcode = async (req, res) => {
  const { barcode } = req.body;

  if (!barcode || String(barcode).length > INPUT_LIMITS.BARCODE || !/^\d{8,14}$/.test(barcode))
    return res.status(400).json({ message: "Invalid barcode format." });

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_en,brands,image_url,image_front_url,serving_size,serving_quantity,nutriments,status`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(BARCODE_LOOKUP_TIMEOUT_MS),
      headers: { "User-Agent": "MealMate/1.0 (graduation project; hoangking1124@gmail.com)" },
    });
    if (response.status === 404) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (!response.ok) throw new Error(`Open Food Facts returned ${response.status}`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ message: "Product not found in Open Food Facts database." });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    // Kho dữ liệu luôn ghi dinh dưỡng theo 100g, nên phải nhân theo tỷ lệ khẩu phần thật.
    const servingSize = p.serving_size || "100g";
    const servingQty = parseFloat(p.serving_quantity) || 100;
    const ratio = servingQty / 100;

    res.json({
      message: "Product found.",
      product: {
        name: p.product_name || p.product_name_en || "Unknown product",
        brand: p.brands || null,
        image: p.image_url || p.image_front_url || null,
        servingSize,
        calories: Math.round((nutriments["energy-kcal_100g"] || 0) * ratio),
        protein: Math.round((nutriments.proteins_100g || 0) * ratio * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || 0) * ratio * 10) / 10,
        fat: Math.round((nutriments.fat_100g || 0) * ratio * 10) / 10,
        // Per 100g reference for users to recalculate
        per100g: {
          calories: Math.round(nutriments["energy-kcal_100g"] || 0),
          protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
        },
      },
    });
  } catch (err) {
    console.error("Open Food Facts error:", err.message);
    res.status(500).json({ message: "Barcode lookup failed. Please try again." });
  }
};
