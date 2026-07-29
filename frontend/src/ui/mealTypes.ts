export type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack";

export type MealTypeMeta = {
  key: MealTypeKey;
  label: string;
  // Tên biểu tượng trong bộ Ionicons.
  icon: string;
  // Màu của biểu tượng.
  color: string;
  // Màu nền nhẹ phía sau biểu tượng.
  bg: string;
};

export const MEAL_TYPE_META: MealTypeMeta[] = [
  { key: "breakfast", label: "Breakfast", icon: "sunny", color: "#FF8A3D", bg: "rgba(255,138,61,0.12)" },
  { key: "lunch", label: "Lunch", icon: "partly-sunny", color: "#0891B2", bg: "rgba(8,145,178,0.10)" },
  { key: "dinner", label: "Dinner", icon: "moon", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  { key: "snack", label: "Snacks", icon: "nutrition", color: "#059669", bg: "rgba(5,150,105,0.12)" },
];

export const MEAL_TYPE_BY_KEY: Record<string, MealTypeMeta> = Object.fromEntries(
  MEAL_TYPE_META.map((m) => [m.key, m])
);
