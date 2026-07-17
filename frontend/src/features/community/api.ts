import { apiRequest, BASE_URL } from "@/utils/api";

export type FeedPost = {
  id: string;
  caption: string;
  image: string | null;   // first image (legacy readers / grid tile)
  images: string[];       // all images, Instagram-style (max 5)
  meal: { name: string; calories: number; protein: number; carbs: number; fat: number } | null;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
};

export type PublicProfile = {
  user: { id: string; name: string; avatar: string | null; goal: string; joinedAt: string };
  stats: { postCount: number; followers: number; following: number };
  isFollowing: boolean;
  isMe: boolean;
  isPrivate: boolean;
  postsHidden: boolean; // true when someone else views a private profile → hide the grid
};

export async function getFeed(token: string, page = 1): Promise<FeedPost[]> {
  const data = await apiRequest(`/community/posts/feed?page=${page}`, "GET", undefined, token);
  return data.posts || [];
}

export async function getExplore(token: string, page = 1): Promise<FeedPost[]> {
  const data = await apiRequest(`/community/posts/explore?page=${page}`, "GET", undefined, token);
  return data.posts || [];
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

export async function getUserPosts(token: string, userId: string): Promise<FeedPost[]> {
  const data = await apiRequest(`/community/posts/user/${userId}`, "GET", undefined, token);
  return data.posts || [];
}

export async function toggleLike(token: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
  return apiRequest(`/community/posts/${postId}/like`, "POST", undefined, token);
}

export async function toggleSave(token: string, postId: string): Promise<{ saved: boolean }> {
  return apiRequest(`/community/posts/${postId}/save`, "POST", undefined, token);
}

export async function getSavedPosts(token: string): Promise<FeedPost[]> {
  const data = await apiRequest(`/community/posts/saved`, "GET", undefined, token);
  return data.posts || [];
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

// Create a post — multipart because it may include images (max 5, Instagram-style)
export async function createPost(
  token: string,
  input: {
    caption?: string;
    imageUris?: string[];
    meal?: { name: string; calories: number; protein: number; carbs: number; fat: number } | null;
  }
): Promise<FeedPost> {
  const form = new FormData();
  if (input.caption) form.append("caption", input.caption);
  if (input.meal) {
    form.append("mealName", input.meal.name);
    form.append("calories", String(input.meal.calories));
    form.append("protein", String(input.meal.protein));
    form.append("carbs", String(input.meal.carbs));
    form.append("fat", String(input.meal.fat));
  }
  for (const uri of (input.imageUris || []).slice(0, 5)) {
    const filename = uri.split("/").pop() || "post.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    form.append("images", { uri, name: filename, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
  }

  const res = await fetch(`${BASE_URL}/community/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to post");
  return data.post;
}

// Edit an existing post — caption + meal only (photos are FIXED at post time,
// Instagram rule) → plain JSON, no multipart needed anymore.
export async function updatePost(
  token: string,
  postId: string,
  input: {
    caption: string;
    removeMeal?: boolean; // drop the attached meal snapshot
  }
): Promise<FeedPost> {
  const data = await apiRequest(
    `/community/posts/${postId}`,
    "PATCH",
    { caption: input.caption, ...(input.removeMeal ? { removeMeal: true } : {}) },
    token
  );
  return data.post;
}
