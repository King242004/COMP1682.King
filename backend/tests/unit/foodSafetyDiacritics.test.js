// ═══ FILE NÀY LÀM GÌ ═══
// Khoá hợp đồng của lớp lọc bệnh nền về chuyện CÓ DẤU và KHÔNG DẤU.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì, danh sách tên món nằm ngay trong file
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là hoặc bỏ sót món cần tránh, hoặc chặn nhầm món lành
//
// HỢP ĐỒNG, đọc kỹ trước khi sửa:
//   Gõ CÓ DẤU     -> mọi từ khóa trong RULES đều phải bắt được
//   Gõ KHÔNG DẤU  -> chỉ những từ nằm trong RULES_PLAIN mới bắt được
//
// Vì sao không bắt hết khi gõ không dấu: `bò` `bó` `bơ` `bỏ` đều thành `bo`,
// `dê` và `dễ` đều thành `de`. Ép bắt hết thì rau bó xôi và bánh mì bơ bị coi
// là thịt bò. Đây là đánh đổi có chủ ý, và nửa dưới của file này canh đúng
// chuyện đó: KHÔNG được chặn nhầm món lành.
const {
  RULES, RULES_PLAIN, normalizeFoodText, forbiddenFor, filterDishes,
} = require("../../src/services/nutrition/foodSafetyFilter");

const stripDiacritics = (value) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

const DISHES = {
  gout: ["Tôm rang me", "Lòng heo luộc", "Cháo lòng", "Bò kho", "Ốc len xào dừa", "Hải sản nướng"],
  diabetes: ["Chè đậu xanh", "Bánh ngọt kem", "Trà sữa trân châu", "Nước ngọt có ga"],
  hypertension: ["Mì gói", "Xúc xích nướng", "Dưa muối", "Lạp xưởng chiên"],
  high_cholesterol: ["Gà rán", "Tóp mỡ", "Lòng xào", "Da gà chiên giòn"],
  gastritis: ["Canh chua cá", "Lẩu cay Thái", "Kim chi", "Cà phê sữa đá"],
};

describe("gõ CÓ DẤU thì mọi món đều bắt được", () => {
  for (const [condition, dishes] of Object.entries(DISHES)) {
    test.each(dishes)(`${condition}: %s`, (dish) => {
      expect(forbiddenFor(dish, [condition])).toBe(condition);
    });
  }
});

describe("gõ KHÔNG DẤU vẫn bắt được các món có từ khóa đủ rõ nghĩa", () => {
  const PLAIN_DISHES = {
    gout: ["Tom rang me", "Hai san nuong", "Muc chien gion", "Noi tang xao"],
    diabetes: ["Tra sua tran chau", "Banh ngot kem", "Nuoc ngot co ga"],
    hypertension: ["Mi goi", "Xuc xich nuong", "Dua muoi", "Lap xuong chien", "Do hop"],
    high_cholesterol: ["Da ga chien gion", "Pha lau", "Top mo"],
    gastritis: ["Canh chua ca", "Kim chi", "Ca phe sua da", "Dua chua"],
  };
  for (const [condition, dishes] of Object.entries(PLAIN_DISHES)) {
    test.each(dishes)(`${condition}: %s`, (dish) => {
      expect(forbiddenFor(dish, [condition])).toBe(condition);
    });
  }
});

describe("viết hoa hay thường đều không ảnh hưởng", () => {
  test.each(["TÔM RANG ME", "tôm rang me", "TOM RANG ME", "tom rang me", "Tom Rang Me"])(
    "gout: %s",
    (dish) => expect(forbiddenFor(dish, ["gout"])).toBe("gout"),
  );
});

// Lưới lớn: chạy TỪNG từ khóa trong bảng, không phải chỉ vài món mẫu.
describe("từng từ khóa tự bắt được chính nó, đúng theo hợp đồng", () => {
  for (const [condition, pattern] of Object.entries(RULES)) {
    const keywords = pattern.source.split("|").map((word) => word.replace(/-\?/g, "-"));

    test(`${condition}: cả ${keywords.length} từ khóa bắt được khi gõ có dấu`, () => {
      const missed = keywords.filter((word) => forbiddenFor(word, [condition]) !== condition);
      expect(missed).toEqual([]);
    });

    // Không dấu thì chỉ những từ đã được đưa vào RULES_PLAIN mới phải bắt được.
    // Test tự suy ra danh sách đó thay vì chép tay, nên thêm bớt từ khóa
    // ở file nguồn là test đi theo, không phải sửa hai chỗ.
    test(`${condition}: từ nào nằm trong bảng không dấu thì bắt được khi bỏ dấu`, () => {
      const shouldMatch = keywords.filter((word) =>
        RULES_PLAIN[condition].test(normalizeFoodText(word)),
      );
      expect(shouldMatch.length).toBeGreaterThan(0);
      const missed = shouldMatch.filter(
        (word) => forbiddenFor(stripDiacritics(word), [condition]) !== condition,
      );
      expect(missed).toEqual([]);
    });
  }
});

// Nửa quan trọng nhất. Chặn nhầm món lành làm người dùng mất sạch gợi ý,
// và mấy cái tên dưới đây là các ca đã va chạm thật khi thử bằng máy.
describe("KHÔNG được chặn nhầm món lành", () => {
  const SAFE = [
    // Va chạm thật đã gặp: bò/bó/bơ, dê/dễ
    "Rau bó xôi xào tỏi", "Bánh mì bơ", "Món dễ ăn",
    // `ốc` từng khớp BÊN TRONG chữ "thuốc" vì bảng thiếu ranh giới từ,
    // nên gà hầm thuốc bắc bị coi là món có ốc.
    "Gà hầm thuốc bắc", "Gà tần thuốc bắc", "Canh thuốc nam",
    // `gan` từng khớp bên trong "ngan", `óc` khớp trong "sóc" và "bóc"
    "Ngan nướng", "Thịt ngan", "Sóc nhí", "Bóc vỏ",
    // `ot` của bảng không dấu từng khớp bên trong "bột"
    "Bánh bột lọc", "Banh bot loc", "Bột sắn dây",
    "Canh hầm xương", "Thịt kho tàu",
    // Từ thường gặp trùng âm với từ khóa: của, cây, gần, số
    "Món của tôi", "Cây nhà lá vườn", "Gần nhà có quán", "Số lượng vừa phải",
    // Món lành thông thường, cả hai cách gõ
    "Cơm trắng", "Com trang", "Rau muống luộc", "Rau muong luoc",
    "Cá hấp hành", "Ca hap hanh", "Khoai lang luộc", "Khoai lang luoc",
    "Ức gà luộc", "Uc ga luoc", "Cháo yến mạch", "Chao yen mach",
    "Trứng luộc", "Trung luoc", "Canh bí đỏ", "Canh bi do",
  ];
  const conditions = Object.keys(RULES);

  test.each(SAFE)("%s không dính bệnh nào", (dish) => {
    const hits = conditions.filter((condition) => forbiddenFor(dish, [condition]) !== null);
    expect(hits).toEqual([]);
  });

  // "Bò hầm" và "Kho bò" CÓ chữ bò nên dính gút là đúng, không phải chặn nhầm.
  // Chúng chỉ được dùng để canh va chạm với tăng huyết áp, vì `ham` tiếng Anh
  // đụng `hầm`, còn `kho bo` đụng `kho bò` tức món kho chứ không phải khô bò.
  test.each(["Bò hầm khoai tây", "Kho bò tàu", "Gà kho gừng"])(
    "%s không bị coi là thực phẩm mặn của tăng huyết áp",
    (dish) => expect(forbiddenFor(dish, ["hypertension"])).toBeNull(),
  );

  test("lọc cả danh sách thì giữ món lành và bỏ đúng món cần tránh", () => {
    const dishes = [{ name: "Com trang" }, { name: "Tom rang me" }, { name: "Ga ham thuoc bac" }];
    const { kept, removed } = filterDishes(dishes, ["gout"]);
    expect(kept.map((d) => d.name)).toEqual(["Com trang", "Ga ham thuoc bac"]);
    expect(removed).toEqual([{ name: "Tom rang me", condition: "gout" }]);
  });
});
