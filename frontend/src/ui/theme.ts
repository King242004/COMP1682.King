// Palette from design-system/meal-snap/MASTER.md — "Calm cyan + health green"
// (UI/UX Pro Max recommendation for health/nutrition apps).
export const theme = {
  colors: {
    bg: "#ECFEFF", // soft cyan-tinted background
    surface: "#FFFFFF",
    text: "#164E63", // deep cyan-slate
    muted: "#3F6B7D",
    subtle: "#5C7F8F", // keeps ≥4.5:1 on white for small text
    border: "#D7EEF4",
    primary: "#0891B2", // calm medical cyan
    primary2: "#0E7490", // pressed/darker state
    accent: "#059669", // health green — CTAs & positive states
    accent2: "#FF8A3D", // energy orange (flame/activity)
    indigo: "#6366F1", // fat macro — cool counterpoint to the cyan palette
    danger: "#E5484D",
    danger2: "#C9343A",
    tint: "rgba(8, 145, 178, 0.10)",
    tintSoft: "rgba(8, 145, 178, 0.06)", // lighter tint for large surfaces (search box, chips)
    shadow: "rgba(22, 78, 99, 0.16)",
  },
  // Soft UI Evolution: radius 12-18, depth via layered soft shadows (see shadow())
  radius: {
    card: 18,
    input: 14,
    button: 14,
    pill: 999,
  },
  space: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  type: {
    h0: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.3 },
    h1: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.2 },
    h2: { fontSize: 18, fontWeight: "800" as const, letterSpacing: -0.1 },
    body: { fontSize: 15, fontWeight: "500" as const },
    body2: { fontSize: 14, fontWeight: "500" as const },
    caption: { fontSize: 12, fontWeight: "600" as const },
  },
} as const;

export type Theme = typeof theme;

// Single source of truth for daily macro goals (grams), derived from calorie goal.
// Split: 30% protein, 45% carbs, 25% fat. Protein/carbs = 4 kcal/g, fat = 9 kcal/g.
// Used by Home, Progress and Meal Detail so all screens stay consistent.
export function macroGoals(calorieGoal: number) {
  return {
    protein: Math.round((calorieGoal * 0.3) / 4),
    carbs: Math.round((calorieGoal * 0.45) / 4),
    fat: Math.round((calorieGoal * 0.25) / 9),
  };
}

export function shadow(level: 1 | 2 | 3 = 2) {
  // Soft, premium shadow that works on iOS + Android.
  // Level 1 = quiet RESTING shadow for ordinary cards — kept subtle so level 2+
  // (hero/summary cards) visibly float above them (depth hierarchy, not noise).
  if (level === 1) {
    return {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 1,
    } as const;
  }

  if (level === 2) {
    return {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.55,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 22,
      elevation: 4,
    } as const;
  }

  return {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 6,
  } as const;
}

