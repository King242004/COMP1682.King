// Hook dùng chung cho nút theo dõi ở các danh sách người dùng.
// Nó cập nhật giao diện trước, gọi communityApi và hoàn tác nếu backend báo lỗi.
import { useCallback, useState } from "react";
import { followUser, unfollowUser, type DiscoverUser } from "../communityApi";
import { resolvedFollowState } from "../communityDisplay";

export function useFollowToggle(token: string | null) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const isFollowing = useCallback(
    (user: DiscoverUser) => resolvedFollowState(overrides, user),
    [overrides],
  );

  const toggleFollow = useCallback(async (user: DiscoverUser) => {
    if (!token) return;
    const next = !resolvedFollowState(overrides, user);
    setOverrides((current) => ({ ...current, [user.id]: next }));
    try {
      if (next) await followUser(token, user.id);
      else await unfollowUser(token, user.id);
    } catch {
      setOverrides((current) => ({ ...current, [user.id]: !next }));
    }
  }, [overrides, token]);

  const clearFollowOverrides = useCallback(() => setOverrides({}), []);

  return { isFollowing, toggleFollow, clearFollowOverrides };
}
