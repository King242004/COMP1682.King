// File này khai báo hình dạng dữ liệu tài khoản dùng khắp app.
// Chỉ có kiểu, không có code chạy.
// User phải khớp với hàm publicUser trong backend authController,
// lệch một trường là app đọc thiếu dữ liệu.
import type { WeightGoal } from "@/config/nutritionCalculations";
import type { Lang } from "@/utils/languageUtils";

export type User = {
  id: string;
  name: string;
  email: string;
  // Bằng null khi hồ sơ chưa đủ để tính. App phải mời hoàn tất hồ sơ
  // chứ không được hiện một mục tiêu mặc định.
  calorieGoal: number | null;
  customGoal?: boolean;
  goal: WeightGoal;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  // Tốc độ đổi cân nặng mong muốn, kg mỗi tuần. Đây là thứ quyết định
  // mục tiêu calo lệch bao nhiêu so với TDEE.
  weeklyRateKg?: number | null;
  weeklyWorkoutTarget?: number | null;
  height?: number | null;
  activityLevel?: string | null;
  conditions?: string[];
  avatar?: string | null;
  language?: "vi" | "en" | null;
  tastePreferences?: string;
  isPrivate?: boolean;
};

export type Stats = {
  bmi: number | null;
  // Năng lượng khi nằm yên cả ngày, phần nền của TDEE.
  bmr: number | null;
  tdee: number | null;
  weightDirection?: "lose" | "gain" | "maintain";
  rateBands?: { lose: { max: number; default: number }; gain: { max: number; default: number } };
  rateOptions?: {
    lose: { key: "slow" | "moderate" | "fast" | "maximum"; value: number }[];
    gain: { key: "slow" | "moderate" | "fast"; value: number }[];
  };
  maintainWeightThresholdKg?: number;
};

  // calorieGoal bằng null sẽ cho backend quay lại mục tiêu TDEE tự động.
export type ProfileUpdate = Partial<Omit<User, "calorieGoal">> & {
  calorieGoal?: number | null;
};

export type AuthSession = {
  user: User;
  token: string;
};

export type UserPatch = Partial<User> & { _id?: string };

export type ProfileResponse = {
  user: UserPatch;
  stats: Stats;
  adjustedGoal?: WeightGoal;
};

export type UserResponse = {
  user: UserPatch;
};

export type AuthContextType = {
  user: User | null;
  stats: Stats | null;
  token: string | null;
  isLoading: boolean;
  languagePreference: Lang | null;
  setLanguagePreference: (language: Lang) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  replaceSessionToken: (token: string) => Promise<void>;
  requestRegistrationOTP: (email: string) => Promise<void>;
  register: (name: string, email: string, password: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<ProfileResponse | undefined>;
  changeName: (name: string) => Promise<void>;
  uploadAvatar: (localUri: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};
