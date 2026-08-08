// ═══ FILE NÀY LÀM GÌ ═══
// Khai những lựa chọn mà màn Bài tập tại nhà THỰC SỰ có.
//
// Ai gọi tới: planController, khi lọc gợi ý tập mà AI vừa dựng
// Nhận vào:   nhóm bài tập và thời lượng mà AI đề xuất
// Trả ra:     đúng hoặc sai, là app có làm được đề xuất đó không
// Khi lỗi:    không khớp thì bỏ đề xuất đó đi
//
// Vì sao cần: AI có thể gợi ý "bơi 45 phút", nhưng app không có mục bơi
// và cũng không có mốc 45 phút. Gợi ý như vậy thì người dùng bấm vào không được.
//
// ══════════════════════════════════════════════════════════
// LUẬT BÀI TẬP TẠI NHÀ
//
// Không phải luồng. Một bảng lựa chọn, một hàm kiểm, và một đoạn lời dặn cho AI.
// Đến từ coachPrompt và coachResponse.
//
// Nhớ: đây là bản sao của những gì app THẬT SỰ có. Sửa danh sách bài tập bên
//      frontend/src/features/exercise/guidedRoutines.ts thì phải sửa cả ở đây,
//      lệch là Coach gợi ý một bài mà bấm vào không mở được.
// ══════════════════════════════════════════════════════════

// Bốn nhóm bài và ba mốc thời lượng, đúng bằng những gì màn Bài tập tại nhà có.
const HOME_EXERCISE_CATEGORIES = ["everyday", "recovery", "strength", "cardio"];
// Ba mốc thời lượng. Chỉ có 10, 20, 30 phút, KHÔNG có mốc 45 phút.
const HOME_EXERCISE_DURATIONS = [10, 20, 30];

// Cửa kiểm cuối, chạy SAU khi AI đã trả lời. Lời dặn ở dưới chỉ là nhắc nhở,
// AI vẫn có thể quên, nên phải chặn lại bằng hàm này.
function isAllowedHomeExercise(category, durationMin) {
  return HOME_EXERCISE_CATEGORIES.includes(category) &&
    HOME_EXERCISE_DURATIONS.includes(Number(durationMin));
}

// Đoạn lời dặn nhét thẳng vào câu lệnh gửi cho AI, nên viết bằng tiếng Anh.
// Ba điều quan trọng nhất trong đoạn này: chỉ gợi ý trong phạm vi app có,
// KHÔNG được hứa một con số calo đốt cụ thể, và khi nói tiếng Việt thì
// gọi là "bài tập tại nhà" chứ đừng chêm chữ "routine".
const HOME_EXERCISE_GUIDE = `MealMate exercise is limited to guided, equipment-free sessions done at home.
Available categories:
- everyday: gentle daily movement, warm-up, posture and stretching
- recovery: mobility and active recovery
- strength: bodyweight strength
- cardio: low-impact indoor cardio
Available durations: 10, 20 or 30 minutes.
Proactive recommendations must stay within the at-home options above. If the user explicitly asks about another sport, you may give general safety, duration and intensity guidance without pretending MealMate tracks it.
Do not claim an exact calorie burn. Recommend a category and duration that exist above.
When replying in Vietnamese, say "bài tập tại nhà" or "buổi tập", never use the English word "routine".`;

module.exports = {
  HOME_EXERCISE_CATEGORIES,
  HOME_EXERCISE_DURATIONS,
  HOME_EXERCISE_GUIDE,
  isAllowedHomeExercise,
};
