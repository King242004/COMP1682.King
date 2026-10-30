// Màu của app, lấy đúng theo tai-lieu/GiaoDien.md
export const colors = {
  primary: '#0369A1',
  textOnPrimary: '#FFFFFF',
  primaryLight: '#E0F2FE',
  textOnPrimaryLight: '#075985',
  background: '#FBF9F4',
  surface: '#FFFFFF',
  card: '#F4F4F5',
  border: '#E4E4E7',
  cardBorder: '#F0EDE4',
  text: '#18181B',
  textSecondary: '#52525B',
  overlay: 'rgba(0, 0, 0, 0.3)',
  overOnPrimary: '#FECACA',
  trackOnPrimary: 'rgba(255, 255, 255, 0.25)',
  error: '#DC2626',
  errorBackground: '#FEF2F2',
  errorText: '#B91C1C',
  warning: '#B45309',
  warningBackground: '#FEF3C7',
  warningText: '#92400E',
  protein: '#047857',
  proteinLight: '#ECFDF5',
  carbs: '#B45309',
  carbsLight: '#FEF3C7',
  fat: '#BE185D',
  fatLight: '#FCE7F3',
  // Màu ô biểu tượng của từng bữa (bữa trưa dùng màu chính); khác hẳn màu 3 chất để không lẫn
  breakfast: '#C2410C',
  breakfastLight: '#FFEDD5',
  dinner: '#5B21B6',
  dinnerLight: '#EDE9FE',
  snack: '#0F766E',
  snackLight: '#CCFBF1',
};

// Cỡ chữ dùng chung cho cả app; không dùng cỡ nào khác
export const fontSizes = {
  screenTitle: 24,
  sectionTitle: 18,
  body: 15,
  secondary: 13,
  label: 12,
  bigNumber: 28,
};

// Khoảng cách dùng chung: chỉ 4 bậc
export const spacing = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
};

// Bo góc dùng chung
export const radius = {
  input: 12,
  card: 22,
  pill: 999,
};

// Bóng mềm của thẻ: iOS dùng 4 thuộc tính shadow, Android dùng elevation
export const shadows = {
  card: {
    shadowColor: '#0369A1',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

// Độ mờ khi đang chạm vào nút, thẻ, dòng bấm được
export const pressedOpacity = 0.6;
