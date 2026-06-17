const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// One follow edge per pair; also speeds up "who do I follow" / "who follows me"
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

module.exports = mongoose.model("Follow", followSchema);
