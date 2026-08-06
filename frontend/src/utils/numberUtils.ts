// ═══ FILE NÀY LÀM GÌ ═══
// Đọc số người dùng gõ vào, chấp nhận cả dấu chấm lẫn dấu phẩy thập phân.
//
// Ai gọi tới: AddMealScreen, EditMealScreen, các ô nhập cân nặng và chiều cao
// Nhận vào:   chuỗi người dùng gõ
// Trả ra:     một con số, hoặc rỗng nếu gõ không ra số
// Khi lỗi:    gõ chữ thì trả rỗng, để màn hình hiện lỗi thay vì tính ra NaN
// Đọc số người dùng nhập với cả dấu chấm và dấu phẩy thập phân.
// Bàn phím số tiếng Việt trên iOS thường hiển thị dấu phẩy.
export function parseDecimal(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}
