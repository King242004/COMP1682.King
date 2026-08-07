// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng của một món ĐÃ ăn trong nhật ký.
// Đây là điểm CUỐI của LUỒNG LƯU MÓN, nơi dữ liệu thật sự chạm vào MongoDB.
// Đây là bảng trung tâm của app: gần như mọi con số trên Trang chủ
// và Tiến trình đều cộng từ bảng này ra.
//
// Ai gọi tới: mealController (thêm sửa xóa), planController (nút "Đã ăn"),
//             coachContext (gom món đã ăn để đưa cho AI Coach)
// Nhận vào:   object món do mealController/planController dựng, đã qua mealInputValidator
// Trả ra:     một dòng Meal đã kiểm hợp lệ
// Khi lỗi:    thiếu tên, buổi ăn hoặc ngày thì Mongoose chặn lại
//
// Năm lối ghi vào bảng này: nhập tay, quét ảnh, quét mã vạch,
// bấm "Đã ăn" ở kế hoạch tuần, và bấm "Thêm" trên tin nhắn Coach.
//
// Ngày lưu dạng chuỗi "2026-08-03" chứ không lưu kiểu ngày tháng,
// để so sánh và lọc theo ngày địa phương mà không lo lệch múi giờ.
const mongoose = require("mongoose");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../config/inputLimits");
const nutritionFields = require("./nutritionFields");
const { MEAL_TYPES, NUTRITION_SOURCES } = require("../config/mealEnums");
// Đến từ mealController, đã qua mealInputValidator rồi.
// Mongoose vẫn kiểm lần NỮA theo khuôn dưới đây, vì có thể ai đó gọi thẳng
// model từ chỗ khác mà không đi qua validator.
const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Các trần dưới đây là trần LỊCH SỬ. Giới hạn mới nhỏ hơn và được áp ở
    // giao diện, vì validator Mongoose chạy mỗi lần ghi nên hạ số ở đây sẽ làm
    // bản ghi cũ dài hơn số mới không sửa và lưu lại được.
    name: { type: String, required: true, maxlength: LEGACY_LIMITS.MEAL_NAME },
    mealType: {
      type: String,
      enum: MEAL_TYPES,
      required: true,
    },
    ...nutritionFields,
    portionAmount: { type: Number, default: null, min: 0 },
    portionUnit: { type: String, default: "", trim: true, maxlength: INPUT_LIMITS.PORTION_UNIT },
    portionText: { type: String, default: "", trim: true, maxlength: LEGACY_LIMITS.PORTION_TEXT },
    nutritionSource: {
      type: String,
      enum: NUTRITION_SOURCES,
      default: "manual",
    },
    image: { type: String, default: null },
    note: { type: String, default: "", maxlength: LEGACY_LIMITS.MEAL_DETAILS },
    // Ngày theo định dạng YYYY-MM-DD.
    date: { type: String, required: true },
  },
  { timestamps: true }
);

// Chỉ mục theo người dùng và ngày, để lấy món của một ngày chạy nhanh.
mealSchema.index({ user: 1, date: -1, createdAt: -1 });

module.exports = mongoose.model("Meal", mealSchema);
