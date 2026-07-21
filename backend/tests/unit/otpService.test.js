jest.mock("../../src/models/OTP", () => ({
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
}));

const OTP = require("../../src/models/OTP");
const {
  recordFailedOTPAttempt,
  reserveOTP,
} = require("../../src/services/otpService");

describe("OTP atomic state changes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
