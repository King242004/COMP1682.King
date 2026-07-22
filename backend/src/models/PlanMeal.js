const mongoose = require("mongoose");

// A PLANNED meal for a future/specific day. Kept separate from Meal so the
// weekly plan never mixes into the real diary. `done` flips to true once the
// user marks it eaten (which also creates a real Meal log).
const planMealSchema = new mongoose.Schema(
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
    note: { type: String, default: "" },
    date: { type: String, required: true }, // format: "YYYY-MM-DD"
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

planMealSchema.index({ user: 1, date: 1, createdAt: 1 });

module.exports = mongoose.model("PlanMeal", planMealSchema);
