// ═══ FILE NÀY LÀM GÌ ═══
// Chặng giữa các màn tập luyện và backend. Chỉ lo gọi mạng.
//
// Ai gọi tới: LogActivityScreen, GuidedRoutineScreen, ProgressScreen
// Nhận vào:   mã hoạt động và thời lượng
// Trả ra:     buổi tập đã lưu kèm calo đốt do server tính
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo

// Frontend chỉ gửi mã hoạt động hoặc mã bài hướng dẫn. Backend tự tra MET từ
// danh mục Compendium của server và tự tính calo từ cân nặng trong hồ sơ.
import { apiRequest } from "@/utils/apiClient";

export type Exercise = {
  id: string;
  name: string;
  met: number;
  durationMin: number;
  caloriesBurned: number;
  date: string;
};
type RawExercise = Omit<Exercise, "id"> & { _id: string };


function mapExercise(e: RawExercise): Exercise {
  return {
    id: e._id,
    name: e.name,
    met: e.met,
    durationMin: e.durationMin,
    caloriesBurned: e.caloriesBurned,
    date: e.date,
  };
}

// Lấy buổi tập của một ngày. Gọi GET /exercise kèm ngày.
// Trả kèm tổng calo đốt mà backend đã cộng sẵn.
export async function getExercisesByDate(
  token: string,
  date: string
): Promise<{ exercises: Exercise[]; totalBurned: number }> {
  const data = await apiRequest<{ exercises: RawExercise[]; totalBurned: number }>(`/exercise?date=${date}`, "GET", undefined, token);
  return { exercises: (data.exercises || []).map(mapExercise), totalBurned: data.totalBurned || 0 };
}

// Ghi một buổi tập. Gọi POST /exercise.
// KHÔNG gửi calo lên, backend tự tính từ cân nặng thật trong hồ sơ.
export async function addExercise(
  token: string,
  input: { name: string; durationMin: number; date: string } & (
    | { activityKey: string; routineKey?: never }
    | { routineKey: string; activityKey?: never }
  )
): Promise<Exercise> {
  const data = await apiRequest<{ exercise: RawExercise }>("/exercise", "POST", input, token);
  return mapExercise(data.exercise);
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
  return (data.exercises || []).map(mapExercise);
}
