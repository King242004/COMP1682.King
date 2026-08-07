// ═══ FILE NÀY LÀM GÌ ═══
// Giữ hai danh sách giá trị cho phép của món ăn, ở MỘT chỗ duy nhất.
//
// Ai gọi tới: model Meal, PlanMeal, Post; validator mealInputValidator;
//             controller meal, plan, coach, community/post
// Nhận vào:   không nhận gì, đây là hai mảng khai sẵn
// Trả ra:     danh sách buổi ăn, và danh sách nguồn số liệu dinh dưỡng
// Khi lỗi:    không có nhánh lỗi, việc kiểm do nơi gọi làm
//
// Vì sao tách ra: trước đây danh sách buổi ăn bị chép ở 6 chỗ và danh sách
// nguồn dinh dưỡng ở 5 chỗ. Thêm một giá trị mới là phải sửa đủ 6 file,
// sót một chỗ thì dữ liệu lọt qua validator rồi chết ở tầng model.
// Giờ sửa một chỗ là xong.

// Bốn buổi ăn trong ngày. Thứ tự này cũng là thứ tự hiện trên giao diện.
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// Số dinh dưỡng của một món ở đâu ra. Dùng để dán nhãn nguồn cho người dùng biết
// con số là do họ tự gõ, do AI đoán, hay lấy từ bao bì sản phẩm.
const NUTRITION_SOURCES = [
  "manual",         // người dùng tự gõ
  "ai_estimate",    // AI ước tính từ tên món và khẩu phần
  "ai_adjusted",    // AI ước tính rồi người dùng sửa lại
  "photo_scan",     // AI nhìn ảnh đoán ra
  "barcode",        // lấy từ Open Food Facts qua mã vạch
  "community",      // chép từ một bài đăng trong Cộng đồng
  "repeat",         // ghi lại một món cũ trong nhật ký
  "ai_suggestion",  // món do Coach hoặc thẻ gợi ý đề xuất
];

module.exports = { MEAL_TYPES, NUTRITION_SOURCES };
