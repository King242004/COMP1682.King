// ═══ FILE NÀY LÀM GÌ ═══
// Danh sách địa chỉ backend của phần quét món, kèm phần nén ảnh trước khi gửi.
// Không giữ state và không vẽ gì.
//
// Ai gọi tới: ScanScreen (quét ảnh, quét mã vạch),
//             AddMealScreen (nút Ước tính khi gõ tay tên món)
// Nhận vào:   đường dẫn ảnh trong máy, hoặc dãy số mã vạch, hoặc tên món
// Trả ra:     danh sách món kèm calo và ba chất
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo
//
// Ba việc, ba địa chỉ:
//   scanPhoto          POST /scan/photo     ảnh món, AI trả tối đa ba ứng viên
//   scanBarcode        POST /scan/barcode   scanController.scanBarcode tra Open Food Facts
//   estimateNutrition  POST /scan/estimate  tên và khẩu phần, AI trả calo cùng ba chất
// Ảnh được thu nhỏ và nén TRƯỚC khi gửi. Ảnh gốc của điện thoại quá nặng nên
// vừa lâu vừa dễ vượt giới hạn của scanUploadLimiter trong scanRoutes.js.
import * as ImageManipulator from "expo-image-manipulator";
import { apiFetch } from "@/utils/apiClient";
import type { Lang } from "@/utils/languageUtils";

export type ScanMode = "photo" | "barcode";

export type Candidate = {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionDescription?: string;
};

export type Product = {
  name: string;
  brand?: string | null;
  image?: string | null;
  servingSize?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionEstimate = {
  items: NutritionEstimateItem[];
  totals: NutritionTotals;
};

export type NutritionEstimateItem = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionDescription: string;
};

export type NutritionTotals = Pick<NutritionEstimateItem, "calories" | "protein" | "carbs" | "fat">;

export type NutritionEstimateInput = {
  items: { name: string; portion: string; details?: string }[];
};

export const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e", "code128"] as const;

export const BARCODE_SETTINGS = { barcodeTypes: [...BARCODE_TYPES] } as {
  barcodeTypes: ("ean13" | "ean8" | "upc_a" | "upc_e" | "code128")[];
};

// File này KHÔNG gọi fetch. Nó nhờ apiFetch bên src/utils/apiClient.ts,
// chỗ đó lo địa chỉ server, thẻ đăng nhập, múi giờ, hạn chờ và lỗi 401.

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri;
  }
}

// Gửi language để scanController.scanPhoto đưa ngôn ngữ vào vision prompt.
export async function scanImage(
  uri: string,
  token: string,
  language: Lang,
  signal?: AbortSignal
): Promise<Candidate[]> {
  const formData = new FormData();
  const filename = uri.split("/").pop() || "meal.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  formData.append("image", { uri, name: filename, type: mimeType } as any);
  formData.append("language", language);

  const data = await apiFetch("/scan/photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, { timeoutMs: 90_000, signal });
  return data.candidates || [];
}

export async function lookupBarcode(barcode: string, token: string): Promise<Product> {
  const data = await apiFetch("/scan/barcode", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ barcode }),
  });
  return data.product;
}

export async function estimateNutrition(
  meal: NutritionEstimateInput,
  token: string,
  language: Lang
): Promise<NutritionEstimate> {
  const data = await apiFetch<{ estimate: NutritionEstimate }>("/scan/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...meal, language }),
  }, { timeoutMs: 60_000 });
  return data.estimate;
}
