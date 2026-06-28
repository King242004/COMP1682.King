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

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
