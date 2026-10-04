import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import environment from '../environment.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { deleteUser, findUserByEmail, findUserById, findUserWithLoginById, insertUser, updatePassword } from './AuthQueries.ts';
import type { User } from './AuthQueries.ts';

// Mật khẩu ngắn nhất được chấp nhận
const MIN_PASSWORD_LENGTH = 8;

// Token hết hạn sau 30 ngày, phải đăng nhập lại
const TOKEN_LIFETIME = '30d';

// Kết quả đăng ký và đăng nhập gửi về app
type AuthResult = {
  token: string;
  user: User;
};

// Tạo token chứa id người dùng và phiên bản token
function createToken(userId: number, tokenVersion: number): string {
  return jwt.sign({ userId, tokenVersion }, environment.jwtSecret, { expiresIn: TOKEN_LIFETIME });
}

// Kiểm tra dữ liệu, băm mật khẩu, lưu tài khoản mới rồi đăng nhập luôn
export async function register(displayName: unknown, email: unknown, password: unknown): Promise<AuthResult> {
  if (typeof displayName !== 'string' || displayName.trim() === '') {
    throw new HttpError(400, 'Hãy nhập tên hiển thị');
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new HttpError(400, 'Email chưa đúng định dạng');
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
  }

  // Email lưu bằng chữ thường để "King@Gmail.com" và "king@gmail.com" là một
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new HttpError(409, 'Email này đã được dùng');
  }

  const passwordHash = await argon2.hash(password);
  const newUser = await insertUser(displayName.trim(), normalizedEmail, passwordHash);

  return {
    token: createToken(newUser.id, newUser.phien_ban_token),
    user: { id: newUser.id, ten_hien_thi: newUser.ten_hien_thi, email: newUser.email, da_co_ho_so: newUser.da_co_ho_so },
  };
}

// Kiểm tra email và mật khẩu, đúng thì trả về token
export async function login(email: unknown, password: unknown): Promise<AuthResult> {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Hãy nhập email và mật khẩu');
  }

  // Sai email hay sai mật khẩu đều báo cùng một câu, để người lạ không dò được email nào đã đăng ký
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw new HttpError(400, 'Sai email hoặc mật khẩu');
  }
  const passwordIsCorrect = await argon2.verify(user.mat_khau_bam, password);
  if (!passwordIsCorrect) {
    throw new HttpError(400, 'Sai email hoặc mật khẩu');
  }

  return {
    token: createToken(user.id, user.phien_ban_token),
    user: { id: user.id, ten_hien_thi: user.ten_hien_thi, email: user.email, da_co_ho_so: user.da_co_ho_so },
  };
}

// Đổi mật khẩu: kiểm mật khẩu hiện tại, lưu mật khẩu mới, trả token mới để máy đang dùng không bị đăng xuất
export async function changePassword(userId: number, currentPassword: unknown, newPassword: unknown): Promise<{ token: string }> {
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw new HttpError(400, 'Hãy nhập mật khẩu hiện tại và mật khẩu mới');
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Mật khẩu mới cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
  }

  const user = await findUserWithLoginById(userId);
  if (!user) {
    throw new HttpError(404, 'Không tìm thấy tài khoản');
  }
  const passwordIsCorrect = await argon2.verify(user.mat_khau_bam, currentPassword);
  if (!passwordIsCorrect) {
    throw new HttpError(400, 'Mật khẩu hiện tại không đúng');
  }

  const newPasswordHash = await argon2.hash(newPassword);
  const newTokenVersion = await updatePassword(userId, newPasswordHash);
  return { token: createToken(userId, newTokenVersion) };
}

// Xóa tài khoản của người đang đăng nhập
export async function deleteAccount(userId: number): Promise<void> {
  await deleteUser(userId);
}

// Lấy thông tin người đang đăng nhập
export async function getMe(userId: number): Promise<User> {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, 'Không tìm thấy tài khoản');
  }
  return user;
}
