import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleDailyReminder, cancelNotification } from "./notifications";

// Per meal reminders. Each meal type owns one daily notification, so the
// message can name the meal ("Did you log lunch?") rather than being generic.
//
// LIMITATION: a scheduled notification is handed to the operating system, so it
// fires whether or not the meal was already logged. Skipping a reminder for an
// already logged meal would require code to run at fire time, which needs a
// development build rather than the standard development client.

export const MEAL_KEYS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealKey = (typeof MEAL_KEYS)[number];

export type Reminder = { enabled: boolean; time: string; id: string | null };
export type ReminderMap = Record<MealKey, Reminder>;

// Defaults sit AFTER the usual eating window, because the purpose is to prompt
// logging rather than to prompt eating.
const DEFAULT_TIMES: Record<MealKey, string> = {
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "19:30",
  snack: "16:00",
};

const STORAGE_KEY = "mealReminders";
const LEGACY_ID_KEY = "mealReminderId";
const LEGACY_TIME_KEY = "mealReminderTime";

export function emptyReminders(): ReminderMap {
  return MEAL_KEYS.reduce((acc, k) => {
    acc[k] = { enabled: false, time: DEFAULT_TIMES[k], id: null };
    return acc;
  }, {} as ReminderMap);
}

export function parseTime(raw: string): [number, number] | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return [h, min];
}

export function formatTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const toMinutes = (t: string) => {
  const p = parseTime(t);
  return p ? p[0] * 60 + p[1] : 0;
};

// A user who configured the single reminder of the earlier design keeps it:
// the existing notification id is carried over onto whichever meal type has the
// closest default time, so nothing needs rescheduling and nothing is lost.
async function migrateLegacy(state: ReminderMap): Promise<ReminderMap> {
  const [legacyId, legacyTime] = await Promise.all([
    AsyncStorage.getItem(LEGACY_ID_KEY),
    AsyncStorage.getItem(LEGACY_TIME_KEY),
  ]);
  if (!legacyId && !legacyTime) return state;

  if (legacyId && legacyTime) {
    const target = MEAL_KEYS.reduce((best, k) =>
      Math.abs(toMinutes(DEFAULT_TIMES[k]) - toMinutes(legacyTime)) <
      Math.abs(toMinutes(DEFAULT_TIMES[best]) - toMinutes(legacyTime))
        ? k
        : best
    );
    state[target] = { enabled: true, time: legacyTime, id: legacyId };
  }

  await AsyncStorage.multiRemove([LEGACY_ID_KEY, LEGACY_TIME_KEY]);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export async function loadReminders(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return migrateLegacy(emptyReminders());
  try {
    const saved = JSON.parse(raw) as Partial<ReminderMap>;
    // Merge over defaults so a key added in a later version cannot be missing
    const state = emptyReminders();
    for (const k of MEAL_KEYS) if (saved[k]) state[k] = { ...state[k], ...saved[k] };
    return state;
  } catch {
    return emptyReminders();
  }
}

async function persist(state: ReminderMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Turn a reminder on or off, or move it to a different time. Any existing
// notification for that meal is cancelled first, so changing the time never
// leaves an orphan firing at the old one.
export async function applyReminder(
  state: ReminderMap,
  key: MealKey,
  next: { enabled: boolean; time: string },
  content: { title: string; body: string }
): Promise<ReminderMap> {
  const updated: ReminderMap = { ...state, [key]: { ...state[key] } };

  await cancelNotification(updated[key].id);
  updated[key].id = null;
  updated[key].time = next.time;
  updated[key].enabled = next.enabled;

  if (next.enabled) {
    const parsed = parseTime(next.time);
    if (parsed) {
      const id = await scheduleDailyReminder(parsed[0], parsed[1], content);
      // A null id means permission was refused, so the switch must not appear on
      updated[key].id = id;
      updated[key].enabled = !!id;
    }
  }

  await persist(updated);
  return updated;
}

export function enabledCount(state: ReminderMap) {
  return MEAL_KEYS.filter((k) => state[k].enabled).length;
}

// Cancels every scheduled reminder and clears storage. Used on sign out, so
// reminders belonging to one account never fire for the next account.
export async function cancelAllReminders() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ReminderMap>;
      await Promise.all(MEAL_KEYS.map((k) => cancelNotification(saved[k]?.id)));
    }
    // Legacy key, in case sign out happens before the screen has been opened
    await cancelNotification(await AsyncStorage.getItem(LEGACY_ID_KEY));
  } catch {
    // best effort, never block sign out
  }
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_ID_KEY, LEGACY_TIME_KEY]);
}
