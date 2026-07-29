const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Who triggered it
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "follow"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, actor: 1, type: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Notification", notificationSchema);
