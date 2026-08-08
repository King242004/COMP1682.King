// ═══ FILE NÀY LÀM GÌ ═══
// Lo màn Thông báo và chấm đỏ báo có thông báo mới trên biểu tượng chuông.
//
// Ai gọi tới: communityRoutes, tức màn Thông báo và thanh tab
// Nhận vào:   mã người dùng đang đăng nhập
// Trả ra:     danh sách thông báo, hoặc số thông báo chưa đọc
// Khi lỗi:    không có thông báo nào thì trả danh sách rỗng
//
// Có lọc bỏ thông báo đã mồ côi: người gây ra đã xóa tài khoản, hoặc thông báo
// tim mà bài đã bị xóa. Không lọc thì màn hình hiện dòng trống bấm vào không ra gì.
const Notification = require("../../models/Notification");

// ══════════════════════════════════════════════════════════
// BA CỬA VỀ THÔNG BÁO
//
// Không phải luồng. Lấy danh sách, đếm số chưa đọc, và đánh dấu đã đọc.
// ══════════════════════════════════════════════════════════

// Bỏ qua thông báo mà người gây ra đã xóa tài khoản, hoặc thông báo tim
// mà bài đã bị xóa, để màn hình không hiện dòng trống bấm vào không ra gì.
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("actor", "name avatar")
    .populate("post", "image images");

  const items = notifications
    .filter((notification) => notification.actor && (notification.type !== "like" || notification.post))
    .map((notification) => {
      const postImage = notification.post
        ? (notification.post.images || []).length
          ? notification.post.images[0].url
          : notification.post.image
        : null;

      return {
        id: notification._id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        actor: {
          id: notification.actor._id,
          name: notification.actor.name,
          avatar: notification.actor.avatar || null,
        },
        postId: notification.post ? notification.post._id : null,
        postThumb: postImage,
      };
    });

  res.json({ notifications: items });
};

// Đếm thông báo chưa đọc, cho chấm đỏ trên chuông.
// Dùng countDocuments chứ không tải cả danh sách rồi đếm, vì chỉ cần một con số.
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user.id, read: false });
  res.json({ count });
};

// Chạy tự động khi người dùng mở màn Thông báo, không cần bấm nút nào.
exports.markNotificationsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.json({ message: "Marked read." });
};
