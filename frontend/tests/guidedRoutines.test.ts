import {
  GUIDED_ROUTINES,
  ROUTINE_CATEGORIES,
  ROUTINE_DURATIONS,
  resolvePlannedRoutine,
} from "@/features/exercise/guidedRoutines";

describe("guided routines", () => {
  it("keeps each timer equal to the advertised duration", () => {
    for (const routine of GUIDED_ROUTINES) {
      const seconds = routine.steps.reduce((total, step) => total + step.seconds, 0);
      expect(seconds).toBe(routine.durationMin * 60);
    }
  });

  it("covers every time filter and category", () => {
    for (const duration of ROUTINE_DURATIONS) {
      for (const category of ROUTINE_CATEGORIES) {
        const routines = GUIDED_ROUTINES.filter(
          (routine) => routine.durationMin === duration && routine.category === category,
        );
        expect(routines.length).toBeGreaterThanOrEqual(5);
        expect(routines.length).toBeLessThanOrEqual(10);
      }
    }
  });

  it("resolves a weekly-plan reference to the same supported routine", () => {
    const first = resolvePlannedRoutine("strength", 20, "2026-08-05");
    const second = resolvePlannedRoutine("strength", 20, "2026-08-05");

    expect(first).not.toBeNull();
    expect(second?.key).toBe(first?.key);
    expect(first?.category).toBe("strength");
    expect(first?.durationMin).toBe(20);
    expect(resolvePlannedRoutine("strength", 25, "2026-08-05")).toBeNull();
  });
});
