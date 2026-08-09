// ═══ FILE NÀY LÀM GÌ ═══
// Lo bốn danh sách bài: Đang theo dõi, Khám phá, bài của một người, bài đã lưu.
//
// Ai gọi tới: communityRoutes, tức tab Cộng đồng và trang cá nhân
// Nhận vào:   trang cần lấy, và mã người dùng nếu xem trang của ai đó
// Trả ra:     danh sách bài đã dọn gọn, chia trang
// Khi lỗi:    không có bài nào thì trả danh sách rỗng, màn hình tự hiện
//             lời nhắc thay vì báo lỗi
//
// Điểm riêng tư: bài của tài khoản để chế độ riêng tư bị lọc bỏ khỏi
// Khám phá, xem privateUserIds trong communityHelpers.
const Post = require("../../models/Post");
const User = require("../../models/User");
const Follow = require("../../models/Follow");
const { privateUserIds, shapePost } = require("./communityHelpers");

// Đọc số trang và số bài mỗi trang từ request. Kẹp lại để người gọi không
// xin một trang khổng lồ rồi kéo cả database về trong một lượt.
function readPaging(req) {
  return {
    page: Math.max(1, parseInt(req.query.page) || 1),
    limit: Math.max(1, Math.min(50, parseInt(req.query.limit) || 20)),
  };
}

// Cả bốn danh sách đều chia trang theo cùng một cách: xin thêm 1 bài so với số
// cần, lấy về dư thì biết là còn trang sau, rồi cắt bài dư đi trước khi trả.
function sendPage(res, posts, { page, limit }, viewerId) {
  res.json({
    posts: posts.slice(0, limit).map((post) => shapePost(post, viewerId)),
    page,
    hasMore: posts.length > limit,
  });
}

// CÁC CỬA LẤY DANH SÁCH BÀI
//
// Bốn cửa: feed người mình theo dõi, khám phá,
// bài đã lưu, và bài của một người.
//
// Nhớ: cả bốn đều phải LỌC BỎ bài của tài khoản riêng tư, nhưng luôn chừa
//      bài của chính người đang xem ra. Quên lọc là lộ bài của người để riêng tư.

// Tab Đang theo dõi.
exports.getFeed = async (req, res) => {
  const paging = readPaging(req);

  const [following, hidden] = await Promise.all([
    Follow.find({ follower: req.user.id }).distinct("following"),
    privateUserIds(),
  ]);
  const authorIds = following.filter((id) => !hidden.some((hiddenId) => hiddenId.equals(id)));

  const posts = await Post.find({ user: { $in: authorIds } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((paging.page - 1) * paging.limit)
    .limit(paging.limit + 1)
    .populate("user", "name avatar");

  sendPage(res, posts, paging, req.user.id);
};

// Tab Khám phá.
// Bài của chính mình vẫn hiện dù mình để tài khoản riêng tư.
exports.getExplore = async (req, res) => {
  const paging = readPaging(req);
  // Lấy danh sách tài khoản riêng tư để loại bài của họ khỏi feed.
  // Chừa chính mình ra, kẻo bật riêng tư xong là không thấy bài của mình nữa.
  const hidden = (await privateUserIds()).filter((id) => id.toString() !== req.user.id);

  const posts = await Post.find({ user: { $nin: hidden } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((paging.page - 1) * paging.limit)
    .limit(paging.limit + 1)
    .populate("user", "name avatar");

  sendPage(res, posts, paging, req.user.id);
};

// Lưới bài trong trang cá nhân của một người.
exports.getUserPosts = async (req, res) => {
  const paging = readPaging(req);

  if (req.params.id !== req.user.id) {
    const owner = await User.findById(req.params.id).select("isPrivate");
    if (owner?.isPrivate) {
      return res.json({ posts: [], private: true, page: paging.page, hasMore: false });
    }
  }

  const posts = await Post.find({ user: req.params.id })
    .sort({ createdAt: -1, _id: -1 })
    .skip((paging.page - 1) * paging.limit)
    .limit(paging.limit + 1)
    .populate("user", "name avatar");

  sendPage(res, posts, paging, req.user.id);
};

// Tab bài đã lưu.
// Vẫn lọc bỏ tài khoản riêng tư, vì người ta có thể chuyển sang riêng tư
// sau khi mình đã lưu bài của họ.
exports.getSavedPosts = async (req, res) => {
  const paging = readPaging(req);
  // Cùng cách lọc với hàm feed ở trên: bỏ bài của tài khoản riêng tư,
  // nhưng luôn chừa bài của CHÍNH mình ra.
  const hidden = (await privateUserIds()).filter((id) => id.toString() !== req.user.id);

  const posts = await Post.find({ saves: req.user.id, user: { $nin: hidden } })
    .sort({ createdAt: -1, _id: -1 })
    .skip((paging.page - 1) * paging.limit)
    .limit(paging.limit + 1)
    .populate("user", "name avatar");

  sendPage(res, posts, paging, req.user.id);
};
