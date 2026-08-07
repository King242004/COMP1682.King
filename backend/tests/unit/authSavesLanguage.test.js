// ═══ FILE NÀY LÀM GÌ ═══
// Khóa đăng nhập và đăng ký lưu ngôn ngữ ngay trong request tạo phiên.
// Test đạt khi không cần thêm một lượt PUT /profile sau khi xác thực.
// ═══ FILE NÀY LÀM GÌ ═══
// Khóa đăng nhập và đăng ký lưu ngôn ngữ ngay trong request tạo phiên.
// Test đạt khi không cần thêm một lượt PUT /profile sau khi xác thực.
// Khóa hành vi: POST /auth/login và POST /auth/register nhận luôn language.
// Trước đây app phải gọi thêm một lượt PUT /profile chỉ để đẩy ngôn ngữ đã chọn
// ở màn Đăng nhập lên server. Test này giữ cho lượt gọi thừa đó không quay lại.
jest.mock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("../../src/services/emailRelayClient", () => ({ sendOTP: jest.fn() }));
jest.mock("../../src/services/otpService", () => ({ reserveOTP: jest.fn(), verifyOTPCode: jest.fn() }));
jest.mock("../../src/utils/authToken", () => ({ createAuthToken: () => "fake-token" }));
jest.mock("../../src/models/User", () => ({
  exists: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const User = require("../../src/models/User");
const { verifyOTPCode } = require("../../src/services/otpService");
const { login, register } = require("../../src/controllers/authController");

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

// Giả lập User.findOne(...).select(...) trả về một tài khoản.
const mockUser = (over = {}) => {
  const user = { _id: "user-id", tokenVersion: 0, password: "hashed", language: undefined, save: jest.fn(), ...over };
  User.findOne.mockReturnValue({ select: () => Promise.resolve(user) });
  return user;
};

describe("đăng nhập và đăng ký lưu luôn ngôn ngữ, khỏi gọi thêm lượt PUT /profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.compare.mockResolvedValue(true);
  });

  test("login lưu language khi nó khác giá trị đang có", async () => {
    const user = mockUser({ language: "en" });
    const res = response();

    await login({ body: { email: "a@b.com", password: "Good1x", language: "vi" } }, res);

    expect(user.language).toBe("vi");
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  test("language trùng giá trị cũ thì KHÔNG ghi lại, đỡ một lệnh ghi", async () => {
    const user = mockUser({ language: "vi" });
    const res = response();

    await login({ body: { email: "a@b.com", password: "Good1x", language: "vi" } }, res);

    expect(user.save).not.toHaveBeenCalled();
  });

  test("language lạ thì bỏ qua, không ghi gì", async () => {
    const user = mockUser({ language: "en" });
    const res = response();

    await login({ body: { email: "a@b.com", password: "Good1x", language: "fr" } }, res);

    expect(user.language).toBe("en");
    expect(user.save).not.toHaveBeenCalled();
  });

  test("không gửi language thì đăng nhập vẫn chạy bình thường", async () => {
    const user = mockUser({ language: "en" });
    const res = response();

    await login({ body: { email: "a@b.com", password: "Good1x" } }, res);

    expect(user.save).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("register truyền language xuống User.create", async () => {
    verifyOTPCode.mockResolvedValue("valid");
    User.exists.mockResolvedValue(false);
    bcrypt.hash.mockResolvedValue("hashed");
    User.create.mockResolvedValue({ _id: "new-id", tokenVersion: 0 });
    const res = response();

    await register({ body: { name: "Nam", email: "a@b.com", password: "Good1x", otp: "123456", language: "vi" } }, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ language: "vi" }));
  });

  test("register với language lạ thì để undefined, model tự dùng mặc định", async () => {
    verifyOTPCode.mockResolvedValue("valid");
    User.exists.mockResolvedValue(false);
    bcrypt.hash.mockResolvedValue("hashed");
    User.create.mockResolvedValue({ _id: "new-id", tokenVersion: 0 });
    const res = response();

    await register({ body: { name: "Nam", email: "a@b.com", password: "Good1x", otp: "123456", language: "de" } }, res);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ language: undefined }));
  });
});
