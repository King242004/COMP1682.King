// ═══ FILE NÀY LÀM GÌ ═══
// Khóa luồng đổi mật khẩu: kiểm mật khẩu cũ, băm mật khẩu mới và cấp lại token.
// Model và dịch vụ ngoài được mock; test đạt khi controller trả đúng mã và state.
// ═══ FILE NÀY LÀM GÌ ═══
// Khóa luồng đổi mật khẩu: kiểm mật khẩu cũ, băm mật khẩu mới và cấp lại token.
// Model và dịch vụ ngoài được mock; test đạt khi controller trả đúng mã và state.
jest.mock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("../../src/config/cloudinary", () => ({ uploader: {} }));
jest.mock("../../src/services/emailRelayClient", () => ({ sendOTP: jest.fn() }));
jest.mock("../../src/services/otpService", () => ({ reserveOTP: jest.fn(), verifyOTPCode: jest.fn() }));
jest.mock("../../src/models/User", () => ({
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const User = require("../../src/models/User");
const { verifyOTPCode } = require("../../src/services/otpService");
const { changePassword, resetPassword } = require("../../src/controllers/accountController");

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe("account password changes", () => {
  beforeAll(() => { process.env.JWT_SECRET = "unit-test-secret"; });
  beforeEach(() => jest.clearAllMocks());

  test("returns a replacement token after invalidating old sessions", async () => {
    const user = { _id: "user-id", password: "old-hash", tokenVersion: 1, save: jest.fn() };
    user.save.mockResolvedValue(user);
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");
    const res = response();

    await changePassword(
      { user: { id: "user-id" }, body: { currentPassword: "Old1xx", newPassword: "New1xx" } },
      res
    );

    expect(user.tokenVersion).toBe(2);
    expect(res.json.mock.calls[0][0].token).toEqual(expect.any(String));
  });

  test("reset password invalidates sessions without referencing a logged-in user", async () => {
    verifyOTPCode.mockResolvedValue("valid");
    bcrypt.hash.mockResolvedValue("new-hash");
    User.findOneAndUpdate.mockResolvedValue({ _id: "user-id" });
    const res = response();

    await resetPassword(
      { body: { email: "person@example.com", otp: "123456", newPassword: "New1xx" } },
      res
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { email: "person@example.com" },
      { $set: { password: "new-hash" }, $inc: { tokenVersion: 1 } }
    );
    expect(res.json).toHaveBeenCalledWith({ message: "Password changed successfully." });
  });
});
