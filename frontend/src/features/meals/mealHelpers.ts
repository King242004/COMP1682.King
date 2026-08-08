// ═══ FILE NÀY LÀM GÌ ═══
// Túi đồ dùng chung của phần món ăn: kiểm số dinh dưỡng, đặt nhãn nguồn số,
// đoán bữa theo giờ, gợi món gần đây, và dò tên gõ gần giống món cũ.
//
// Ai gọi tới: AddMealScreen, EditMealScreen, ScanScreen, MealDetailScreen
// Nhận vào:   bốn ô số dinh dưỡng, hoặc giờ hiện tại, hoặc danh sách món cũ
// Trả ra:     câu báo lỗi, tên bữa, danh sách món, hoặc món gần giống
// Khi lỗi:    không có nhánh lỗi, sai thì trả undefined chứ không ném
//
// Nhớ: mealSlotByHour có bản song sinh là coachController.mealTypeByHour
import type { Strings } from "@/i18n";
import type { NutritionSource } from "@/features/meals/mealTypes";
import { parseDecimal } from "@/utils/numberUtils";

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type NutritionFields = Record<"calories" | "protein" | "carbs" | "fat", string>;

// ══════════════════════════════════════════════════════════
// KIỂM SỐ DINH DƯỠNG. Ba hàm kiểm bốn ô số
// Đến từ màn Thêm món và màn Sửa món, chạy mỗi lần người dùng gõ
// ══════════════════════════════════════════════════════════

// Có gõ được ít nhất MỘT ô hay chưa
export function hasAnyNutrition(values: NutritionFields): boolean {
  return [values.calories, values.protein, values.carbs, values.fat].some((value) => value.trim());
}

// Đủ CẢ BỐN ô và số nằm trong khoảng cho phép thì mới cho lưu
export function hasCompleteNutrition(values: NutritionFields): boolean {
  if (![values.calories, values.protein, values.carbs, values.fat].every((value) => value.trim())) return false;
  const calories = parseDecimal(values.calories);
  // Ba chất gộp một mảng vì luật kiểm giống hệt nhau, chỉ calo phải lớn hơn 0
  const macros = [values.protein, values.carbs, values.fat].map(parseDecimal);
  return Number.isFinite(calories) && calories > 0 && calories <= 9999
    && macros.every((value) => Number.isFinite(value) && value >= 0 && value <= 9999);
}

// Câu lỗi đỏ dưới MỘT ô, allowZero tắt cho ô calo vì món 0 kcal là vô lý
export function nutritionNumberError(
  value: string,
  field: string,
  t: Strings,
  allowZero = true,
): string | undefined {
  if (!value.trim()) return t.meals.nutritionValueRequired(field);
  const number = parseDecimal(value);
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number === 0))
    return t.meals.numPositive(field);
  if (number > 9999) return t.meals.numTooHigh(field);
}

// ══════════════════════════════════════════════════════════
// NHÃN NGUỒN SỐ. Hai hàm tra bảng, cho biết số dinh dưỡng ở đâu ra
// Đến từ màn Chi tiết món và màn Sửa món
// ══════════════════════════════════════════════════════════

// Nguồn AI đoán thì hiện dấu ngã trước calo, mã vạch và món ghi lại thì không
export function isApproximateSource(source: NutritionSource): boolean {
  return ["ai_estimate", "ai_adjusted", "photo_scan", "ai_suggestion"].includes(source);
}

// Đổi mã nguồn ra chữ, bảng tra thẳng nên thiếu một khóa là TypeScript báo ngay
export function nutritionSourceLabel(source: NutritionSource, t: Strings): string {
  return {
    ai_estimate: t.meals.sourceAi,
    ai_adjusted: t.meals.sourceAdjusted,
    photo_scan: t.meals.sourcePhoto,
    barcode: t.meals.sourceBarcode,
    community: t.meals.sourceCommunity,
    repeat: t.meals.sourceRepeat,
    ai_suggestion: t.meals.sourceSuggestion,
    manual: t.meals.sourceManual,
  }[source];
}

// ══════════════════════════════════════════════════════════
// ĐOÁN BỮA VÀ GỢI MÓN. Hai hàm lo phần đoán sẵn cho màn Thêm món
// ══════════════════════════════════════════════════════════

// Đoán bữa theo giờ máy, sau 21 giờ tính là bữa phụ chứ không phải bữa tối
export function mealSlotByHour(h: number): MealSlot {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

// Món gần đây cho hàng chọn nhanh, ăn phở ba ngày liền thì chỉ hiện một ô Phở
export function recentUniqueMeals<T extends { name: string; date: string }>(
  history: T[],
  limit = 8,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  // Chép ra rồi mới sắp, kẻo đảo luôn thứ tự mảng gốc của nơi gọi
  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const m of sorted) {
    const key = m.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

// ══════════════════════════════════════════════════════════
// DÒ TÊN GÕ GẦN GIỐNG. Đến từ màn Thêm món, chạy khi gõ xong tên món
// Ra màn: câu hỏi "có phải ý bạn là bánh mì thịt không" dưới ô tên
// Không gọi mạng
// ══════════════════════════════════════════════════════════

// Chuẩn hóa hai kiểu, bản còn dấu để loại trùng khít, bản bỏ dấu để so độ giống
export function similarRecentMealName<T extends { name: string }>(query: string, meals: T[]): T | undefined {
  const exactQuery = normalizedName(query);
  const fuzzyQuery = normalizedName(query, true);
  // Tên dưới 8 chữ thì bỏ qua, "bo" với "ga" chỉ lệch 2 chữ mà là hai món khác
  if (fuzzyQuery.length < 8) return undefined;

  // Quét cả danh sách món cũ, giữ lại món lệch ÍT NHẤT
  let closest: { meal: T; distance: number } | undefined;
  for (const meal of meals) {
    // Trùng khít thì bỏ qua, vì đó là gõ đúng chứ không phải gõ sai
    if (normalizedName(meal.name) === exactQuery) continue;
    const candidate = normalizedName(meal.name, true);
    const distance = editDistance(fuzzyQuery, candidate);
    if (!closest || distance < closest.distance) closest = { meal, distance };
  }

  // Ngưỡng co giãn 20 phần trăm số chữ, kẹp trong khoảng 1 tới 3
  if (!closest) return undefined;
  const maxDistance = Math.min(3, Math.max(1, Math.floor(fuzzyQuery.length * 0.2)));
  return closest.distance <= maxDistance ? closest.meal : undefined;
}

// Đồ nghề của hàm trên, nằm dưới được vì khai báo function được kéo lên trước

// Đưa tên món về dạng chuẩn, removeMarks bật thì lột dấu tiếng Việt luôn
function normalizedName(value: string, removeMarks = false): string {
  const normalized = value.normalize(removeMarks ? "NFD" : "NFC").trim().replace(/\s+/g, " ").toLowerCase();
  return removeMarks
    ? normalized.replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, "")
    : normalized;
}

// Đếm số lần thêm, bớt hoặc đổi chữ để biến a thành b, số nhỏ là hai tên giống
function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = a[i - 1] === b[j - 1]
        ? diagonal
        : 1 + Math.min(diagonal, previous[j], previous[j - 1]);
      diagonal = above;
    }
  }
  return previous[b.length];
}
