// ═══ FILE NÀY LÀM GÌ ═══
// Khai bốn buổi ăn cùng biểu tượng và màu của từng buổi.
//
// Ai gọi tới: mọi màn có nhắc tới buổi ăn
// Nhận vào:   mã buổi ăn
// Trả ra:     tên hiển thị, biểu tượng, và màu
// Khi lỗi:    không có nhánh lỗi

// Mọi màn lấy từ đây nên bốn buổi luôn cùng màu và cùng biểu tượng khắp app
import { theme } from "@/ui/theme";
import type { MealType } from "./mealTypes";

// Trước đây file này khai lại nguyên một union giống hệt MealType ở mealTypes.ts.
// Nay chỉ đặt tên khác cho cùng một kiểu, nên thêm bớt buổi ăn chỉ sửa một chỗ.
export type MealTypeKey = MealType;

export type MealTypeMeta = {
  key: MealTypeKey;
  // Tên biểu tượng trong bộ Ionicons
  icon: string;
  // Màu của biểu tượng
  color: string;
  // Màu nền nhẹ phía sau biểu tượng
  bg: string;
};

// Màu lấy từ theme chứ không gõ mã màu, vì cả bốn màu này đều đã có tên ở đó.
// Gõ tay thì đổi tông màu app một chỗ mà bốn biểu tượng bữa ăn vẫn màu cũ.
export const MEAL_TYPE_META: MealTypeMeta[] = [
  { key: "breakfast", icon: "sunny", color: theme.colors.accent2, bg: "rgba(255,138,61,0.12)" },
  { key: "lunch", icon: "partly-sunny", color: theme.colors.primary, bg: theme.colors.tint },
  { key: "dinner", icon: "moon", color: theme.colors.indigo, bg: "rgba(99,102,241,0.12)" },
  { key: "snack", icon: "nutrition", color: theme.colors.accent, bg: "rgba(5,150,105,0.12)" },
];

export const MEAL_TYPE_BY_KEY: Record<string, MealTypeMeta> = Object.fromEntries(
  MEAL_TYPE_META.map((m) => [m.key, m])
);
