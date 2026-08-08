// ═══ FILE NÀY LÀM GÌ ═══
// Ba việc của cửa vào app: gửi mã đăng ký, tạo tài khoản, và đăng nhập.
//
// Ai gọi tới: authRoutes, gắn vào /api/auth
// Nhận vào:   email, mật khẩu, tên, và mã 6 số
// Trả ra:     thẻ JWT kèm hồ sơ đã lọc, hoặc lỗi
// Khi lỗi:    sai email hay sai mật khẩu đều trả CÙNG một câu chung chung,
//             để người lạ không dò được email nào đã có tài khoản
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../services/emailRelayClient");
// ══════════════════════════════════════════════════════════
// BA CỬA CỦA MÀN ĐĂNG NHẬP ĐĂNG KÝ
//
// Không phải luồng. Ba cửa độc lập, app gọi cửa nào tùy việc:
// gửi mã đăng ký, tạo tài khoản, và đăng nhập.
// 
// Nhớ: mọi câu từ chối đều CHUNG CHUNG như nhau, không nói rõ sai email hay
//      sai mật khẩu, để người lạ không dò được email nào đã có tài khoản.
// ══════════════════════════════════════════════════════════

// Bảng lưu mã 6 số đã băm, dùng cho luồng đăng ký.
const OTP = require("../models/OTP");
const User = require("../models/User");
const { reserveOTP, verifyOTPCode } = require("../services/otpService");
const { OTP_PURPOSE, OTP_TTL_MS, generateOTP, hashOTP, normalizeEmail, waitForResponseFloor } = require("../utils/otpSecurity");
const { INPUT_LIMITS } = require("../config/inputLimits");
const { createAuthToken } = require("../utils/authToken");

// Lọc lại hồ sơ trước khi gửi cho app, bỏ hẳn mật khẩu đã mã hóa.
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  goal: u.goal,
  calorieGoal: u.calorieGoal ?? null,
  customGoal: !!u.customGoal,
  gender: u.gender ?? null,
  age: u.age ?? null,
  weight: u.weight ?? null,
  targetWeight: u.targetWeight ?? null,
  weeklyRateKg: u.weeklyRateKg ?? null,
  weeklyWorkoutTarget: u.weeklyWorkoutTarget ?? null,
  height: u.height ?? null,
  activityLevel: u.activityLevel ?? null,
  conditions: u.conditions || [],
  language: u.language ?? null,
  avatar: u.avatar ?? null,
  tastePreferences: u.tastePreferences || "",
  isPrivate: !!u.isPrivate,
});

// ─── Validation helpers ───────────────────────────────────────────────────────
// Chặn trần độ dài email vì trường này có unique index, mà khóa index của MongoDB
// giới hạn 1024 byte nên chuỗi quá dài sẽ làm lỗi index thay vì ra câu báo lỗi tử tế.
const isValidEmail = (email) =>
  email.length <= INPUT_LIMITS.EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Trần mật khẩu là 64 vì bcrypt chỉ băm 72 byte đầu và bỏ im lặng phần dư,
// nghĩa là mật khẩu dài hơn sẽ có một phần đuôi không hề có tác dụng.
const isValidPassword = (pw) =>
  typeof pw === "string" && pw.length >= 6 && pw.length <= INPUT_LIMITS.PASSWORD && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
// Ngôn ngữ email chỉ nhận vi hoặc en, giá trị lạ thì về mặc định.
const resolveEmailLanguage = (value) => value === "vi" ? "vi" : "en";
// \p{L} = any Unicode letter (supports Vietnamese diacritics, Chinese, etc.)
const isValidName = (name) =>
  typeof name === "string" && name.trim().length >= 2 && name.trim().length <= INPUT_LIMITS.DISPLAY_NAME && /^[\p{L}\s]+$/u.test(name.trim());

// ─── Send registration OTP ───────────────────────────────────────────────────
// Vì sao câu trả lời luôn giống nhau và có chờ thêm cho đủ thời gian:
// để người lạ không thử từng email rồi đoán ra email nào đã đăng ký.
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
  // Trả về rỗng nghĩa là mới gửi mã chưa đầy một phút, im lặng bỏ qua lần này.
  if (!record) {
    await waitForResponseFloor(startedAt);
    return res.json({ message: "If this email can be used, a verification code will be sent." });
  }

  try {
    await sendOTP(email, code, purpose, resolveEmailLanguage(req.body.language));
  } catch (err) {
    // Email không gửi được thì phải xóa mã vừa lưu, nếu không người dùng
    // sẽ phải chờ hết một phút mà tay chưa hề nhận được mã nào.
    await OTP.deleteOne({ _id: record._id, codeHash }).catch(() => {});
    console.error("Registration email failed:", err.message);
    return res.status(503).json({ message: "Could not send the code. Please try again shortly." });
  }

  await waitForResponseFloor(startedAt);
  res.json({ message: "If this email can be used, a verification code will be sent." });
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, password, otp, goal, conditions, calorieGoal, weight, height, age, language } = req.body;
  const email = normalizeEmail(req.body.email);

  // Kiểm các trường bắt buộc trước khi đụng tới database
  if (!name || !email || !password || !otp)
    return res.status(400).json({ message: "Name, email, password and verification code are required." });

  if (!isValidName(name))
    return res.status(400).json({ message: "Name must be at least 2 characters and contain only letters." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  if (!isValidPassword(password))
    return res.status(400).json({ message: "Password must be at least 6 characters, include one uppercase letter and one number." });

  // consume true nghĩa là mã đúng sẽ bị xóa luôn, mỗi mã chỉ dùng được một lần.
  const purpose = OTP_PURPOSE.REGISTRATION;
  const otpStatus = await verifyOTPCode({ email, purpose, candidate: otp, consume: true });
  if (otpStatus === "expired") {
    return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
  }
  if (otpStatus === "burned") {
    return res.status(400).json({ message: "Too many wrong attempts. Please request a new code." });
  }
  if (otpStatus !== "valid")
    return res.status(400).json({ message: "Invalid verification code." });

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
      goal: goal || "maintain_weight",
      conditions: conditions || [],
      // Chưa có số đo thì để rỗng, bước thiết lập lần đầu sẽ tính mục tiêu thật.
      calorieGoal: calorieGoal || null,
      weight, height, age,
      // Ngôn ngữ người dùng chọn ở màn Đăng ký. Lưu luôn để app khỏi gọi
      // thêm một lượt PUT /profile ngay sau khi tạo tài khoản.
      // Ngôn ngữ lạ thì bỏ qua, để undefined và model dùng mặc định.
      language: language === "vi" || language === "en" ? language : undefined,
    });
  } catch (err) {
    // Mã 11000 là lỗi trùng email của database. Xảy ra khi hai lần đăng ký
    // cùng email chạy sát nhau, cả hai đều lọt qua bước kiểm tra ở trên.
    if (err?.code === 11000)
      return res.status(400).json({ message: "Email already in use." });
    throw err;
  }

  res.status(201).json({ token: createAuthToken(user._id, user.tokenVersion), user: publicUser(user) });
};

// ─── Login ────────────────────────────────────────────────────────────────────
// Nhận thêm language, là ngôn ngữ người dùng đã chọn ở màn Đăng nhập trước khi bấm.
// Trước kia app phải gọi thêm một lượt PUT /profile chỉ để đẩy lựa chọn đó lên,
// giờ gộp vào đây nên đăng nhập chỉ còn một lượt mạng.
exports.login = async (req, res) => {
  const { email, password, language } = req.body;

  if (typeof email !== "string" || typeof password !== "string" || !email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Please provide a valid email address." });

  // Mật khẩu bị giấu sẵn trong model nên phải xin thêm bằng dấu cộng.
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password +tokenVersion");
  if (!user) return res.status(400).json({ message: "Invalid email or password." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid email or password." });

  // Chỉ ghi khi thật sự khác, để đăng nhập bình thường không tốn thêm lệnh ghi.
  // Ngôn ngữ lạ thì bỏ qua, coi như người dùng không chọn gì.
  if ((language === "vi" || language === "en") && user.language !== language) {
    user.language = language;
    await user.save();
  }

  res.json({ token: createAuthToken(user._id, user.tokenVersion), user: publicUser(user) });
};

// App gọi khi cần lấy lại hồ sơ mới nhất mà không phải đăng nhập lại.
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
