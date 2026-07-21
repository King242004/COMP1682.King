// Scan feature — upload/lookup helpers + shared types.
import * as ImageManipulator from "expo-image-manipulator";
import { apiFetch } from "@/utils/api";

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

// One list for BOTH the live camera scanner and still-image scanning
export const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e", "code128"] as const;

// Stable reference so CameraView doesn't reconfigure the session each render
export const BARCODE_SETTINGS = { barcodeTypes: [...BARCODE_TYPES] } as {
  barcodeTypes: ("ean13" | "ean8" | "upc_a" | "upc_e" | "code128")[];
};

// Compress + resize before upload: big phone photos (4000px) → max 1024px wide,
// JPEG quality 0.5. Cuts upload size ~5-10x → faster scan. Falls back to original on error.
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

// Upload helper - returns parsed candidates or throws.
// Accepts an AbortSignal so the user can cancel an in-flight scan.
export async function scanImage(uri: string, token: string, signal?: AbortSignal): Promise<Candidate[]> {
  const formData = new FormData();
  const filename = uri.split("/").pop() || "meal.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  formData.append("image", { uri, name: filename, type: mimeType } as any);

  const data = await apiFetch("/scan/photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, { timeoutMs: 90_000, signal });
  return data.candidates || [];
}

// Look up a packaged product by barcode (Open Food Facts via backend)
export async function lookupBarcode(barcode: string, token: string): Promise<Product> {
  const data = await apiFetch("/scan/barcode", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ barcode }),
  });
  return data.product;
}
