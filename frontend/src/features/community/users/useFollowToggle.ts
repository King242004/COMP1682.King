// ═══ FILE NÀY LÀM GÌ ═══
// Hook dùng chung cho nút theo dõi ở mọi danh sách người dùng.
//
// Ai gọi tới: CommunityUserList, UserProfileScreen, DiscoverScreen
// Nhận vào:   mã người muốn theo dõi
// Trả ra:     trạng thái theo dõi mới
// Khi lỗi:    đổi giao diện TRƯỚC, gọi mạng hụt thì lật ngược lại
//
// Nhớ: hook này KHÔNG sửa danh sách người mà màn đang giữ. Nó giữ riêng một bảng
//      đè, khóa là mã người, giá trị là trạng thái mới. Nhờ vậy màn nào cũng
//      dùng được mà không cần biết danh sách của nó hình dạng ra sao.
import { useCallback, useState } from "react";
import { followUser, unfollowUser, type DiscoverUser } from "../communityApi";
import { resolvedFollowState } from "../communityDisplay";

// ══════════════════════════════════════════════════════════
// BẤM THEO DÕI
//
// Đến từ nút Theo dõi ở màn Khám phá và màn danh sách người.
// Bốn bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì chữ trên nút đổi ngay, còn backend chạy theo sau.
// ══════════════════════════════════════════════════════════

// BẤM THEO DÕI BƯỚC 1. Bảng đè, khóa là mã người, giá trị là trạng thái mới.
// Chỉ chứa những người vừa bị bấm, chứ không chứa cả danh sách.
export function useFollowToggle(token: string | null) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // BẤM THEO DÕI BƯỚC 2. Trả trạng thái để vẽ nút.
  // Có trong bảng đè thì lấy giá trị đè, không có thì lấy giá trị backend đưa về.
  const isFollowing = useCallback(
    (user: DiscoverUser) => resolvedFollowState(overrides, user),
    [overrides],
  );

  // BẤM THEO DÕI BƯỚC 3. Người dùng bấm nút.
  // Ghi vào bảng đè TRƯỚC, nên nút đổi chữ ngay, chưa chờ mạng.
  const toggleFollow = useCallback(async (user: DiscoverUser) => {
    if (!token) return;
    const next = !resolvedFollowState(overrides, user);
    setOverrides((current) => ({ ...current, [user.id]: next }));
    try {
      // Giờ mới gửi lệnh thật rồi CHỜ.
      // Đường đi: followUser hoặc unfollowUser → apiClient
      //           → POST hoặc DELETE /community/users/:id/follow
      //           → socialController.followUser hoặc unfollowUser
      if (next) await followUser(token, user.id);
      else await unfollowUser(token, user.id);
    } catch {
      // Gửi hụt thì lật ngược giá trị đè lại.
      setOverrides((current) => ({ ...current, [user.id]: !next }));
    }
  }, [overrides, token]);

  // BẤM THEO DÕI BƯỚC 4. Xóa sạch bảng đè.
  // Màn gọi hàm này sau khi vừa tải lại danh sách, vì lúc đó dữ liệu backend
  // đã là mới nhất, giữ bảng đè cũ lại chỉ tổ đè nhầm.
  const clearFollowOverrides = useCallback(() => setOverrides({}), []);

  return { isFollowing, toggleFollow, clearFollowOverrides };
}
