// ═══ FILE NÀY LÀM GÌ ═══
// Adapter HTTP giữa các màn tập luyện và exerciseRoutes/exerciseController.
//
// Ai gọi tới: LogActivityScreen, GuidedRoutineScreen, ProgressScreen
// Nhận vào:   mã hoạt động và thời lượng
// Trả ra:     Exercise do exerciseController tạo, gồm caloriesBurned đã tính
// Khi lỗi:    ném lỗi lên cho màn hình tự hiện thông báo

// Frontend chỉ gửi mã hoạt động hoặc mã bài hướng dẫn. exerciseController.addExercise
// tra MET từ backend/src/config/exerciseMet.js rồi gọi computeBurned.
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
// exerciseController.getExercisesByDate trả kèm totalBurned đã cộng sẵn.
export async function getExercisesByDate(
  token: string,
  date: string
): Promise<{ exercises: Exercise[]; totalBurned: number }> {
  const data = await apiRequest<{ exercises: RawExercise[]; totalBurned: number }>(`/exercise?date=${date}`, "GET", undefined, token);
  return { exercises: (data.exercises || []).map(mapExercise), totalBurned: data.totalBurned || 0 };
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
