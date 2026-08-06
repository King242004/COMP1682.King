// ═══ FILE NÀY LÀM GÌ ═══
// Giữ MỌI giới hạn độ dài của các ô người dùng nhập, ở một chỗ duy nhất.
//
// Ai gọi tới: mọi controller và model có nhận chữ từ người dùng
// Nhận vào:   không nhận gì, đây là bảng số khai sẵn
// Trả ra:     các con số giới hạn
// Khi lỗi:    không có nhánh lỗi, việc chặn do nơi gọi làm
//
// Quy tắc của file: một giới hạn chỉ được khai ở ĐÂY, không nơi nào gõ lại số.
//
// File này giữ MỌI giới hạn độ dài của các ô người dùng nhập.
// Quy tắc của file: một giới hạn chỉ được khai ở đây, không nơi nào gõ lại số.
// Có hai loại số trong file:
//   1. Giới hạn hiện hành, dùng cho dữ liệu mới. Giao diện dùng đúng bộ này.
//   2. Trần lịch sử, chỉ dùng ở tầng model và ở đường sửa bản ghi cũ.
//      Vài giới hạn đã được hạ xuống, nên bản ghi tạo trước đợt này có thể
//      dài hơn số mới. Giữ trần cũ để người dùng vẫn sửa và lưu lại được
//      bản ghi của chính mình, thay vì bị kẹt không thao tác nổi.
// Nguyên tắc chung: giới hạn ở giao diện luôn NHỎ HƠN HOẶC BẰNG giới hạn ở đây,
// nhờ vậy người dùng không bao giờ nhận lỗi độ dài từ server.
// Bản song song cho giao diện là frontend/src/config/inputLimits.ts.
// Có unit test đọc cả hai file và bắt hai bên phải khớp nhau.

// Ô viết dài. Con số chọn theo chỗ mà chữ thật sự được hiển thị.
const INPUT_LIMITS = {
  // Bài viết Community. Thẻ ngoài Feed chỉ hiện 3 dòng, đây là nhật ký món ăn
  // chứ không phải blog, nên 300 đủ cho bốn tới năm câu tiếng Việt.
  POST_CAPTION: 300,

  // Tên món. Dài hơn mức này là mô tả chứ không còn là tên.
  MEAL_NAME: 80,

  // Phần khẩu phần đã ăn, ví dụ "1 tô lớn khoảng 350 gam" mới 24 ký tự.
  PORTION_TEXT: 40,

  // Đơn vị khẩu phần, ví dụ "tô", "phần", "gam".
  PORTION_UNIT: 40,

  // Nguyên liệu và cách chế biến. Ô này nạp thẳng vào câu lệnh gửi cho AI,
  // nên ngắn lại là rẻ hơn và nhanh hơn. 600 đủ liệt kê nguyên liệu một món.
  MEAL_DETAILS: 600,

  // Tin nhắn gửi cho Coach.
  COACH_MESSAGE: 1000,

  // Khẩu vị và món cần tránh, lưu trong hồ sơ.
  TASTE_PREFERENCES: 200,

  // Ghi chú khi tạo kế hoạch tuần. Có hạn mức RIÊNG, không dùng chung với
  // khẩu vị trong hồ sơ, vì trước đây hai vế bị nối rồi mới cắt chung nên
  // ghi chú dài sẽ đẩy mất khẩu vị và AI dựng kế hoạch theo dữ liệu cụt.
  PLAN_NOTE: 200,

  // Tên hiển thị. Đủ cho họ tên tiếng Việt đầy đủ, và hàng danh sách
  // người dùng trong Community không bị vỡ.
  DISPLAY_NAME: 40,

  // Email. Đặt dưới giới hạn khóa index của MongoDB là 1024 byte, vì trường
  // email có unique index nên chuỗi quá dài sẽ làm lỗi index chứ không ra
  // câu báo lỗi tử tế.
  EMAIL: 120,

  // Mật khẩu. bcrypt chỉ băm 72 byte đầu, phần dư bị bỏ im lặng.
  // Chặn ở 64 nên không bao giờ có chuyện người dùng đặt mật khẩu dài
  // rồi phần đuôi không có tác dụng gì.
  PASSWORD: 64,

  // Ô tìm tên người dùng. Dài hơn tên cho phép thì tìm cũng không ra ai.
  USER_SEARCH: 50,

  // Mã vạch. Đúng bằng luật EAN và UPC mà scanController đang kiểm.
  BARCODE: 14,

  // Giờ nhắc bữa, dạng HH:MM.
  REMINDER_TIME: 5,

  // Mã xác minh gửi qua email. generateOTP luôn sinh đúng 6 chữ số.
  OTP_CODE: 6,
};

// Số CHỮ SỐ tối đa của các ô nhập số. Khoảng giá trị hợp lệ vẫn do
// PROFILE_LIMITS trong nutritionConstants.js quyết định, ở đây chỉ chặn
// người dùng gõ được hai mươi chữ số vào một ô cân nặng.
const DIGIT_LIMITS = {
  // Tuổi tối đa 120 nên ba chữ số là đủ.
  AGE: 3,
  // Cân nặng tối đa 300 và cho nhập số lẻ, ví dụ "300.5" là năm ký tự.
  WEIGHT: 5,
  // Chiều cao tối đa 250, để năm ký tự cho trường hợp nhập số lẻ.
  HEIGHT: 5,
  // Calo và ba chất của MỘT món, mealInputValidator chặn ở 9999 nên bốn chữ số.
  CALORIE: 4,
  MACRO: 4,
  // Mục tiêu calo mỗi ngày trong hồ sơ, PROFILE_LIMITS cho tối đa 10000.
  CALORIE_GOAL: 5,
};

// Trần lịch sử. Chỉ dùng ở model và ở đường sửa bản ghi cũ.
// KHÔNG dùng bộ này cho dữ liệu mới, và không đưa nó ra giao diện.
const LEGACY_LIMITS = {
  POST_CAPTION: 500,
  MEAL_NAME: 100,
  PORTION_TEXT: 80,
  MEAL_DETAILS: 2000,
  TASTE_PREFERENCES: 300,
  COACH_MESSAGE: 2000,
};

module.exports = { INPUT_LIMITS, DIGIT_LIMITS, LEGACY_LIMITS };
