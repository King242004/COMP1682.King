jest.mock("../../src/models/User", () => ({ findById: jest.fn() }));

const jwt = require("jsonwebtoken");
const User = require("../../src/models/User");
const authenticateUser = require("../../src/middleware/authenticateUser");

describe("authenticateUser", () => {
  beforeAll(() => { process.env.JWT_SECRET = "unit-test-secret"; });

  const response = () => {
    const res = { status: jest.fn(), json: jest.fn() };
    res.status.mockReturnValue(res);
    return res;
  };

  test("accepts a token only while its version matches the account", async () => {
    const token = jwt.sign({ id: "user-id", tokenVersion: 2 }, process.env.JWT_SECRET);
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "user-id", tokenVersion: 2 }) });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = response();
    const next = jest.fn();

    await authenticateUser(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: "user-id" });
  });

  test("rejects a token issued before a password change", async () => {
    const token = jwt.sign({ id: "user-id", tokenVersion: 1 }, process.env.JWT_SECRET);
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "user-id", tokenVersion: 2 }) });
    const res = response();

    await authenticateUser({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("rejects a validly signed token after the account is deleted", async () => {
    const token = jwt.sign({ id: "deleted-user" }, process.env.JWT_SECRET);
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = response();

    await authenticateUser({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
