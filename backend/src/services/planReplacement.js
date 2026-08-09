// ═══ FILE NÀY LÀM GÌ ═══
// Thay kế hoạch của một khoảng ngày, theo thứ tự GHI TRƯỚC XÓA SAU.
//
// Ai gọi tới: planController.generatePlan, sau khi AI đã trả dữ liệu hợp lệ
//             và cả hai lớp lọc an toàn đã chạy xong
// Nhận vào:   khoảng ngày, danh sách món mới, danh sách buổi tập mới
// Trả ra:     không trả gì, chỉ ghi rồi xóa
// Khi lỗi:    ghi bản mới hỏng thì dừng luôn, kế hoạch CŨ vẫn còn nguyên
//
// Vì sao phải ghi trước xóa sau: nếu xóa trước rồi ghi mới mà ghi hỏng,
// người dùng mất sạch kế hoạch cũ và không có gì thay thế.
const PlanMeal = require("../models/PlanMeal");
const PlanWorkout = require("../models/PlanWorkout");

async function replacePlanRange(range, mealDocs, workoutDocs) {
  const newMeals = await PlanMeal.insertMany(mealDocs);
  let newWorkouts = [];
  try {
    if (workoutDocs.length) newWorkouts = await PlanWorkout.insertMany(workoutDocs);
  } catch (error) {
    await PlanMeal.deleteMany({ _id: { $in: newMeals.map((item) => item._id) } }).catch(() => {});
    throw error;
  }

  await Promise.all([
    PlanMeal.deleteMany({ ...range, _id: { $nin: newMeals.map((item) => item._id) } }),
    PlanWorkout.deleteMany({ ...range, _id: { $nin: newWorkouts.map((item) => item._id) } }),
  ]);
}

module.exports = { replacePlanRange };
