// Cửa kiểm tra đăng nhập, chạy trước controller của mọi API riêng tư.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("+tokenVersion");
    if (!user || Number(decoded.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { id: String(user._id) };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
