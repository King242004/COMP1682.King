// ═══ FILE NÀY LÀM GÌ ═══
// Rút tên người dùng thành chữ cái đại diện, dùng cho avatar khi chưa có ảnh.
//
// Ai gọi tới: ProfileScreen và các màn Community
// Nhận vào:   tên người dùng
// Trả ra:     một hoặc hai chữ cái viết hoa
// Khi lỗi:    tên rỗng thì trả chữ mặc định, không trả chuỗi trống
//
// Nhớ: kết quả đưa thẳng vào ô avatar chữ, nên không bao giờ được trả chuỗi trống,
//      trả trống là ô avatar hiện ra một hình tròn rỗng không.
// ══════════════════════════════════════════════════════════
// RÚT CHỮ CÁI ĐẦU
//
// Đến từ ProfileScreen và các màn Cộng đồng. Hai bước, chỉ tính tại máy.
// Xong thì nơi gọi vẽ chữ đó vào giữa hình tròn avatar.
// ══════════════════════════════════════════════════════════

// RÚT CHỮ CÁI ĐẦU BƯỚC 1. Nơi gọi đưa tên vào đây.
export function initials(name: string) {
  // RÚT CHỮ CÁI ĐẦU BƯỚC 2. Cắt tên theo dấu cách, bỏ mảnh rỗng do gõ thừa dấu cách.
  const p = (name || "").split(" ").filter(Boolean);
  // Lấy chữ đầu của mảnh đầu ghép với chữ đầu của mảnh cuối.
  // Tên chỉ có một mảnh thì mảnh đầu cũng là mảnh cuối, ra hai chữ giống nhau,
  // nhưng vẫn chấp nhận được. Tên rỗng thì lấy "U", viết tắt của user.
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
