// ═══ FILE NÀY LÀM GÌ ═══
// Lo quan hệ giữa người với người: theo dõi, bỏ theo dõi, tìm người,
// gợi ý người nên theo dõi, và xem trang cá nhân của người khác.
//
// Ai gọi tới: communityRoutes, tức màn Khám phá người dùng và trang cá nhân
// Nhận vào:   mã người muốn theo dõi, hoặc từ khóa tìm kiếm
// Trả ra:     kết quả theo dõi, hoặc danh sách người dùng
// Khi lỗi:    tự theo dõi chính mình thì bị chặn. Xem trang riêng tư của người
//             chưa cho phép thì chỉ thấy thông tin cơ bản, không thấy bài.
//
// Từ khóa tìm kiếm bị cắt ngắn trước khi ghép vào truy vấn, để một chuỗi
// dài vô hạn không bị ném thẳng vào bộ tìm kiếm của database.
const Follow = require("../../models/Follow");
const Notification = require("../../models/Notification");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { addNotification } = require("./communityHelpers");
const { INPUT_LIMITS } = require("../../config/inputLimits");

// Nút Theo dõi.
// Dùng upsert nên bấm nhiều lần cũng chỉ có một quan hệ, không bị trùng.
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

// Nút Bỏ theo dõi.
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

// Ô tìm người trong màn Khám phá.
exports.searchUsers = async (req, res) => {
  // Cắt từ khóa trước khi ghép vào truy vấn. Dài hơn tên cho phép thì không thể
  // khớp ai, nên đây chỉ là chặn chuỗi vô hạn bị ném thẳng vào $regex.
  if (req.query.q !== undefined && typeof req.query.q !== "string")
    return res.status(400).json({ message: "Search query must be text." });
  // Cắt từ khóa trước khi ghép vào truy vấn, chặn chuỗi dài vô hạn.
  const query = (req.query.q || "").trim().slice(0, INPUT_LIMITS.USER_SEARCH);
  if (!query) return res.json({ users: [] });

  // Vô hiệu hóa các ký tự đặc biệt trước khi ghép vào biểu thức tìm kiếm,
  // để người dùng gõ dấu chấm hay dấu sao cũng không làm hỏng câu truy vấn.
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

// Phần gợi ý người nên theo dõi trong màn Khám phá.
exports.getSuggestions = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("goal");
  const followingIds = await Follow.find({ follower: req.user.id }).distinct("following");
  // Bỏ khỏi gợi ý những người đã theo dõi, và bỏ luôn chính mình.
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

// Gắn thêm cờ đang theo dõi vào một danh sách người.
// Chỉ hỏi database MỘT lần cho cả danh sách, không hỏi từng người một.
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

// Kiểm tra có được xem danh sách theo dõi của một người không.
// Xem của chính mình thì luôn được.
async function graphHiddenFrom(targetId, viewerId) {
  if (targetId === viewerId) return false;
  const owner = await User.findById(targetId).select("isPrivate");
  return !!owner?.isPrivate;
}

// Danh sách người đang theo dõi một tài khoản.
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

// Danh sách những người mà một tài khoản đang theo dõi.
// Giống hàm trên nhưng đọc quan hệ theo chiều ngược lại.
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

// Phần đầu trang cá nhân của một người.
// Ba cờ để app biết hiện gì: isMe thì ẩn nút theo dõi,
// isFollowing đổi chữ trên nút, postsHidden thì thay lưới bài bằng dòng riêng tư.
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
