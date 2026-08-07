// ═══ FILE NÀY LÀM GÌ ═══
// Túi đồ dùng chung của phần món ăn: kiểm số dinh dưỡng, đặt nhãn nguồn số,
// đoán bữa theo giờ, gợi món gần đây, và dò tên gõ gần giống món cũ.
//
// Ai gọi tới: AddMealScreen, EditMealScreen, ScanScreen, MealDetailScreen
// Nhận vào:   bốn ô số dinh dưỡng, hoặc giờ hiện tại, hoặc danh sách món cũ
// Trả ra:     câu báo lỗi, tên bữa, danh sách món, hoặc món gần giống
// Khi lỗi:    không có nhánh lỗi, sai thì trả undefined chứ không ném
//
// Nhớ: mealSlotByHour có bản song sinh là coachController.mealTypeByHour.
// Sửa mốc giờ bên này thì phải sửa hàm đó để app với Coach không nói khác nhau.
import type { Strings } from "@/i18n";
import type { NutritionSource } from "@/features/meals/mealTypes";
import { parseDecimal } from "@/utils/numberUtils";

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type NutritionFields = Record<"calories" | "protein" | "carbs" | "fat", string>;

// ══════════════════════════════════════════════════════════
// KIỂM SỐ DINH DƯỠNG
//
// Không phải luồng. Ba hàm kiểm bốn ô số, gọi cái nào cũng được.
// Đến từ màn Thêm món và màn Sửa món, chạy mỗi lần người dùng gõ.
// ══════════════════════════════════════════════════════════

// Có gõ được ít nhất MỘT ô hay chưa. Dùng để biết nên hiện nút "Nhờ AI ước tính"
// hay để người dùng tự nhập tiếp.
export function hasAnyNutrition(values: NutritionFields): boolean {
  return [values.calories, values.protein, values.carbs, values.fat].some((value) => value.trim());
}

// Chặt hơn hàm trên: phải đủ CẢ BỐN ô và số phải nằm trong khoảng cho phép.
// Đủ thì mới cho lưu mà không cần nhờ AI ước tính.
export function hasCompleteNutrition(values: NutritionFields): boolean {
  if (![values.calories, values.protein, values.carbs, values.fat].every((value) => value.trim())) return false;
  const calories = parseDecimal(values.calories);
  // Ba chất gộp một mảng vì luật kiểm giống hệt nhau, chỉ calo là phải lớn hơn 0.
  const macros = [values.protein, values.carbs, values.fat].map(parseDecimal);
  return Number.isFinite(calories) && calories > 0 && calories <= 9999
    && macros.every((value) => Number.isFinite(value) && value >= 0 && value <= 9999);
}

// Câu báo lỗi cho MỘT ô, hiện ngay dưới ô đó. Không lỗi thì trả undefined.
// allowZero tắt cho ô calo, vì món 0 kcal là vô lý, còn ba chất kia bằng 0 thì được.
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
// NHÃN NGUỒN SỐ
//
// Không phải luồng. Hai hàm tra bảng, cho biết số dinh dưỡng ở đâu ra.
// Đến từ màn Chi tiết món và màn Sửa món.
// ══════════════════════════════════════════════════════════

// Nguồn nào là số AI ước tính, nguồn nào là số chắc chắn.
// Giao diện dùng cái này để quyết định có hiện dấu ngã trước số calo và có hiện
// câu cảnh báo ước tính hay không. Mã vạch và món ghi lại thì số đã có sẵn nên
// không phải ước tính, còn bốn nguồn còn lại đều do AI đoán ra.
export function isApproximateSource(source: NutritionSource): boolean {
  return ["ai_estimate", "ai_adjusted", "photo_scan", "ai_suggestion"].includes(source);
}

// Đổi mã nguồn ra chữ cho người đọc. Bảng tra thẳng, thiếu một khóa là TypeScript báo ngay.
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
// ĐOÁN BỮA VÀ GỢI MÓN
//
// Không phải luồng. Hai hàm lo phần đoán sẵn cho màn Thêm món,
// để mở màn ra là ô bữa đã chọn đúng và có sẵn vài món bấm một cái là xong.
// ══════════════════════════════════════════════════════════

// Đoán bữa theo giờ máy. Sau 21 giờ tính là bữa phụ chứ không phải bữa tối.
// Nhớ: coachController.mealTypeByHour là bản song sinh; sửa bên này phải sửa hàm đó.
export function mealSlotByHour(h: number): MealSlot {
  if (h < 11) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 17) return "snack";
  if (h < 21) return "dinner";
  return "snack";
}

// Lấy tối đa 8 món gần đây, mỗi TÊN chỉ hiện một lần, cho hàng chọn nhanh ở màn Thêm món.
// Ăn phở ba ngày liền thì chỉ hiện một ô Phở, chứ không hiện ba ô giống nhau.
export function recentUniqueMeals<T extends { name: string; date: string }>(
  history: T[],
  limit = 8,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  // Chép ra rồi mới sắp, không sắp thẳng mảng gốc, kẻo đảo luôn thứ tự của nơi gọi.
  // Sắp giảm dần theo ngày, nên món giữ lại luôn là lần ăn gần nhất.
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
// DÒ TÊN GÕ GẦN GIỐNG
//
// Đến từ màn Thêm món, chạy khi người dùng gõ xong tên món.
// Bốn bước, đọc từ trên xuống là đúng thứ tự. Không gọi mạng.
// Để làm gì: gõ "bunh mi thit" mà tuần trước đã ăn "bánh mì thịt" thì hỏi lại,
// đỡ đẻ ra hai món khác tên nhưng thật ra là một.
// Xong thì màn Thêm món hiện câu hỏi "có phải ý bạn là ... không".
// ══════════════════════════════════════════════════════════

// DÒ TÊN BƯỚC 1. Màn Thêm món gọi thẳng vào đây, kèm tên vừa gõ và danh sách món cũ.
// Chuẩn hóa tên gõ theo hai kiểu: bản còn dấu để loại món trùng khít,
// bản bỏ dấu để đem đi so độ giống.
export function similarRecentMealName<T extends { name: string }>(query: string, meals: T[]): T | undefined {
  const exactQuery = normalizedName(query);
  const fuzzyQuery = normalizedName(query, true);
  // Tên ngắn dưới 8 chữ thì bỏ qua, vì tên càng ngắn càng dễ giống nhau bừa.
  // "bo" với "ga" chỉ lệch 2 chữ nhưng là hai món hoàn toàn khác.
  if (fuzzyQuery.length < 8) return undefined;

  // DÒ TÊN BƯỚC 2. Quét cả danh sách món cũ, giữ lại món lệch ÍT NHẤT.
  let closest: { meal: T; distance: number } | undefined;
  for (const meal of meals) {
    // Trùng khít thì bỏ qua, vì đó là gõ đúng chứ không phải gõ sai.
    if (normalizedName(meal.name) === exactQuery) continue;
    const candidate = normalizedName(meal.name, true);
    const distance = editDistance(fuzzyQuery, candidate);
    if (!closest || distance < closest.distance) closest = { meal, distance };
  }

  // DÒ TÊN BƯỚC 3. Chốt xem gần nhất đã đủ gần chưa.
  // Ngưỡng co giãn theo độ dài, lấy 20 phần trăm số chữ, kẹp trong khoảng 1 tới 3.
  // Tên dài thì cho sai nhiều hơn, nhưng tối đa 3 chữ, quá đó là hai món khác nhau.
  if (!closest) return undefined;
  const maxDistance = Math.min(3, Math.max(1, Math.floor(fuzzyQuery.length * 0.2)));
  return closest.distance <= maxDistance ? closest.meal : undefined;
}

// DÒ TÊN BƯỚC 4, phần đồ nghề. Hai hàm dưới đây được BƯỚC 1 tới 3 gọi.
// Nằm dưới chỗ gọi được vì đều là khai báo function, JavaScript kéo lên trước khi chạy.

// Đưa tên món về một dạng chuẩn để so.
// removeMarks tắt thì chỉ gom khoảng trắng với hạ chữ thường.
// removeMarks bật thì lột luôn dấu tiếng Việt, đổi đ thành d, bỏ hết ký tự lạ.
// Tách NFD là tách chữ với dấu ra hai ký tự, nhờ đó xóa dấu bằng một lệnh thay thế.
function normalizedName(value: string, removeMarks = false): string {
  const normalized = value.normalize(removeMarks ? "NFD" : "NFC").trim().replace(/\s+/g, " ").toLowerCase();
  return removeMarks
    ? normalized.replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, "")
    : normalized;
}

// Đếm số lần sửa ít nhất để biến chuỗi a thành chuỗi b.
// Một lần sửa là thêm, bớt, hoặc đổi một chữ. Số càng nhỏ thì hai tên càng giống.
// Chỉ giữ MỘT hàng số thay vì cả bảng, vì mỗi ô chỉ cần ba ô liền kề là tính được.
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
