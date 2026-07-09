const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    gender: { type: String, enum: ["male", "female"], default: null },
    age: { type: Number, default: null },
    weight: { type: Number, default: null }, // kg — kept in sync with the newest WeightLog
    targetWeight: { type: Number, default: null }, // kg — goal weight for the journey
    height: { type: Number, default: null }, // cm
    goal: {
      type: String,
      enum: ["lose_weight", "gain_muscle", "eat_healthy"],
      default: "eat_healthy",
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "moderate", "active"],
      default: "moderate",
    },
    conditions: [{ type: String }], // e.g. ["diabetes", "hypertension"]
    calorieGoal: { type: Number, default: 2000 },
    // true = the user typed their own calorie goal (Settings) — the app must
    // NEVER auto-recalculate over it. false = goal follows TDEE automatically.
    customGoal: { type: Boolean, default: false },
    language: { type: String, enum: ["vi", "en"] }, // AI Coach reply language (unset = follow device)
    // Saved taste preferences ("không ăn hải sản, thích gà") — read by ALL AI
    // features (meal suggestions, weekly plan, coach) so the user types it once.
    tastePreferences: { type: String, default: "" },
    // Private profile: when true, this user's posts are hidden from Explore,
    // other people's feeds, and their public profile (only the owner sees them).
    isPrivate: { type: Boolean, default: false },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
