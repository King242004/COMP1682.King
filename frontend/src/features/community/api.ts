import { apiFetch, apiRequest } from "@/utils/api";

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

export async function getFeed(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/feed?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

export async function getExplore(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/explore?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

export type DiscoverUser = {
  id: string;
  name: string;
  avatar: string | null;
  goal: string;
  isFollowing?: boolean;
  followers?: number;
  sameGoal?: boolean;
};

export async function searchUsers(token: string, q: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/search?q=${encodeURIComponent(q)}`, "GET", undefined, token);
  return data.users || [];
}

export async function getSuggestions(token: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/suggestions`, "GET", undefined, token);
  return data.users || [];
}

export async function getUserPosts(token: string, userId: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/user/${userId}?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

export async function toggleLike(token: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
  return apiRequest(`/community/posts/${postId}/like`, "POST", undefined, token);
}

export async function toggleSave(token: string, postId: string): Promise<{ saved: boolean }> {
  return apiRequest(`/community/posts/${postId}/save`, "POST", undefined, token);
}

export async function getSavedPosts(token: string, page = 1): Promise<FeedPage> {
  const data = await apiRequest(`/community/posts/saved?page=${page}`, "GET", undefined, token);
  return { posts: data.posts || [], page: data.page || page, hasMore: !!data.hasMore };
}

export async function getPost(token: string, postId: string): Promise<FeedPost> {
  const data = await apiRequest(`/community/posts/${postId}`, "GET", undefined, token);
  return data.post;
}

export async function deletePost(token: string, postId: string): Promise<void> {
  await apiRequest(`/community/posts/${postId}`, "DELETE", undefined, token);
}

export async function getPublicProfile(token: string, userId: string): Promise<PublicProfile> {
  return apiRequest(`/community/users/${userId}`, "GET", undefined, token);
}

export type Notification = {
  id: string;
  type: "like" | "follow";
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string; avatar: string | null };
  postId: string | null;
  postThumb: string | null;
};

export async function getNotifications(token: string): Promise<Notification[]> {
  const data = await apiRequest(`/community/notifications`, "GET", undefined, token);
  return data.notifications || [];
}

export async function getUnreadCount(token: string): Promise<number> {
  const data = await apiRequest(`/community/notifications/unread-count`, "GET", undefined, token);
  return data.count || 0;
}

export async function markNotificationsRead(token: string): Promise<void> {
  await apiRequest(`/community/notifications/read`, "POST", undefined, token);
}

export async function getFollowers(token: string, userId: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/${userId}/followers`, "GET", undefined, token);
  return data.users || [];
}

export async function getFollowing(token: string, userId: string): Promise<DiscoverUser[]> {
  const data = await apiRequest(`/community/users/${userId}/following`, "GET", undefined, token);
  return data.users || [];
}

export async function followUser(token: string, userId: string): Promise<void> {
  await apiRequest(`/community/follow/${userId}`, "POST", undefined, token);
}

export async function unfollowUser(token: string, userId: string): Promise<void> {
  await apiRequest(`/community/follow/${userId}`, "DELETE", undefined, token);
}

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
  if (input.meal) {
    form.append("mealName", input.meal.name);
    form.append("calories", String(input.meal.calories));
    form.append("protein", String(input.meal.protein));
    form.append("carbs", String(input.meal.carbs));
    form.append("fat", String(input.meal.fat));
  }
  for (const uri of (input.imageUris || []).slice(0, 10)) {
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
  const newUris = (input.newImageUris || []).slice(0, 10);

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
  if (input.meal) {
    form.append("mealName", input.meal.name);
    form.append("calories", String(input.meal.calories));
    form.append("protein", String(input.meal.protein));
    form.append("carbs", String(input.meal.carbs));
    form.append("fat", String(input.meal.fat));
  }
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
