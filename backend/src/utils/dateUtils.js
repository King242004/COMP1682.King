// Tạo chuỗi ngày hôm nay dạng YYYY-MM-DD theo múi giờ thiết bị.
// Offset lấy từ thiết bị qua header chung; thiếu hoặc sai thì dùng UTC.
// Nơi dùng: chặn ghi dữ liệu cho ngày tương lai và lấy mặc định hôm nay.
function todayKey(timezoneOffsetMinutes = 0, now = new Date()) {
  const offset = Number(timezoneOffsetMinutes);
  const safeOffset = Number.isFinite(offset) && offset >= -840 && offset <= 840 ? offset : 0;
  return new Date(now.getTime() - safeOffset * 60_000).toISOString().slice(0, 10);
}

function requestTodayKey(req, now) {
  return todayKey(req.get("x-timezone-offset"), now);
}

module.exports = { requestTodayKey, todayKey };
