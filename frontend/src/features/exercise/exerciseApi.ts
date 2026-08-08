// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa các màn tập luyện và exerciseRoutes/exerciseController.
//
// Ai gọi tới: LogActivityScreen, GuidedRoutineScreen, ProgressScreen
// Nhận vào:   mã hoạt động và thời lượng
// Trả ra:     Exercise do exerciseController tạo, gồm caloriesBurned đã tính
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo
//
// Nhớ: app KHÔNG tự tính calo đốt và KHÔNG gửi con số đó lên.
//      App chỉ gửi mã hoạt động hoặc mã bài hướng dẫn, rồi backend tra hệ số MET
//      trong config/exerciseMet.js và tự tính với cân nặng trong hồ sơ.
//      Làm vậy để calo đốt luôn khớp cân nặng mới nhất, không phải số đóng băng lúc ghi.
import { apiRequest } from "@/utils/apiClient";
import { withId } from "@/utils/apiTypes";

export type Exercise = {
  id: string;
  name: string;
  met: number;
  durationMin: number;
  caloriesBurned: number;
  date: string;
};
// Bản backend trả về. Khác bản app dùng đúng một chỗ: mã món tên là _id.
type RawExercise = Omit<Exercise, "id"> & { _id: string };

// ══════════════════════════════════════════════════════════
// BỐN CỬA GỌI MẠNG
// Mỗi hàm là một cửa riêng, màn nào cần gì thì gọi cái đó
// Cả bốn đều đi qua apiClient rồi sang exerciseRoutes bên backend
// Lỗi thì để nguyên cho ném lên, màn hình gọi tự lo phần hiện thông báo
// ══════════════════════════════════════════════════════════

// Lấy buổi tập của một ngày. Gọi GET /exercise kèm ngày.
// exerciseController.getExercisesByDate trả kèm totalBurned đã cộng sẵn.
export async function getExercisesByDate(
  token: string,
  date: string
): Promise<{ exercises: Exercise[]; totalBurned: number }> {
  const data = await apiRequest<{ exercises: RawExercise[]; totalBurned: number }>(`/exercise?date=${date}`, "GET", undefined, token);
  return { exercises: (data.exercises || []).map(withId), totalBurned: data.totalBurned || 0 };
}

// Ghi một buổi tập. Gọi POST /exercise.
// Không gửi caloriesBurned; exerciseController.addExercise gọi computeBurned với cân nặng hồ sơ.
export async function addExercise(
  token: string,
  input: { name: string; durationMin: number; date: string } & (
    | { activityKey: string; routineKey?: never }
    | { routineKey: string; activityKey?: never }
  )
): Promise<Exercise> {
  const data = await apiRequest<{ exercise: RawExercise }>("/exercise", "POST", input, token);
  return withId(data.exercise);
}

// Xóa một buổi tập. Gọi DELETE /exercise/:id.
export async function deleteExercise(token: string, id: string): Promise<void> {
  await apiRequest(`/exercise/${id}`, "DELETE", undefined, token);
}

// Lấy lịch sử tập. Gọi GET /exercise/history.
// Không truyền khoảng ngày thì lấy tất cả.
export async function getExerciseHistory(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<Exercise[]> {
  const range = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  const data = await apiRequest<{ exercises: RawExercise[] }>(`/exercise/history${range}`, "GET", undefined, token);
  return (data.exercises || []).map(withId);
}
