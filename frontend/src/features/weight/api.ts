import { apiRequest } from "@/utils/api";

export type WeightEntry = {
  _id: string;
  // Ngày theo định dạng YYYY-MM-DD.
  date: string;
  weightKg: number;
};

export type WeightHistory = {
  // Dữ liệu từ cũ đến mới để có thể đưa thẳng vào biểu đồ.
  logs: WeightEntry[];
  currentWeight: number | null;
  targetWeight: number | null;
};

export async function getWeights(token: string, limit = 90): Promise<WeightHistory> {
  return apiRequest(`/weight?limit=${limit}`, "GET", undefined, token);
}

export async function logWeight(token: string, weightKg: number, date?: string): Promise<WeightEntry> {
  const data = await apiRequest("/weight", "POST", { weightKg, date }, token);
  return data.log;
}

export async function deleteWeight(token: string, id: string): Promise<void> {
  await apiRequest(`/weight/${id}`, "DELETE", undefined, token);
}
