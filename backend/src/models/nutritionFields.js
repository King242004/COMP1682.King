// ═══ FILE NÀY LÀM GÌ ═══
// Khai bốn trường dinh dưỡng dùng chung: calo, đạm, tinh bột, chất béo.
// Có hai bản: bản cho bảng chính, và bản chụp lại để đính kèm.
//
// Ai gọi tới: model Meal và PlanMeal lấy bản chính; model Post và ChatMessage
//             lấy bản chụp lại cho phần món đính kèm bài đăng hoặc tin nhắn
// Nhận vào:   không nhận gì, đây chỉ là hai object khai sẵn
// Trả ra:     bốn trường kèm kiểu số và giá trị nhỏ nhất là 0
// Khi lỗi:    không có nhánh lỗi, việc kiểm do Mongoose làm ở các model kia
//
// Vì sao tách ra: món đã ăn và món dự định ăn phải có cùng bộ số dinh dưỡng.
// Viết một chỗ thì sửa một chỗ, không lo bốn bảng lệch nhau.
//
// Nhớ: khác nhau ĐÚNG một điểm. Bản chính bắt buộc có calo và điền 0 cho ba chất
//      còn thiếu, vì đó là dòng nhật ký thật. Bản chụp lại KHÔNG bắt buộc và
//      KHÔNG điền 0, vì bài viết thường và tin nhắn thường vốn không kèm món nào,
//      điền 0 vào là bịa ra một món 0 calo.

// Bản chính, dùng cho bảng Meal và PlanMeal.
const nutritionFields = {
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, default: 0, min: 0 },
  carbs: { type: Number, default: 0, min: 0 },
  fat: { type: Number, default: 0, min: 0 },
};

// Bản chụp lại, dùng cho phần món đính kèm trong Post và ChatMessage.
const nutritionSnapshotFields = {
  calories: { type: Number, min: 0 },
  protein: { type: Number, min: 0 },
  carbs: { type: Number, min: 0 },
  fat: { type: Number, min: 0 },
};

module.exports = { nutritionFields, nutritionSnapshotFields };
