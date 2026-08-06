// Thay kế hoạch trong một khoảng ngày mà không xóa bản cũ trước.
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
