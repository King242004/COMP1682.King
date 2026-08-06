// File này là cửa duy nhất để app gọi backend. Mọi request đều đi qua đây.
import Constants from "expo-constants";
import { Platform } from "react-native";

// Tìm địa chỉ máy đang chạy Expo, để điện thoại thật gọi được về laptop.
// Máy ảo và điện thoại không hiểu localhost, phải dùng địa chỉ IP của laptop.
function getDevHost(): string | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }
  const legacyConstants = Constants as typeof Constants & {
    expoGoConfig?: { hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    manifest?: { debuggerHost?: string };
  };
  const hostUri =
    Constants.expoConfig?.hostUri ||
    legacyConstants.expoGoConfig?.hostUri ||
    legacyConstants.manifest2?.extra?.expoGo?.debuggerHost ||
    legacyConstants.manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0];
}

const devHost = getDevHost();
const prodApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

// Địa chỉ backend, chọn theo thứ tự ưu tiên.
// 1. Biến EXPO_PUBLIC_API_URL trong frontend/.env, dùng khi chạy bản thật trên Render.
// 2. Địa chỉ laptop dò được ở trên, dùng khi chạy thử ở nhà.
// Bản build từ GitHub phải có EXPO_PUBLIC_API_URL. Khi chạy local bằng Expo,
// host của laptop được Expo cung cấp tự động nên không cần ghi cứng IP cá nhân.
function resolveBaseUrl(): string {
  if (prodApi) return `${prodApi}/api`;
  if (devHost) return `http://${devHost}:5000/api`;
  throw new Error("EXPO_PUBLIC_API_URL is required when Expo cannot detect the development host");
}

const BASE_URL = resolveBaseUrl();

// Chỗ để AuthContext gửi vào một hàm xử lý khi thẻ đăng nhập hết hạn.
// File này không tự biết cách đăng xuất, nên nhờ AuthContext làm hộ.
let onUnauthorized: (() => void) | null = null;
// AuthContext gọi hàm này một lần lúc dựng để gửi hàm xử lý vào,
// và gọi lại với null khi bị gỡ để không giữ hàm cũ.
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
  signal?: AbortSignal;
};

// Chờ tối đa 45 giây. Đủ dài cho lần gọi đầu khi Render còn đang thức dậy,
// vì gói miễn phí ngủ sau 15 phút không ai dùng.
const DEFAULT_TIMEOUT_MS = 45_000;

// Hàm gọi mạng gốc, mọi hàm khác trong app đều đi qua đây.
export async function apiFetch<T = any>(
  endpoint: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const relayAbort = () => controller.abort();

  // Nối lệnh hủy từ bên ngoài vào, ví dụ màn Quét ảnh hủy khi người dùng thoát màn.
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", relayAbort);

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    const headers = new Headers(init.headers);
    headers.set("X-Timezone-Offset", String(new Date().getTimezoneOffset()));
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    // Phân biệt hai kiểu hủy. Hết giờ thì báo lỗi quá thời gian chờ,
    // còn người dùng chủ động thoát màn thì để nguyên lỗi hủy cho màn hình tự bỏ qua.
    if (error instanceof Error && error.name === "AbortError" && timedOut) throw new ApiTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", relayAbort);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // 401 nghĩa là thẻ đăng nhập hỏng hoặc hết hạn.
    // Đây là chỗ duy nhất trong app tự động đăng xuất người dùng.
    if (res.status === 401) onUnauthorized?.();
    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (data === null) throw new Error("Server returned an invalid response");
  return data as T;
}

// Bản gọn của apiFetch cho các request gửi JSON, dùng nhiều nhất trong app.
// Gửi ảnh thì KHÔNG dùng hàm này, phải gọi thẳng apiFetch với FormData,
// vì kiểu nội dung của FormData do hệ thống tự đặt.
export async function apiRequest<T = any>(
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string,
  options?: ApiRequestOptions
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return apiFetch<T>(
    endpoint,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    },
    options
  );
}
