// ═══ FILE NÀY LÀM GÌ ═══
// Chặng giữa phần Cân nặng và backend. Chỉ lo gọi mạng.
//
// Ai gọi tới: WeightSection, WeightGoalsScreen, ProgressScreen
// Nhận vào:   số cân nặng và ngày
// Trả ra:     bản ghi đã lưu, kèm mục tiêu calo đã tính lại
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo

// Chỉ lo gọi mạng, không giữ state.
import { apiRequest } from "@/utils/apiClient";
import type { WeightGoal } from "@/config/nutritionCalculations";

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

export type WeightMutationResponse = {
  log?: WeightEntry;
  adjustedGoal?: WeightGoal;
};

// Lấy danh sách cân nặng. Gọi GET /weight.
// Backend trả từ cũ đến mới để biểu đồ vẽ thẳng, kèm cân hiện tại và cân mục tiêu.
export async function getWeights(token: string, limit = 90): Promise<WeightHistory> {
  return apiRequest(`/weight?limit=${limit}`, "GET", undefined, token);
}

// Ghi cân nặng. Gọi POST /weight.
// Mỗi ngày chỉ giữ MỘT lần cân, cân lại trong ngày thì ghi đè.
// Nếu là lần mới nhất, backend cập nhật luôn cân nặng trong hồ sơ.
export function logWeight(token: string, weightKg: number, date?: string): Promise<WeightMutationResponse> {
  return apiRequest("/weight", "POST", { weightKg, date }, token);
}

// Xóa một lần cân. Gọi DELETE /weight/:id.
// Backend tự lấy lần cân còn lại mới nhất để cập nhật lại hồ sơ.
export function deleteWeight(token: string, id: string): Promise<WeightMutationResponse> {
  return apiRequest(`/weight/${id}`, "DELETE", undefined, token);
}
