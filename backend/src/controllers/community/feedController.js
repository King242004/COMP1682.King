const Post = require("../../models/Post");
const User = require("../../models/User");
const Follow = require("../../models/Follow");
const { privateUserIds, shapePost } = require("./helpers");

exports.getFeed = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  const [following, hidden] = await Promise.all([
    Follow.find({ follower: req.user.id }).distinct("following"),
    privateUserIds(),
  ]);
  const authorIds = following.filter((id) => !hidden.some((hiddenId) => hiddenId.equals(id)));

  const posts = await Post.find({ user: { $in: authorIds } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .populate("user", "name avatar");

  const hasMore = posts.length > limit;
  res.json({
    posts: posts.slice(0, limit).map((post) => shapePost(post, req.user.id)),
    page,
    hasMore,
  });
};

exports.getExplore = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const hidden = (await privateUserIds()).filter((id) => id.toString() !== req.user.id);

  const posts = await Post.find({ user: { $nin: hidden } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .populate("user", "name avatar");

  const hasMore = posts.length > limit;
  res.json({
    posts: posts.slice(0, limit).map((post) => shapePost(post, req.user.id)),
    page,
    hasMore,
  });
};

exports.getUserPosts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);

  if (req.params.id !== req.user.id) {
    const owner = await User.findById(req.params.id).select("isPrivate");
    if (owner?.isPrivate) {
      return res.json({ posts: [], private: true, page, hasMore: false });
    }
  }

  const posts = await Post.find({ user: req.params.id })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .populate("user", "name avatar");

  const hasMore = posts.length > limit;
  res.json({
    posts: posts.slice(0, limit).map((post) => shapePost(post, req.user.id)),
    page,
    hasMore,
  });
};

exports.getSavedPosts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const hidden = (await privateUserIds()).filter((id) => id.toString() !== req.user.id);

  const posts = await Post.find({ saves: req.user.id, user: { $nin: hidden } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .populate("user", "name avatar");

  const hasMore = posts.length > limit;
  res.json({
    posts: posts.slice(0, limit).map((post) => shapePost(post, req.user.id)),
    page,
    hasMore,
  });
};
