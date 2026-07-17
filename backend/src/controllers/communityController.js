const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const User = require("../models/User");

// Upload a buffer to Cloudinary, resolve with URL + public_id (kept for deletion)
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "healthysnap/posts", transformation: [{ width: 1080, crop: "limit" }] },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(buffer);
  });
}

// Shape a post document for the client: author info + like state, no raw likes array
function shapePost(post, currentUserId) {
  const author = post.user || {};
  // Multi-image posts carry images[]; legacy single-image posts fall back to [image]
  const images = (post.images || []).length
    ? post.images.map((i) => i.url)
    : post.image
    ? [post.image]
    : [];
  return {
    id: post._id,
    caption: post.caption,
    image: images[0] || null,
    images,
    meal: post.meal && post.meal.name ? post.meal : null,
    likeCount: post.likes.length,
    isLiked: post.likes.some((id) => id.toString() === currentUserId),
    // older docs predate the saves field
    isSaved: (post.saves || []).some((id) => id.toString() === currentUserId),
    createdAt: post.createdAt,
    author: {
      id: author._id,
      name: author.name,
      avatar: author.avatar || null,
    },
  };
}

// ─── Create Post ────────────────────────────────────────────────────────────
// Instagram-style: up to 5 images per post (upload.array in the route). The
// photos are FIXED at post time — edits only touch caption/meal.
exports.createPost = async (req, res) => {
  const { caption, mealName, calories, protein, carbs, fat } = req.body;
  const files = req.files || [];

  // Instagram rule: a post ALWAYS carries at least one photo — caption and
  // meal snapshot are additions, never a substitute (keeps the grid visual)
  if (files.length === 0)
    return res.status(400).json({ message: "A post needs at least one photo." });

  if (caption && caption.length > 500)
    return res.status(400).json({ message: "Caption must be 500 characters or fewer." });

  let images = [];
  try {
    // Sequential upload keeps memory flat (each file is a buffer in RAM)
    for (const f of files.slice(0, 10)) {
      images.push(await uploadToCloudinary(f.buffer));
    }
  } catch {
    // Best-effort rollback of the ones that DID land
    await Promise.allSettled(images.map((i) => cloudinary.uploader.destroy(i.publicId)));
    return res.status(500).json({ message: "Image upload failed. Please try again." });
  }

  // Build frozen meal snapshot only if a meal name was provided
  const meal = mealName
    ? {
        name: mealName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      }
    : undefined;

  const post = await Post.create({
    user: req.user.id,
    caption: caption ? caption.trim() : "",
    // Legacy single-image fields mirror the first image (older readers)
    image: images[0]?.url || null,
    imagePublicId: images[0]?.publicId || null,
    images,
    meal,
    likes: [],
  });

  await post.populate("user", "name avatar");
  res.status(201).json({ message: "Posted.", post: shapePost(post, req.user.id) });
};

// IDs of users with a private profile — their posts are hidden from everyone
// but themselves. Returned as a list to plug into a `$nin` filter.
async function privateUserIds() {
  return User.find({ isPrivate: true }).distinct("_id");
}

// ─── Feed (strictly people I follow), paginated ──────────────────────────────
// Own posts are NOT included — an account following nobody sees an empty feed
// (own posts live in Explore and on the user's own profile).
exports.getFeed = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [following, hidden] = await Promise.all([
    Follow.find({ follower: req.user.id }).distinct("following"),
    privateUserIds(),
  ]);
  // A followed user who went private stops appearing in the feed
  const authorIds = following.filter((id) => !hidden.some((h) => h.equals(id)));

  const posts = await Post.find({ user: { $in: authorIds } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name avatar");

  res.json({ posts: posts.map((p) => shapePost(p, req.user.id)), page });
};

// ─── Explore (everyone's latest) ─────────────────────────────────────────────
exports.getExplore = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  // Hide private users' posts, but always keep my own visible to me
  const hidden = (await privateUserIds()).filter((id) => id.toString() !== req.user.id);

  const posts = await Post.find({ user: { $nin: hidden } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name avatar");

  res.json({ posts: posts.map((p) => shapePost(p, req.user.id)), page });
};

// ─── A user's posts ──────────────────────────────────────────────────────────
exports.getUserPosts = async (req, res) => {
  // A private user's posts are only visible to themselves
  if (req.params.id !== req.user.id) {
    const owner = await User.findById(req.params.id).select("isPrivate");
    if (owner?.isPrivate) return res.json({ posts: [], private: true });
  }

  const posts = await Post.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar");
  res.json({ posts: posts.map((p) => shapePost(p, req.user.id)) });
};

// ─── Delete own post ─────────────────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to delete this post." });
  // Best-effort Cloudinary cleanup — ALL images of the post (multi + legacy;
  // posts created before publicIds existed keep their files)
  const publicIds = new Set(
    [...(post.images || []).map((i) => i.publicId), post.imagePublicId].filter(Boolean)
  );
  await Promise.allSettled([...publicIds].map((id) => cloudinary.uploader.destroy(id)));
  await post.deleteOne();
  res.json({ message: "Post deleted." });
};

// ─── Single post (detail screen) ─────────────────────────────────────────────
exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", "name avatar isPrivate");
  if (!post) return res.status(404).json({ message: "Post not found." });
  // Hide a private user's post from everyone but the owner
  if (post.user?.isPrivate && post.user._id.toString() !== req.user.id)
    return res.status(403).json({ message: "This post is private." });
  res.json({ post: shapePost(post, req.user.id) });
};

// ─── Toggle save (private bookmark, WEAR-style) ──────────────────────────────
exports.toggleSave = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });

  if (!post.saves) post.saves = [];
  const idx = post.saves.findIndex((id) => id.toString() === req.user.id);
  if (idx >= 0) post.saves.splice(idx, 1);
  else post.saves.push(req.user.id);
  await post.save();

  res.json({ saved: idx < 0 });
};

// ─── My saved posts ──────────────────────────────────────────────────────────
exports.getSavedPosts = async (req, res) => {
  const posts = await Post.find({ saves: req.user.id })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar");
  res.json({ posts: posts.map((p) => shapePost(p, req.user.id)) });
};

// ─── Edit own post (caption + meal only) ─────────────────────────────────────
// Instagram rule: PHOTOS ARE FIXED once posted — editing never touches images
// (avoids partial-carousel edit complexity and accidental media loss).
exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized to edit this post." });

  if (typeof req.body.caption === "string") {
    if (req.body.caption.length > 500)
      return res.status(400).json({ message: "Caption must be 500 characters or fewer." });
    post.caption = req.body.caption.trim();
  }

  if (req.body.removeMeal === true || req.body.removeMeal === "true") post.meal = undefined;

  // A post must still carry something after the edit
  const hasImage = !!post.image || (post.images || []).length > 0;
  if (!post.caption && !hasImage && !(post.meal && post.meal.name))
    return res.status(400).json({ message: "A post needs a caption, photo, or meal." });

  await post.save();
  await post.populate("user", "name avatar");
  res.json({ message: "Post updated.", post: shapePost(post, req.user.id) });
};

// ─── Toggle like ─────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });

  const idx = post.likes.findIndex((id) => id.toString() === req.user.id);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(req.user.id);
  await post.save();

  res.json({ liked: idx < 0, likeCount: post.likes.length });
};

// ─── Follow / Unfollow ───────────────────────────────────────────────────────
exports.followUser = async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id)
    return res.status(400).json({ message: "You can't follow yourself." });

  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: "User not found." });

  // upsert avoids duplicate-key errors if already following
  await Follow.updateOne(
    { follower: req.user.id, following: targetId },
    { $setOnInsert: { follower: req.user.id, following: targetId } },
    { upsert: true }
  );
  res.json({ following: true });
};

exports.unfollowUser = async (req, res) => {
  await Follow.deleteOne({ follower: req.user.id, following: req.params.id });
  res.json({ following: false });
};

// ─── Search users by name ────────────────────────────────────────────────────
exports.searchUsers = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ users: [] });

  // Escape regex special characters from user input
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({
    _id: { $ne: req.user.id },
    name: { $regex: safe, $options: "i" },
  })
    .select("name avatar goal")
    .limit(20);

  const followingIds = await Follow.find({
    follower: req.user.id,
    following: { $in: users.map((u) => u._id) },
  }).distinct("following");
  const followingSet = new Set(followingIds.map((id) => id.toString()));

  res.json({
    users: users.map((u) => ({
      id: u._id,
      name: u.name,
      avatar: u.avatar || null,
      goal: u.goal,
      isFollowing: followingSet.has(u._id.toString()),
    })),
  });
};

// ─── Follow suggestions (same goal first, then most followed) ─────────────────
exports.getSuggestions = async (req, res) => {
  const me = await User.findById(req.user.id).select("goal");
  const followingIds = await Follow.find({ follower: req.user.id }).distinct("following");
  const exclude = [...followingIds, req.user.id];

  const candidates = await User.find({ _id: { $nin: exclude } })
    .select("name avatar goal")
    .limit(50);

  if (candidates.length === 0) return res.json({ users: [] });

  // Count followers for ranking
  const counts = await Follow.aggregate([
    { $match: { following: { $in: candidates.map((c) => c._id) } } },
    { $group: { _id: "$following", n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.n]));

  // Rank: users with the same health goal first, then by follower count
  const ranked = candidates
    .map((u) => ({
      u,
      sameGoal: me && u.goal === me.goal ? 1 : 0,
      followers: countMap.get(u._id.toString()) || 0,
    }))
    .sort((a, b) => b.sameGoal - a.sameGoal || b.followers - a.followers)
    .slice(0, 10);

  res.json({
    users: ranked.map(({ u, followers, sameGoal }) => ({
      id: u._id,
      name: u.name,
      avatar: u.avatar || null,
      goal: u.goal,
      followers,
      sameGoal: !!sameGoal,
    })),
  });
};

// Shape a list of user docs with isFollowing from the current viewer's angle
async function withFollowState(users, viewerId) {
  const ids = users.map((u) => u._id);
  const followingIds = await Follow.find({
    follower: viewerId,
    following: { $in: ids },
  }).distinct("following");
  const set = new Set(followingIds.map((id) => id.toString()));
  return users.map((u) => ({
    id: u._id,
    name: u.name,
    avatar: u.avatar || null,
    goal: u.goal,
    isFollowing: set.has(u._id.toString()),
  }));
}

// A private user's social graph (followers/following) is only visible to them
async function graphHiddenFrom(targetId, viewerId) {
  if (targetId === viewerId) return false;
  const owner = await User.findById(targetId).select("isPrivate");
  return !!owner?.isPrivate;
}

// ─── Followers of a user ──────────────────────────────────────────────────────
exports.getFollowers = async (req, res) => {
  if (await graphHiddenFrom(req.params.id, req.user.id))
    return res.json({ users: [], private: true });
  const rels = await Follow.find({ following: req.params.id })
    .sort({ createdAt: -1 })
    .populate("follower", "name avatar goal");
  const users = rels.map((r) => r.follower).filter(Boolean);
  res.json({ users: await withFollowState(users, req.user.id) });
};

// ─── Who a user follows ───────────────────────────────────────────────────────
exports.getFollowing = async (req, res) => {
  if (await graphHiddenFrom(req.params.id, req.user.id))
    return res.json({ users: [], private: true });
  const rels = await Follow.find({ follower: req.params.id })
    .sort({ createdAt: -1 })
    .populate("following", "name avatar goal");
  const users = rels.map((r) => r.following).filter(Boolean);
  res.json({ users: await withFollowState(users, req.user.id) });
};

// ─── Public profile (counts + isFollowing) ───────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select("name avatar goal createdAt isPrivate");
  if (!user) return res.status(404).json({ message: "User not found." });

  const [postCount, followers, followingCount, isFollowing] = await Promise.all([
    Post.countDocuments({ user: user._id }),
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    Follow.exists({ follower: req.user.id, following: user._id }),
  ]);

  const isMe = user._id.toString() === req.user.id;

  res.json({
    user: {
      id: user._id,
      name: user.name,
      avatar: user.avatar || null,
      goal: user.goal,
      joinedAt: user.createdAt,
    },
    stats: { postCount, followers, following: followingCount },
    isFollowing: !!isFollowing,
    isMe,
    isPrivate: !!user.isPrivate,
    // The grid is hidden when someone else views a private profile
    postsHidden: !!user.isPrivate && !isMe,
  });
};
