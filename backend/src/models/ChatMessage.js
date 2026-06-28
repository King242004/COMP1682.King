const mongoose = require("mongoose");

// One coach chat turn (user message or coach reply), per user.
const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "coach"], required: true },
    text: { type: String, required: true },
    image: { type: String, default: null }, // Cloudinary URL for photos sent in chat
    // Suggested meal on a coach turn (so the Add card persists across reloads)
    meal: {
      type: {
        name: String, calories: Number, protein: Number, carbs: Number, fat: Number, mealType: String,
      },
      default: null,
    },
    mealEating: { type: Boolean, default: false }, // true if user is actually eating the suggested dish (show Add button)
    loggedMealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", default: null }, // set once added to diary
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
