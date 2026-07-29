import { apiRequest } from "@/utils/api";

export type Exercise = {
  id: string;
  name: string;
  met: number;
  durationMin: number;
  caloriesBurned: number;
  date: string;
};
type RawExercise = Omit<Exercise, "id"> & { _id: string };

export type Activity = { key: string; met: number; icon: string; custom?: boolean };

export const ACTIVITY_GROUPS: { key: string; items: Activity[] }[] = [
  {
    key: "cardio",
    items: [
      { key: "walking", met: 3.5, icon: "🚶" },
      { key: "brisk_walking", met: 4.3, icon: "🚶‍♂️" },
      { key: "jogging", met: 8.0, icon: "🏃" },
      { key: "running_fast", met: 11, icon: "🏃‍♂️" },
      { key: "cycling", met: 6.0, icon: "🚴" },
      { key: "swimming", met: 6.0, icon: "🏊" },
      { key: "jump_rope", met: 10, icon: "🪢" },
      { key: "stair_climbing", met: 8.0, icon: "🪜" },
      { key: "elliptical", met: 5.0, icon: "🎚️" },
    ],
  },
  {
    key: "strength",
    items: [
      { key: "weights_light", met: 3.5, icon: "🏋️" },
      { key: "weights_heavy", met: 6.0, icon: "🏋️‍♂️" },
      { key: "bodyweight", met: 3.8, icon: "🤸" },
      { key: "hiit", met: 8.0, icon: "🔥" },
      { key: "crossfit", met: 8.0, icon: "💥" },
    ],
  },
  {
    key: "flexibility",
    items: [
      { key: "yoga", met: 3.0, icon: "🧘" },
      { key: "pilates", met: 3.0, icon: "🧎" },
      { key: "stretching", met: 2.5, icon: "🙆" },
    ],
  },
  {
    key: "sports",
    items: [
      { key: "football", met: 7.0, icon: "⚽" },
      { key: "basketball", met: 6.5, icon: "🏀" },
      { key: "badminton", met: 5.5, icon: "🏸" },
      { key: "tennis", met: 7.0, icon: "🎾" },
      { key: "volleyball", met: 4.0, icon: "🏐" },
      { key: "pickleball", met: 4.5, icon: "🥒" },
    ],
  },
  {
    key: "other",
    items: [
      { key: "dancing", met: 5.0, icon: "🕺" },
      { key: "hiking", met: 6.0, icon: "🥾" },
      { key: "boxing", met: 7.5, icon: "🥊" },
      { key: "other", met: 0, icon: "➕", custom: true },
    ],
  },
];

export const SIMPLE_ACTIVITIES: Activity[] = [
  { key: "walking", met: 3.5, icon: "🚶" },
  { key: "jogging", met: 8.0, icon: "🏃" },
  { key: "cycling", met: 6.0, icon: "🚴" },
  { key: "swimming", met: 6.0, icon: "🏊" },
  // Mức MET trung bình cho tập tạ nhẹ, nặng và HIIT.
  { key: "gym", met: 5.0, icon: "🏋️" },
  // Mức MET trung bình cho bóng đá, cầu lông và quần vợt.
  { key: "sports", met: 6.5, icon: "⚽" },
  // Mức MET trung bình cho yoga, pilates và giãn cơ.
  { key: "yoga_stretch", met: 2.8, icon: "🧘" },
  { key: "dancing", met: 5.0, icon: "🕺" },
  { key: "other", met: 0, icon: "➕", custom: true },
];

export const DURATION_PRESETS = [15, 30, 45, 60, 90];

export function estimateBurned(met: number, durationMin: number, weight: number | null) {
  const w = weight && weight > 0 ? weight : 60;
  return Math.round(met * w * (durationMin / 60));
}

function mapExercise(e: RawExercise): Exercise {
  return {
    id: e._id,
    name: e.name,
    met: e.met,
    durationMin: e.durationMin,
    caloriesBurned: e.caloriesBurned,
    date: e.date,
  };
}

export async function getExercisesByDate(
  token: string,
  date: string
): Promise<{ exercises: Exercise[]; totalBurned: number }> {
  const data = await apiRequest<{ exercises: RawExercise[]; totalBurned: number }>(`/exercise?date=${date}`, "GET", undefined, token);
  return { exercises: (data.exercises || []).map(mapExercise), totalBurned: data.totalBurned || 0 };
}

export async function addExercise(
  token: string,
  input: { name: string; met: number; durationMin: number; date: string }
): Promise<Exercise> {
  const data = await apiRequest<{ exercise: RawExercise }>("/exercise", "POST", input, token);
  return mapExercise(data.exercise);
}

export async function deleteExercise(token: string, id: string): Promise<void> {
  await apiRequest(`/exercise/${id}`, "DELETE", undefined, token);
}

export async function getExerciseHistory(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<Exercise[]> {
  const range = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  const data = await apiRequest<{ exercises: RawExercise[] }>(`/exercise/history${range}`, "GET", undefined, token);
  return (data.exercises || []).map(mapExercise);
}
