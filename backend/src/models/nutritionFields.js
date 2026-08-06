// Bốn trường dinh dưỡng dùng chung cho Meal và PlanMeal.
// Hai model trải object này vào schema để database áp cùng kiểu số và giá trị tối thiểu.
// Bốn trường dinh dưỡng dùng chung cho Meal và PlanMeal.
// Hai model trải object này vào schema để database áp cùng kiểu số và giá trị tối thiểu.
module.exports = {
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, default: 0, min: 0 },
  carbs: { type: Number, default: 0, min: 0 },
  fat: { type: Number, default: 0, min: 0 },
};
