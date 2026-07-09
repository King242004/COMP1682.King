// Single source of truth for the auto calorie goal (TDEE-based).
// Used by profileController (Use auto / auto mode), weightController (weight
// sync → goal follows) and coachContext (nudge when custom goal drifts).

// Mifflin-St Jeor BMR × activity multiplier
function calculateTDEE(weight, height, age, gender, activityLevel) {
  if (!weight || !height || !age || !gender) return null;

  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const multipliers = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

// TDEE → daily goal by objective, clamped to a SAFE floor so a small person
// on lose_weight never gets a dangerously low target (standard nutrition
// guidance: ≥1200 kcal women, ≥1500 kcal men).
function goalFromTDEE(tdee, goal, gender) {
  let g;
  if (goal === "lose_weight") g = tdee - 500;
  else if (goal === "gain_muscle") g = tdee + 300;
  else g = tdee;
  const floor = gender === "male" ? 1500 : 1200;
  return Math.max(floor, g);
}

// Convenience: compute the auto goal straight from a user-like object.
// Returns null when body metrics are incomplete.
function autoGoal(u) {
  const tdee = calculateTDEE(u.weight, u.height, u.age, u.gender, u.activityLevel);
  if (!tdee) return null;
  return goalFromTDEE(tdee, u.goal, u.gender);
}

module.exports = { calculateTDEE, goalFromTDEE, autoGoal };
