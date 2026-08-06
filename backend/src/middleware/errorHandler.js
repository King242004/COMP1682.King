// ═══ FILE NÀY LÀM GÌ ═══
// Nơi mọi lỗi của backend đi về. Đặt ở CUỐI app.js nên nó bắt được
// mọi thứ mà các chặng trước ném ra.
//
// Ai gọi tới: app.js, gắn cuối cùng sau tất cả route
// Nhận vào:   lỗi do bất kỳ controller hay middleware nào ném ra
// Trả ra:     một câu báo lỗi gọn cho app, kèm mã trạng thái hợp lý
// Khi lỗi:    nếu đã lỡ trả lời rồi thì bỏ qua, không ghi đè lên câu đã gửi
//
// Vì sao cần: không có file này thì lỗi lạ sẽ lộ nguyên dấu vết kỹ thuật
// ra ngoài, gồm cả đường dẫn file trên máy chủ.
function errorHandler(err, req, res, next) {
  // Nếu đã lỡ trả lời rồi thì thôi, không ghi đè lên nữa.
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "Image is too large." : "Invalid image upload.",
    });
  }
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid request body." });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

module.exports = errorHandler;
