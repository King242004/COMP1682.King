// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra thay kế hoạch chỉ xóa bản cũ sau khi ghi bản mới thành công.
// Model được mock để khóa thứ tự ghi/xóa và nhánh rollback an toàn.
jest.mock("../../src/models/PlanMeal", () => ({ insertMany: jest.fn(), deleteMany: jest.fn() }));
jest.mock("../../src/models/PlanWorkout", () => ({ insertMany: jest.fn(), deleteMany: jest.fn() }));

const PlanMeal = require("../../src/models/PlanMeal");
const PlanWorkout = require("../../src/models/PlanWorkout");
const { replacePlanRange } = require("../../src/services/planReplacement");

describe("replacePlanRange", () => {
  beforeEach(() => jest.clearAllMocks());

  test("keeps the old plan until both new collections are written", async () => {
    PlanMeal.insertMany.mockResolvedValue([{ _id: "new-meal" }]);
    PlanWorkout.insertMany.mockResolvedValue([{ _id: "new-workout" }]);
    PlanMeal.deleteMany.mockResolvedValue({});
    PlanWorkout.deleteMany.mockResolvedValue({});
    const range = { user: "u1", date: { $gte: "2026-08-03", $lte: "2026-08-09" } };

    await replacePlanRange(range, [{ name: "meal" }], [{ name: "workout" }]);

    expect(PlanMeal.insertMany.mock.invocationCallOrder[0])
      .toBeLessThan(PlanMeal.deleteMany.mock.invocationCallOrder[0]);
    expect(PlanWorkout.insertMany.mock.invocationCallOrder[0])
      .toBeLessThan(PlanWorkout.deleteMany.mock.invocationCallOrder[0]);
    expect(PlanMeal.deleteMany).toHaveBeenCalledWith({ ...range, _id: { $nin: ["new-meal"] } });
  });

  test("removes only the partial new data when workout insertion fails", async () => {
    PlanMeal.insertMany.mockResolvedValue([{ _id: "new-meal" }]);
    PlanWorkout.insertMany.mockRejectedValue(new Error("write failed"));
    PlanMeal.deleteMany.mockResolvedValue({});

    await expect(replacePlanRange({ user: "u1" }, [{}], [{}])).rejects.toThrow("write failed");

    expect(PlanMeal.deleteMany).toHaveBeenCalledTimes(1);
    expect(PlanMeal.deleteMany).toHaveBeenCalledWith({ _id: { $in: ["new-meal"] } });
    expect(PlanWorkout.deleteMany).not.toHaveBeenCalled();
  });
});
