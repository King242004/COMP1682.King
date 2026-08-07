// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra phiên đăng nhập được lưu/xóa nguyên khối, không để token và user lệch nhau.
// authStorage được mock; test khóa rollback khi ghi dở và dọn phiên thiếu dữ liệu.
jest.mock("@/features/auth/authStorage", () => ({
  clearAuthToken: jest.fn(),
  clearAuthUser: jest.fn(),
  loadAuthToken: jest.fn(),
  loadAuthUser: jest.fn(),
  saveAuthToken: jest.fn(),
  saveAuthUser: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getAllKeys: jest.fn(),
    getItem: jest.fn(),
    multiRemove: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock("@/utils/notifications/reminderSettings", () => ({
  cancelAllReminders: jest.fn(),
}));

import {
  clearAuthToken,
  clearAuthUser,
  loadAuthToken,
  loadAuthUser,
  saveAuthToken,
  saveAuthUser,
} from "@/features/auth/authStorage";
import { loadStoredAuthSession, saveStoredAuthSession } from "@/features/auth/authSession";

beforeEach(() => jest.clearAllMocks());

test("a partial session write rolls back both stored values", async () => {
  jest.mocked(saveAuthToken).mockResolvedValue();
  jest.mocked(saveAuthUser).mockRejectedValue(new Error("storage failed"));
  jest.mocked(clearAuthToken).mockResolvedValue();
  jest.mocked(clearAuthUser).mockResolvedValue();

  await expect(saveStoredAuthSession({
    token: "token",
    user: { id: "u1", name: "Test", email: "test@example.com", calorieGoal: null, goal: "maintain_weight" },
  })).rejects.toThrow("storage failed");

  expect(clearAuthToken).toHaveBeenCalledTimes(1);
  expect(clearAuthUser).toHaveBeenCalledTimes(1);
});

test("an incomplete stored session clears both stored values", async () => {
  jest.mocked(loadAuthToken).mockResolvedValue(null);
  jest.mocked(loadAuthUser).mockResolvedValue(JSON.stringify({ id: "stale-user" }));
  jest.mocked(clearAuthToken).mockResolvedValue();
  jest.mocked(clearAuthUser).mockResolvedValue();

  await expect(loadStoredAuthSession()).resolves.toBeNull();

  expect(clearAuthToken).toHaveBeenCalledTimes(1);
  expect(clearAuthUser).toHaveBeenCalledTimes(1);
});
