// ═══ FILE NÀY LÀM GÌ ═══
// Khóa thời lượng, bước tập, cảnh báo an toàn và liên kết catalog guided routines.
// Test vừa kiểm helper vừa đọc source để ngăn UI bỏ mất cảnh báo bắt buộc.
import fs from "fs";
import path from "path";
import {
  GUIDED_ROUTINES,
  ROUTINE_CATEGORIES,
  ROUTINE_DURATIONS,
  resolvePlannedRoutine,
} from "@/features/exercise/guidedRoutines";

const routineSource = () =>
  fs.readFileSync(path.join(__dirname, "../src/features/exercise/guidedRoutines.ts"), "utf8");

// Mọi mốc thời lượng phải là bội số của khối 10 phút, vì ACSM chỉ công nhận
// buổi tập từ 10 phút trở lên được cộng dồn. Mốc 15 phút cũ không phải bội số
// nên buộc phải nhân mọi bước cho 1.5, đẩy một lần giữ giãn cơ lên 150 giây,
// gấp năm lần mức ACSM khuyến nghị.
describe("thời lượng dựa trên khối 10 phút", () => {
  it("không còn mốc nào lẻ ngoài bội số của 10", () => {
    expect([...ROUTINE_DURATIONS]).toEqual([10, 20, 30]);
    for (const duration of ROUTINE_DURATIONS) expect(duration % 10).toBe(0);
  });

  it("không còn chỗ nhân giãn số giây của từng bước", () => {
    expect(routineSource()).not.toContain("* 1.5");
  });

  // Mốc thời lượng khai ở BA file. Đợt bỏ mốc 15 phải sửa cả ba, thiếu một chỗ
  // là Coach gợi ý một thời lượng mà màn Bài tập tại nhà không mở được.
  it("khớp với hai bảng thời lượng bên backend", () => {
    const read = (file: string) => fs.readFileSync(path.join(__dirname, "../../backend/src/config", file), "utf8");
    const list = (source: string, name: string) =>
      source.match(new RegExp(`${name} = \\[([^\\]]*)\\]`))?.[1].split(",").map((n) => Number(n.trim())) ?? [];

    expect(list(read("exerciseCatalog.js"), "GUIDED_DURATIONS")).toEqual([...ROUTINE_DURATIONS]);
    expect(list(read("homeRoutineRules.js"), "HOME_EXERCISE_DURATIONS")).toEqual([...ROUTINE_DURATIONS]);
  });

  it("có dẫn nguồn cho cấu trúc buổi tập", () => {
    const source = routineSource();
    expect(source).toContain("Garber");
    expect(source).toContain("ACSM");
  });

  // Dễ hiểu sai nhất: thấy file có dẫn ACSM rồi tưởng MỌI con số trong đó đều
  // có nguồn. Thật ra chỉ 10 phút, 25 giây và 2 tới 4 lượt là có.
  it("nói rõ số giây từng bước không có căn cứ sinh lý", () => {
    const source = routineSource();
    expect(source).toContain("KHÔNG có căn cứ sinh lý");
    expect(source).toContain("600 giây");
  });

  // ACSM 2011: giữ tĩnh 10 tới 30 giây, lặp 2 tới 4 lượt.
  it("mọi lần giữ giãn cơ nằm trong khoảng ACSM", () => {
    const holds = [...routineSource().matchAll(/giữ (\d+) giây/g)].map((m) => Number(m[1]));
    expect(holds.length).toBeGreaterThan(0);
    for (const hold of holds) {
      expect(hold).toBeGreaterThanOrEqual(10);
      expect(hold).toBeLessThanOrEqual(30);
    }
  });

  it("mọi số lượt lặp nằm trong khoảng ACSM", () => {
    const rounds = [...routineSource().matchAll(/(\d+) lượt/g)].map((m) => Number(m[1]));
    expect(rounds.length).toBeGreaterThan(0);
    for (const round of rounds) {
      expect(round).toBeGreaterThanOrEqual(2);
      expect(round).toBeLessThanOrEqual(4);
    }
  });
});

// App hỏi bệnh nền lúc thiết lập và dùng nó để lọc MÓN ĂN, nhưng không dùng
// chút nào cho bài tập. Người khai tiểu đường nhận bài y hệt người không khai.
// Dòng cảnh báo phải tự nhận giới hạn đó thay vì im lặng.
describe("cảnh báo an toàn ở màn bài tập", () => {
  const catalogs = ["../src/i18n/vi.ts", "../src/i18n/en.ts"];

  it("nói rõ đây là bài tập chung, không cá nhân hóa", () => {
    const [vi, en] = catalogs.map((file) =>
      fs.readFileSync(path.join(__dirname, file), "utf8").split("\n").find((row) => row.includes("safety:")) ?? "",
    );
    expect(vi).toContain("bài tập chung");
    expect(vi).toContain("hỏi chuyên gia");
    expect(en).toContain("general routine");
    expect(en).toContain("check with a professional");
  });

  it("vẫn hiện ở cả trang xem trước và trang đang tập", () => {
    const screen = fs.readFileSync(
      path.join(__dirname, "../src/features/exercise/GuidedRoutineScreen.tsx"), "utf8");
    expect(screen.match(/t\.exercise\.safety/g)?.length).toBe(2);
  });
});

describe("guided routines", () => {
  it("has a server MET reference for every frontend routine family", () => {
    const backend = fs.readFileSync(
      path.join(__dirname, "../../backend/src/config/exerciseCatalog.js"),
      "utf8",
    );
    const backendFamilies = [...backend.matchAll(/^  (\w+): \{ category:/gm)].map((match) => match[1]);
    const frontendFamilies = [...new Set(
      GUIDED_ROUTINES.map((routine) => routine.key.replace(/\d+$/, "")),
    )];

    expect(backendFamilies).toEqual(frontendFamilies);
  });

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
