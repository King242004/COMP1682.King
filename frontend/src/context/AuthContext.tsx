import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { apiRequest, BASE_URL, setOnUnauthorized } from "../utils/api";
import { cancelNotification } from "../utils/notifications";
import { getStrings } from "../i18n";
import { resolveLanguage } from "../utils/language";

type User = {
  id: string;
  name: string;
  email: string;
  calorieGoal: number;
  customGoal?: boolean; // true = user typed the goal; false = follows TDEE
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

type Stats = {
  bmi: number | null;
  bmiCategory: string | null;
  tdee: number | null;
};

// Profile update payload: calorieGoal accepts `null` = "Use auto" — the
// backend switches back to TDEE mode and recomputes (number = custom goal).
type ProfileUpdate = Partial<Omit<User, "calorieGoal">> & {
  calorieGoal?: number | null;
};

type AuthContextType = {
  user: User | null;
  stats: Stats | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  changeName: (name: string) => Promise<void>;
  uploadAvatar: (localUri: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }
    loadAuth();
  }, []);

  // Session-expiry watchdog: the JWT lives 30 days — when it dies the app used
  // to become a "zombie" (token still stored, every request silently 401s).
  // apiRequest calls this on any 401 → force logout + back to login.
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;
  // Language ref: the 401 callback is registered once, so it reads the CURRENT
  // language through a ref (AuthProvider sits above useT's own provider chain).
  const langRef = useRef<string | null>(null);
  langRef.current = user?.language ?? null;
  useEffect(() => {
    setOnUnauthorized(() => {
      // Only react while we believed we were logged in; Home fires several
      // parallel requests, so the ref-clear makes repeat 401s no-ops.
      if (!tokenRef.current) return;
      tokenRef.current = null;
      logout();
      const t = getStrings(resolveLanguage(langRef.current));
      Alert.alert(t.auth.sessionExpiredTitle, t.auth.sessionExpiredMsg);
      router.replace("/auth/login");
    });
    return () => setOnUnauthorized(null);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest("/auth/login", "POST", { email, password });
    setUser(data.user);
    setToken(data.token);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiRequest("/auth/register", "POST", { name, email, password });
    setUser(data.user);
    setToken(data.token);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setStats(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    // Per-user data must not survive into the NEXT account on this device:
    // cached AI insight/plan/grocery + the meal reminder all belong to the
    // user who just left.
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stale = keys.filter(
        (k) =>
          k.startsWith("coach_insight_") ||
          k.startsWith("plan_week_") ||
          k.startsWith("grocery_") ||
          k === "mealReminderId" ||
          k === "mealReminderTime"
      );
      const reminderId = await AsyncStorage.getItem("mealReminderId");
      await cancelNotification(reminderId);
      if (stale.length) await AsyncStorage.multiRemove(stale);
    } catch {
      // cache cleanup is best-effort — never block the logout itself
    }
  };

  const fetchProfile = async () => {
    if (!token) return;
    const data = await apiRequest("/profile", "GET", undefined, token);
    setUser((prev) => ({ ...prev, ...data.user, id: data.user._id ?? prev?.id }));
    setStats(data.stats);
  };

  const updateProfile = async (data: ProfileUpdate) => {
    if (!token) return;
    const res = await apiRequest("/profile", "PUT", data, token);
    setUser((prev) => ({ ...prev, ...res.user, id: res.user._id ?? prev?.id }));
    setStats(res.stats);
    await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...res.user }));
  };

  const changeName = async (name: string) => {
    if (!token) return;
    const res = await apiRequest("/user/name", "PUT", { name }, token);
    setUser((prev) => ({ ...prev, ...res.user, id: res.user._id ?? prev?.id }));
    await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...res.user }));
  };

  // Permanently deletes the account + ALL server-side data (password-confirmed),
  // then clears local state exactly like a logout.
  const deleteAccount = async (password: string) => {
    if (!token) return;
    await apiRequest("/user/account", "DELETE", { password }, token);
    await logout();
  };

  // Avatar upload uses multipart/form-data (image file), NOT JSON like other endpoints
  // So we bypass apiRequest helper and call fetch directly
  const uploadAvatar = async (localUri: string) => {
    if (!token) return;
    const formData = new FormData();
    // Extract filename + mime from local URI (e.g. file:///.../IMG_1234.jpg)
    const filename = localUri.split("/").pop() || "avatar.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    // React Native FormData accepts {uri, name, type} objects for file uploads
    formData.append("image", {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any);

    const res = await fetch(`${BASE_URL}/user/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type — let fetch set it with the boundary
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Avatar upload failed");
    setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : prev));
    if (user) await AsyncStorage.setItem("user", JSON.stringify({ ...user, avatar: data.avatar }));
  };

  return (
    <AuthContext.Provider value={{ user, stats, token, isLoading, login, register, logout, fetchProfile, updateProfile, changeName, uploadAvatar, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
