// ═══ FILE NÀY LÀM GÌ ═══
// Chấm điểm sức khỏe trong ngày, thang 100.
//
// Ai gọi tới: coachController, khi app xin điểm cho thẻ ở Trang chủ
// Nhận vào:   món đã ăn, buổi tập, mục tiêu calo của ngày đó
// Trả ra:     điểm tổng, kèm breakdown chia bốn phần
// Khi lỗi:    thiếu dữ liệu phần nào thì phần đó 0 điểm, không bịa số
//
// Điểm do CODE tính chứ không do AI chấm, nên cùng dữ liệu luôn ra cùng điểm.
// AI chỉ nhận điểm này rồi viết lời bình.
//
// CẦN NÓI RÕ KHI BẢO VỆ: đây là chỉ số tổng hợp do người làm dự án tự thiết kế,
// không phải thang đo y khoa có sẵn. Bốn trọng số là lựa chọn thiết kế.
// Vì vậy hàm luôn trả về breakdown, và giao diện phải hiện đủ bốn phần điểm
// để người dùng thấy điểm tổng được ghép từ đâu, thay vì nhận một con số kín.
const { HEALTH_SCORE_WEIGHTS, CALORIE_SCORE_DEVIATION, PROTEIN_G_PER_KG,
  PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN, ATWATER_KCAL_PER_GRAM } = require("../../config/nutritionConstants");

function computeHealthScore(ctx) {
  const { profile, today, week } = ctx;
  const W = HEALTH_SCORE_WEIGHTS;
  const goal = profile.calorieGoal;
  // Không có mục tiêu thì không chấm được, và không được bịa ra một mục tiêu.
  if (!goal || goal <= 0) return null;

  const eaten = today.totals.calories;
  const deviation = Math.abs(eaten - goal) / goal;
  const { full, zero } = CALORIE_SCORE_DEVIATION;
  let calorieScore;
  // Không có món nào được ghi thì điểm calo bằng 0.
  if (eaten === 0) calorieScore = 0;
  else if (deviation <= full) calorieScore = W.calorie;
  else if (deviation >= zero) calorieScore = 0;
  else calorieScore = Math.round(W.calorie * (1 - (deviation - full) / (zero - full)));

  // Mức đạm cần tính theo cân nặng. Chưa nhập cân nặng thì ước theo tỷ lệ calo.
  // Dùng hằng số tập trung để không lặp lại con số trong công thức.
  const proteinTarget = profile.weight
    ? profile.weight * PROTEIN_G_PER_KG
    : (goal * PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN) / ATWATER_KCAL_PER_GRAM.protein;
  const proteinRatio = proteinTarget > 0 ? Math.min(today.totals.protein / proteinTarget, 1) : 0;
  const proteinScore = Math.round(W.protein * proteinRatio);

  const activityScore = today.totalBurned > 0 ? W.activity : 0;

  // Chia cho số ngày tài khoản đã tồn tại chứ không chia cứng cho 7.
  // Tài khoản 2 ngày ghi đủ cả 2 ngày phải được điểm tối đa, vì họ không
  // bỏ sót ngày nào kể từ lúc cài app. Chặn trần 1 để dữ liệu lạ không vượt điểm.
  // Không dùng `|| 7` vì số 0 sẽ bị coi là thiếu dữ liệu rồi nhảy về 7.
  const rawEligible = Number.isFinite(week.eligibleDays) ? week.eligibleDays : 7;
  const eligibleDays = Math.min(7, Math.max(1, rawEligible));
  const consistencyScore = Math.round(W.consistency * Math.min(week.loggedDays / eligibleDays, 1));

  const total = calorieScore + proteinScore + activityScore + consistencyScore;
  const max = W.calorie + W.protein + W.activity + W.consistency;

  return {
    score: Math.max(0, Math.min(max, total)),
    breakdown: {
      calorie: calorieScore,
      protein: proteinScore,
      activity: activityScore,
      consistency: consistencyScore,
    },
    // Gửi kèm trọng số tối đa để giao diện hiện được dạng "32 trên 40".
    weights: W,
  };
}

module.exports = { computeHealthScore };
