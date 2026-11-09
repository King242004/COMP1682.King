import { GoogleGenAI } from '@google/genai';
import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';

import environment from '../environment.ts';
import { HttpError } from './errorHandler.ts';

// Mặc định một lần hỏi AI chờ tối đa 15 giây (câu trả lời ngắn, bình thường khoảng 2 giây); quá thì báo AI bận để người dùng thử lại
const REQUEST_TIMEOUT_MS = 15000;

// Mức "được phép đoán" của AI: thấp để cùng một câu hỏi ra kết quả gần giống nhau
const TEMPERATURE = 0.2;

// Google trả mã 503 khi model đang quá tải; lúc đó chờ 1 giây rồi hỏi lại đúng một lần
const GOOGLE_OVERLOADED_STATUS = 503;
const RETRY_DELAY_MS = 1000;

// Ảnh gửi kèm câu hỏi, dạng base64
export type ImageInput = {
  base64Data: string;
  mimeType: string;
};

// Hỏi Gemini và nhận về JSON đúng khuôn jsonSchema; câu trả lời dài thì truyền timeoutMs lớn hơn; lỗi gì cũng báo 503
export async function askGeminiForJson(
  prompt: string,
  jsonSchema: object,
  image?: ImageInput,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<unknown> {
  // Có ảnh thì gửi ảnh trước rồi tới câu hỏi
  const parts: object[] = [];
  if (image) {
    parts.push({ inlineData: { data: image.base64Data, mimeType: image.mimeType } });
  }
  parts.push({ text: prompt });

  // Câu hỏi gửi Gemini: model, nội dung, khuôn JSON, mức đoán và thời gian chờ
  const request: GenerateContentParameters = {
    model: environment.geminiModel,
    contents: [{ role: 'user', parts: parts }],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: jsonSchema,
      temperature: TEMPERATURE,
      httpOptions: { timeout: timeoutMs },
    },
  };

  // Gọi Gemini rồi đọc chữ trả về thành JSON; thiếu khóa, mất mạng, hết lượt, quá giờ, trả rỗng hay sai định dạng đều gộp thành một câu báo
  try {
    const client = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    let response: GenerateContentResponse;
    try {
      response = await client.models.generateContent(request);
    } catch (firstError) {
      // Chỉ hỏi lại khi Google báo quá tải; lỗi khác ném tiếp ra ngoài
      if ((firstError as { status?: number }).status !== GOOGLE_OVERLOADED_STATUS) {
        throw firstError;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      response = await client.models.generateContent(request);
    }
    if (!response.text) {
      throw new Error('Gemini trả về rỗng');
    }
    return JSON.parse(response.text);
  } catch (error) {
    console.error(error);
    throw new HttpError(503, 'AI đang bận, thử lại sau');
  }
}
