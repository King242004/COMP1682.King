const User = require("../models/User");
const { calculateTDEE, autoGoal } = require("../services/calorieGoal");

// ─── Calculate BMI ────────────────────────────────────────────────────────────
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found." });

  const bmi = calculateBMI(user.weight, user.height);
  const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel);

  res.json({
    user,
    stats: {
      bmi,
      bmiCategory: getBMICategory(bmi),
      tdee,
    },
  });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { name, gender, age, weight, height, goal, activityLevel, conditions, calorieGoal, avatar, language, tastePreferences, isPrivate, targetWeight } = req.body;

  // Validation
  if (age && (age < 10 || age > 120))
    return res.status(400).json({ message: "Age must be between 10 and 120." });

  if (weight && (weight < 20 || weight > 300))
    return res.status(400).json({ message: "Weight must be between 20 and 300 kg." });

  // null clears the target; a number must be a sane body weight
  if (targetWeight !== undefined && targetWeight !== null && (targetWeight < 20 || targetWeight > 300))
    return res.status(400).json({ message: "Target weight must be between 20 and 300 kg." });

  if (height && (height < 50 || height > 250))
    return res.status(400).json({ message: "Height must be between 50 and 250 cm." });

  if (gender && !["male", "female"].includes(gender))
    return res.status(400).json({ message: "Gender must be male or female." });

  if (goal && !["lose_weight", "gain_muscle", "eat_healthy"].includes(goal))
    return res.status(400).json({ message: "Invalid goal." });

  if (activityLevel && !["sedentary", "moderate", "active"].includes(activityLevel))
    return res.status(400).json({ message: "Invalid activity level." });

  if (language && !["vi", "en"].includes(language))
    return res.status(400).json({ message: "Language must be vi or en." });

  if (calorieGoal !== undefined && calorieGoal !== null &&
      (typeof calorieGoal !== "number" || calorieGoal < 800 || calorieGoal > 10000))
    return res.status(400).json({ message: "Calorie goal must be between 800 and 10,000 kcal." });

  // ── Calorie goal modes ────────────────────────────────────────────────────
  // calorieGoal: number → the user typed it (custom, NEVER auto-overwritten)
  // calorieGoal: null   → "Use auto": back to TDEE mode + recompute now
  // calorieGoal absent  → keep the current mode; auto mode follows body changes
  const current = await User.findById(req.user.id).select(
    "customGoal weight height age gender activityLevel goal"
  );
  if (!current) return res.status(404).json({ message: "User not found." });

  const customGoal =
    typeof calorieGoal === "number" ? true : calorieGoal === null ? false : current.customGoal;

  let finalCalorieGoal;
  if (typeof calorieGoal === "number") {
    finalCalorieGoal = calorieGoal;
  } else if (!customGoal) {
    // Recompute from the MERGED profile (incoming values win over stored ones)
    // so updating just the weight still refreshes the goal in auto mode.
    finalCalorieGoal = autoGoal({
      weight: weight ?? current.weight,
      height: height ?? current.height,
      age: age ?? current.age,
      gender: gender ?? current.gender,
      activityLevel: activityLevel ?? current.activityLevel,
      goal: goal ?? current.goal,
    });
  }

  const updated = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name: name.trim() }),
      ...(gender && { gender }),
      ...(age && { age }),
      ...(weight && { weight }),
      ...(height && { height }),
      ...(goal && { goal }),
      ...(activityLevel && { activityLevel }),
      ...(conditions && { conditions }),
      ...(finalCalorieGoal && { calorieGoal: finalCalorieGoal }),
      customGoal,
      ...(avatar !== undefined && { avatar }),
      ...(language && { language }),
      // !== undefined so an empty string can CLEAR saved preferences
      ...(tastePreferences !== undefined && { tastePreferences: String(tastePreferences).trim().slice(0, 300) }),
      ...(isPrivate !== undefined && { isPrivate: !!isPrivate }),
      ...(targetWeight !== undefined && { targetWeight }),
    },
    { new: true }
  ).select("-password");

  const bmi = calculateBMI(updated.weight, updated.height);
  const tdee = calculateTDEE(updated.weight, updated.height, updated.age, updated.gender, updated.activityLevel);

  res.json({
    message: "Profile updated successfully.",
    user: updated,
    stats: {
      bmi,
      bmiCategory: getBMICategory(bmi),
      tdee,
    },
  });
};
