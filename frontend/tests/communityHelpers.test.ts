// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra trạng thái theo dõi dùng trong các màn Community.
import { resolvedFollowState } from "@/features/community/communityDisplay";

describe("resolvedFollowState", () => {
  test("uses the optimistic override before the server value", () => {
    const user = { id: "user-1", isFollowing: false };
    expect(resolvedFollowState({}, user)).toBe(false);
    expect(resolvedFollowState({ "user-1": true }, user)).toBe(true);
  });
});
