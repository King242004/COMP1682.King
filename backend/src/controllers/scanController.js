const axios = require("axios");
const { visionModels } = require("../config/gemini");
const { generateWithFallback } = require("../services/aiGenerate");

// ─── Scan Photo (AI Food Recognition)
// Receives an uploaded image (multer memory storage), sends to Gemini Vision,
// returns top 3 most likely food candidates with nutrition estimates.
exports.scanPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });

  try {
    // Convert image buffer to base64 for Gemini API
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    // Prompt engineered to ALWAYS return top 3 candidates as strict JSON.
    // Asking for Vietnamese names + portion-aware calorie estimates.
    const prompt = `You are a nutrition expert specializing in Vietnamese and international cuisine.
Analyze this food photo and return the top 3 most likely food matches.

For each candidate, provide:
- name: dish name (use Vietnamese name if it's a Vietnamese dish, else English)
- confidence: 0.0 to 1.0 (higher = more sure)
- calories: estimated kcal for the visible portion
- protein: grams
- carbs: grams
- fat: grams
- portionDescription: short description of portion size (e.g. "1 medium bowl", "1 plate")

Rules:
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

    res.json({
      message: "Food recognized successfully.",
      candidates: parsed.candidates || [],
    });
  } catch (err) {
    console.error("Gemini scan error:", err.message);
    res.status(500).json({ message: "AI scan failed. Please try again." });
  }
};

// ─── Scan Barcode (Open Food Facts) 
// Receives a barcode string, looks up in Open Food Facts free database.
// No API key needed.
exports.scanBarcode = async (req, res) => {
  const { barcode } = req.body;

  if (!barcode || !/^\d{8,14}$/.test(barcode))
    return res.status(400).json({ message: "Invalid barcode format." });

  try {
    // Open Food Facts REQUIRES a descriptive User-Agent or it blocks/throttles
    // requests (default axios UA gets rate-limited). Request only the fields we use.
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_en,brands,image_url,image_front_url,serving_size,serving_quantity,nutriments,status`;
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "HealthySnap/1.0 (graduation project; hoangking1124@gmail.com)" },
    });

    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ message: "Product not found in Open Food Facts database." });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    // Open Food Facts uses per-100g values; we return both per-100g and per-serving
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
    if (err.response?.status === 404) {
      return res.status(404).json({ message: "Product not found." });
    }
    console.error("Open Food Facts error:", err.message);
    res.status(500).json({ message: "Barcode lookup failed. Please try again." });
  }
};
