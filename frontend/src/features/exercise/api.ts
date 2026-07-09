import { apiRequest } from "@/utils/api";

export type Exercise = {
  id: string;
  name: string;
  met: number;
  durationMin: number;
  caloriesBurned: number;
  date: string;
};

// MET values from the Compendium of Physical Activities (common subset).
// `key` looks up the localized label in t.exercise.groups / t.exercise.activities.
// `custom` marks the "Other" entry where the user types their own MET.
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

// Live preview helper — mirrors the backend MET formula
export function estimateBurned(met: number, durationMin: number, weight: number | null) {
  const w = weight && weight > 0 ? weight : 60;
  return Math.round(met * w * (durationMin / 60));
}

function mapExercise(e: any): Exercise {
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
  const data = await apiRequest(`/exercise?date=${date}`, "GET", undefined, token);
  return { exercises: (data.exercises || []).map(mapExercise), totalBurned: data.totalBurned || 0 };
}

export async function addExercise(
  token: string,
  input: { name: string; met: number; durationMin: number; date: string }
): Promise<Exercise> {
  const data = await apiRequest("/exercise", "POST", input, token);
  return mapExercise(data.exercise);
}

export async function deleteExercise(token: string, id: string): Promise<void> {
  await apiRequest(`/exercise/${id}`, "DELETE", undefined, token);
}
