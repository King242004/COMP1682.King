const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerifiedAt: { type: Date, default: null },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    gender: { type: String, enum: ["male", "female"], default: null },
    age: { type: Number, default: null },
    // Cân nặng hiện tại theo kg, luôn đồng bộ với WeightLog mới nhất.
    weight: { type: Number, default: null },
    // Cân nặng mục tiêu theo kg.
    targetWeight: { type: Number, default: null },
    // Chiều cao theo cm.
    height: { type: Number, default: null },
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
    // Danh sách tình trạng sức khỏe, ví dụ tiểu đường hoặc cao huyết áp.
    conditions: [{ type: String }],
    calorieGoal: { type: Number, default: 2000 },
    customGoal: { type: Boolean, default: false },
    // Ngôn ngữ AI Coach. Nếu chưa chọn thì frontend dùng ngôn ngữ thiết bị.
    language: { type: String, enum: ["vi", "en"] },
    tastePreferences: { type: String, default: "" },
    isPrivate: { type: Boolean, default: false },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
