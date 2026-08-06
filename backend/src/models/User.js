// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng của một tài khoản trong database.
// Đây là gốc của mọi bảng khác: bảng nào cũng có một trường user trỏ về đây.
//
// Ai gọi tới: authController (tạo), profileController (sửa hồ sơ),
//             accountController (đổi mật khẩu, xóa tài khoản),
//             planController và coachController (đọc bệnh nền, mục tiêu calo)
// Nhận vào:   object tài khoản do controller dựng sẵn
// Trả ra:     một dòng User đã kiểm hợp lệ, có sẵn mã _id và thời gian tạo
// Khi lỗi:    thiếu trường bắt buộc hoặc sai kiểu thì Mongoose chặn lại,
//             controller bắt lỗi và trả thông báo cho app
//
// Hai trường cần chú ý:
//   password có select false nên mặc định KHÔNG bị đọc ra.
//     Muốn lấy phải xin thêm bằng .select("+password"), chỉ lúc đăng nhập mới cần.
//   conditions là danh sách bệnh nền, chính là thứ mà lớp lọc an toàn dựa vào.
const mongoose = require("mongoose");
const { WEIGHT_GOALS, WEIGHT_GOAL_VALUES } = require("../config/nutritionConstants");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerifiedAt: { type: Date, default: null },
    password: { type: String, required: true, select: false },
    // Tăng số này sau mỗi lần đổi mật khẩu để mọi token cũ hết hiệu lực.
    tokenVersion: { type: Number, default: 0, select: false },
    avatar: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    gender: { type: String, enum: ["male", "female"], default: null },
    age: { type: Number, default: null },
    // Cân nặng hiện tại theo kg, luôn đồng bộ với WeightLog mới nhất.
    weight: { type: Number, default: null },
    // Cân nặng mục tiêu theo kg.
    targetWeight: { type: Number, default: null },
    // Tốc độ muốn đổi cân nặng, tính bằng kg mỗi tuần.
    // Đây là thứ quyết định mục tiêu calo lệch bao nhiêu so với TDEE.
    // Chưa chọn thì calorieGoal dùng mức mặc định trong nutritionConstants.
    weeklyRateKg: { type: Number, default: null },
    // Số buổi tập muốn đạt mỗi tuần, dùng cho vòng tiến độ ở Trang chủ.
    weeklyWorkoutTarget: { type: Number, default: null },
    // Chiều cao theo cm.
    height: { type: Number, default: null },
    goal: {
      type: String,
      enum: WEIGHT_GOAL_VALUES,
      default: WEIGHT_GOALS.maintain,
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "moderate", "active"],
      default: "moderate",
    },
    // Danh sách tình trạng sức khỏe, ví dụ tiểu đường hoặc cao huyết áp.
    conditions: [{ type: String }],
    // Chưa đủ hồ sơ thì để rỗng chứ KHÔNG đặt sẵn một con số.
    // Bịa ra một mục tiêu mặc định sẽ khiến người dùng tưởng app đã tính cho mình.
    calorieGoal: { type: Number, default: null },
    customGoal: { type: Boolean, default: false },
    // Ngôn ngữ AI Coach. Nếu chưa chọn thì frontend dùng ngôn ngữ thiết bị.
    language: { type: String, enum: ["vi", "en"] },
    tastePreferences: { type: String, default: "" },
    isPrivate: { type: Boolean, default: false },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
