const {
  EXTERNAL_ACTIVITIES,
  GUIDED_ROUTINES,
  getExternalActivity,
  getGuidedRoutine,
  buildExerciseSnapshot,
} = require("../../src/config/exerciseCatalog");

describe("server-authoritative exercise MET catalogue", () => {
  test("every entry has a traceable Compendium code and positive MET", () => {
    for (const entry of [...Object.values(EXTERNAL_ACTIVITIES), ...Object.values(GUIDED_ROUTINES)]) {
      expect(entry.met).toBeGreaterThan(0);
      expect(entry.code).toMatch(/^\d{5}$/);
    }
  });

  test("resolves only known external activities and guided sessions", () => {
    expect(getExternalActivity("jogging")).toEqual({ met: 7.5, code: "12020" });
    expect(getExternalActivity("made-up")).toBeNull();
    expect(getExternalActivity("__proto__")).toBeNull();
    expect(getGuidedRoutine("fullBodyStrength20")).toMatchObject({
      category: "strength", durationMin: 20, met: 3.8, code: "02022",
    });
    expect(getGuidedRoutine("fullBodyStrength25")).toBeNull();
  });

  test("builds a reproducible calculation snapshot", () => {
    expect(buildExerciseSnapshot("external", "jogging", getExternalActivity("jogging"), 70))
      .toEqual({
        sourceType: "external",
        sourceKey: "jogging",
        met: 7.5,
        metCode: "12020",
        metSource: "Herrmann et al. (2024), Adult Compendium of Physical Activities",
        weightKgAtLog: 70,
      });
  });
});
