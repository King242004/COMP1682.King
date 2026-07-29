const cloudinary = require("../../config/cloudinary");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

async function addNotification({ user, actor, type, post = null }) {
  if (user.toString() === actor.toString()) return;
  try {
    await Notification.updateOne(
      { user, actor, type, post },
      { $setOnInsert: { user, actor, type, post }, $set: { read: false } },
      { upsert: true }
    );
  } catch {
    // A failed notification must never break the like or follow action.
  }
}

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "healthysnap/posts", transformation: [{ width: 1080, crop: "limit" }] },
      (err, result) =>
        err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

function shapePost(post, currentUserId) {
  const author = post.user || {};
  const images = (post.images || []).length
    ? post.images.map((image) => image.url)
    : post.image
    ? [post.image]
    : [];

  return {
    id: post._id,
    caption: post.caption,
    image: images[0] || null,
    images,
    dishName: post.dishName || post.meal?.name || null,
    meal: post.meal && post.meal.name ? post.meal : null,
    likeCount: post.likes.length,
    isLiked: post.likes.some((id) => id.toString() === currentUserId),
    isSaved: (post.saves || []).some((id) => id.toString() === currentUserId),
    createdAt: post.createdAt,
    author: {
      id: author._id,
      name: author.name,
      avatar: author.avatar || null,
    },
  };
}

async function privateUserIds() {
  return User.find({ isPrivate: true }).distinct("_id");
}

async function postHiddenFrom(post, viewerId) {
  if (post.user.toString() === viewerId) return false;
  const owner = await User.findById(post.user).select("isPrivate");
  return !!owner?.isPrivate;
}

module.exports = {
  addNotification,
  postHiddenFrom,
  privateUserIds,
  shapePost,
  uploadToCloudinary,
};
