jest.mock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("../../src/config/cloudinary", () => ({ uploader: {} }));
jest.mock("../../src/services/emailRelayClient", () => ({ sendOTP: jest.fn() }));
jest.mock("../../src/services/otpService", () => ({ reserveOTP: jest.fn(), verifyOTPCode: jest.fn() }));
jest.mock("../../src/models/User", () => ({
  exists: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../../src/controllers/community/communityHelpers", () => ({
  addNotification: jest.fn(),
  postHiddenFrom: jest.fn(),
  shapePost: jest.fn(),
  uploadToCloudinary: jest.fn().mockResolvedValue({ url: "image-url", publicId: "image-id" }),
}));

const bcrypt = require("bcryptjs");
const User = require("../../src/models/User");
const { login, register } = require("../../src/controllers/authController");
const { changeName, changePassword, deleteAccount } = require("../../src/controllers/accountController");
const { updateProfile } = require("../../src/controllers/profileController");
const { createPost } = require("../../src/controllers/community/postController");
const { searchUsers } = require("../../src/controllers/community/socialController");

const response = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

describe("text input types at API boundaries", () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    ["registration name", register, { body: { name: 123, email: "person@example.com", password: "Good1x", otp: "123456" } }],
    ["account name", changeName, { body: { name: 123 }, user: { id: "user-id" } }],
    ["profile name", updateProfile, { body: { name: {} }, user: { id: "user-id" } }],
    ["post caption", createPost, { body: { caption: 123 }, files: [{ buffer: Buffer.from("image") }], user: { id: "user-id" } }],
    ["search query", searchUsers, { query: { q: ["name"] }, user: { id: "user-id" } }],
  ])("rejects a non-text %s without throwing", async (_label, controller, req) => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        customGoal: false,
        weight: 70,
        height: 170,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        goal: "maintain_weight",
        targetWeight: 70,
        weeklyRateKg: 0,
      }),
    });
    const res = response();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test.each([
    ["login password", login, { body: { email: "person@example.com", password: 123 } }],
    ["current password", changePassword, { body: { currentPassword: 123, newPassword: "Good2x" }, user: { id: "user-id" } }],
    ["account deletion password", deleteAccount, { body: { password: 123 }, user: { id: "user-id" } }],
  ])("rejects a non-text %s before database or bcrypt work", async (_label, controller, req) => {
    const res = response();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
