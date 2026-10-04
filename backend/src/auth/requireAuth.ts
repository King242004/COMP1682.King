import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import environment from '../environment.ts';
import { HttpError } from '../shared/errorHandler.ts';
import { findTokenVersion } from './AuthQueries.ts';

// Nội dung nằm bên trong token, do createToken trong AuthService tạo ra
type TokenContent = {
  userId: number;
  tokenVersion: number;
};

// Chặn yêu cầu chưa đăng nhập; hợp lệ thì để id người dùng vào response.locals.userId
export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  // App gửi token trong header dạng "Authorization: Bearer <token>"
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Bạn chưa đăng nhập');
  }
  const token = authorizationHeader.slice('Bearer '.length);

  // Kiểm chữ ký và hạn dùng của token
  let tokenContent: TokenContent;
  try {
    tokenContent = jwt.verify(token, environment.jwtSecret) as TokenContent;
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn');
  }

  // Đổi mật khẩu hoặc xóa tài khoản thì phiên bản trong database không còn khớp với token
  const currentTokenVersion = await findTokenVersion(tokenContent.userId);
  if (currentTokenVersion !== tokenContent.tokenVersion) {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn');
  }

  response.locals.userId = tokenContent.userId;
  next();
}
