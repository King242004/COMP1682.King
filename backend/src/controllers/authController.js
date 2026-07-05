const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
  gender: u.gender ?? null,
  age: u.age ?? null,
  weight: u.weight ?? null,
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

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, goal, conditions, calorieGoal, weight, height, age } = req.body;

  // Validate required fields
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required." });

  if (!isValidName(name))
    return res.status(400).json({ message: "Name must be at least 2 characters and contain only letters." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  if (!isValidPassword(password))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: "Email already in use." });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    goal: goal || "eat_healthy",
    conditions: conditions || [],
    calorieGoal: calorieGoal || 2000,
    weight, height, age,
  });

  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
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
