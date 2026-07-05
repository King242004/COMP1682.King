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
  return {
    id: post._id,
    caption: post.caption,
    image: post.image,
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
exports.createPost = async (req, res) => {
  const { caption, mealName, calories, protein, carbs, fat } = req.body;

  if ((!caption || !caption.trim()) && !req.file && !mealName)
    return res.status(400).json({ message: "Add a caption, photo, or meal to post." });

  if (caption && caption.length > 500)
    return res.status(400).json({ message: "Caption must be 500 characters or fewer." });

  let imageUrl = null;
  let imagePublicId = null;
  if (req.file) {
    try {
      const up = await uploadToCloudinary(req.file.buffer);
      imageUrl = up.url;
      imagePublicId = up.publicId;
    } catch {
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }
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
    image: imageUrl,
    imagePublicId,
    meal,
    likes: [],
  });

  await post.populate("user", "name avatar");
  res.status(201).json({ message: "Posted.", post: shapePost(post, req.user.id) });
};

// ─── Feed (people I follow + my own), paginated ──────────────────────────────
exports.getFeed = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const following = await Follow.find({ follower: req.user.id }).distinct("following");
  const authorIds = [...following, req.user.id];

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

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name avatar");

  res.json({ posts: posts.map((p) => shapePost(p, req.user.id)), page });
};

// ─── A user's posts ──────────────────────────────────────────────────────────
exports.getUserPosts = async (req, res) => {
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
  // Best-effort Cloudinary cleanup — posts created before imagePublicId existed keep their file
  if (post.imagePublicId) {
    try { await cloudinary.uploader.destroy(post.imagePublicId); } catch {}
  }
  await post.deleteOne();
  res.json({ message: "Post deleted." });
};

// ─── Single post (detail screen) ─────────────────────────────────────────────
exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", "name avatar");
  if (!post) return res.status(404).json({ message: "Post not found." });
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

// ─── Public profile (counts + isFollowing) ───────────────────────────────────
exports.getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select("name avatar goal createdAt");
  if (!user) return res.status(404).json({ message: "User not found." });

  const [postCount, followers, followingCount, isFollowing] = await Promise.all([
    Post.countDocuments({ user: user._id }),
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    Follow.exists({ follower: req.user.id, following: user._id }),
  ]);

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
    isMe: user._id.toString() === req.user.id,
  });
};
