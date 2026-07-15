// Layer-2 safety net for AI-generated dishes: a DETERMINISTIC ingredient
// blocklist per health condition. Layer 1 (the prompts) ASKS the model to
// respect conditions; this layer ENFORCES it in code, so a generated dish
// whose name contains a forbidden ingredient never reaches the user.
// Matching is on dish NAMES (vi + en), intentionally conservative: with
// health conditions, over-blocking a safe dish beats serving a harmful one.

const RULES = {
  gout: /tôm|tép|cua|ghẹ|ốc|nghêu|sò|hàu|hến|hải sản|mực|gan|lòng|tim|cật|óc|nội tạng|bò|bê|dê|cừu|bia|shrimp|prawn|crab|shellfish|mussel|oyster|clam|snail|squid|organ|liver|kidney|beef|lamb|beer/i,
  diabetes: /chè|bánh kem|bánh ngọt|kẹo|nước ngọt|trà sữa|si-?rô|mứt|soda|cake|candy|milk tea|syrup|sweetened|donut|doughnut/i,
  hypertension: /mắm|dưa muối|cà muối|kim chi|xúc xích|lạp xưởng|thịt nguội|giăm bông|khô bò|khô gà|mì gói|mì ăn liền|đồ hộp|sausage|ham|bacon|jerky|pickled|instant noodle|canned/i,
  high_cholesterol: /chiên|rán|quay|mỡ|tóp mỡ|gan|lòng|óc|nội tạng|da gà|phá lấu|fried|organ|liver|lard|crackling/i,
  gastritis: /cay|ớt|sa tế|kim chi|dưa chua|canh chua|gỏi chua|cà phê|rượu|bia|chanh|spicy|chili|sriracha|sour|pickled|coffee|alcohol|lemon/i,
};

// Returns the FIRST violated condition for a dish name, or null when safe.
function forbiddenFor(name, conditions = []) {
  const n = String(name || "");
  for (const c of conditions) {
    const re = RULES[c];
    if (re && re.test(n)) return c;
  }
  return null;
}

// Splits a dish list into { kept, removed } against the user's conditions.
// `removed` carries { name, condition } for logging/traceability.
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

module.exports = { RULES, forbiddenFor, filterDishes };
