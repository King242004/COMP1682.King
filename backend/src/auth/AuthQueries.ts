import database from '../database/database.ts';

// Thông tin người dùng gửi về app (không có mật khẩu); da_co_ho_so cho app biết có cần thiết lập hồ sơ không
export type User = {
  id: number;
  ten_hien_thi: string;
  email: string;
  da_co_ho_so: boolean;
};

// Thêm thông tin cần để đăng nhập, chỉ dùng trong backend
export type UserWithLogin = User & {
  mat_khau_bam: string;
  phien_ban_token: number;
};

// Các cột lấy ra mỗi lần đọc một người dùng; hồ sơ coi là đã có khi đã tính được mục tiêu calo
const USER_COLUMNS = 'id, ten_hien_thi, email, (muc_tieu_calo IS NOT NULL) AS da_co_ho_so';
const USER_WITH_LOGIN_COLUMNS = `${USER_COLUMNS}, mat_khau_bam, phien_ban_token`;

// Lưu tài khoản mới, trả về tài khoản vừa lưu
export async function insertUser(displayName: string, email: string, passwordHash: string): Promise<UserWithLogin> {
  const result = await database.query<UserWithLogin>(
    `INSERT INTO nguoi_dung (ten_hien_thi, email, mat_khau_bam)
     VALUES ($1, $2, $3)
     RETURNING ${USER_WITH_LOGIN_COLUMNS}`,
    [displayName, email, passwordHash],
  );
  return result.rows[0];
}

// Tìm tài khoản theo email, không có thì trả về undefined
export async function findUserByEmail(email: string): Promise<UserWithLogin | undefined> {
  const result = await database.query<UserWithLogin>(
    `SELECT ${USER_WITH_LOGIN_COLUMNS} FROM nguoi_dung WHERE email = $1`,
    [email],
  );
  return result.rows[0];
}

// Tìm tài khoản theo id kèm mật khẩu đã băm, không có thì trả về undefined
export async function findUserWithLoginById(userId: number): Promise<UserWithLogin | undefined> {
  const result = await database.query<UserWithLogin>(
    `SELECT ${USER_WITH_LOGIN_COLUMNS} FROM nguoi_dung WHERE id = $1`,
    [userId],
  );
  return result.rows[0];
}

// Tìm tài khoản theo id, không có thì trả về undefined
export async function findUserById(userId: number): Promise<User | undefined> {
  const result = await database.query<User>(
    `SELECT ${USER_COLUMNS} FROM nguoi_dung WHERE id = $1`,
    [userId],
  );
  return result.rows[0];
}

// Lấy phiên bản token hiện tại, tài khoản không còn thì trả về undefined
export async function findTokenVersion(userId: number): Promise<number | undefined> {
  const result = await database.query<{ phien_ban_token: number }>(
    'SELECT phien_ban_token FROM nguoi_dung WHERE id = $1',
    [userId],
  );
  const row = result.rows[0];
  if (!row) {
    return undefined;
  }
  return row.phien_ban_token;
}

// Lưu mật khẩu mới và tăng phiên bản token để mọi token cũ hết dùng được; trả về phiên bản mới
export async function updatePassword(userId: number, passwordHash: string): Promise<number> {
  const result = await database.query<{ phien_ban_token: number }>(
    `UPDATE nguoi_dung SET mat_khau_bam = $2, phien_ban_token = phien_ban_token + 1
     WHERE id = $1
     RETURNING phien_ban_token`,
    [userId, passwordHash],
  );
  return result.rows[0].phien_ban_token;
}

// Xóa tài khoản; dữ liệu liên quan tự xóa theo nhờ ON DELETE CASCADE
export async function deleteUser(userId: number): Promise<void> {
  await database.query('DELETE FROM nguoi_dung WHERE id = $1', [userId]);
}
