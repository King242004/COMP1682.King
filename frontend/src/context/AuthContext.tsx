import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, BASE_URL } from "../utils/api";

type User = {
  id: string;
  name: string;
  email: string;
  calorieGoal: number;
  goal: string;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  activityLevel?: string | null;
  conditions?: string[];
  avatar?: string | null;
  language?: "vi" | "en" | null;
};

type Stats = {
  bmi: number | null;
  bmiCategory: string | null;
  tdee: number | null;
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
  updateProfile: (data: Partial<User>) => Promise<void>;
  changeName: (name: string) => Promise<void>;
  uploadAvatar: (localUri: string) => Promise<void>;
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
    await AsyncStorage.removeItem("meals");
  };

  const fetchProfile = async () => {
    if (!token) return;
    const data = await apiRequest("/profile", "GET", undefined, token);
    setUser((prev) => ({ ...prev, ...data.user, id: data.user._id ?? prev?.id }));
    setStats(data.stats);
  };

  const updateProfile = async (data: Partial<User>) => {
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
    <AuthContext.Provider value={{ user, stats, token, isLoading, login, register, logout, fetchProfile, updateProfile, changeName, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
