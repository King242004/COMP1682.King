import Constants from "expo-constants";
import { Platform } from "react-native";

// Tự động lấy IP của laptop (máy chạy Metro) để gọi backend, không cần sửa tay
// mỗi khi đổi mạng. Trong Expo Go, điện thoại luôn cùng mạng với Metro nên IP này
// chính là IP backend (cùng laptop, cổng 5000).
function getDevHost(): string | null {
  // Bản web: trang được serve từ chính máy dev → hostname của trang là host backend
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0]; // bỏ cổng (vd "192.168.1.37:8081" → "192.168.1.37")
}

const devHost = getDevHost();

// Deployed backend: set EXPO_PUBLIC_API_URL to the hosted root (no trailing
// /api, e.g. https://mealmate-api.onrender.com). When present it wins, so the
// app works off any network without the laptop running. When absent we fall
// back to the auto-detected dev host, so local development is unchanged.
const prodApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export const BASE_URL = prodApi
  ? `${prodApi}/api`
  : devHost
  ? `http://${devHost}:5000/api`
  : "http://192.168.1.37:5000/api";

// Called when the server rejects our token (401 = expired/invalid JWT).
// AuthContext registers a handler that force-logs-out and returns to login —
// otherwise an expired session leaves a "zombie" app full of silent errors.
// (Safe to hook on 401: login/register failures return 400, never 401.)
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export class ApiTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "ApiTimeoutError";
  }
}

type ApiRequestOptions = {
  timeoutMs?: number;
};

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string,
  options?: ApiRequestOptions
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = options?.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : null;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") throw new ApiTimeoutError();
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  // Guard the parse: a proxy/crash can still return non-JSON (HTML error page) —
  // surface a readable message instead of a cryptic "JSON Parse error".
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  if (data === null) throw new Error("Server returned an invalid response");
  return data;
}
