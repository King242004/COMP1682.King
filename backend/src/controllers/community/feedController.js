const Post = require("../../models/Post");
const User = require("../../models/User");
const Follow = require("../../models/Follow");
const { privateUserIds, shapePost } = require("./communityHelpers");

// File này lo bốn danh sách bài: Đang theo dõi, Khám phá, bài của một người, bài đã lưu.
// Cả bốn đều chia trang theo cùng một cách: xin thêm 1 bài so với số cần,
// nếu lấy về dư thì biết là còn trang sau, rồi cắt bớt bài dư đi.

// Tab Đang theo dõi.
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

// Tab Khám phá.
// Bài của chính mình vẫn hiện dù mình để tài khoản riêng tư.
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

// Lưới bài trong trang cá nhân của một người.
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

// Tab bài đã lưu.
// Vẫn lọc bỏ tài khoản riêng tư, vì người ta có thể chuyển sang riêng tư
// sau khi mình đã lưu bài của họ.
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
