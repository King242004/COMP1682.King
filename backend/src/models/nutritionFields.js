// ═══ FILE NÀY LÀM GÌ ═══
// Khai bốn trường dinh dưỡng dùng chung: calo, đạm, tinh bột, chất béo.
//
// Ai gọi tới: model Meal và model PlanMeal, cả hai trải object này vào schema
// Nhận vào:   không nhận gì, đây chỉ là một object khai sẵn
// Trả ra:     bốn trường kèm kiểu số và giá trị nhỏ nhất là 0
// Khi lỗi:    không có nhánh lỗi, việc kiểm do Mongoose làm ở hai model kia
//
// Vì sao tách ra: món đã ăn và món dự định ăn phải có cùng bộ số dinh dưỡng.
// Viết một chỗ thì sửa một chỗ, không lo hai bên lệch nhau.
module.exports = {
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, default: 0, min: 0 },
  carbs: { type: Number, default: 0, min: 0 },
  fat: { type: Number, default: 0, min: 0 },
};
