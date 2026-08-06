const cloudinary = require("../../config/cloudinary");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

// File này chứa các việc dùng chung cho cả bốn controller của Community.

// Tạo một thông báo. Bấm tim rồi bỏ tim rồi bấm lại cũng chỉ có MỘT thông báo,
// nhờ upsert cộng với chỉ mục duy nhất trong model Notification.
// Tự bấm tim bài của mình thì không tạo thông báo.
async function addNotification({ user, actor, type, post = null }) {
  if (user.toString() === actor.toString()) return;
  try {
    await Notification.updateOne(
      { user, actor, type, post },
      { $setOnInsert: { user, actor, type, post }, $set: { read: false } },
      { upsert: true }
    );
  } catch {
  // Tạo thông báo hỏng thì bỏ qua. Lượt tim đã lưu rồi,
  // không được vì mất thông báo mà làm hỏng cả nút tim.
  }
}

// Đẩy một ảnh bài đăng lên kho ảnh, thu về tối đa 1080 pixel chiều ngang.
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mealmate/posts", transformation: [{ width: 1080, crop: "limit" }] },
      (err, result) =>
        err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

// Hai cờ được tính ở server để app không phải tự dò trong danh sách mã người tim.
// Bài cũ chỉ có một ảnh nên phải gộp về cùng dạng mảng ảnh.
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

// Danh sách mã của mọi tài khoản để riêng tư. Các hàm lấy danh sách bài
// dùng nó để loại bài của những người này ra khỏi feed.
async function privateUserIds() {
  return User.find({ isPrivate: true }).distinct("_id");
}

// Kiểm tra một bài có bị giấu với người đang xem không.
// Bài của chính mình thì luôn xem được, dù tài khoản để riêng tư.
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
