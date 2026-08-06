// ═══ FILE NÀY LÀM GÌ ═══
// Rút tên người dùng thành chữ cái đại diện, dùng cho avatar khi chưa có ảnh.
//
// Ai gọi tới: ProfileScreen và các màn Community
// Nhận vào:   tên người dùng
// Trả ra:     một hoặc hai chữ cái viết hoa
// Khi lỗi:    tên rỗng thì trả chữ mặc định, không trả chuỗi trống
// Các màn Profile và Community gọi trực tiếp, kết quả được đưa vào ô avatar chữ.
export function initials(name: string) {
  const p = (name || "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
