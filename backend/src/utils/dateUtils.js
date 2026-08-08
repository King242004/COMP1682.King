// ══════════════════════════════════════════════════════════
// CHỐT HÔM NAY LÀ NGÀY NÀO
//
// Không phải luồng. Mấy hàm tính ngày thuần.
// 
// Nhớ: server nằm ở Singapore còn người dùng ở đâu cũng có. Vì vậy KHÔNG được
//      lấy ngày của server, phải lấy theo múi giờ mà app gửi kèm mỗi request
//      trong header x-timezone-offset.
// ══════════════════════════════════════════════════════════

// ═══ FILE NÀY LÀM GÌ ═══
// Trả lời một câu hỏi: hôm nay là ngày nào, theo múi giờ của MÁY người dùng.
//
// Ai gọi tới: mealController, planController, coachController, exerciseController
// Nhận vào:   độ lệch múi giờ mà app gửi kèm trong tiêu đề request
// Trả ra:     chuỗi ngày dạng YYYY-MM-DD
// Khi lỗi:    thiếu hoặc sai độ lệch thì dùng giờ quốc tế UTC
//
// Vì sao không dùng thẳng giờ máy chủ: máy chủ đặt ở Singapore. Người dùng
// ghi món lúc 23h ở Việt Nam mà tính theo giờ máy chủ có thể nhảy sang ngày mai.
//
// Đổi một mốc thời gian thành khóa ngày địa phương dạng YYYY-MM-DD.
function dateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Tạo chuỗi ngày hôm nay dạng YYYY-MM-DD theo múi giờ thiết bị.
// Offset lấy từ thiết bị qua header chung; thiếu hoặc sai thì dùng UTC.
// Nơi dùng: chặn ghi dữ liệu cho ngày tương lai và lấy mặc định hôm nay.
function todayKey(timezoneOffsetMinutes = 0, now = new Date()) {
  const offset = Number(timezoneOffsetMinutes);
  const safeOffset = Number.isFinite(offset) && offset >= -840 && offset <= 840 ? offset : 0;
  return new Date(now.getTime() - safeOffset * 60_000).toISOString().slice(0, 10);
}

// Bản gọn cho controller: móc luôn múi giờ ra khỏi header của request.
// Header x-timezone-offset do apiClient bên app gắn vào MỌI request.
// App không gửi header đó thì todayKey ở trên tự lùi về 0, tức tính theo giờ UTC.
function requestTodayKey(req, now) {
  return todayKey(req.get("x-timezone-offset"), now);
}

module.exports = { dateKey, requestTodayKey, todayKey };
