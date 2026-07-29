import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, User } from "@/context/authTypes";
import { cancelAllReminders } from "../notifications/reminders";
import { clearAuthToken, loadAuthToken, saveAuthToken } from "./authStorage";

const USER_KEY = "user";
const USER_CACHE_PREFIXES = ["coach_insight_", "plan_week_", "grocery_"];

export async function loadStoredAuthSession(): Promise<AuthSession | null> {
  const [token, storedUser] = await Promise.all([
    loadAuthToken(),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (token && storedUser) {
    return {
      token,
      user: JSON.parse(storedUser) as User,
    };
  }

  if (token) await clearAuthToken();
  return null;
}

export async function saveStoredUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function saveStoredAuthSession(session: AuthSession): Promise<void> {
  await saveAuthToken(session.token);
  await saveStoredUser(session.user);
}

export async function clearStoredAuthSession(): Promise<void> {
  await Promise.all([
    clearAuthToken(),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export async function clearStoredAccountData(): Promise<void> {
  await clearStoredAuthSession();

  // Cache cleanup is best-effort and must never block the logout itself.
  try {
    await cancelAllReminders();
    const keys = await AsyncStorage.getAllKeys();
    const staleKeys = keys.filter((key) =>
      USER_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
    );
    if (staleKeys.length) await AsyncStorage.multiRemove(staleKeys);
  } catch {
    // The authenticated session has already been removed above.
  }
}
