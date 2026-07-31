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
const { reserveOTP, verifyOTPCode } = require("../services/otpService");
const { OTP_PURPOSE, OTP_TTL_MS, generateOTP, hashOTP, normalizeEmail, waitForResponseFloor } = require("../utils/otpSecurity");

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

    if (previousPublicId) {
      await cloudinary.uploader.destroy(previousPublicId).catch(() => {});
    }
    res.json({ message: "Avatar uploaded successfully.", avatar: url });
  } catch (err) {
    console.error("Avatar upload failed:", err.message);
    res.status(500).json({ message: "Upload failed." });
  }
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
exports.sendPasswordOTP = async (req, res) => {
  const startedAt = Date.now();
  const email = normalizeEmail(req.body.email);

  if (!email) return res.status(400).json({ message: "Email is required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  const user = await User.exists({ email });
  if (!user) {
    await waitForResponseFloor(startedAt);
    return res.json({ message: "If an account matches this email, a code will be sent." });
  }

  // Cooldown: one code per minute per email — stops OTP email spam
  const purpose = OTP_PURPOSE.PASSWORD_RESET;
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const codeHash = hashOTP(email, purpose, code);
  const record = await reserveOTP({ email, purpose, codeHash, expiresAt });
  if (!record) {
    await waitForResponseFloor(startedAt);
    return res.json({ message: "If an account matches this email, a code will be sent." });
  }
  try {
    await sendOTP(email, code, purpose);
  } catch (err) {
    await OTP.deleteOne({ _id: record._id, codeHash }).catch(() => {});
    console.error("OTP email failed:", err.message);
    return res.status(503).json({ message: "Could not send the code. Please try again shortly." });
  }

  await waitForResponseFloor(startedAt);
  res.json({ message: "If an account matches this email, a code will be sent." });
};

exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  const purpose = OTP_PURPOSE.PASSWORD_RESET;
  const otpStatus = await verifyOTPCode({ email, purpose, candidate: otp });
  if (otpStatus === "expired") {
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  }
  if (otpStatus === "burned") {
    return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
  }
  if (otpStatus !== "valid") return res.status(400).json({ message: "Invalid OTP." });

  res.json({ message: "OTP verified." });
};

// ─── Verify OTP & Change Password ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP and new password are required." });

  if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const purpose = OTP_PURPOSE.PASSWORD_RESET;
  const otpStatus = await verifyOTPCode({ email, purpose, candidate: otp, consume: true });
  if (otpStatus === "expired") {
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  }
  if (otpStatus === "burned") {
    return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
  }
  if (otpStatus !== "valid") return res.status(400).json({ message: "Invalid OTP." });

  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await User.findOneAndUpdate({ email }, { password: hashed });
  if (!updated) return res.status(400).json({ message: "Unable to reset this account." });

  res.json({ message: "Password changed successfully." });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Current and new password are required." });

  if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: "Current password is incorrect." });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully." });
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Password is required." });

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Password is incorrect." });

  const uid = req.user.id;

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
    { returnDocument: "after" }
  ).select("-password");

  res.json({ message: "Name updated successfully.", user });
};
