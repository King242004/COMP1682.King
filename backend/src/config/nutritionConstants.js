// File này giữ MỌI con số dinh dưỡng mà backend dùng để tính toán.
// Quy tắc của file: một hằng số phải đi kèm dòng nói rõ nó ở đâu ra, thuộc một
// trong ba loại là tài liệu khoa học đã công bố, quyết định thiết kế của dự án,
// hoặc giới hạn kỹ thuật của hệ thống. Số không truy được về một trong ba thì
// không được đặt ở đây, và cũng không được rải trong controller.
// Nơi dùng: calorieGoal, dailyHealthScore, profileController, planController.

// Hệ số của công thức tính năng lượng lúc nghỉ.
// Nguồn: Mifflin và cộng sự (1990), đã dẫn trong báo cáo mục 6.3.2.
// Dùng ĐÚNG hệ số bài báo gốc là 9.99 và 4.92, không dùng bản làm tròn 10 và 5,
// để con số trong code khớp với bài báo mà báo cáo đang trích.
const MIFFLIN_ST_JEOR = {
  weightFactor: 9.99,
  heightFactor: 6.25,
  ageFactor: 4.92,
  maleOffset: 5,
  femaleOffset: -161,
};

// Hệ số nhân theo mức vận động, đổi năng lượng lúc nghỉ thành tổng tiêu hao.
// Nguồn: FAO/WHO/UNU (2004) Human energy requirements. Ba con số này là giá trị
// đại diện do CHÍNH FAO tính ra ở Bảng 5.1, không phải dự án tự chọn trong khoảng.
// Ba khoảng phân loại tương ứng là 1.40 tới 1.69, 1.70 tới 1.99 và 2.00 tới 2.40.
// CHÚ Ý: PAL đã tính cả tập luyện có chủ đích, nên KHÔNG được cộng thêm calo của
// buổi tập đã ghi vào mục tiêu một lần nữa, nếu không buổi tập bị tính hai lần.
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.53,
  moderate: 1.76,
  active: 2.25,
};

const DEFAULT_ACTIVITY_LEVEL = "moderate";

// Ba mục tiêu cân nặng được lưu trong hồ sơ. Khai báo một lần để model,
// controller và phần tính toán không tự gõ lại các chuỗi dễ lệch nhau.
const WEIGHT_GOALS = Object.freeze({
  lose: "lose_weight",
  gain: "gain_weight",
  maintain: "maintain_weight",
});

const WEIGHT_GOAL_VALUES = Object.freeze(Object.values(WEIGHT_GOALS));

// Quyết định thiết kế: chênh lệch nhỏ hơn nửa kg được xem là đang giữ cân.
const MAINTAIN_WEIGHT_THRESHOLD_KG = 0.5;

// Số kcal mà một gam mỗi chất sinh năng lượng tạo ra.
// Nguồn: hệ số Atwater tổng quát, do W.O. Atwater và cộng sự xây dựng cuối
// thế kỷ 19 và được FAO (2003) trình bày trong Food energy: methods of analysis
// and conversion factors, FAO Food and Nutrition Paper 77.
// Dùng để kiểm tra chéo, vì calo và ba chất phải khớp nhau.
const ATWATER_KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

// Mức calo thấp nhất app cho phép đặt làm mục tiêu.
// Nguồn: NHLBI (2000) The Practical Guide, NIH Publication No. 00-4084, nêu
// khoảng 1.000 tới 1.200 kcal cho nữ và 1.200 tới 1.600 kcal cho nam. App lấy
// trần của khoảng nữ và mức giữa của khoảng nam, tức về phía an toàn hơn tài liệu.
// CÁCH PHÁT BIỂU: đây là giới hạn phạm vi của phần mềm, không phải tuyên bố y khoa
// rằng dưới mức này là không an toàn. App chỉ nói nó dừng ở đâu và vì sao.
const CALORIE_FLOOR = {
  male: 1500,
  female: 1200,
};

// Số kcal ứng với một kg thay đổi cân nặng, để đổi tốc độ kg mỗi tuần
// thành mức chênh calo mỗi ngày.
// Nguồn: Wishnofsky (1958), khoảng 3.500 kcal mỗi pound, quy ra 7.700 kcal mỗi kg.
// GIỚI HẠN ĐÃ BIẾT: Hall và Chow (2013) chỉ ra quy tắc này ước lượng quá cao khi
// áp cho dài hạn, vì cơ thể hạ mức tiêu hao khi cân nặng giảm. Dự án vẫn dùng vì
// nó chỉ để ĐẶT MỤC TIÊU BAN ĐẦU chứ không dự báo cân nặng, và mục tiêu được tính
// lại từ đầu mỗi lần người dùng ghi cân nặng mới.
const KCAL_PER_KG_BODY_WEIGHT = 7700;

// Khoảng tốc độ thay đổi cân nặng app cho phép, tính bằng kg mỗi tuần.
// Nguồn: NHLBI (2000), NIH Pub. 00-4084, nêu mức thiếu hụt 500 tới 1.000 kcal
// mỗi ngày cho 1 tới 2 pound mỗi tuần, tức khoảng 0.45 tới 0.91 kg.
// Trần 0.9 chứ không phải 1.0 vì 1.0 kg quy ra 1.100 kcal, VƯỢT mức 1.000 cao nhất.
// Chiều tăng cân không có tài liệu nêu con số nên trần của nó là QUYẾT ĐỊNH THIẾT KẾ,
// đặt hẹp hơn chiều giảm. Căn cứ: Garthe và cộng sự (2013) thấy nạp dư nhiều làm
// tăng mỡ đáng kể trong khi phần nạc không tăng thêm.
// KHÔNG có mức tối thiểu, vì không tài liệu nào quy định phải giảm ít nhất bao nhiêu
// và đi chậm thì không gây hại. Chỉ kẹp trần, không kẹp đáy.
const WEEKLY_RATE_KG = {
  lose: { max: 0.9, default: 0.5 },
  gain: { max: 0.5, default: 0.25 },
};

// Các lựa chọn giao diện. Đây là QUYẾT ĐỊNH THIẾT KẾ của dự án, không phải
// ngưỡng y khoa: backend vẫn kiểm tra trần thật bằng WEEKLY_RATE_KG ở trên.
const WEIGHT_RATE_OPTIONS = Object.freeze({
  lose: Object.freeze([
    Object.freeze({ key: "slow", value: 0.25 }),
    Object.freeze({ key: "moderate", value: 0.5 }),
    Object.freeze({ key: "fast", value: 0.75 }),
    Object.freeze({ key: "maximum", value: 0.9 }),
  ]),
  gain: Object.freeze([
    Object.freeze({ key: "slow", value: 0.1 }),
    Object.freeze({ key: "moderate", value: 0.25 }),
    Object.freeze({ key: "fast", value: 0.5 }),
  ]),
});

// Lượng đạm cần mỗi ngày, tính theo gam trên mỗi kg cân nặng.
// Nguồn: Jäger, R. và cộng sự (2017) 'International Society of Sports Nutrition
// Position Stand: protein and exercise', Journal of the International Society of
// Sports Nutrition, khuyến nghị 1.4 tới 2.0 g mỗi kg cho người có vận động.
// Giá trị 1.6 nằm giữa khoảng này.
// Dùng chung cho phần chấm điểm sức khỏe của Coach.
const PROTEIN_G_PER_KG = 1.6;

// Khi chưa biết cân nặng thì không đoán cân nặng, mà ước lượng đạm
// theo tỷ lệ calo để Coach vẫn tính được điểm khi hồ sơ thiếu cân nặng.
// Nguồn: cùng bộ AMDR trong Dietary Reference Intakes, khoảng cho đạm là
// 10 tới 35 phần trăm calo. Lấy 25 phần trăm nằm trong khoảng đó.
const PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN = 0.25;

// Trọng số của bốn phần trong điểm sức khỏe, tổng đúng 100.
// Nguồn: QUYẾT ĐỊNH THIẾT KẾ của dự án. Đây là chỉ số tổng hợp riêng của app,
// KHÔNG phải thang đo y khoa có sẵn, nên giao diện phải hiện cả bốn phần điểm
// để người dùng thấy được điểm tổng được ghép từ đâu.
const HEALTH_SCORE_WEIGHTS = {
  calorie: 40,
  protein: 20,
  activity: 20,
  consistency: 20,
};

// Ngưỡng lệch calo dùng khi chấm phần điểm calo.
// Lệch tới mức dưới thì được điểm tối đa, lệch quá mức trên thì được 0 điểm,
// ở giữa thì giảm dần đều. Nguồn: QUYẾT ĐỊNH THIẾT KẾ của dự án.
const CALORIE_SCORE_DEVIATION = { full: 0.1, zero: 0.5 };

// Giới hạn hợp lệ của các trường hồ sơ, dùng chung cho mọi nơi kiểm dữ liệu.
// Nguồn: giới hạn kỹ thuật, đặt rộng để không chặn nhầm người dùng thật.
const PROFILE_LIMITS = {
  age: { min: 10, max: 120 },
  weightKg: { min: 20, max: 300 },
  heightCm: { min: 50, max: 250 },
  calorieGoal: { min: 800, max: 10000 },
};

module.exports = {
  MIFFLIN_ST_JEOR,
  ACTIVITY_MULTIPLIERS,
  DEFAULT_ACTIVITY_LEVEL,
  WEIGHT_GOALS,
  WEIGHT_GOAL_VALUES,
  MAINTAIN_WEIGHT_THRESHOLD_KG,
  ATWATER_KCAL_PER_GRAM,
  CALORIE_FLOOR,
  KCAL_PER_KG_BODY_WEIGHT,
  WEEKLY_RATE_KG,
  WEIGHT_RATE_OPTIONS,
  PROTEIN_G_PER_KG,
  PROTEIN_RATIO_WHEN_WEIGHT_UNKNOWN,
  HEALTH_SCORE_WEIGHTS,
  CALORIE_SCORE_DEVIATION,
  PROFILE_LIMITS,
};
