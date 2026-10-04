// Đọc một biến trong .env, thiếu thì dừng server và báo tên biến
function readRequiredVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Thiếu biến ${variableName} trong file .env`);
  }
  return value;
}

// Các biến server cần, đọc một lần lúc khởi động
const environment = {
  port: Number(readRequiredVariable('PORT')),
  databaseUrl: readRequiredVariable('DATABASE_URL'),
  jwtSecret: readRequiredVariable('JWT_SECRET'),
};

export default environment;
