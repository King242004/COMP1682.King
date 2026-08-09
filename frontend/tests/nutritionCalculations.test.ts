// ═══ FILE NÀY LÀM GÌ ═══
// Kiểm tra hướng cân và bản xem trước mục tiêu calo trên frontend.
// Kết quả cố định khóa frontend khớp công thức chính thức phía server.
import {
  ACTIVITY_MULTIPLIERS,
  ATWATER_KCAL_PER_GRAM,
  CALORIE_FLOOR,
  DEFAULT_ACTIVITY_LEVEL,
  estimateCalorieGoal,
  FAT_RATIO_OF_CALORIES,
  KCAL_PER_KG_BODY_WEIGHT,
  MIFFLIN_ST_JEOR,
  PROTEIN_G_PER_KG,
  PROTEIN_MAX_RATIO_OF_CALORIES,
  PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN,
  resolveDraftWeightDirection,
  WEEKLY_RATE_KG,
  WEIGHT_GOAL_BY_DIRECTION,
} from "../src/config/nutritionCalculations";
import fs from "fs";
import path from "path";

const backendSource = fs.readFileSync(
  path.join(__dirname, "../../backend/src/config/nutritionConstants.js"),
  "utf8",
);

function backendBlock(name: string): Record<string, number> {
  const start = backendSource.indexOf(`const ${name} = {`);
  const body = backendSource.slice(start, backendSource.indexOf("};", start));
  const found: Record<string, number> = {};
  for (const match of body.matchAll(/(\w+):\s*(-?[\d.]+),/g)) found[match[1]] = Number(match[2]);
  return found;
}

function backendNumber(name: string): number {
  const match = backendSource.match(new RegExp(`const ${name} = (-?[\\d.]+);`));
  if (!match) throw new Error(`Không tìm thấy ${name} bên backend`);
  return Number(match[1]);
}

describe("resolveDraftWeightDirection", () => {
  test("still previews gain and loss when an older API response has no maintain threshold", () => {
    expect(resolveDraftWeightDirection(60, 65)).toBe("gain");
    expect(resolveDraftWeightDirection(60, 55)).toBe("lose");
  });

  test("uses the backend threshold when it is available", () => {
    expect(resolveDraftWeightDirection(60, 60.2, 0.5)).toBe("maintain");
    expect(resolveDraftWeightDirection(55, 62, 0.5)).toBe("gain");
  });

  test("maps every UI direction to the stored profile goal", () => {
    expect(WEIGHT_GOAL_BY_DIRECTION).toEqual({
      lose: "lose_weight",
      gain: "gain_weight",
      maintain: "maintain_weight",
    });
  });
});

describe("estimateCalorieGoal", () => {
  test("uses the selected weekly pace instead of a fixed calorie offset", () => {
    expect(estimateCalorieGoal(2500, "male", "lose_weight", 0.25)).toBe(2225);
    expect(estimateCalorieGoal(2500, "male", "gain_weight", 0.5)).toBe(3050);
    expect(estimateCalorieGoal(2500, "male", "maintain_weight", 0.5)).toBe(2500);
  });
});

describe("shared nutrition constants match the backend", () => {
  test("formula tables and defaults match", () => {
    expect(MIFFLIN_ST_JEOR).toEqual(backendBlock("MIFFLIN_ST_JEOR"));
    expect(ACTIVITY_MULTIPLIERS).toEqual(backendBlock("ACTIVITY_MULTIPLIERS"));
    expect(CALORIE_FLOOR).toEqual(backendBlock("CALORIE_FLOOR"));
    expect(ATWATER_KCAL_PER_GRAM).toEqual(backendBlock("ATWATER_KCAL_PER_GRAM"));
    expect(DEFAULT_ACTIVITY_LEVEL).toBe(
      backendSource.match(/const DEFAULT_ACTIVITY_LEVEL = "(\w+)";/)?.[1],
    );
  });

  test("single-value constants match", () => {
    expect(KCAL_PER_KG_BODY_WEIGHT).toBe(backendNumber("KCAL_PER_KG_BODY_WEIGHT"));
    expect(PROTEIN_G_PER_KG).toBe(backendNumber("PROTEIN_G_PER_KG"));
    expect(PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN)
      .toBe(backendNumber("PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN"));
  });

  test("weekly rate bands match", () => {
    const start = backendSource.indexOf("const WEEKLY_RATE_KG = {");
    const body = backendSource.slice(start, backendSource.indexOf("};", start));
    const parsed: Record<string, { max: number; default: number }> = {};
    for (const match of body.matchAll(/(\w+):\s*\{\s*max:\s*([\d.]+),\s*default:\s*([\d.]+)\s*\}/g)) {
      parsed[match[1]] = { max: Number(match[2]), default: Number(match[3]) };
    }
    expect(WEEKLY_RATE_KG).toEqual(parsed);
  });

  test("frontend-only macro ratios stay inside their cited bounds", () => {
    expect(PROTEIN_MAX_RATIO_OF_CALORIES).toBeGreaterThanOrEqual(0.1);
    expect(PROTEIN_MAX_RATIO_OF_CALORIES).toBeLessThanOrEqual(0.35);
    expect(FAT_RATIO_OF_CALORIES).toBeLessThanOrEqual(0.25);
  });
});
