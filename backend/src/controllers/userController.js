const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const { sendOTP } = require("../config/mailer");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Meal = require("../models/Meal");
const Exercise = require("../models/Exercise");
const PlanMeal = require("../models/PlanMeal");
const PlanWorkout = require("../models/PlanWorkout");
const WeightLog = require("../models/WeightLog");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const ChatMessage = require("../models/ChatMessage");
const Notification = require("../models/Notification");

// ─── Upload Avatar ────────────────────────────────────────────────────────────
// upload_stream is callback-based (it returns a stream, NOT a promise) — wrap it
// so errors flow through try/catch instead of relying on the callback by accident.
function uploadAvatarToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "healthysnap/avatars", transformation: [{ width: 300, height: 300, crop: "fill" }] },
      (err, result) =>
        err
          ? reject(err)
          : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });

  try {
    const user = await User.findById(req.user.id).select("avatarPublicId");
    if (!user) return res.status(404).json({ message: "User not found." });

    const previousPublicId = user.avatarPublicId;
    const { url, publicId } = await uploadAvatarToCloudinary(req.file.buffer);
    user.avatar = url;
    user.avatarPublicId = publicId;
    await user.save();

    // The new avatar is already durable, so cleanup of the replaced file is
    // best-effort and must not make a successful upload look like a failure.
    if (previousPublicId) {
      await Promise.allSettled([cloudinary.uploader.destroy(previousPublicId)]);
    }
    res.json({ message: "Avatar uploaded successfully.", avatar: url });
  } catch (err) {
    console.error("Avatar upload failed:", err.message);
    res.status(500).json({ message: "Upload failed." });
  }
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
exports.sendPasswordOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "No account found with this email." });

  // Cooldown: one code per minute per email — stops OTP email spam
  const recent = await OTP.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
  if (recent?.createdAt && Date.now() - recent.createdAt.getTime() < 60 * 1000)
    return res.status(429).json({ message: "Please wait a minute before requesting another code." });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete old OTPs for this email
  await OTP.deleteMany({ email: email.toLowerCase() });

  // Save first so the code in the email is already verifiable when delivered.
  // Roll it back if SMTP fails, otherwise a failed send would still trigger
  // the one-minute cooldown and block the user from trying again.
  const record = await OTP.create({ email: email.toLowerCase(), otp, expiresAt });
  try {
    await sendOTP(email, otp);
  } catch (err) {
    await record.deleteOne().catch(() => {});
    console.error("OTP email failed:", err.message);
    return res.status(503).json({ message: "Could not send the code. Please try again shortly." });
  }

  res.json({ message: "OTP sent to your email." });
};

// ─── Verify OTP only (step-2 pre-check, does NOT consume the code) ────────────
// The app's "Verify OTP" button used to advance locally without asking the
// server — a wrong code sailed through to the password step. Misses here count
// against the same 5-attempt budget as the final reset.
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  const record = await OTP.findOne({ email: email.toLowerCase() });
  if (!record) return res.status(400).json({ message: "Invalid OTP." });

  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      await record.deleteOne();
      return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
    }
    await record.save();
    return res.status(400).json({ message: "Invalid OTP." });
  }

  res.json({ message: "OTP verified." });
};

// ─── Verify OTP & Change Password ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP and new password are required." });

  if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  // Look up by email only, so wrong guesses can be COUNTED against the record —
  // matching on the OTP itself would make unlimited brute-force attempts free.
  const record = await OTP.findOne({ email: email.toLowerCase() });
  if (!record) return res.status(400).json({ message: "Invalid OTP." });

  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });

  if (record.otp !== String(otp).trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      await record.deleteOne(); // burned — must request a fresh code
      return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
    }
    await record.save();
    return res.status(400).json({ message: "Invalid OTP." });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashed });
  await OTP.deleteMany({ email: email.toLowerCase() });

  res.json({ message: "Password changed successfully." });
};

// ─── Change Password (logged-in) ──────────────────────────────────────────────
// Requires the CURRENT password — a stolen unlocked phone can't silently take
// over the account. Forgot-password (OTP) remains the logged-out path.
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Current and new password are required." });

  if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: "Current password is incorrect." });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully." });
};

// ─── Delete Account (right to erasure) ────────────────────────────────────────
// Permanently removes the user and EVERY piece of their data. Requires the
// current password so a stolen unlocked phone can't wipe the account.
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Password is required." });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Password is incorrect." });

  const uid = req.user.id;

  // Best-effort Cloudinary cleanup (post + chat images that carry a publicId)
  const [posts, chats] = await Promise.all([
    Post.find({ user: uid }).select("imagePublicId images"),
    ChatMessage.find({ user: uid }).select("imagePublicId"),
  ]);
  const publicIds = [
    user.avatarPublicId,
    ...posts.flatMap((p) => [p.imagePublicId, ...(p.images || []).map((i) => i.publicId)]),
    ...chats.map((d) => d.imagePublicId),
  ].filter(Boolean);
  await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));

  // Purge every collection that references this user
  await Promise.all([
    Meal.deleteMany({ user: uid }),
    Exercise.deleteMany({ user: uid }),
    PlanMeal.deleteMany({ user: uid }),
    PlanWorkout.deleteMany({ user: uid }),
    WeightLog.deleteMany({ user: uid }),
    Post.deleteMany({ user: uid }),
    ChatMessage.deleteMany({ user: uid }),
    Follow.deleteMany({ $or: [{ follower: uid }, { following: uid }] }),
    // Their likes/saves on OTHER people's posts
    Post.updateMany({}, { $pull: { likes: uid, saves: uid } }),
    // Notifications to them or triggered by them
    Notification.deleteMany({ $or: [{ user: uid }, { actor: uid }] }),
    OTP.deleteMany({ email: user.email }),
  ]);

  await user.deleteOne();
  res.json({ message: "Account deleted." });
};

// ─── Change Name ──────────────────────────────────────────────────────────────
exports.changeName = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters." });

  // \p{L} = any Unicode letter (English + Vietnamese diacritics + other languages)
  if (!/^[\p{L}\s]+$/u.test(name.trim()))
    return res.status(400).json({ message: "Name must contain only letters." });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name: name.trim() },
    { new: true }
  ).select("-password");

  res.json({ message: "Name updated successfully.", user });
};
