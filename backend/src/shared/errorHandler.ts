import type { NextFunction, Request, Response } from 'express';

// Lỗi có mã HTTP và câu báo tiếng Việt để gửi về app
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Bắt mọi lỗi: HttpError thì gửi đúng mã và câu báo, lỗi lạ thì ghi ra terminal và gửi 500
export function errorHandler(error: unknown, request: Request, response: Response, next: NextFunction) {
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: 'Lỗi máy chủ, thử lại sau' });
}
