const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, default: "", maxlength: 500 },
    image: { type: String, default: null },
    // Cloudinary public_id so deletePost can remove the file (older posts lack it)
    imagePublicId: { type: String, default: null },
    // Frozen snapshot of the meal at post time — so editing/deleting the original
    // meal never breaks an existing post. Null if the post isn't about a meal.
    meal: {
      name: { type: String },
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // WEAR-style bookmark: users who saved this post to their private list
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Feed queries filter by author and sort by recency
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
