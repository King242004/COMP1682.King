const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

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

  res.status(201).json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, goal: user.goal, calorieGoal: user.calorieGoal },
  });
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

  res.json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, goal: user.goal, calorieGoal: user.calorieGoal },
  });
};

// ─── Get current user ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
