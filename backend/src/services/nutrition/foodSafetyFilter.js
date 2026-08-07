// ═══ FILE NÀY LÀM GÌ ═══
// LỚP AN TOÀN THỨ HAI. Lọc bỏ món không hợp với bệnh nền của người dùng.
//
// Ai gọi tới: planController (lọc thực đơn AI vừa dựng),
//             coachController (lọc món Coach định gợi ý)
// Nhận vào:   danh sách tên món, và danh sách bệnh nền của người dùng
// Trả ra:     danh sách đã bỏ những món có tên chạm từ khóa cần tránh
// Khi lỗi:    không có bệnh nền thì trả nguyên danh sách, không lọc gì
//
// GIỚI HẠN cần nói rõ khi bảo vệ: nó chỉ đọc TÊN món, không phân tích được
// nguyên liệu bên trong. Món tên vô hại mà chứa thành phần cần tránh thì lọt lưới.
// Đây là lưới chắn thêm, KHÔNG phải bảo đảm y khoa.
//
// NGUỒN CỦA CẢ BẢNG NÀY. Đây không phải danh sách tự nghĩ ra. Khung chung là
// Quyết định 2879/QĐ-BYT ngày 10/8/2006 của Bộ Y tế, "Hướng dẫn chế độ ăn bệnh
// viện", gồm 103 nguyên tắc và ký hiệu chế độ ăn áp dụng cho mọi bệnh viện
// trong nước. App làm bản RÚT GỌN của tài liệu đó: hướng dẫn gốc dành cho khoa
// dinh dưỡng tính theo thành phần khẩu phần, còn app chỉ đọc được tên món.
// Mỗi bệnh bên dưới ghi thêm một hướng dẫn quốc tế cho nhóm chất tương ứng.
//
// VÌ SAO ĐÚNG NĂM BỆNH NÀY. Một bệnh chỉ được đưa vào app khi thỏa CẢ HAI:
//   Tầng 1, có gánh nặng thật ở Việt Nam, chứng minh bằng số liệu dịch tễ trong nước.
//   Tầng 2, chế độ ăn là một phần điều trị được công nhận, và người bệnh tự làm
//           được ở nhà chứ không phải chế độ ăn kê theo gam trong bệnh viện.
// Cả năm bệnh dưới đây đều có tên trong QĐ 2879, bộ dành cho NGƯỜI LỚN:
//   diabetes         Mục III,   cả một mục riêng cấp cao nhất
//   gout             Mục IV,    cả một mục riêng cấp cao nhất
//   hypertension     Mục V.1,   "Tăng huyết áp"
//   high_cholesterol Mục V.2,   "Rối loạn lipid máu"
//   gastritis        Mục VI.1,  "Viêm loét dạ dày tá tràng"
//
// VÌ SAO KHÔNG THÊM BỆNH KHÁC, dù văn bản còn nhiều mục nữa:
//   Thận tiết niệu, mục II, kê theo gam, ví dụ đạm 0,6 g/kg mỗi ngày. App chỉ lọc
//     được tên món nên không làm nổi. Hướng dẫn KDOQI 2020 quốc tế cũng đã bỏ
//     kiểu cấm kali và phốt pho đại trà, chuyển sang cá thể hóa.
//   Tụy mục VII, gan mật mục VIII: bệnh nặng cần theo dõi y tế, không tự quản ở nhà.
//   Phẫu thuật, nhiễm khuẩn, bỏng, các mục IX tới XI: trạng thái nằm viện.
//
// BA GIỚI HẠN ĐÃ BIẾT, phải nói trước khi bảo vệ chứ đừng để bị hỏi:
//   1. LỌC MỘT CHIỀU. Bảng này chỉ biết BỎ món đi, không có cách nào nói nên ăn
//      thêm gì. Vì vậy huyết áp thấp KHÔNG diễn đạt được ở đây, do nó cần tăng
//      muối và tăng nước, tức ngược hẳn với tăng huyết áp ngay bên dưới.
//   2. ĐỒNG MẮC. QĐ 2879 coi hai bệnh cùng lúc là một chế độ ăn RIÊNG, bằng chứng
//      là 7 trong 8 chế độ của mục III là dạng kết hợp, ví dụ đái tháo đường cộng
//      suy thận hoặc cộng gút. App thì chạy từng regex độc lập rồi gộp kết quả.
//      Hai cách này KHÔNG tương đương. Điều tra STEPS cho thấy đồng mắc đái tháo
//      đường với tăng huyết áp ở Việt Nam đã tăng hơn 8 lần trong 10 năm.
//   3. TUỔI. Gút, tăng huyết áp và rối loạn lipid máu chỉ nằm ở bộ NGƯỜI LỚN của
//      QĐ 2879; bộ trẻ em của cùng văn bản không có ba bệnh này. App lại cho nhập
//      tuổi từ 10, và vẫn lọc theo bộ người lớn cho mọi lứa tuổi.
//
// APP KHÔNG ĐO ĐƯỢC MẤY CHẤT MÀ NGUỒN BÊN DƯỚI NÓI TỚI. Đọc kỹ chỗ này.
// `models/nutritionFields.js` cho thấy app chỉ lưu ĐÚNG BỐN số cho mỗi món:
// calo, đạm, tinh bột, chất béo. Không có natri, không có đường tự do, không tách
// chất béo bão hòa hay chuyển hóa. Mà đó lại chính là ba thứ mà WHO nói tới:
//   tăng huyết áp   -> WHO nói về NATRI          -> app không đo
//   đái tháo đường  -> WHO nói về ĐƯỜNG TỰ DO    -> app chỉ có tinh bột tổng
//   mỡ máu          -> WHO nói về BÉO BÃO HÒA    -> app chỉ có chất béo tổng
// Vậy các ngưỡng WHO ghi bên dưới là LÝ DO CHỌN TỪ KHÓA, không phải thứ app theo
// dõi hay kiểm tra. App không bao giờ hiện một con số natri, một mục tiêu natri,
// hay bất kỳ đánh giá nào dựa trên mấy chất đó. Đừng đọc chúng thành cam kết.
//
// Mỗi bệnh có một danh sách từ khóa cần tránh, gồm cả tiếng Việt và tiếng Anh.
const RULES = {
  // Purin và rượu bia. Nguồn: FitzGerald và cộng sự (2020), 2020 American College
  // of Rheumatology Guideline for the Management of Gout, Arthritis Care & Research,
  // 72(6), tr. 744 tới 760. Hướng dẫn nêu hạn chế rượu, purin và siro ngô nhiều
  // fructose, đồng thời nói rõ BẰNG CHỨNG CÒN HẠN CHẾ cho việc các hạn chế này
  // làm giảm urat. Vì vậy app LỌC BỚT gợi ý chứ không tuyên bố người bệnh không
  // được ăn. CHƯA KIỂM ĐƯỢC TỪ BẢN GỐC: mức độ khuyến nghị là mạnh hay có điều
  // kiện, vì cả PubMed lẫn nhà xuất bản đều chặn tải; phần bằng chứng hạn chế và
  // số trang thì đã đối chiếu qua bản tóm tắt của AAFP.
  gout: /tôm|tép|cua|ghẹ|ốc|nghêu|sò|hàu|hến|hải sản|mực|gan|lòng|tim|cật|óc|nội tạng|bò|bê|dê|cừu|bia|shrimp|prawn|crab|shellfish|mussel|oyster|clam|snail|squid|organ|liver|kidney|beef|lamb|beer/i,
  // Đường tự do. Nguồn: WHO (2015), Guideline: Sugars intake for adults and
  // children. Dưới 10 phần trăm tổng năng lượng, tốt hơn là dưới 5 phần trăm.
  // Đường tự do gồm cả siro, mật ong và nước quả ép, nên danh sách có si-rô và mứt.
  diabetes: /chè|bánh kem|bánh ngọt|kẹo|nước ngọt|trà sữa|si-?rô|mứt|soda|cake|candy|milk tea|syrup|sweetened|donut|doughnut/i,
  // Natri. Nguồn: WHO (2012), Guideline: Sodium intake for adults and children,
  // dưới 2000 mg natri tức dưới 5 g muối mỗi ngày. Danh sách nhắm vào THỰC PHẨM
  // CHẾ BIẾN vì WHO nêu khoảng ba phần tư natri khẩu phần đến từ nhóm này.
  hypertension: /mắm|dưa muối|cà muối|kim chi|xúc xích|lạp xưởng|thịt nguội|giăm bông|khô bò|khô gà|mì gói|mì ăn liền|đồ hộp|sausage|ham|bacon|jerky|pickled|instant noodle|canned/i,
  // Chất béo bão hòa và chất béo chuyển hóa. Nguồn: WHO (2023), Saturated fatty
  // acid and trans-fatty acid intake for adults and children. Giảm hai nhóm này
  // làm giảm LDL với độ chắc chắn cao. Đó là lý do danh sách nhắm vào cách chế
  // biến chiên, rán, quay và vào nội tạng.
  high_cholesterol: /chiên|rán|quay|mỡ|tóp mỡ|gan|lòng|óc|nội tạng|da gà|phá lấu|fried|organ|liver|lard|crackling/i,
  // NHÓM CÓ BẰNG CHỨNG YẾU NHẤT, phải nói thẳng khi bảo vệ.
  // Nguồn: Ostadsharif và cộng sự, tổng quan hệ thống và phân tích gộp về thói quen
  // ăn uống với nguy cơ khó tiêu chức năng, Journal of Health, Population and
  // Nutrition (2026), 45:54. Đã đọc bản gốc, 11 nghiên cứu và 21.220 người.
  // ĐỒ CAY là thứ DUY NHẤT trong danh sách dưới đây được bài này gộp và xác nhận:
  // tăng 32 phần trăm nguy cơ, OR 1,32 với khoảng tin cậy 95 phần trăm 1,04 tới 1,67.
  // CÀ PHÊ, RƯỢU BIA, ĐỒ CHUA thì bài này KHÔNG gộp, nên chúng KHÔNG có nguồn nào
  // trong file này chống lưng, chỉ là lời khuyên truyền thống. Giữ lại vì cùng lắm
  // mất một gợi ý món chứ không gây hại, nhưng ĐỪNG trình bày như kết luận khoa học.
  // Nhớ: cũng chính bài này thấy ăn NHIỀU BỮA HƠN làm GIẢM nguy cơ, OR 0,52 với
  // khoảng tin cậy 0,32 tới 0,86. Đó là lời khuyên dạng NÊN LÀM, mà bảng lọc một
  // chiều ở file này không diễn đạt được, giống hệt ca huyết áp thấp nêu ở trên.
  gastritis: /cay|ớt|sa tế|kim chi|dưa chua|canh chua|gỏi chua|cà phê|rượu|bia|chanh|spicy|chili|sriracha|sour|pickled|coffee|alcohol|lemon/i,
};

// Một món có nhiều cách gọi, ví dụ tôm còn gọi là shrimp hay prawn.
// Không gom lại thì lọc theo tên sẽ sót khi AI trả về tên tiếng Anh.
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

// Hạ chữ thường và bỏ dấu, để so tên món không phụ thuộc cách gõ.
function normalizeFoodText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();
}

// Lọc theo sở thích người dùng tự khai, ví dụ không ăn thịt gà.
// Khác forbiddenFor ở chỗ đây là lựa chọn cá nhân, không phải bệnh nền.
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

// Lọc theo BỆNH NỀN. Đây là phần an toàn, khác với lọc theo sở thích.
// Nhớ: chỉ đọc TÊN món, không phân tích được nguyên liệu bên trong.
function forbiddenFor(name, conditions = []) {
  const n = String(name || "");
  for (const c of conditions) {
    // Phải dùng Object.hasOwn chứ không tra thẳng RULES[c] rồi kiểm truthy.
    // `conditions` đến từ User.healthConditions; profileController.updateProfile chỉ
    // kiểm kiểu mảng chứ không giới hạn từng giá trị, nên
    // một khoá như "constructor" sẽ tra trúng thuộc tính mà mọi object thừa kế,
    // lọt qua phép kiểm truthy rồi chết ở `re.test`. `exerciseCatalog.js` đã
    // dùng đúng cách này từ trước, chỉ file này bị sót.
    if (!Object.hasOwn(RULES, c)) continue;
    const re = RULES[c];
    if (re.test(n)) return c;
  }
  return null;
}

// Nơi dùng: planController.generatePlan và coachController.suggestMeal.
function filterDishes(dishes, conditions = [], getName = (d) => d.name) {
  // Tách làm hai danh sách: món giữ lại, và món bị loại kèm lý do.
  // Trả cả hai để nơi gọi biết đã bỏ những gì chứ không im lặng cắt bớt.
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
