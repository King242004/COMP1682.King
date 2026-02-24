export const theme = {
  colors: {
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#0B1220",
    muted: "#5B6475",
    subtle: "#8A93A3",
    border: "#E6E9F0",
    primary: "#0B2A6F", // deep navy
    primary2: "#0A225C",
    accent: "#2FBF71", // soft green
    accent2: "#FF8A3D", // soft orange
    danger: "#E5484D",
    danger2: "#C9343A",
    tint: "rgba(11, 42, 111, 0.10)",
    shadow: "rgba(11, 18, 32, 0.14)",
  },
  radius: {
    card: 18,
    input: 14,
    button: 16,
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

