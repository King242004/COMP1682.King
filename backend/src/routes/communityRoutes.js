// ═══ FILE NÀY LÀM GÌ ═══
// Ánh xạ /api/community/* tới postController, feedController,
// socialController hoặc notificationController trong controllers/community.
//
// Ai gọi tới: app.js, gắn cả file này vào /api/community
// Nhận vào:   request từ tab Cộng đồng
// Trả ra:     không tự trả gì, chuyển cho post, feed, social hoặc notification
// Khi lỗi:    thiếu thẻ đăng nhập thì chặn ngay, cả file đều cần thẻ
//
// Lưu ý thứ tự khai báo: /posts/:id phải khai SAU /posts/feed và /posts/explore,
// nếu không thì chữ "feed" sẽ bị hiểu nhầm là một mã bài đăng.
//
// Bảng chia việc cho Community, địa chỉ bắt đầu bằng /api/community.
// Bài đăng, xử lý ở postController:
//   POST   /posts             đăng bài mới, kèm tối đa 10 ảnh
//   DELETE /posts/:id         chủ bài xóa bài
//   PATCH  /posts/:id         sửa bài
//   POST   /posts/:id/like    bấm tim
//   POST   /posts/:id/save    bấm lưu bài
//   GET    /posts/:id         mở chi tiết một bài
// Danh sách bài, xử lý ở feedController:
//   GET /posts/feed, /posts/explore, /posts/saved, /posts/user/:id
// Theo dõi và tìm người, xử lý ở socialController:
//   POST và DELETE /follow/:id, GET /users/search, /suggestions,
//   GET /users/:id/followers, /users/:id/following, /users/:id
// Thông báo, xử lý ở notificationController:
//   GET /notifications, /notifications/unread-count, POST /notifications/read
const express = require("express");
const protect = require("../middleware/authenticateUser");
const { createImageUpload, imageUploadLimiter } = require("../middleware/imageUpload");
const { createPost, deletePost, getPost, toggleLike, toggleSave, updatePost } = require("../controllers/community/postController");
const { getExplore, getFeed, getSavedPosts, getUserPosts } = require("../controllers/community/feedController");
const { followUser, getFollowers, getFollowing, getPublicProfile, getSuggestions, searchUsers, unfollowUser } = require("../controllers/community/socialController");
const { getNotifications, getUnreadCount, markNotificationsRead } = require("../controllers/community/notificationController");

const router = express.Router();

const upload = createImageUpload({
  maxFileBytes: 5 * 1024 * 1024,
  maxFiles: 10,
  maxFields: 10,
});
const postUploadLimiter = imageUploadLimiter(20);

router.use(protect);
// Instagram-style: up to 10 images per post
router.post("/posts", postUploadLimiter, upload.array("images", 10), createPost);
router.get("/posts/feed", getFeed);
router.get("/posts/explore", getExplore);
router.get("/posts/saved", getSavedPosts);
router.get("/posts/user/:id", getUserPosts);
router.delete("/posts/:id", deletePost);
// Caption/meal-only edits arrive as plain JSON (multer skips non-multipart);
// sửa ảnh gửi lên dạng multipart, gồm keepUrls và các file mới
router.patch("/posts/:id", postUploadLimiter, upload.array("images", 10), updatePost);
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/save", toggleSave);
// Đăng ký SAU các địa chỉ feed, explore, saved và user/:id, để những chuỗi cố định đó khớp trước
router.get("/posts/:id", getPost);
router.post("/follow/:id", followUser);
router.delete("/follow/:id", unfollowUser);
router.get("/users/search", searchUsers);
router.get("/suggestions", getSuggestions);
router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.post("/notifications/read", markNotificationsRead);
router.get("/users/:id/followers", getFollowers);
router.get("/users/:id/following", getFollowing);
router.get("/users/:id", getPublicProfile);

module.exports = router;
