// Deterministic daily Health Score (0–100), computed in code (NOT by the AI)
// so it's trustworthy and explainable in the report. The AI only writes the
// narrative around it.
//
// Breakdown (100 total):
//   - Calorie adherence  : 40  (how close net intake is to the goal)
//   - Protein adequacy   : 20  (protein vs ~1.6 g/kg, or 25% of calories fallback)
//   - Activity           : 20  (any workout logged today)
//   - Logging consistency: 20  (days logged in last 7)
function computeHealthScore(ctx) {
  const { profile, today, week } = ctx;
  const goal = profile.calorieGoal || 2000;
  const eaten = today.totals.calories;
  const netCalories = eaten - (today.totalBurned || 0);

  // 1) Calorie adherence — exercise burn follows the same net-calorie balance
  // shown on Home and used by the Coach.
  const deviation = goal > 0 ? Math.abs(netCalories - goal) / goal : 1;
  let calorieScore;
  if (eaten === 0) calorieScore = 0; // nothing logged
  else if (deviation <= 0.1) calorieScore = 40;
  else if (deviation >= 0.5) calorieScore = 0;
  else calorieScore = Math.round(40 * (1 - (deviation - 0.1) / 0.4));

  // 2) Protein adequacy — target 1.6 g/kg if weight known, else 25% of calorie goal
  const proteinTarget = profile.weight ? profile.weight * 1.6 : (goal * 0.25) / 4;
  const proteinRatio = proteinTarget > 0 ? Math.min(today.totals.protein / proteinTarget, 1) : 0;
  const proteinScore = Math.round(20 * proteinRatio);

  // 3) Activity — any workout logged today earns the block
  const activityScore = today.totalBurned > 0 ? 20 : 0;

  // 4) Logging consistency — proportion of last 7 days with at least one meal
  const consistencyScore = Math.round(20 * (week.loggedDays / 7));

  const total = calorieScore + proteinScore + activityScore + consistencyScore;

  return {
    score: Math.max(0, Math.min(100, total)),
    breakdown: {
      calorie: calorieScore,
      protein: proteinScore,
      activity: activityScore,
      consistency: consistencyScore,
    },
  };
}

module.exports = { computeHealthScore };
