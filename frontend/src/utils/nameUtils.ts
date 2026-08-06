// Rút tên người dùng thành chữ cái đại diện cho avatar mặc định.
// Các màn Profile và Community gọi trực tiếp, kết quả được đưa vào ô avatar chữ.
export function initials(name: string) {
  const p = (name || "").split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "U") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
