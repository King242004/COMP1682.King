jest.mock("../../src/models/OTP", () => ({
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
}));

const OTP = require("../../src/models/OTP");
const { recordFailedOTPAttempt, reserveOTP, verifyOTPCode } = require("../../src/services/otpService");
const { hashOTP } = require("../../src/utils/otpSecurity");

describe("OTP atomic state changes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("reserves one code with an atomic cooldown condition", async () => {
    const record = { _id: "otp-id" };
    OTP.findOneAndUpdate.mockResolvedValue(record);

    const result = await reserveOTP({
      email: "person@example.com",
      purpose: "registration",
      codeHash: "digest",
      expiresAt: new Date("2030-01-01T00:00:00Z"),
    });

    expect(result).toBe(record);
    const [query, update, options] = OTP.findOneAndUpdate.mock.calls[0];
    expect(query).toMatchObject({
      email: "person@example.com",
      purpose: "registration",
    });
    expect(query.$or).toHaveLength(2);
    expect(update.$set.attempts).toBe(0);
    expect(options).toMatchObject({ upsert: true, returnDocument: "after" });
  });

  test("treats a duplicate-key race as an active cooldown", async () => {
    OTP.findOneAndUpdate.mockRejectedValue(Object.assign(new Error("duplicate"), { code: 11000 }));

    await expect(
      reserveOTP({
        email: "person@example.com",
        purpose: "registration",
        codeHash: "digest",
        expiresAt: new Date(),
      })
    ).resolves.toBeNull();
  });

  test("burns only the exact code that reaches five wrong attempts", async () => {
    OTP.findOneAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({ attempts: 5 }),
    });
    OTP.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await expect(recordFailedOTPAttempt("otp-id", "old-digest")).resolves.toEqual({ burned: true });
    expect(OTP.findOneAndUpdate.mock.calls[0][0]).toMatchObject({
      _id: "otp-id",
      codeHash: "old-digest",
    });
    expect(OTP.deleteOne).toHaveBeenCalledWith({
      _id: "otp-id",
      codeHash: "old-digest",
    });
  });

  test("does not delete a code replaced by a concurrent resend", async () => {
    OTP.findOneAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(recordFailedOTPAttempt("otp-id", "old-digest")).resolves.toEqual({ burned: false });
    expect(OTP.deleteOne).not.toHaveBeenCalled();
  });

  test("verifies a valid code without consuming it during the pre-check", async () => {
    const record = {
      _id: "otp-id",
      codeHash: hashOTP("person@example.com", "password_reset", "123456"),
      expiresAt: new Date(Date.now() + 60_000),
    };
    OTP.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(record) });

    await expect(verifyOTPCode({
      email: "person@example.com",
      purpose: "password_reset",
      candidate: "123456",
    })).resolves.toBe("valid");
    expect(OTP.findOneAndDelete).not.toHaveBeenCalled();
  });

  test("consumes the exact valid code when requested", async () => {
    const record = {
      _id: "otp-id",
      codeHash: hashOTP("person@example.com", "registration", "123456"),
      expiresAt: new Date(Date.now() + 60_000),
    };
    OTP.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(record) });
    OTP.findOneAndDelete.mockResolvedValue(record);

    await expect(verifyOTPCode({
      email: "person@example.com",
      purpose: "registration",
      candidate: "123456",
      consume: true,
    })).resolves.toBe("valid");
    expect(OTP.findOneAndDelete).toHaveBeenCalledWith(expect.objectContaining({
      _id: "otp-id",
      codeHash: record.codeHash,
    }));
  });
});
