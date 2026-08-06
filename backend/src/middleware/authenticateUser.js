// ═══ FILE NÀY LÀM GÌ ═══
// Cửa kiểm tra đăng nhập. Chạy TRƯỚC controller của mọi API riêng tư.
//
// Ai gọi tới: gần như mọi file route, dưới tên protect
// Nhận vào:   thẻ đăng nhập gửi kèm trong tiêu đề request
// Trả ra:     không trả gì, chỉ gắn req.user rồi cho đi tiếp
// Khi lỗi:    không có thẻ, thẻ hỏng, thẻ hết hạn, hoặc thẻ thuộc phiên cũ
//             thì trả 401 và controller không bao giờ chạy
//
// Vì sao có tokenVersion: mỗi lần đổi mật khẩu thì số này trong User tăng lên,
// nên mọi thẻ phát trước đó thành vô giá trị. Đây là cách đăng xuất
// mọi thiết bị khác khi nghi ngờ mật khẩu bị lộ.
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
