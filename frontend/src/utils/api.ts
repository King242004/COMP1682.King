import Constants from "expo-constants";

// Tự động lấy IP của laptop (máy chạy Metro) để gọi backend, không cần sửa tay
// mỗi khi đổi mạng. Trong Expo Go, điện thoại luôn cùng mạng với Metro nên IP này
// chính là IP backend (cùng laptop, cổng 5000).
function getDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0]; // bỏ cổng (vd "192.168.1.22:8081" → "192.168.1.22")
}

const devHost = getDevHost();

// Tự động khi chạy Expo Go, fallback IP cứng nếu không lấy được.
export const BASE_URL = devHost
  ? `http://${devHost}:5000/api`
  : "http://192.168.1.22:5000/api";

// Called when the server rejects our token (401 = expired/invalid JWT).
// AuthContext registers a handler that force-logs-out and returns to login —
// otherwise an expired session leaves a "zombie" app full of silent errors.
// (Safe to hook on 401: login/register failures return 400, never 401.)
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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
