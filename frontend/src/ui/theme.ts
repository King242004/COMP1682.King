export const theme = {
  colors: {
    bg: "#F5F9FF", // soft blue-tinted background — friendlier than pure white
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#526077",
    subtle: "#64748B", // was #8C99AD (~3:1 on white) — bumped to meet WCAG 4.5:1 for small text
    border: "#E3EAF5",
    primary: "#2563EB", // ocean blue — friendly yet trustworthy
    primary2: "#1D4ED8", // pressed/darker state
    accent: "#2FBF71", // soft green
    accent2: "#FF8A3D", // soft orange
    indigo: "#6366F1", // fat macro — replaces old purple, fits blue palette
    danger: "#E5484D",
    danger2: "#C9343A",
    tint: "rgba(37, 99, 235, 0.10)",
    shadow: "rgba(15, 23, 42, 0.14)",
  },
  radius: {
    card: 22,
    input: 16,
    button: 18,
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
  if (level === 1) {
    return {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 14,
      elevation: 2,
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

