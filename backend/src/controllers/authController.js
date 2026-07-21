const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../config/mailer");
const OTP = require("../models/OTP");
const User = require("../models/User");
const { recordFailedOTPAttempt, reserveOTP } = require("../services/otpService");
const {
  OTP_PURPOSE,
  OTP_TTL_MS,
  generateOTP,
  hashOTP,
  isOTPMatch,
  normalizeEmail,
  waitForResponseFloor,
} = require("../utils/otpSecurity");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Full safe user payload for auth responses. Login/register used to return only
// a few fields, so the app lacked language/conditions/weight/avatar until the
// user happened to open the Profile tab (wrong coach language, 60kg fallback...).
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  goal: u.goal,
  calorieGoal: u.calorieGoal,
  customGoal: !!u.customGoal,
  gender: u.gender ?? null,
  age: u.age ?? null,
  weight: u.weight ?? null,
  targetWeight: u.targetWeight ?? null,
  height: u.height ?? null,
  activityLevel: u.activityLevel ?? null,
  conditions: u.conditions || [],
  language: u.language ?? null,
  avatar: u.avatar ?? null,
  tastePreferences: u.tastePreferences || "",
  isPrivate: !!u.isPrivate,
});

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pw) => pw.length >= 6 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
// \p{L} = any Unicode letter (supports Vietnamese diacritics, Chinese, etc.)
const isValidName = (name) => name.trim().length >= 2 && /^[\p{L}\s]+$/u.test(name.trim());

// ─── Send registration OTP ───────────────────────────────────────────────────
exports.sendRegistrationOTP = async (req, res) => {
  const startedAt = Date.now();
  const email = normalizeEmail(req.body.email);
  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  const exists = await User.exists({ email });
  if (exists) {
    await waitForResponseFloor(startedAt);
    return res.json({ message: "If this email can be used, a verification code will be sent." });
  }

  const purpose = OTP_PURPOSE.REGISTRATION;
  const code = generateOTP();
  const codeHash = hashOTP(email, purpose, code);
  const record = await reserveOTP({
    email,
    purpose,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  if (!record) {
    await waitForResponseFloor(startedAt);
    return res.json({ message: "If this email can be used, a verification code will be sent." });
  }

  try {
    await sendOTP(email, code, purpose);
  } catch (err) {
    await OTP.deleteOne({ _id: record._id, codeHash }).catch(() => {});
    console.error("Registration email failed:", err.message);
    return res.status(503).json({ message: "Could not send the code. Please try again shortly." });
  }

  await waitForResponseFloor(startedAt);
  res.json({ message: "If this email can be used, a verification code will be sent." });
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, password, otp, goal, conditions, calorieGoal, weight, height, age } = req.body;
  const email = normalizeEmail(req.body.email);

  // Validate required fields
  if (!name || !email || !password || !otp)
    return res.status(400).json({ message: "Name, email, password and verification code are required." });

  if (!isValidName(name))
    return res.status(400).json({ message: "Name must be at least 2 characters and contain only letters." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  if (!isValidPassword(password))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const purpose = OTP_PURPOSE.REGISTRATION;
  const record = await OTP.findOne({ email, purpose }).select("+codeHash");
  if (!record) return res.status(400).json({ message: "Invalid verification code." });

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
  }

  if (!isOTPMatch(record.codeHash, email, purpose, otp)) {
    const { burned } = await recordFailedOTPAttempt(record._id, record.codeHash);
    if (burned) {
      return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
    }
    return res.status(400).json({ message: "Invalid verification code." });
  }

  // Consume the exact verified code atomically. This makes the OTP single-use
  // even when two registration requests arrive at the same time.
  const consumed = await OTP.findOneAndDelete({
    _id: record._id,
    codeHash: record.codeHash,
    expiresAt: { $gt: new Date() },
  });
  if (!consumed)
    return res.status(400).json({ message: "Invalid verification code." });

  // Check uniqueness only after mailbox ownership is proven. Otherwise this
  // endpoint becomes an account-enumeration oracle for arbitrary callers.
  const exists = await User.exists({ email });
  if (exists) {
    return res.status(400).json({ message: "Unable to create an account with this email." });
  }

  const hashed = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email,
      emailVerifiedAt: new Date(),
      password: hashed,
      goal: goal || "eat_healthy",
      conditions: conditions || [],
      calorieGoal: calorieGoal || 2000,
      weight, height, age,
    });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(400).json({ message: "Email already in use." });
    throw err;
  }

  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) return res.status(400).json({ message: "Invalid email or password." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid email or password." });

  res.json({ token: generateToken(user._id), user: publicUser(user) });
};

// ─── Get current user ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
