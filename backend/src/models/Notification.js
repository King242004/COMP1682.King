const mongoose = require("mongoose");

// In-app community notification: someone liked your post or followed you.
// A record is created on the positive action (like/follow) and removed on the
// reverse (unlike/unfollow), so the list always reflects the real state.
// Remote push (buzzing the phone while the app is closed) is out of scope —
// these show when the recipient opens the app.
const notificationSchema = new mongoose.Schema(
  {
    // Who receives the notification
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Who triggered it
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "follow"], required: true },
    // Only set for "like" — the post that was liked
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Recipient's list, newest first
notificationSchema.index({ user: 1, createdAt: -1 });
// One like-notification per (recipient, actor, post); follow uses post:null
notificationSchema.index({ user: 1, actor: 1, type: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Notification", notificationSchema);
