import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, InteractionManager } from "react-native";
import { router } from "expo-router";
import { setOnUnauthorized } from "../utils/api";
import { getStrings } from "../i18n";
import { resolveLanguage } from "../utils/language";
import type {
  AuthContextType,
  AuthSession,
  ProfileUpdate,
  Stats,
  User,
  UserPatch,
} from "./authTypes";
import {
  changeNameRequest,
  deleteAccountRequest,
  fetchProfileRequest,
  loginRequest,
  registerRequest,
  sendRegistrationOTP,
  updateProfileRequest,
  uploadAvatarRequest,
} from "../utils/auth/accountApi";
import {
  clearStoredAccountData,
  clearStoredAuthSession,
  loadStoredAuthSession,
  saveStoredAuthSession,
  saveStoredUser,
} from "../utils/auth/authSession";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userRef = useRef<User | null>(null);
  const tokenRef = useRef<string | null>(null);
  const langRef = useRef<string | null>(null);
  userRef.current = user;
  tokenRef.current = token;
  langRef.current = user?.language ?? null;

  const saveSession = useCallback(async (session: AuthSession) => {
    setUser(session.user);
    setToken(session.token);
    await saveStoredAuthSession(session);
  }, []);

  useEffect(() => {
    async function loadAuth() {
      try {
        const session = await loadStoredAuthSession();
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      } catch {
        await clearStoredAuthSession().catch(() => {});
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    await saveSession(data);
  };

  const requestRegistrationOTP = async (email: string) => {
    await sendRegistrationOTP(email);
  };

  const register = async (name: string, email: string, password: string, otp: string) => {
    const data = await registerRequest(name, email, password, otp);
    await saveSession(data);
  };

  const logout = useCallback(async () => {
    userRef.current = null;
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    setStats(null);
    await clearStoredAccountData();
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      if (!tokenRef.current) return;
      tokenRef.current = null;
      router.replace("/auth/login");
      const t = getStrings(resolveLanguage(langRef.current));
      Alert.alert(t.auth.sessionExpiredTitle, t.auth.sessionExpiredMsg);
      InteractionManager.runAfterInteractions(() => { logout(); });
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  const mergeAndStoreUser = useCallback(async (patch: UserPatch) => {
    const current = userRef.current;
    if (!current) return;
    const next = { ...current, ...patch, id: patch._id ?? current.id };
    userRef.current = next;
    setUser(next);
    await saveStoredUser(next);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const data = await fetchProfileRequest(token);
    await mergeAndStoreUser(data.user);
    setStats(data.stats);
  }, [mergeAndStoreUser, token]);

  const updateProfile = async (data: ProfileUpdate) => {
    if (!token) return;
    const res = await updateProfileRequest(data, token);
    await mergeAndStoreUser(res.user);
    setStats(res.stats);
  };

  const changeName = async (name: string) => {
    if (!token) return;
    const res = await changeNameRequest(name, token);
    await mergeAndStoreUser(res.user);
  };

  const deleteAccount = async (password: string) => {
    if (!token) return;
    await deleteAccountRequest(password, token);
    await logout();
  };

  const uploadAvatar = async (localUri: string) => {
    if (!token) return;
    const avatar = await uploadAvatarRequest(localUri, token);
    await mergeAndStoreUser({ avatar });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        login,
        requestRegistrationOTP,
        register,
        logout,
        fetchProfile,
        updateProfile,
        changeName,
        uploadAvatar,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
