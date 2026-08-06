// File này là LỚP AN TOÀN THỨ HAI, chạy SAU khi AI đã trả lời.
// Lớp thứ nhất chỉ là lời dặn trong câu lệnh, AI vẫn có thể quên.
// Lớp này chạy ở server nên người dùng không tắt được.
// GIỚI HẠN cần nói rõ khi bảo vệ: nó chỉ đọc TÊN món, không phân tích
// được nguyên liệu bên trong. Đây là lưới chắn thêm, không phải bảo đảm y khoa.

// Mỗi bệnh có một danh sách từ khóa cần tránh, gồm cả tiếng Việt và tiếng Anh.
const RULES = {
  gout: /tôm|tép|cua|ghẹ|ốc|nghêu|sò|hàu|hến|hải sản|mực|gan|lòng|tim|cật|óc|nội tạng|bò|bê|dê|cừu|bia|shrimp|prawn|crab|shellfish|mussel|oyster|clam|snail|squid|organ|liver|kidney|beef|lamb|beer/i,
  diabetes: /chè|bánh kem|bánh ngọt|kẹo|nước ngọt|trà sữa|si-?rô|mứt|soda|cake|candy|milk tea|syrup|sweetened|donut|doughnut/i,
  hypertension: /mắm|dưa muối|cà muối|kim chi|xúc xích|lạp xưởng|thịt nguội|giăm bông|khô bò|khô gà|mì gói|mì ăn liền|đồ hộp|sausage|ham|bacon|jerky|pickled|instant noodle|canned/i,
  high_cholesterol: /chiên|rán|quay|mỡ|tóp mỡ|gan|lòng|óc|nội tạng|da gà|phá lấu|fried|organ|liver|lard|crackling/i,
  gastritis: /cay|ớt|sa tế|kim chi|dưa chua|canh chua|gỏi chua|cà phê|rượu|bia|chanh|spicy|chili|sriracha|sour|pickled|coffee|alcohol|lemon/i,
};

const FOOD_ALIASES = [
  ["chicken", "ga", "thit ga"],
  ["beef", "bo", "thit bo"],
  ["pork", "heo", "thit heo"],
  ["fish", "ca"],
  ["seafood", "hai san", "shrimp", "tom", "crab", "cua"],
  ["egg", "eggs", "trung"],
  ["milk", "dairy", "sua"],
  ["mushroom", "mushrooms", "nam"],
];

function normalizeFoodText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();
}

function forbiddenByTaste(name, tastePreferences = "") {
  const meal = normalizeFoodText(name);
  const preferences = normalizeFoodText(tastePreferences);
  if (!meal || !preferences) return null;
  const negative = "(?:no|avoid|allergic to|dont eat|do not eat|dislike|hate|khong an|khong thich|di ung|ghet|tranh)";
  for (const aliases of FOOD_ALIASES) {
    const mealAlias = aliases.find((alias) => new RegExp(`\\b${alias}\\b`).test(meal));
    if (!mealAlias) continue;
    const blocked = aliases.some((alias) => new RegExp(`${negative}(?: [a-z0-9]+){0,3} \\b${alias}\\b|${negative} \\b${alias}\\b`).test(preferences));
    if (blocked) return mealAlias;
  }
  return null;
}

function forbiddenFor(name, conditions = []) {
  const n = String(name || "");
  for (const c of conditions) {
    const re = RULES[c];
    if (re && re.test(n)) return c;
  }
  return null;
}

// Nơi dùng: planController.generatePlan và coachController.suggestMeal.
function filterDishes(dishes, conditions = [], getName = (d) => d.name) {
  const kept = [];
  const removed = [];
  for (const d of dishes) {
    const hit = forbiddenFor(getName(d), conditions);
    if (hit) removed.push({ name: getName(d), condition: hit });
    else kept.push(d);
  }
  return { kept, removed };
}

module.exports = { RULES, forbiddenFor, filterDishes, forbiddenByTaste };
