// Danh mục chỉ số MET, đặt Ở SERVER. App chỉ gửi lên mã hoạt động, còn con số
// dùng để tính calo nằm ở đây, nên một app đã bị sửa cũng không tự đặt được MET.
// Nguồn: Herrmann và cộng sự (2024), 2024 Adult Compendium of Physical Activities.
// Tra cứu tại https://pacompendium.com/adult-compendium/
// Trường code là mã tra cứu trong Compendium, để bất kỳ ai cũng kiểm lại được
// từng con số. Bài tập hướng dẫn trong app không có mục riêng trong Compendium
// vì nó trộn nhiều động tác, nên lấy theo hoạt động gần nhất và thiên về phía
// thấp hơn. Bốn mốc đang dùng: 02101 giãn cơ nhẹ, 02150 yoga,
// 02022 calisthenics mức vừa, 17190 đi bộ mức vừa, và 15110 đấm bao cát.

const EXTERNAL_ACTIVITIES = {
  walking: { met: 3.8, code: "17190" },
  jogging: { met: 7.5, code: "12020" },
  cycling: { met: 6.8, code: "01020" },
  swimming: { met: 6.0, code: "18310" },
  badminton: { met: 5.5, code: "15030" },
  football: { met: 7.0, code: "15610" },
  basketball: { met: 7.5, code: "15055" },
  volleyball: { met: 3.0, code: "15720" },
};

const MET_SOURCE = "Herrmann et al. (2024), Adult Compendium of Physical Activities";

const GUIDED_FAMILIES = {
  wakeUp: { category: "everyday", met: 2.3, code: "02101" },
  deskReset: { category: "everyday", met: 2.3, code: "02101" },
  fullWarmup: { category: "everyday", met: 3.8, code: "02022" },
  eveningStretch: { category: "everyday", met: 2.3, code: "02101" },
  postureReset: { category: "everyday", met: 2.3, code: "02101" },
  gentleRecovery: { category: "recovery", met: 2.3, code: "02101" },
  fullMobility: { category: "recovery", met: 2.3, code: "02150" },
  lowerRecovery: { category: "recovery", met: 2.3, code: "02101" },
  neckShoulderRecovery: { category: "recovery", met: 2.3, code: "02101" },
  hipBackRelease: { category: "recovery", met: 2.3, code: "02101" },
  strongCore: { category: "strength", met: 3.8, code: "02022" },
  fullBodyStrength: { category: "strength", met: 3.8, code: "02022" },
  lowerStrength: { category: "strength", met: 3.8, code: "02022" },
  upperStrength: { category: "strength", met: 3.8, code: "02022" },
  balanceStrength: { category: "strength", met: 3.8, code: "02022" },
  lowImpactCardio: { category: "cardio", met: 3.8, code: "17190" },
  fullBodyCardio: { category: "cardio", met: 3.8, code: "02022" },
  indoorWalk: { category: "cardio", met: 3.8, code: "17190" },
  cardioBoxing: { category: "cardio", met: 5.8, code: "15110" },
  coordinationCardio: { category: "cardio", met: 3.8, code: "02022" },
};

const GUIDED_DURATIONS = [10, 15, 20, 30];
const GUIDED_ROUTINES = Object.fromEntries(
  Object.entries(GUIDED_FAMILIES).flatMap(([familyKey, family]) =>
    GUIDED_DURATIONS.map((durationMin) => [
      `${familyKey}${durationMin}`,
      { ...family, durationMin },
    ]),
  ),
);

const getExternalActivity = (key) =>
  typeof key === "string" && Object.hasOwn(EXTERNAL_ACTIVITIES, key)
    ? EXTERNAL_ACTIVITIES[key]
    : null;
const getGuidedRoutine = (key) =>
  typeof key === "string" && Object.hasOwn(GUIDED_ROUTINES, key)
    ? GUIDED_ROUTINES[key]
    : null;

const buildExerciseSnapshot = (sourceType, sourceKey, reference, weightKg) => ({
  sourceType,
  sourceKey,
  met: reference.met,
  metCode: reference.code,
  metSource: MET_SOURCE,
  weightKgAtLog: weightKg,
});

const computeBurned = (met, durationMin, weightKg) =>
  Math.round(Number(met) * Number(weightKg) * (Number(durationMin) / 60));

module.exports = {
  EXTERNAL_ACTIVITIES,
  GUIDED_ROUTINES,
  getExternalActivity,
  getGuidedRoutine,
  buildExerciseSnapshot,
  computeBurned,
};
