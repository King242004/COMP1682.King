function computeHealthScore(ctx) {
  const { profile, today, week } = ctx;
  const goal = profile.calorieGoal || 2000;
  const eaten = today.totals.calories;
  const netCalories = eaten - (today.totalBurned || 0);

  const deviation = goal > 0 ? Math.abs(netCalories - goal) / goal : 1;
  let calorieScore;
  // Không có món nào được ghi thì điểm calo bằng 0.
  if (eaten === 0) calorieScore = 0;
  else if (deviation <= 0.1) calorieScore = 40;
  else if (deviation >= 0.5) calorieScore = 0;
  else calorieScore = Math.round(40 * (1 - (deviation - 0.1) / 0.4));

  const proteinTarget = profile.weight ? profile.weight * 1.6 : (goal * 0.25) / 4;
  const proteinRatio = proteinTarget > 0 ? Math.min(today.totals.protein / proteinTarget, 1) : 0;
  const proteinScore = Math.round(20 * proteinRatio);

  const activityScore = today.totalBurned > 0 ? 20 : 0;

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
