// ═══ FILE NÀY LÀM GÌ ═══
// Lo phần tài khoản: ảnh đại diện, đổi tên, đổi mật khẩu,
// quên mật khẩu ba bước, và xóa tài khoản.
//
// Ai gọi tới: accountRoutes, tức màn Cài đặt và màn Quên mật khẩu
// Nhận vào:   mật khẩu cũ và mới, tên mới, ảnh mới, hoặc mã 6 số
// Trả ra:     kết quả thành công, và thẻ đăng nhập mới nếu đổi mật khẩu
// Khi lỗi:    sai mật khẩu hiện tại thì từ chối. Mã sai hoặc hết hạn thì
//             bảo xin mã mới.
//
// Xóa tài khoản là chỗ nặng nhất: phải dọn cả ảnh trên kho ảnh, vì nếu chỉ xóa
// bản ghi thì không còn ai biết đường dẫn ảnh nào cần dọn, và ảnh nằm lại mãi mãi.
const bcrypt = require("bcryptjs");
const { INPUT_LIMITS } = require("../config/inputLimits");
const cloudinary = require("../config/cloudinary");
const { sendOTP } = require("../services/emailRelayClient");
const User = require("../models/User");
// ══════════════════════════════════════════════════════════
// CÁC CỬA VỀ TÀI KHOẢN
//
// Không phải luồng. Mấy cửa độc lập: đổi tên, đổi ảnh đại diện, đổi mật khẩu,
// quên mật khẩu, và xóa tài khoản.
// 
// Nhớ: xóa tài khoản là việc KHÔNG lùi được. Nó phải dọn dữ liệu ở MỌI bảng
//      và xóa cả ảnh trên Cloudinary, sót chỗ nào là rác nằm lại vĩnh viễn.
// ══════════════════════════════════════════════════════════

// Từ đây xuống là các bảng cần dọn khi xóa tài khoản.
// Thiếu một bảng là dữ liệu của người đã xóa còn nằm lại trong database.
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
const NutritionEstimateCache = require("../models/NutritionEstimateCache");
const { reserveOTP, verifyOTPCode } = require("../services/otpService");
const { OTP_PURPOSE, OTP_TTL_MS, generateOTP, hashOTP, normalizeEmail, waitForResponseFloor } = require("../utils/otpSecurity");
const { createAuthToken } = require("../utils/authToken");
// Chốt ngôn ngữ email. Chỉ có tiếng Việt hoặc tiếng Anh,
// giá trị lạ thì rơi về tiếng Anh.
const resolveEmailLanguage = (value) => value === "vi" ? "vi" : "en";

// Đẩy ảnh lên kho ảnh và cắt vuông 300x300 ngay lúc tải lên.
function uploadAvatarToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mealmate/avatars", transformation: [{ width: 300, height: 300, crop: "fill" }] },
      (err, result) =>
        err
          ? reject(err)
          : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });
}

// Xóa ảnh cũ SAU khi đã lưu ảnh mới, để nếu giữa chừng có lỗi thì
// hồ sơ vẫn còn một ảnh dùng được chứ không mất trắng.
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

// Đổi tên nằm cạnh đổi ảnh vì hai thao tác này cùng cập nhật hồ sơ công khai
// và cùng được gọi từ ProfileScreen/AuthContext, trước các luồng mật khẩu bên dưới.
exports.changeName = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters." });

  if (name.trim().length > INPUT_LIMITS.DISPLAY_NAME)
    return res.status(400).json({ message: `Name must be ${INPUT_LIMITS.DISPLAY_NAME} characters or fewer.` });

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

// ─── Send OTP ─────────────────────────────────────────────────────────────────
// Bước 1 của luồng Quên mật khẩu.
// Giống luồng đăng ký, câu trả lời luôn như nhau để không lộ email nào đã đăng ký.
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
    await sendOTP(email, code, purpose, resolveEmailLanguage(req.body.language));
  } catch (err) {
    await OTP.deleteOne({ _id: record._id, codeHash }).catch(() => {});
    console.error("OTP email failed:", err.message);
    return res.status(503).json({ message: "Could not send the code. Please try again shortly." });
  }

  await waitForResponseFloor(startedAt);
  res.json({ message: "If an account matches this email, a code will be sent." });
};

// Bước 2 của luồng Quên mật khẩu.
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
// Bước 3 của luồng Quên mật khẩu.
// Bước 2 chỉ xem mã, bước 3 mới xóa mã, nên mã dùng đúng một lần cho cả luồng.
exports.resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !otp || typeof newPassword !== "string" || !newPassword)
    return res.status(400).json({ message: "Email, OTP and new password are required." });

  if (newPassword.length < 6 || newPassword.length > INPUT_LIMITS.PASSWORD ||
      !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
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
  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { password: hashed }, $inc: { tokenVersion: 1 } }
  );
  if (!updated) return res.status(400).json({ message: "Unable to reset this account." });

  res.json({ message: "Password changed successfully." });
};

// Đổi mật khẩu khi ĐANG đăng nhập, khác với luồng quên mật khẩu ở trên.
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword)
    return res.status(400).json({ message: "Current and new password are required." });

  if (newPassword.length < 6 || newPassword.length > INPUT_LIMITS.PASSWORD ||
      !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  const user = await User.findById(req.user.id).select("+password +tokenVersion");
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: "Current password is incorrect." });

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion = Number(user.tokenVersion || 0) + 1;
  await user.save();

  res.json({
    message: "Password changed successfully.",
    token: createAuthToken(user._id, user.tokenVersion),
  });
};

// Xóa ảnh trước rồi mới xóa dữ liệu, vì xóa dữ liệu xong sẽ không còn
// biết đường dẫn ảnh nào cần dọn, ảnh sẽ nằm lại trên kho mãi mãi.
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string" || !password)
    return res.status(400).json({ message: "Password is required." });

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Password is incorrect." });

  const uid = req.user.id;

  const [posts, chats] = await Promise.all([
    Post.find({ user: uid }).select("imagePublicId images"),
    ChatMessage.find({ user: uid }).select("imagePublicId"),
  ]);
  // Gom mã ảnh trên Cloudinary của cả tài khoản: ảnh đại diện và ảnh mọi bài đăng.
  // Phải gom trước khi xóa dữ liệu, kẻo xóa xong là mất đường tìm lại ảnh,
  // và ảnh nằm lại trên Cloudinary mãi mãi.
  const publicIds = [
    user.avatarPublicId,
    ...posts.flatMap((p) => [p.imagePublicId, ...(p.images || []).map((i) => i.publicId)]),
    ...chats.map((d) => d.imagePublicId),
  ].filter(Boolean);
  await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));

  // Xóa song song ở mọi bảng có dính tới người này.
  await Promise.all([
    Meal.deleteMany({ user: uid }),
    Exercise.deleteMany({ user: uid }),
    PlanMeal.deleteMany({ user: uid }),
    PlanWorkout.deleteMany({ user: uid }),
    WeightLog.deleteMany({ user: uid }),
    Post.deleteMany({ user: uid }),
    ChatMessage.deleteMany({ user: uid }),
    Follow.deleteMany({ $or: [{ follower: uid }, { following: uid }] }),
    // Lượt tim và lượt lưu của họ trên bài NGƯỜI KHÁC
    Post.updateMany({}, { $pull: { likes: uid, saves: uid } }),
    // Thông báo gửi tới họ, và thông báo do họ gây ra
    Notification.deleteMany({ $or: [{ user: uid }, { actor: uid }] }),
    NutritionEstimateCache.deleteMany({ user: uid }),
    OTP.deleteMany({ email: user.email }),
  ]);

  await user.deleteOne();
  res.json({ message: "Account deleted." });
};
