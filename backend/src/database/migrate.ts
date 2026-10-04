import { readdir, readFile } from 'node:fs/promises';

import database from './database.ts';

// Bảng ghi lại những file .sql đã chạy, để lần sau không chạy lại
await database.query(`
  CREATE TABLE IF NOT EXISTS migrations (
    file_name TEXT PRIMARY KEY,
    ran_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

// Lấy các file .sql trong thư mục migrations, xếp theo số thứ tự đầu tên file
const migrationsFolder = new URL('./migrations/', import.meta.url);
const allFileNames = await readdir(migrationsFolder);
const sqlFileNames = allFileNames.filter((fileName) => fileName.endsWith('.sql')).sort();

for (const fileName of sqlFileNames) {
  // Bỏ qua file đã chạy rồi
  const alreadyRan = await database.query('SELECT 1 FROM migrations WHERE file_name = $1', [fileName]);
  if (alreadyRan.rows.length > 0) {
    continue;
  }

  // Chạy file và ghi tên file trong cùng một lần: lỗi ở đâu thì hủy hết, không lưu nửa vời
  const sql = await readFile(new URL(fileName, migrationsFolder), 'utf8');
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (file_name) VALUES ($1)', [fileName]);
    await client.query('COMMIT');
    console.log(`Đã chạy ${fileName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Đóng kết nối để lệnh kết thúc
await database.end();
console.log('Database đã cập nhật xong');
