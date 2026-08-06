// Những lựa chọn mà màn Bài tập tại nhà thực sự hỗ trợ.
// Coach dùng danh sách này để không gợi ý môn bên ngoài app.
const HOME_EXERCISE_CATEGORIES = ["everyday", "recovery", "strength", "cardio"];
const HOME_EXERCISE_DURATIONS = [10, 15, 20, 30];

function isAllowedHomeExercise(category, durationMin) {
  return HOME_EXERCISE_CATEGORIES.includes(category) &&
    HOME_EXERCISE_DURATIONS.includes(Number(durationMin));
}

const HOME_EXERCISE_GUIDE = `MealMate exercise is limited to guided, equipment-free sessions done at home.
Available categories:
- everyday: gentle daily movement, warm-up, posture and stretching
- recovery: mobility and active recovery
- strength: bodyweight strength
- cardio: low-impact indoor cardio
Available durations: 10, 15, 20 or 30 minutes.
Proactive recommendations must stay within the at-home options above. If the user explicitly asks about another sport, you may give general safety, duration and intensity guidance without pretending MealMate tracks it.
Do not claim an exact calorie burn. Recommend a category and duration that exist above.
When replying in Vietnamese, say "bài tập tại nhà" or "buổi tập", never use the English word "routine".`;

module.exports = {
  HOME_EXERCISE_CATEGORIES,
  HOME_EXERCISE_DURATIONS,
  HOME_EXERCISE_GUIDE,
  isAllowedHomeExercise,
};
