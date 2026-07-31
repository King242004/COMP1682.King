const express = require("express");
const protect = require("../middleware/auth");
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
// photo edits arrive as multipart with keepUrls + new files
router.patch("/posts/:id", postUploadLimiter, upload.array("images", 10), updatePost);
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/save", toggleSave);
// Registered AFTER /posts/feed|explore|saved|user/:id so those literals win the match
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
