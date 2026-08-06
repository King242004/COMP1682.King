// File này giữ giới hạn độ dài của mọi ô người dùng nhập trong app.
// Bản gốc nằm ở backend/src/config/inputLimits.js. Backend vẫn là nơi kiểm
// cuối cùng, file này chỉ để ô nhập dừng sớm ngay trên máy người dùng,
// nhờ vậy không ai phải gửi request lên rồi mới biết mình gõ quá dài.
// Sửa một bên thì phải sửa bên kia, và có unit test bắt hai bên khớp nhau.
// Vài giới hạn ở đây NHỎ HƠN bản backend. Đó là cố ý: các trường đó vừa được
// hạ số, nên backend phải giữ trần cũ để bản ghi tạo từ trước vẫn sửa và lưu
// lại được, còn giao diện thì áp số mới cho mọi thứ người dùng gõ từ nay.

export const INPUT_LIMITS = {
  // Bài viết Community. Thẻ ngoài Feed chỉ hiện 3 dòng.
  POST_CAPTION: 300,
  // Tên món. Dài hơn mức này là mô tả chứ không còn là tên.
  MEAL_NAME: 80,
  // Khẩu phần đã ăn, ví dụ "1 tô lớn khoảng 350 gam" mới 24 ký tự.
  PORTION_TEXT: 40,
  // Nguyên liệu và cách chế biến. Ô này nạp thẳng vào câu lệnh gửi cho AI.
  MEAL_DETAILS: 600,
  // Tin nhắn gửi cho Coach.
  COACH_MESSAGE: 1000,
  // Khẩu vị và món cần tránh, lưu trong hồ sơ.
  TASTE_PREFERENCES: 200,
  // Ghi chú khi tạo kế hoạch tuần, có hạn mức riêng chứ không dùng chung
  // với khẩu vị trong hồ sơ.
  PLAN_NOTE: 200,
  // Tên hiển thị. Đủ cho họ tên tiếng Việt đầy đủ.
  DISPLAY_NAME: 40,
  // Email.
  EMAIL: 120,
  // Mật khẩu. bcrypt chỉ băm 72 byte đầu nên chặn ở 64 cho chắc.
  PASSWORD: 64,
  // Ô tìm tên người dùng.
  USER_SEARCH: 50,
  // Mã vạch, đúng bằng luật EAN và UPC mà backend đang kiểm.
  BARCODE: 14,
  // Giờ nhắc bữa, dạng HH:MM.
  REMINDER_TIME: 5,
  // Mã xác minh gửi qua email, backend luôn sinh đúng 6 chữ số.
  OTP_CODE: 6,
} as const;

// Số CHỮ SỐ tối đa của các ô nhập số. Khoảng giá trị hợp lệ vẫn do
// PROFILE_LIMITS quyết định, ở đây chỉ chặn gõ hai mươi chữ số vào ô cân nặng.
export const DIGIT_LIMITS = {
  // Tuổi tối đa 120 nên ba chữ số là đủ.
  AGE: 3,
  // Cân nặng tối đa 300 và cho nhập số lẻ, ví dụ "300.5" là năm ký tự.
  WEIGHT: 5,
  // Chiều cao tối đa 250, để năm ký tự cho trường hợp nhập số lẻ.
  HEIGHT: 5,
  // Calo và ba chất của MỘT món, backend chặn ở 9999 nên bốn chữ số.
  CALORIE: 4,
  MACRO: 4,
  // Mục tiêu calo mỗi ngày trong hồ sơ, backend cho tối đa 10000.
  CALORIE_GOAL: 5,
} as const;
