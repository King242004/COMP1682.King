import { GoogleGenAI } from '@google/genai';

import environment from '../environment.ts';
import { HttpError } from './errorHandler.ts';

// Mặc định một lần hỏi AI chờ tối đa 15 giây (câu trả lời ngắn, bình thường khoảng 2 giây); quá thì báo AI bận để người dùng thử lại
const REQUEST_TIMEOUT_MS = 15000;

// Mức "được phép đoán" của AI: thấp để cùng một câu hỏi ra kết quả gần giống nhau
const TEMPERATURE = 0.2;

// Ảnh gửi kèm câu hỏi, dạng base64
export type ImageInput = {
  base64Data: string;
  mimeType: string;
};

// Hỏi Gemini và nhận về JSON đúng khuôn jsonSchema; câu trả lời dài thì truyền timeoutMs lớn hơn; chưa có khóa hoặc AI lỗi thì báo 503
export async function askGeminiForJson(
  prompt: string,
  jsonSchema: object,
  image?: ImageInput,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<unknown> {
  if (!environment.geminiApiKey || !environment.geminiModel) {
    throw new HttpError(503, 'Tính năng AI chưa được cấu hình, hãy nhập tay');
  }

  // Có ảnh thì gửi ảnh trước rồi tới câu hỏi
  const parts: object[] = [];
  if (image) {
    parts.push({ inlineData: { data: image.base64Data, mimeType: image.mimeType } });
  }
  parts.push({ text: prompt });

  // Gọi Gemini; lỗi mạng, hết lượt, quá giờ đều gộp thành một câu báo cho người dùng
  let responseText: string | undefined;
  try {
    const client = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    const response = await client.models.generateContent({
      model: environment.geminiModel,
      contents: [{ role: 'user', parts: parts }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: jsonSchema,
        temperature: TEMPERATURE,
        httpOptions: { timeout: timeoutMs },
      },
    });
    responseText = response.text;
  } catch (error) {
    console.error(error);
    throw new HttpError(503, 'AI đang bận, thử lại sau hoặc nhập tay');
  }

  // Đọc chữ AI trả về thành JSON
  if (!responseText) {
    throw new HttpError(503, 'AI không trả lời, thử lại sau hoặc nhập tay');
  }
  try {
    return JSON.parse(responseText);
  } catch {
    throw new HttpError(503, 'AI trả lời sai định dạng, thử lại sau hoặc nhập tay');
  }
}
