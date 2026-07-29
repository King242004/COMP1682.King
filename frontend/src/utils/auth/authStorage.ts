import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SECURE_TOKEN_KEY = "mealmate.auth.token";
const LEGACY_TOKEN_KEY = "token";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function loadAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  }

  const secureToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY, secureOptions);
  if (secureToken) return secureToken;

  // One-time migration for users already signed in before SecureStore was
  // introduced. Move the JWT, then remove its unencrypted legacy copy.
  const legacyToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken) {
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, legacyToken, secureOptions);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  }
  return legacyToken;
}

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(LEGACY_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token, secureOptions);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY, secureOptions);
  }
}
