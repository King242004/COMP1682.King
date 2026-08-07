// ═══ FILE NÀY LÀM GÌ ═══
// Khóa việc thêm món trả luôn danh sách và tổng của ngày vừa ghi.
// Test đạt khi frontend không cần gọi thêm GET chỉ để cập nhật tổng dinh dưỡng.
// ═══ FILE NÀY LÀM GÌ ═══
// Khóa việc thêm món trả luôn danh sách và tổng của ngày vừa ghi.
// Test đạt khi frontend không cần gọi thêm GET chỉ để cập nhật tổng dinh dưỡng.
// Khóa hành vi: POST /meals và POST /meals/batch phải trả về CẢ NGÀY kèm tổng.
// Trước đây chúng chỉ trả món vừa thêm, nên app phải gọi thêm một lượt GET /meals
// chỉ để lấy tổng calo mới. Test này giữ cho lượt gọi thừa đó không quay lại.
jest.mock("../../src/models/Meal", () => {
  const Meal = { create: jest.fn(), insertMany: jest.fn(), find: jest.fn() };
  return Meal;
});
jest.mock("../../src/utils/dateUtils", () => ({ requestTodayKey: () => "2026-08-07" }));

const Meal = require("../../src/models/Meal");
const { addMeal, addMeals } = require("../../src/controllers/mealController");

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

// Giả lập Meal.find(...).sort(...) trả về danh sách món của ngày đó.
const mockDay = (meals) => Meal.find.mockReturnValue({ sort: () => Promise.resolve(meals) });

const validMeal = (over = {}) => ({
  name: "Phở bò",
  mealType: "breakfast",
  calories: 400,
  protein: 20,
  carbs: 50,
  fat: 10,
  date: "2026-08-07",
  ...over,
});

describe("thêm món trả về cả ngày, không cần gọi thêm lượt nữa", () => {
  beforeEach(() => jest.clearAllMocks());

  test("addMeal trả về day kèm meals và totals đã cộng đúng", async () => {
    Meal.create.mockResolvedValue({ ...validMeal(), date: "2026-08-07" });
    mockDay([
      { calories: 400, protein: 20, carbs: 50, fat: 10 },
      { calories: 600, protein: 30, carbs: 70, fat: 15 },
    ]);

    const res = response();
    await addMeal({ body: validMeal(), user: { id: "user-id" } }, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.day.date).toBe("2026-08-07");
    expect(payload.day.meals).toHaveLength(2);
    expect(payload.day.totals).toEqual({ calories: 1000, protein: 50, carbs: 120, fat: 25 });
  });

  test("addMeals cũng trả về day, đọc theo ngày của món đầu", async () => {
    Meal.insertMany.mockResolvedValue([
      { ...validMeal(), date: "2026-08-07" },
      { ...validMeal(), date: "2026-08-07" },
    ]);
    mockDay([{ calories: 400, protein: 20, carbs: 50, fat: 10 }]);

    const res = response();
    await addMeals({ body: { meals: [validMeal(), validMeal()] }, user: { id: "user-id" } }, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.day.totals.calories).toBe(400);
    expect(Meal.find).toHaveBeenCalledWith({ user: "user-id", date: "2026-08-07" });
  });

  test("ngày chưa có món nào thì totals về 0 chứ không rỗng", async () => {
    Meal.create.mockResolvedValue({ ...validMeal(), date: "2026-08-07" });
    mockDay([]);

    const res = response();
    await addMeal({ body: validMeal(), user: { id: "user-id" } }, res);

    expect(res.json.mock.calls[0][0].day.totals).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});
