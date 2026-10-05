// Đọc một biến trong .env, thiếu thì dừng server và báo tên biến
function readRequiredVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Thiếu biến ${variableName} trong file .env`);
  }
  return value;
}

// Đọc một biến không bắt buộc; thiếu thì trả về chuỗi rỗng
function readOptionalVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value) {
    return '';
  }
  return value;
}

// Các biến server cần, đọc một lần lúc khởi động
const environment = {
  port: Number(readRequiredVariable('PORT')),
  databaseUrl: readRequiredVariable('DATABASE_URL'),
  jwtSecret: readRequiredVariable('JWT_SECRET'),
  // Chưa có khóa Gemini thì app vẫn chạy, chỉ các nút AI báo chưa cấu hình
  geminiApiKey: readOptionalVariable('GEMINI_API_KEY'),
  geminiModel: readOptionalVariable('GEMINI_MODEL'),
  openFoodFactsUrl: readRequiredVariable('OPEN_FOOD_FACTS_URL'),
  openFoodFactsUserAgent: readRequiredVariable('OPEN_FOOD_FACTS_USER_AGENT'),
};

export default environment;
