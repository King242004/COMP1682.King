import { apiRequest } from "./api";

export type Exercise = {
  id: string;
  name: string;
  met: number;
  durationMin: number;
  caloriesBurned: number;
  date: string;
};

// MET values from the Compendium of Physical Activities (common subset).
// `custom` marks the "Other" entry where the user types their own MET.
export type Activity = { name: string; met: number; icon: string; custom?: boolean };

export const ACTIVITY_GROUPS: { group: string; items: Activity[] }[] = [
  {
    group: "Cardio",
    items: [
      { name: "Walking", met: 3.5, icon: "🚶" },
      { name: "Brisk walking", met: 4.3, icon: "🚶‍♂️" },
      { name: "Jogging", met: 8.0, icon: "🏃" },
      { name: "Running (fast)", met: 11, icon: "🏃‍♂️" },
      { name: "Cycling", met: 6.0, icon: "🚴" },
      { name: "Swimming", met: 6.0, icon: "🏊" },
      { name: "Jump rope", met: 10, icon: "🪢" },
      { name: "Stair climbing", met: 8.0, icon: "🪜" },
      { name: "Elliptical", met: 5.0, icon: "🎚️" },
    ],
  },
  {
    group: "Strength / Gym",
    items: [
      { name: "Weights (light)", met: 3.5, icon: "🏋️" },
      { name: "Weights (heavy)", met: 6.0, icon: "🏋️‍♂️" },
      { name: "Bodyweight", met: 3.8, icon: "🤸" },
      { name: "HIIT", met: 8.0, icon: "🔥" },
      { name: "CrossFit", met: 8.0, icon: "💥" },
    ],
  },
  {
    group: "Flexibility / Light",
    items: [
      { name: "Yoga", met: 3.0, icon: "🧘" },
      { name: "Pilates", met: 3.0, icon: "🧎" },
      { name: "Stretching", met: 2.5, icon: "🙆" },
    ],
  },
  {
    group: "Sports",
    items: [
      { name: "Football", met: 7.0, icon: "⚽" },
      { name: "Basketball", met: 6.5, icon: "🏀" },
      { name: "Badminton", met: 5.5, icon: "🏸" },
      { name: "Tennis", met: 7.0, icon: "🎾" },
      { name: "Volleyball", met: 4.0, icon: "🏐" },
      { name: "Pickleball", met: 4.5, icon: "🥒" },
    ],
  },
  {
    group: "Other",
    items: [
      { name: "Dancing", met: 5.0, icon: "🕺" },
      { name: "Hiking", met: 6.0, icon: "🥾" },
      { name: "Boxing", met: 7.5, icon: "🥊" },
      { name: "Other", met: 0, icon: "➕", custom: true },
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
