import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

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
  updateUser: (data: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
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

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem("user", JSON.stringify(updated));
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

  return (
    <AuthContext.Provider value={{ user, stats, token, isLoading, login, register, logout, updateUser, fetchProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
