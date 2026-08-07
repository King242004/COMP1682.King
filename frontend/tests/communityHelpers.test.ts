// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra nhãn khẩu phần và trạng thái theo dõi dùng trong các màn Community.
// Test khóa helper hiển thị thuần, không gọi API.
import { mealPortionLabel, resolvedFollowState } from "@/features/community/communityDisplay";

describe("mealPortionLabel", () => {
  test("prefers the portion description recorded in the diary", () => {
    expect(mealPortionLabel({ portionAmount: 250, portionUnit: "g", portionText: "1 tô vừa" }))
      .toBe("1 tô vừa");
  });

  test("falls back to amount and unit without inventing a serving", () => {
    expect(mealPortionLabel({ portionAmount: 250, portionUnit: "g" })).toBe("250 g");
    expect(mealPortionLabel({})).toBeNull();
  });
});

describe("resolvedFollowState", () => {
  test("uses the optimistic override before the server value", () => {
    const user = { id: "user-1", isFollowing: false };
    expect(resolvedFollowState({}, user)).toBe(false);
    expect(resolvedFollowState({ "user-1": true }, user)).toBe(true);
  });
});
