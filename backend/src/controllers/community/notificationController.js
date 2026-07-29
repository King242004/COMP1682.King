const Notification = require("../../models/Notification");

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

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user.id, read: false });
  res.json({ count });
};

exports.markNotificationsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.json({ message: "Marked read." });
};
