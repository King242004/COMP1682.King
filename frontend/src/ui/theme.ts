// ═══ FILE NÀY LÀM GÌ ═══
// Giữ toàn bộ màu, khoảng cách, bo góc và cỡ chữ của app, ở một chỗ duy nhất.
//
// Ai gọi tới: gần như mọi file có vẽ giao diện
// Nhận vào:   không nhận gì, đây là bảng giá trị khai sẵn
// Trả ra:     màu, khoảng cách, bo góc, cỡ chữ
// Khi lỗi:    không có nhánh lỗi
//
// File này giữ toàn bộ màu, khoảng cách, bo góc và cỡ chữ của app.
// Mọi màn đều lấy giá trị từ đây thay vì tự ghi số, nên đổi một chỗ
// là cả app đổi theo.
// App khóa tông màu sáng, không có chế độ tối.
export const theme = {
  colors: {
    // Nền xanh cyan rất nhạt.
    bg: "#ECFEFF",
    surface: "#FFFFFF",
    // Màu chữ xanh cyan đậm.
    text: "#164E63",
    muted: "#3F6B7D",
    // Giữ độ tương phản tối thiểu 4.5:1 trên nền trắng cho chữ nhỏ.
    subtle: "#5C7F8F",
    border: "#D7EEF4",
    // Màu cyan chính của ứng dụng.
    primary: "#0891B2",
    // Phiên bản đậm hơn khi nút được nhấn.
    primary2: "#0E7490",
    // Màu xanh lá cho nút hành động và trạng thái tích cực.
    accent: "#059669",
    // Màu cam cho năng lượng và hoạt động.
    accent2: "#FF8A3D",
    // Màu tím cho chỉ số chất béo.
    indigo: "#6366F1",
    danger: "#E5484D",
    tint: "rgba(8, 145, 178, 0.10)",
    // Màu nền nhẹ cho vùng lớn như ô tìm kiếm và chip.
    tintSoft: "rgba(8, 145, 178, 0.06)",
    shadow: "rgba(22, 78, 99, 0.16)",
  },
  // Bo góc 12 tới 18, chiều sâu tạo bằng nhiều lớp bóng mềm, xem hàm shadow()
  radius: {
    card: 18,
    input: 14,
    button: 14,
    pill: 999,
  },
  space: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  type: {
    h0: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.3 },
    h1: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.2 },
    h2: { fontSize: 18, fontWeight: "800" as const, letterSpacing: -0.1 },
    body: { fontSize: 15, fontWeight: "500" as const },
    body2: { fontSize: 14, fontWeight: "500" as const },
    caption: { fontSize: 12, fontWeight: "600" as const },
  },
} as const;

export function shadow(level: 1 | 2 | 3 = 2) {
  // Soft, premium shadow that works on iOS + Android.
  // Level 1 = quiet RESTING shadow for ordinary cards — kept subtle so level 2+
  // (hero/summary cards) visibly float above them (depth hierarchy, not noise).
  if (level === 1) {
    return {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 1,
    } as const;
  }

  if (level === 2) {
    return {
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.55,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 22,
      elevation: 4,
    } as const;
  }

  return {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 6,
  } as const;
}
