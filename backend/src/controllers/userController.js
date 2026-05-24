const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const { sendOTP } = require("../config/mailer");
const User = require("../models/User");
const OTP = require("../models/OTP");

// ─── Upload Avatar ────────────────────────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });

  const result = await cloudinary.uploader.upload_stream(
    { folder: "healthysnap/avatars", transformation: [{ width: 300, height: 300, crop: "fill" }] },
    async (error, result) => {
      if (error) return res.status(500).json({ message: "Upload failed." });
      await User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url });
      res.json({ message: "Avatar uploaded successfully.", avatar: result.secure_url });
    }
  );
  result.end(req.file.buffer);
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
exports.sendPasswordOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "No account found with this email." });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete old OTPs for this email
  await OTP.deleteMany({ email: email.toLowerCase() });

  // Save new OTP
  await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

  // Send email
  await sendOTP(email, otp);

  res.json({ message: "OTP sent to your email." });
};

// ─── Verify OTP & Change Password ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP and new password are required." });

  if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const record = await OTP.findOne({ email: email.toLowerCase(), otp });
  if (!record) return res.status(400).json({ message: "Invalid OTP." });

  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashed });
  await OTP.deleteMany({ email: email.toLowerCase() });

  res.json({ message: "Password changed successfully." });
};

// ─── Change Name ──────────────────────────────────────────────────────────────
exports.changeName = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters." });

  if (!/^[a-zA-Z\s]+$/.test(name.trim()))
    return res.status(400).json({ message: "Name must contain only letters." });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name: name.trim() },
    { new: true }
  ).select("-password");

  res.json({ message: "Name updated successfully.", user });
};
