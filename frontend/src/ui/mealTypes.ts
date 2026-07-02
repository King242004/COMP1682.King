// Single source of truth for meal-type presentation (label + Ionicons icon + tint).
// Used by Home diary, add/edit meal, plan screens and history so the four meal
// types look identical everywhere.
export type MealTypeKey = "breakfast" | "lunch" | "dinner" | "snack";

export type MealTypeMeta = {
  key: MealTypeKey;
  label: string;
  icon: string;   // Ionicons name
  color: string;  // icon tint
  bg: string;     // soft background behind the icon
};

export const MEAL_TYPE_META: MealTypeMeta[] = [
  { key: "breakfast", label: "Breakfast", icon: "sunny", color: "#FF8A3D", bg: "rgba(255,138,61,0.12)" },
  { key: "lunch", label: "Lunch", icon: "partly-sunny", color: "#2563EB", bg: "rgba(37,99,235,0.10)" },
  { key: "dinner", label: "Dinner", icon: "moon", color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
  { key: "snack", label: "Snacks", icon: "nutrition", color: "#2FBF71", bg: "rgba(47,191,113,0.12)" },
];

export const MEAL_TYPE_BY_KEY: Record<string, MealTypeMeta> = Object.fromEntries(
  MEAL_TYPE_META.map((m) => [m.key, m])
);
