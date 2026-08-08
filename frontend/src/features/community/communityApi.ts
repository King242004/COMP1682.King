// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa các màn Community và communityRoutes cùng bốn controller Community.
//
// Ai gọi tới: mọi màn trong thư mục community
// Nhận vào:   bài đăng, ảnh, mã người dùng, từ khóa tìm
// Trả ra:     danh sách bài, danh sách người, hoặc thông báo
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thẻ trạng thái

// Chỉ lo gọi mạng, không giữ state. Các hàm đi theo hành trình trên giao diện:
// xem feed → tương tác bài → xem người và thông báo → tạo hoặc sửa bài.
import { apiFetch, apiRequest } from "@/utils/apiClient";
import type { NutritionSource } from "@/features/meals/mealTypes";

export const MAX_POST_IMAGES = 10;

export type FeedPost = {
  id: string;
  caption: string;
  // Ảnh đầu tiên dành cho code cũ và ô bài viết trong lưới.
  image: string | null;
  // Toàn bộ ảnh của bài viết, tối đa 10 ảnh.
  images: string[];
  dishName: string | null;
  meal: MealSnapshot | null;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
};

export type MealSnapshot = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionAmount?: number | null;
  portionUnit?: string;
  portionText?: string;
  nutritionSource?: NutritionSource;
};

export type PublicProfile = {
  user: { id: string; name: string; avatar: string | null; goal: string; joinedAt: string };
  stats: { postCount: number; followers: number; following: number };
  isFollowing: boolean;
  isMe: boolean;
  isPrivate: boolean;
  // Ẩn lưới bài viết khi người khác xem một tài khoản riêng tư.
  postsHidden: boolean;
};

export type FeedPage = { posts: FeedPost[]; page: number; hasMore: boolean };

export type DiscoverUser = {
  id: string;
  name: string;
  avatar: string | null;
  goal: string;
  isFollowing?: boolean;
  followers?: number;
  sameGoal?: boolean;
};

export type Notification = {
  id: string;
  type: "like" | "follow";
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string; avatar: string | null };
  postId: string | null;
  postThumb: string | null;
};

// ══════════════════════════════════════════════════════════
// CÁC CỬA GỌI MẠNG CỦA CỘNG ĐỒNG
//
// Không phải luồng. Mỗi hàm là một cửa riêng, màn nào cần gì thì gọi cái đó.
// Tất cả đều đi qua apiClient rồi sang communityRoutes bên backend.
// Lỗi thì để nguyên cho ném lên, màn hình gọi tự lo phần hiện thông báo.
//
// Nhớ: hàm nào có gửi ẢNH thì phải dùng FormData và gọi thẳng apiFetch,
//      không dùng apiRequest được, vì apiRequest ép kiểu nội dung thành JSON.
// ══════════════════════════════════════════════════════════

// Nhét thông tin món vào FormData, dùng khi bài có kèm ảnh.
// Phải rải thành từng trường phẳng chứ không gửi cả object, vì FormData
// chỉ chở được chuỗi và file, không hiểu object lồng nhau.
// Mấy trường có thể trống thì bỏ hẳn nếu không có, chứ đừng gửi chuỗi "undefined".
function appendMeal(form: FormData, meal: MealSnapshot) {
  form.append("mealName", meal.name);
  form.append("calories", String(meal.calories));
  form.append("protein", String(meal.protein));
  form.append("carbs", String(meal.carbs));
  form.append("fat", String(meal.fat));
  if (meal.portionAmount != null) form.append("portionAmount", String(meal.portionAmount));
  if (meal.portionUnit) form.append("portionUnit", meal.portionUnit);
  if (meal.portionText) form.append("portionText", meal.portionText);
  if (meal.nutritionSource) form.append("nutritionSource", meal.nutritionSource);
}

// ─── FEED, KHÁM PHÁ VÀ BÀI VIẾT ───

// Tab Đang theo dõi. Gọi GET /community/posts/feed.
// feedController.getFeed chỉ trả bài của người đang theo dõi và lọc tài khoản riêng tư.
// hasMore cho biết còn trang sau để cuộn tiếp.
export async function getFeed(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/feed?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

// Tab Khám phá. Gọi GET /community/posts/explore.
// feedController.getExplore trả bài công khai và lọc tài khoản riêng tư.
export async function getExplore(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/explore?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

// Ô tìm người. Gọi GET /community/users/search.
// Trả tối đa 20 người kèm cờ mình đã theo dõi hay chưa.
export async function searchUsers(token: string, q: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/search?q=${encodeURIComponent(q)}`, "GET", undefined, token);
  return data.users || [];
}

// Gợi ý người nên theo dõi. Gọi GET /community/suggestions.
// socialController.getSuggestions xếp cùng mục tiêu trước, nhiều người theo dõi sau.
export async function getSuggestions(token: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/suggestions`, "GET", undefined, token);
  return data.users || [];
}

// Lưới bài trong trang cá nhân. Gọi GET /community/posts/user/:id.
// Tài khoản riêng tư thì trả rỗng kèm cờ, không báo lỗi.
export async function getUserPosts(token: string, userId: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/user/${userId}?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

// Nút tim. Gọi POST /community/posts/:id/like.
// postController.toggleLike gọi communityHelpers.addNotification hoặc xóa Notification của chủ bài.
// Trả về trạng thái mới và tổng số tim.
export async function toggleLike(token: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
  return apiRequest(`/community/posts/${postId}/like`, "POST", undefined, token);
}

// Nút lưu bài. Gọi POST /community/posts/:id/save.
// Bấm lần nữa là bỏ lưu. Khác nút tim ở chỗ KHÔNG tạo thông báo.
export async function toggleSave(token: string, postId: string): Promise<{ saved: boolean }> {
  return apiRequest(`/community/posts/${postId}/save`, "POST", undefined, token);
}

// Tab Đã lưu. Gọi GET /community/posts/saved.
export async function getSavedPosts(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/saved?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

// Mở chi tiết một bài. Gọi GET /community/posts/:id.
// postController.getPost gọi communityHelpers.postHiddenFrom để kiểm quyền xem.
export async function getPost(token: string, postId: string): Promise<FeedPost> {
  const data = await apiRequest(`/community/posts/${postId}`, "GET", undefined, token);
  return data.post;
}

// Chủ bài xóa bài. Gọi DELETE /community/posts/:id.
// postController.deletePost xóa ảnh Cloudinary và Notification trỏ tới bài.
export async function deletePost(token: string, postId: string): Promise<void> {
  await apiRequest(`/community/posts/${postId}`, "DELETE", undefined, token);
}

// ─── TRANG CÁ NHÂN VÀ THÔNG BÁO ───

// Phần đầu trang cá nhân. Gọi GET /community/users/:id.
// Trả tên, ảnh, ba con số thống kê và ba cờ trạng thái.
export async function getPublicProfile(token: string, userId: string): Promise<PublicProfile> {
  return apiRequest(`/community/users/${userId}`, "GET", undefined, token);
}

// Màn Thông báo. Gọi GET /community/notifications.
// Trả 50 thông báo mới nhất, đã bỏ các dòng hỏng.
export async function getNotifications(token: string): Promise<Notification[]> {
  const data = await apiRequest(`/community/notifications`, "GET", undefined, token);
  return data.notifications || [];
}

// Đếm thông báo chưa đọc, dùng cho chấm đỏ trên chuông.
// Gọi GET /community/notifications/unread-count.
export async function getUnreadCount(token: string): Promise<number> {
  const data = await apiRequest(`/community/notifications/unread-count`, "GET", undefined, token);
  return data.count || 0;
}

// Đánh dấu đã đọc hết. Gọi POST /community/notifications/read.
// Chạy tự động khi mở màn Thông báo, không cần bấm nút.
export async function markNotificationsRead(token: string): Promise<void> {
  await apiRequest(`/community/notifications/read`, "POST", undefined, token);
}

// Danh sách người theo dõi một tài khoản.
// Gọi GET /community/users/:id/followers.
export async function getFollowers(token: string, userId: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/${userId}/followers`, "GET", undefined, token);
  return data.users || [];
}

// Danh sách người mà một tài khoản đang theo dõi.
// Gọi GET /community/users/:id/following.
export async function getFollowing(token: string, userId: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/${userId}/following`, "GET", undefined, token);
  return data.users || [];
}

// Nút Theo dõi. Gọi POST /community/follow/:id.
// socialController.followUser lưu following/followers rồi gọi communityHelpers.addNotification.
export async function followUser(token: string, userId: string): Promise<void> {
  await apiRequest(`/community/follow/${userId}`, "POST", undefined, token);
}

// Nút Bỏ theo dõi. Gọi DELETE /community/follow/:id.
// socialController.unfollowUser xóa following/followers và Notification theo dõi.
export async function unfollowUser(token: string, userId: string): Promise<void> {
  await apiRequest(`/community/follow/${userId}`, "DELETE", undefined, token);
}

// ─── TẠO VÀ SỬA BÀI ───

// Dùng apiFetch chứ không dùng apiRequest, vì gửi file cần
// để hệ thống tự đặt kiểu nội dung. Chờ lâu vì có tới 10 ảnh.
export async function createPost(
  token: string,
  input: {
    caption?: string;
    imageUris?: string[];
    dishName?: string | null;
    meal?: MealSnapshot | null;
  }
): Promise<FeedPost> {
  const form = new FormData();
  if (input.caption) form.append("caption", input.caption);
  if (input.dishName) form.append("dishName", input.dishName);
  if (input.meal) appendMeal(form, input.meal);
  for (const uri of (input.imageUris || []).slice(0, MAX_POST_IMAGES)) {
    const filename = uri.split("/").pop() || "post.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    form.append("images", { uri, name: filename, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
  }

  const data = await apiFetch("/community/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  }, { timeoutMs: 120_000 });
  return data.post;
}

// postController.updatePost xóa Cloudinary image không còn nằm trong keepUrls.
export async function updatePost(
  token: string,
  postId: string,
  input: {
    caption: string;
    dishName?: string | null;
    meal?: MealSnapshot | null;
    removeDish?: boolean;
    removeMeal?: boolean;
  // Danh sách ảnh cũ cần giữ. Nếu bỏ qua thì giữ toàn bộ ảnh cũ.
  keepUrls?: string[];
  // Danh sách URI ảnh mới trên thiết bị cần tải lên.
  newImageUris?: string[];
  }
): Promise<FeedPost> {
  // Cắt bớt cho khớp trần ảnh mà backend đang kiểm, gửi thừa cũng bị từ chối.
  const newUris = (input.newImageUris || []).slice(0, MAX_POST_IMAGES);

  // Rẽ hai đường tùy có ảnh mới hay không.
  // Không có ảnh mới thì gửi JSON thường, nhẹ và nhanh hơn hẳn.
  // Có ảnh mới thì rơi xuống nhánh dưới, gửi FormData kèm file.
  if (newUris.length === 0) {
    const data = await apiRequest(
      `/community/posts/${postId}`,
      "PATCH",
      {
        caption: input.caption,
        ...(input.dishName != null ? { dishName: input.dishName } : {}),
        ...(input.meal
          ? {
              mealName: input.meal.name,
              calories: input.meal.calories,
              protein: input.meal.protein,
              carbs: input.meal.carbs,
              fat: input.meal.fat,
              portionAmount: input.meal.portionAmount,
              portionUnit: input.meal.portionUnit,
              portionText: input.meal.portionText,
              nutritionSource: input.meal.nutritionSource,
            }
          : {}),
        ...(input.removeDish ? { removeDish: true } : {}),
        ...(input.removeMeal ? { removeMeal: true } : {}),
        ...(input.keepUrls ? { keepUrls: input.keepUrls } : {}),
      },
      token
    );
    return data.post;
  }

  const form = new FormData();
  form.append("caption", input.caption);
  if (input.dishName != null) form.append("dishName", input.dishName);
  if (input.meal) appendMeal(form, input.meal);
  if (input.removeDish) form.append("removeDish", "true");
  if (input.removeMeal) form.append("removeMeal", "true");
  form.append("keepUrls", JSON.stringify(input.keepUrls || []));
  for (const uri of newUris) {
    const filename = uri.split("/").pop() || "post.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    form.append("images", { uri, name: filename, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
  }

  const data = await apiFetch(`/community/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  }, { timeoutMs: 120_000 });
  return data.post;
}
