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

  // Lỗi do express.json() báo khi đọc dữ liệu gửi lên: quá lớn (413) hoặc JSON sai (400)
  const bodyError = error as { type?: string };
  if (bodyError.type === 'entity.too.large') {
    response.status(413).json({ message: 'Dữ liệu gửi lên quá lớn, hãy chụp ảnh nhỏ hơn' });
    return;
  }
  if (bodyError.type === 'entity.parse.failed') {
    response.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Lỗi máy chủ, thử lại sau' });
}
