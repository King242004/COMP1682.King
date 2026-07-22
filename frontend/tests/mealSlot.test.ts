import { mealSlotByHour } from "@/utils/mealSlot";

describe("mealSlotByHour", () => {
  test.each([
    [0, "breakfast"],
    [10, "breakfast"],
    [11, "lunch"],
    [13, "lunch"],
    [14, "snack"],
    [16, "snack"],
    [17, "dinner"],
    [20, "dinner"],
    [21, "snack"],
    [23, "snack"],
  ])("maps hour %i to %s", (hour, expected) => {
    expect(mealSlotByHour(hour)).toBe(expected);
  });
});
