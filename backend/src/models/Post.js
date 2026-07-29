const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String, default: "", maxlength: 500 },
    image: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
      },
    ],
    dishName: { type: String, trim: true, maxlength: 100, default: null },
    meal: {
      name: { type: String },
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Feed queries filter by author and sort by recency
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
