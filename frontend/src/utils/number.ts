// Đọc số người dùng nhập với cả dấu chấm và dấu phẩy thập phân.
// Bàn phím số tiếng Việt trên iOS thường hiển thị dấu phẩy.
export function parseDecimal(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}
