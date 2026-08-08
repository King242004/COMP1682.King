// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa phần Cân nặng và backend/src/routes/weightRoutes.js.
//
// Ai gọi tới: WeightSection, WeightGoalsScreen, ProgressScreen
// Nhận vào:   số cân nặng và ngày
// Trả ra:     bản ghi đã lưu, kèm mục tiêu calo đã tính lại
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo

// Chỉ lo gọi mạng, không giữ state.
import { apiRequest } from "@/utils/apiClient";
import { withId } from "@/utils/apiTypes";
import type { WeightGoal } from "@/config/nutritionCalculations";

export type WeightEntry = {
  id: string;
  // Ngày theo định dạng YYYY-MM-DD.
  date: string;
  weightKg: number;
};

// Bản backend trả về, khác bản app dùng đúng một chỗ: mã bản ghi tên là _id.
type RawWeightEntry = Omit<WeightEntry, "id"> & { _id: string };

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

type RawMutationResponse = Omit<WeightMutationResponse, "log"> & { log?: RawWeightEntry };

// Ghi và xóa đều trả về cùng một hình dạng, nên dùng chung một hàm đổi tên.
// Backend có thể không kèm log, ví dụ xóa lần cân cuối cùng, nên phải kiểm trước.
const mapMutation = (data: RawMutationResponse): WeightMutationResponse =>
  data.log ? { ...data, log: withId(data.log) } : { ...data, log: undefined };

// Lấy danh sách cân nặng. Gọi GET /weight.
// weightController.getWeights trả từ cũ đến mới để biểu đồ vẽ thẳng,
// kèm cân hiện tại và cân mục tiêu.
export async function getWeights(token: string, limit = 90): Promise<WeightHistory> {
  const data = await apiRequest<Omit<WeightHistory, "logs"> & { logs: RawWeightEntry[] }>(
    `/weight?limit=${limit}`, "GET", undefined, token
  );
  return { ...data, logs: (data.logs || []).map(withId) };
}

// Ghi cân nặng. Gọi POST /weight.
// Mỗi ngày chỉ giữ MỘT lần cân, cân lại trong ngày thì ghi đè.
// Nếu là lần mới nhất, weightController.logWeight cập nhật luôn cân nặng trong hồ sơ.
export async function logWeight(token: string, weightKg: number, date?: string): Promise<WeightMutationResponse> {
  const data = await apiRequest<RawMutationResponse>("/weight", "POST", { weightKg, date }, token);
  return mapMutation(data);
}

// Xóa một lần cân. Gọi DELETE /weight/:id.
// weightController.deleteWeight lấy lần cân còn lại mới nhất để cập nhật lại hồ sơ.
export async function deleteWeight(token: string, id: string): Promise<WeightMutationResponse> {
  const data = await apiRequest<RawMutationResponse>(`/weight/${id}`, "DELETE", undefined, token);
  return mapMutation(data);
}
