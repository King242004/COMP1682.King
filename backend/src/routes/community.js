const express = require("express");
const router = express.Router();
const multer = require("multer");
const protect = require("../middleware/auth");
const {
  createPost, getFeed, getExplore, getUserPosts, deletePost, updatePost,
  getPost, toggleLike, toggleSave, getSavedPosts,
  followUser, unfollowUser, getPublicProfile, getFollowers, getFollowing,
  searchUsers, getSuggestions,
} = require("../controllers/communityController");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.use(protect);

/**
 * @swagger
 * tags: [{ name: Community }]
 */

/**
 * @swagger
 * /community/posts:
 *   post:
 *     summary: Create a post (image + caption + optional meal snapshot)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *               caption: { type: string }
 *               mealName: { type: string }
 *               calories: { type: number }
 *               protein: { type: number }
 *               carbs: { type: number }
 *               fat: { type: number }
 *     responses:
 *       201: { description: Post created }
 */
router.post("/posts", upload.single("image"), createPost);

/**
 * @swagger
 * /community/posts/feed:
 *   get:
 *     summary: Feed from people you follow (and yourself)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: List of posts } }
 */
router.get("/posts/feed", getFeed);

/**
 * @swagger
 * /community/posts/explore:
 *   get:
 *     summary: Latest posts from everyone
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: List of posts } }
 */
router.get("/posts/explore", getExplore);

/**
 * @swagger
 * /community/posts/saved:
 *   get:
 *     summary: Posts I saved (private bookmark list)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: List of saved posts } }
 */
router.get("/posts/saved", getSavedPosts);

/**
 * @swagger
 * /community/posts/user/{id}:
 *   get:
 *     summary: Posts by a specific user
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: List of posts } }
 */
router.get("/posts/user/:id", getUserPosts);

/**
 * @swagger
 * /community/posts/{id}:
 *   delete:
 *     summary: Delete your own post
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Deleted } }
 */
router.delete("/posts/:id", deletePost);

/**
 * @swagger
 * /community/posts/{id}:
 *   patch:
 *     summary: Edit your own post (caption, image, or meal)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *               caption: { type: string }
 *               removeImage: { type: boolean }
 *               removeMeal: { type: boolean }
 *     responses: { 200: { description: Post updated } }
 */
router.patch("/posts/:id", upload.single("image"), updatePost);

/**
 * @swagger
 * /community/posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Like toggled } }
 */
router.post("/posts/:id/like", toggleLike);

/**
 * @swagger
 * /community/posts/{id}/save:
 *   post:
 *     summary: Toggle save (bookmark) on a post
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Save toggled } }
 */
router.post("/posts/:id/save", toggleSave);

/**
 * @swagger
 * /community/posts/{id}:
 *   get:
 *     summary: A single post (detail view)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: The post } }
 */
// Registered AFTER /posts/feed|explore|saved|user/:id so those literals win the match
router.get("/posts/:id", getPost);

/**
 * @swagger
 * /community/follow/{id}:
 *   post:
 *     summary: Follow a user
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Now following } }
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Unfollowed } }
 */
router.post("/follow/:id", followUser);
router.delete("/follow/:id", unfollowUser);

/**
 * @swagger
 * /community/users/search:
 *   get:
 *     summary: Search users by name
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: q, schema: { type: string } }]
 *     responses: { 200: { description: Matching users } }
 */
router.get("/users/search", searchUsers);

/**
 * @swagger
 * /community/suggestions:
 *   get:
 *     summary: Suggested users to follow (same goal first, then most followed)
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Suggested users } }
 */
router.get("/suggestions", getSuggestions);

/**
 * @swagger
 * /community/users/{id}/followers:
 *   get:
 *     summary: Users who follow this user
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Follower list } }
 */
router.get("/users/:id/followers", getFollowers);

/**
 * @swagger
 * /community/users/{id}/following:
 *   get:
 *     summary: Users this user follows
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Following list } }
 */
router.get("/users/:id/following", getFollowing);

/**
 * @swagger
 * /community/users/{id}:
 *   get:
 *     summary: Public profile with post/follower counts
 *     tags: [Community]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Public profile } }
 */
router.get("/users/:id", getPublicProfile);

module.exports = router;
