export type User = {
  id: string;
  name: string;
  email: string;
  calorieGoal: number;
  customGoal?: boolean;
  goal: string;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
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
  bmiCategory: string | null;
  tdee: number | null;
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
};

export type UserResponse = {
  user: UserPatch;
};

export type AuthContextType = {
  user: User | null;
  stats: Stats | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestRegistrationOTP: (email: string) => Promise<void>;
  register: (name: string, email: string, password: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  changeName: (name: string) => Promise<void>;
  uploadAvatar: (localUri: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};
