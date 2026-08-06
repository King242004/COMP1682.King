// ═══ FILE NÀY LÀM GÌ ═══
// Thay kế hoạch của một khoảng ngày, theo thứ tự GHI TRƯỚC XÓA SAU.
//
// Ai gọi tới: planController, ở bước 6 của hàm tạo kế hoạch
// Nhận vào:   khoảng ngày, danh sách món mới, danh sách buổi tập mới
// Trả ra:     các dòng đã ghi thành công
// Khi lỗi:    ghi bản mới hỏng thì dừng luôn, kế hoạch CŨ vẫn còn nguyên
//
// Vì sao phải ghi trước xóa sau: nếu xóa trước rồi ghi mới mà ghi hỏng,
// người dùng mất sạch kế hoạch cũ và không có gì thay thế.
// planController gọi sau khi AI trả dữ liệu hợp lệ; lỗi khi ghi bản mới sẽ giữ kế hoạch cũ.
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
