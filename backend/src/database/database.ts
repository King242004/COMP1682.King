import pg from 'pg';

import environment from '../environment.ts';

// Cột NUMERIC (ví dụ cân nặng 60.5) mặc định được pg trả về dạng chữ "60.5"; đổi thành số để tính được
const NUMERIC_TYPE_ID = 1700;
pg.types.setTypeParser(NUMERIC_TYPE_ID, (value) => Number(value));

// Cột DATE giữ nguyên dạng chữ "2026-10-04"; để pg đổi sang Date thì dễ lệch ngày vì múi giờ
const DATE_TYPE_ID = 1082;
pg.types.setTypeParser(DATE_TYPE_ID, (value) => value);

// Giữ sẵn vài kết nối tới PostgreSQL để dùng lại cho mọi câu truy vấn
const database = new pg.Pool({
  connectionString: environment.databaseUrl,
});

export default database;
