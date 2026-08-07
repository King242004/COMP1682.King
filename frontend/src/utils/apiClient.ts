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
//
// Không ai gọi, cả khối chạy MỘT LẦN lúc app nạp file này, trước mọi request.
// Ba bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì BASE_URL cố định cho tới khi tắt app.
// ══════════════════════════════════════════════════════════

// CHỐT ĐỊA CHỈ BƯỚC 1. Dò địa chỉ máy đang chạy Expo, để điện thoại thật gọi về laptop.
// Máy ảo và điện thoại không hiểu localhost, phải dùng địa chỉ IP của laptop.
// Bốn dòng dò nối nhau bằng dấu hoặc, vì mỗi bản Expo cất địa chỉ ở một chỗ khác nhau.
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

// CHỐT ĐỊA CHỈ BƯỚC 2. Chạy hàm dò một lần, và đọc biến môi trường một lần.
// Cắt dấu gạch chéo cuối, kẻo nối chuỗi ra hai gạch liền.
const devHost = getDevHost();
const prodApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

// CHỐT ĐỊA CHỈ BƯỚC 3. Chọn một trong hai theo thứ tự ưu tiên.
// Trước hết là EXPO_PUBLIC_API_URL trong frontend/.env, dùng khi chạy bản thật trên Render.
// Không có thì lấy địa chỉ laptop dò được ở BƯỚC 1, dùng khi chạy thử ở nhà.
// Nhớ: bản build từ GitHub bắt buộc phải có EXPO_PUBLIC_API_URL, vì lúc đó
//      không còn Expo nào để dò. Thiếu là ném lỗi ngay, chứ không im lặng gọi hụt.
function resolveBaseUrl(): string {
  if (prodApi) return `${prodApi}/api`;
  if (devHost) return `http://${devHost}:5000/api`;
  throw new Error("EXPO_PUBLIC_API_URL is required when Expo cannot detect the development host");
}

// Chốt luôn tại đây, ngay lúc nạp file. Mọi request về sau đều dán chuỗi này lên đầu.
const BASE_URL = resolveBaseUrl();

// ══════════════════════════════════════════════════════════
// ĐƯỜNG DÂY BÁO THẺ HẾT HẠN
//
// Không phải luồng. Chỉ là chỗ để AuthContext gửi vào một hàm, rồi file này
// giữ đó và gọi lại khi route trong backend/src trả 401, ở nhánh !res.ok bên dưới.
// File này không tự biết cách đăng xuất nên phải nhờ AuthContext làm hộ.
// ══════════════════════════════════════════════════════════

// Chỗ để AuthContext gửi vào một hàm xử lý khi thẻ đăng nhập hết hạn.
// File này không tự biết cách đăng xuất, nên nhờ AuthContext làm hộ.
let onUnauthorized: (() => void) | null = null;
// AuthContext gọi hàm này một lần lúc dựng để gửi hàm xử lý vào,
// và gọi lại với null khi bị gỡ để không giữ hàm cũ.
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

// Lỗi riêng cho trường hợp hết giờ chờ. Có kiểu lỗi riêng thì màn hình mới phân biệt được
// "chờ lâu quá" với "mạng hỏng", để hiện hai câu khác nhau.
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

// ══════════════════════════════════════════════════════════
// GỌI MẠNG
//
// Đến từ mọi file api của mọi feature. Đây là cửa RA cuối cùng của app.
// Sáu bước, đọc từ trên xuống là đúng thứ tự. BƯỚC 3 là chặng chờ mạng.
// Xong thì trả dữ liệu đã đọc sẵn về cho file api gọi tới.
// ══════════════════════════════════════════════════════════

// GỌI MẠNG BƯỚC 1. Mọi request trong app đều vào đây.
export async function apiFetch<T = any>(
  endpoint: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {}
): Promise<T> {
  // GỌI MẠNG BƯỚC 2. Lắp hai cái công tắc hủy trước khi gọi.
  // controller là công tắc hủy của lần gọi này.
  const controller = new AbortController();
  // Cờ này để lát nữa phân biệt hủy vì hết giờ với hủy vì người dùng thoát màn.
  let timedOut = false;
  // Cầu nối, để lệnh hủy từ bên ngoài bấm được vào công tắc bên trong.
  const relayAbort = () => controller.abort();

  // Nối lệnh hủy từ bên ngoài vào, ví dụ màn Quét ảnh hủy khi người dùng thoát màn.
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener("abort", relayAbort);

  // Đồng hồ đếm ngược. Hết giờ thì bật cờ rồi tự bấm hủy.
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  // GỌI MẠNG BƯỚC 3. fetch chuyển request tới backend/server.js → backend/src/app.js
  // → file trong backend/src/routes khớp với endpoint; await kết thúc khi route trả response.
  // X-Timezone-Offset cho các controller dùng requestTodayKey chốt ngày địa phương của thiết bị.
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

  // GỌI MẠNG BƯỚC 4. Đọc phần thân trả về thành object.
  // Đọc hỏng thì để null chứ không ném ngay, vì còn phải xem mã lỗi ở BƯỚC 5 đã.
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // GỌI MẠNG BƯỚC 5. Route trả mã ngoài 2xx thì dựng Error từ response rồi ném cho màn hình.
  if (!res.ok) {
    // 401 nghĩa là thẻ đăng nhập hỏng hoặc hết hạn.
    // Đây là chỗ duy nhất trong app tự động đăng xuất người dùng.
    if (res.status === 401) onUnauthorized?.();
    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : `Request failed (${res.status})`;
    throw new Error(message);
  }
  // GỌI MẠNG BƯỚC 6. Tới đây là mọi thứ ổn, trả dữ liệu về cho file api gọi tới.
  if (data === null) throw new Error("Server returned an invalid response");
  return data as T;
}

// Bản gọn của apiFetch, dành cho request gửi JSON, tức gần hết app.
// Chỉ làm hai việc: đặt kiểu nội dung là JSON và gắn thẻ đăng nhập, rồi giao lại cho apiFetch.
// Nhớ: gửi ảnh thì KHÔNG dùng hàm này, phải gọi thẳng apiFetch với FormData,
//      vì FormData cần hệ thống tự đặt kiểu nội dung kèm chuỗi phân cách,
//      ghi đè "application/json" sẽ làm middleware imageUpload.js không đọc được multipart boundary.
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
