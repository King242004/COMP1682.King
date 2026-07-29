const Follow = require("../../models/Follow");
const Notification = require("../../models/Notification");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { addNotification } = require("./helpers");

exports.followUser = async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) {
    return res.status(400).json({ message: "You can't follow yourself." });
  }

  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: "User not found." });

  await Follow.updateOne(
    { follower: req.user.id, following: targetId },
    { $setOnInsert: { follower: req.user.id, following: targetId } },
    { upsert: true }
  );
  await addNotification({ user: targetId, actor: req.user.id, type: "follow" });
  res.json({ following: true });
};

exports.unfollowUser = async (req, res) => {
  await Follow.deleteOne({ follower: req.user.id, following: req.params.id });
  await Notification.deleteOne({
    user: req.params.id,
    actor: req.user.id,
    type: "follow",
    post: null,
  });
  res.json({ following: false });
};

exports.searchUsers = async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) return res.json({ users: [] });

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({
    _id: { $ne: req.user.id },
    name: { $regex: safeQuery, $options: "i" },
  })
    .select("name avatar goal")
    .limit(20);

  const followingIds = await Follow.find({
    follower: req.user.id,
    following: { $in: users.map((user) => user._id) },
  }).distinct("following");
  const followingSet = new Set(followingIds.map((id) => id.toString()));

  res.json({
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar || null,
      goal: user.goal,
      isFollowing: followingSet.has(user._id.toString()),
    })),
  });
};

exports.getSuggestions = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("goal");
  const followingIds = await Follow.find({ follower: req.user.id }).distinct("following");
  const excludedIds = [...followingIds, req.user.id];

  const candidates = await User.find({ _id: { $nin: excludedIds } })
    .select("name avatar goal")
    .limit(50);

  if (candidates.length === 0) return res.json({ users: [] });

  const counts = await Follow.aggregate([
    { $match: { following: { $in: candidates.map((candidate) => candidate._id) } } },
    { $group: { _id: "$following", n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((count) => [count._id.toString(), count.n]));

  const ranked = candidates
    .map((user) => ({
      user,
      sameGoal: currentUser && user.goal === currentUser.goal ? 1 : 0,
      followers: countMap.get(user._id.toString()) || 0,
    }))
    .sort((a, b) => b.sameGoal - a.sameGoal || b.followers - a.followers)
    .slice(0, 10);

  res.json({
    users: ranked.map(({ user, followers, sameGoal }) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar || null,
      goal: user.goal,
      followers,
      sameGoal: !!sameGoal,
    })),
  });
};

async function withFollowState(users, viewerId) {
  const userIds = users.map((user) => user._id);
  const followingIds = await Follow.find({
    follower: viewerId,
    following: { $in: userIds },
  }).distinct("following");
  const followingSet = new Set(followingIds.map((id) => id.toString()));

  return users.map((user) => ({
    id: user._id,
    name: user.name,
    avatar: user.avatar || null,
    goal: user.goal,
    isFollowing: followingSet.has(user._id.toString()),
  }));
}

async function graphHiddenFrom(targetId, viewerId) {
  if (targetId === viewerId) return false;
  const owner = await User.findById(targetId).select("isPrivate");
  return !!owner?.isPrivate;
}

exports.getFollowers = async (req, res) => {
  if (await graphHiddenFrom(req.params.id, req.user.id)) {
    return res.json({ users: [], private: true });
  }

  const relationships = await Follow.find({ following: req.params.id })
    .sort({ createdAt: -1 })
    .populate("follower", "name avatar goal");
  const users = relationships.map((relationship) => relationship.follower).filter(Boolean);
  res.json({ users: await withFollowState(users, req.user.id) });
};

exports.getFollowing = async (req, res) => {
  if (await graphHiddenFrom(req.params.id, req.user.id)) {
    return res.json({ users: [], private: true });
  }

  const relationships = await Follow.find({ follower: req.params.id })
    .sort({ createdAt: -1 })
    .populate("following", "name avatar goal");
  const users = relationships.map((relationship) => relationship.following).filter(Boolean);
  res.json({ users: await withFollowState(users, req.user.id) });
};

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
    postsHidden: !!user.isPrivate && !isMe,
  });
};
