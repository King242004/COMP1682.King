// Single source for the profile goal / activity option lists.
// Shared by the Profile tab (display labels) and the Edit screen (pickers).

export const GOALS = [
  { key: "lose_weight", label: "Lose Weight" },
  { key: "gain_muscle", label: "Gain Muscle" },
  { key: "eat_healthy", label: "Eat Healthy" },
] as const;

export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary" },
  { key: "moderate", label: "Moderate" },
  { key: "active", label: "Active" },
] as const;

export const goalLabel = (key?: string | null) =>
  GOALS.find((g) => g.key === key)?.label;

export const activityLabel = (key?: string | null) =>
  ACTIVITY_LEVELS.find((a) => a.key === key)?.label;
