// ═══ FILE NÀY LÀM GÌ ═══
// Cửa HTTP duy nhất của frontend. Mọi feature API đều đi qua apiFetch hoặc apiRequest ở file này.
//
// Ai gọi tới: mọi file api của từng feature
// Nhận vào:   địa chỉ cần gọi, dữ liệu gửi đi, và thẻ đăng nhập
// Trả ra:     JSON từ route tương ứng trong backend/src/routes, đã đọc thành object
// Khi lỗi:    thẻ hết hạn thì gọi hàm đăng xuất chung, app tự về màn Đăng nhập.
//             Mạng hỏng thì ném lỗi lên cho màn hình tự báo
import Constants from "expo-constants";

// ══════════════════════════════════════════════════════════
// CHỐT ĐỊA CHỈ BACKEND
// Không ai gọi, cả khối chạy MỘT LẦN lúc app nạp file này
// Xong thì BASE_URL cố định cho tới khi tắt app
// ══════════════════════════════════════════════════════════

// Dò địa chỉ laptop đang chạy Expo, vì điện thoại thật không hiểu localhost
// Bốn dòng nối bằng dấu hoặc, vì mỗi bản Expo cất địa chỉ ở một chỗ khác nhau
function getDevHost(): string | null {
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

// Chạy hàm dò một lần, cắt gạch chéo cuối kẻo nối chuỗi ra hai gạch liền
const devHost = getDevHost();
const prodApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

// Chạy bản thật trên Render thì lấy EXPO_PUBLIC_API_URL trong frontend/.env
// Chạy thử ở nhà thì lấy địa chỉ laptop dò được ở trên
// Bản build từ GitHub bắt buộc phải có biến đó, thiếu là ném lỗi ngay
function resolveBaseUrl(): string {
  if (prodApi) return `${prodApi}/api`;
  if (devHost) return `http://${devHost}:5000/api`;
  throw new Error("EXPO_PUBLIC_API_URL is required when Expo cannot detect the development host");
}

// Chốt ngay lúc nạp file, mọi request về sau đều dán chuỗi này lên đầu
const BASE_URL = resolveBaseUrl();

// ══════════════════════════════════════════════════════════
// ĐƯỜNG DÂY BÁO THẺ HẾT HẠN
// Chỗ để AuthContext gửi vào một hàm, file này giữ đó rồi gọi lại khi gặp 401
// File này không tự biết cách đăng xuất nên phải nhờ AuthContext làm hộ
// ══════════════════════════════════════════════════════════

let onUnauthorized: (() => void) | null = null;
// AuthContext gọi một lần lúc dựng, và gọi lại với null khi bị gỡ
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

// Lỗi riêng cho hết giờ chờ, để màn hình phân biệt chờ lâu với mạng hỏng
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

// Chờ tối đa 45 giây, đủ dài cho lần gọi đầu khi Render còn đang thức dậy
const DEFAULT_TIMEOUT_MS = 45_000;

// ══════════════════════════════════════════════════════════
// GỌI MẠNG
// Đến từ mọi file api của mọi feature, đây là cửa RA cuối cùng của app
// Xong thì trả dữ liệu đã đọc sẵn về cho file api gọi tới
// ══════════════════════════════════════════════════════════

// Mọi request trong app đều vào đây
export async function apiFetch<T = any>(
  endpoint: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {}
): Promise<T> {
  // Lắp hai cái công tắc hủy trước khi gọi
  const controller = new AbortController();
  // Cờ để lát nữa phân biệt hủy vì hết giờ với hủy vì người dùng thoát màn
  let timedOut = false;
  // Cầu nối, để lệnh hủy từ bên ngoài bấm được vào công tắc bên trong
  const relayAbort = () => controller.abort();

  // Nối lệnh hủy từ ngoài vào, ví dụ màn Quét ảnh hủy khi người dùng thoát màn
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", relayAbort);

  // Đồng hồ đếm ngược, hết giờ thì bật cờ rồi tự bấm hủy
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  // Ra khỏi điện thoại. Đi tiếp: backend/server.js, backend/src/app.js,
  // rồi file trong backend/src/routes khớp với địa chỉ
  // X-Timezone-Offset để backend biết hôm nay của người dùng là ngày nào
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
    // Hết giờ thì báo lỗi chờ lâu, người dùng thoát màn thì để nguyên lỗi hủy
    if (error instanceof Error && error.name === "AbortError" && timedOut) throw new ApiTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", relayAbort);
  }

  // Đọc phần thân trả về thành object
  // Đọc hỏng thì để null chứ không ném ngay, vì còn phải xem mã lỗi bên dưới
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // Backend trả mã ngoài 2xx thì dựng Error rồi ném lên cho màn hình
  if (!res.ok) {
    // 401 là thẻ đăng nhập hỏng hoặc hết hạn
    // Đây là chỗ DUY NHẤT trong app tự động đăng xuất người dùng
    if (res.status === 401) onUnauthorized?.();
    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }
  // Tới đây là mọi thứ ổn, trả dữ liệu về cho file api gọi tới
  if (data === null) throw new Error("Server returned an invalid response");
  return data as T;
}

// Bản gọn của apiFetch cho request gửi JSON, tức gần hết app
// Chỉ đặt kiểu nội dung JSON và gắn thẻ đăng nhập, rồi giao lại cho apiFetch
// Nhớ: gửi ảnh thì KHÔNG dùng hàm này, phải gọi thẳng apiFetch với FormData,
//      vì đặt đè application/json sẽ làm backend không đọc được ảnh
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
