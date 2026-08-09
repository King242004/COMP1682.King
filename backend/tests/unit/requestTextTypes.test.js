// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra biên HTTP từ chối object/array ở trường chỉ được nhận text.
// Controller và validator dùng request giả để khóa lỗi type trước khi ghi.
jest.mock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("../../src/config/cloudinary", () => ({
  uploader: { destroy: jest.fn().mockResolvedValue({}) },
}));
jest.mock("../../src/services/emailRelayClient", () => ({ sendOTP: jest.fn() }));
jest.mock("../../src/services/otpService", () => ({ reserveOTP: jest.fn(), verifyOTPCode: jest.fn() }));
jest.mock("../../src/models/User", () => ({
  exists: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../../src/models/Post", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));
jest.mock("../../src/controllers/community/communityHelpers", () => ({
  addNotification: jest.fn(),
  privateUserIds: jest.fn(),
  postHiddenFrom: jest.fn(),
  shapePost: jest.fn(),
  uploadToCloudinary: jest.fn().mockResolvedValue({ url: "image-url", publicId: "image-id" }),
}));

const bcrypt = require("bcryptjs");
const User = require("../../src/models/User");
const Post = require("../../src/models/Post");
const cloudinary = require("../../src/config/cloudinary");
const { login, register } = require("../../src/controllers/authController");
const { changeName, changePassword, deleteAccount } = require("../../src/controllers/accountController");
const { updateProfile } = require("../../src/controllers/profileController");
const { createPost, updatePost } = require("../../src/controllers/community/postController");
const { getExplore } = require("../../src/controllers/community/feedController");
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

describe("controller data safety", () => {
  beforeEach(() => jest.clearAllMocks());

  test("clears a stale calorie goal when automatic calculation lacks profile data", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        customGoal: true,
        weight: null,
        height: null,
        age: null,
        gender: null,
        activityLevel: "moderate",
        goal: "maintain_weight",
        targetWeight: null,
        weeklyRateKg: 0,
      }),
    });
    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({ weight: null, height: null }),
    });
    const res = response();

    await updateProfile({ body: { calorieGoal: null }, user: { id: "user-id" } }, res);

    expect(User.findByIdAndUpdate.mock.calls[0][1]).toEqual(
      expect.objectContaining({ calorieGoal: null, customGoal: false }),
    );
  });

  test("removes newly uploaded images when creating the database record fails", async () => {
    Post.create.mockRejectedValue(new Error("database failed"));
    const res = response();

    await expect(createPost({
      body: { caption: "hello" },
      files: [{ buffer: Buffer.from("image") }],
      user: { id: "user-id" },
    }, res)).rejects.toThrow("database failed");

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("image-id");
  });

  test("does not delete old images before an edited post is saved", async () => {
    const post = {
      user: { toString: () => "user-id" },
      caption: "hello",
      images: [{ url: "old-url", publicId: "old-id" }],
      image: "old-url",
      imagePublicId: "old-id",
      save: jest.fn().mockRejectedValue(new Error("database failed")),
    };
    Post.findById.mockResolvedValue(post);
    const res = response();

    await expect(updatePost({
      params: { id: "post-id" },
      body: { keepUrls: "[]", caption: "still valid" },
      files: [{ buffer: Buffer.from("new-image") }],
      user: { id: "user-id" },
    }, res)).rejects.toThrow("database failed");

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalledWith("old-id");
  });

  test("clamps a negative feed limit to one item", async () => {
    const limit = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    Post.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({ limit }),
      }),
    });
    const helpers = require("../../src/controllers/community/communityHelpers");
    helpers.privateUserIds.mockResolvedValue([]);
    const res = response();

    await getExplore({ query: { limit: "-5" }, user: { id: "user-id" } }, res);

    expect(limit).toHaveBeenCalledWith(2);
  });
});
