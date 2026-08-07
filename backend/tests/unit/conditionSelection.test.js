// ═══ FILE NÀY LÀM GÌ ═══
// Khoá phần ghi nguồn của bảng lọc bệnh nền, để nó không bị xoá mất khi ai đó
// dọn ghi chú hàng loạt.
//
// Ai gọi tới: jest, khi chạy npm test
// Nhận vào:   không nhận gì, tự đọc file nguồn
// Trả ra:     pass hoặc fail
// Khi lỗi:    fail nghĩa là mất phần trả lời cho câu "vì sao chọn đúng 5 bệnh này"
//
// Nhớ: đây là câu hỏi user chắc chắn bị hỏi lúc bảo vệ. Bảng RULES tự nó không
//      nói được vì sao có mặt trong app, phần đó nằm ở khối ghi chú đầu file.
const fs = require("fs");
const path = require("path");
const { RULES } = require("../../src/services/nutrition/foodSafetyFilter");

const source = () =>
  fs.readFileSync(path.join(__dirname, "../../src/services/nutrition/foodSafetyFilter.js"), "utf8");

describe("căn cứ chọn bệnh nền", () => {
  test("vẫn đúng 5 bệnh, không tự mọc thêm", () => {
    expect(Object.keys(RULES).sort()).toEqual([
      "diabetes", "gastritis", "gout", "high_cholesterol", "hypertension",
    ]);
  });

  test("dẫn hướng dẫn chế độ ăn bệnh viện của Bộ Y tế", () => {
    expect(source()).toContain("2879");
  });

  // Mỗi bệnh phải tra ngược được về đúng mục trong văn bản, nếu không thì
  // dẫn nguồn chỉ là nhắc tên tài liệu chứ không chứng minh được gì.
  test("mỗi bệnh có số mục tra ngược được trong văn bản", () => {
    const text = source();
    for (const condition of Object.keys(RULES)) {
      const line = text.split("\n").find((row) => row.includes(condition) && row.includes("Mục"));
      expect(line).toBeDefined();
    }
  });

  // Ba trong năm bệnh dẫn nguồn WHO nói về natri, đường tự do và chất béo bão hòa,
  // mà app chỉ lưu calo, đạm, tinh bột, chất béo. Không ghi rõ thì người đọc tưởng
  // app đang theo dõi mấy chất đó.
  test("nói rõ app không đo natri, đường tự do hay chất béo bão hòa", () => {
    const text = source();
    expect(text).toContain("KHÔNG ĐO ĐƯỢC");
    expect(text).toContain("nutritionFields");
  });

  // Bài phân tích gộp chỉ gộp ĐỒ CAY. Từng có lúc file này gán nhầm cho nó một
  // kết luận về cà phê vốn đến từ nguồn khác.
  test("không gán cho phân tích gộp kết luận mà nó không đưa ra", () => {
    const text = source();
    expect(text).toContain("Ostadsharif");
    expect(text).toMatch(/CÀ PHÊ[^\n]*KHÔNG gộp|KHÔNG gộp[^\n]*/);
    expect(text).not.toContain("CÀ PHÊ thì KHÔNG có liên hệ có ý nghĩa");
  });

  test("ghi rõ ba giới hạn đã biết của bảng lọc", () => {
    const text = source();
    // Lọc một chiều: chỉ bỏ món đi, không nói được "nên ăn thêm".
    expect(text).toContain("huyết áp thấp");
    // Đồng mắc: văn bản gốc coi hai bệnh cùng lúc là một chế độ ăn riêng.
    expect(text).toContain("ĐỒNG MẮC");
    // Tuổi: ba trong năm bệnh chỉ nằm ở bộ người lớn của văn bản gốc.
    expect(text).toContain("NGƯỜI LỚN");
  });
});
