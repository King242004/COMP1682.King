const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fat: { type: Number, default: 0, min: 0 },
    image: { type: String, default: null },
    note: { type: String, default: "" },
    date: { type: String, required: true }, // format: "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
