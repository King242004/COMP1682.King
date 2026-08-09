// ═══ FILE NÀY LÀM GÌ ═══
// Danh mục hoạt động mà app cho người dùng chọn khi ghi buổi tập.
//
// Ai gọi tới: LogActivityScreen, khi hiện danh sách hoạt động
// Nhận vào:   không nhận gì, đây là bảng khai sẵn
// Trả ra:     danh sách hoạt động kèm mã và chỉ số MET
// Khi lỗi:    không có nhánh lỗi. Calo đốt vẫn do SERVER tính, đây chỉ để hiện danh sách
//
// MET là mức tiêu hao năng lượng của một hoạt động so với lúc ngồi nghỉ.
// Đi bộ 3.8 nghĩa là đốt gấp 3.8 lần lúc ngồi yên.
// NGUỒN: Herrmann, S.D. và cộng sự (2024) '2024 Adult Compendium of Physical
// Activities: a third update of the energy costs of human activities',
// Journal of Sport and Health Science, 13(1), tr. 6 tới 12.
// Tra cứu trực tuyến: https://pacompendium.com/adult-compendium/
// QUY TẮC CỦA FILE: mỗi hoạt động phải có mã Compendium hoặc một nguồn học thuật
// riêng để bất kỳ ai cũng mở tài liệu ra kiểm được con số.
// LỊCH SỬ: trước ngày 4/8/2026 danh mục này nằm trong features/exercise/api.ts
// và dùng số của Compendium bản 2011, trong khi báo cáo lại dẫn bản 2024.
// Đối chiếu bốn hoạt động cho thấy cả bốn đều lệch, ví dụ đi bộ ghi 3.5
// trong khi bản 2024 là 3.8. Toàn bộ danh mục đã được tra lại theo bản 2024.

export type Activity = {
  key: string;
  met: number;
  icon: string;
  // Mã tra cứu trong Compendium 2024. Rỗng nghĩa là Compendium không có
  // hoạt động này; khi đó phải có `source` riêng.
  code?: string;
  source?: string;
};

// Đúng 14 hoạt động, bằng ĐÚNG bộ khóa của EXTERNAL_ACTIVITIES trong
// backend/src/config/exerciseCatalog.js. Gửi lên một khóa ngoài bộ này thì
// exerciseController trả "Unknown exercise reference", nên hai bên phải khớp.
// Đây cũng là thứ tự hiện trên màn Ghi buổi tập.
//
// Danh sách chọn theo khảo sát 392 sinh viên nội trú Đại học Cần Thơ của
// Dang và cộng sự (2025), DOI 10.46827/ejpe.v12i6.6045. Không đưa cờ vua và
// e-sports vào nhật ký tập vì đây không phải vận động thể chất.
//
// Trước ngày 9/8/2026 file này khai 30 hoạt động chia làm năm nhóm, nhưng chỉ
// 14 cái được hiện ra, 16 cái còn lại không màn nào đọc tới và backend cũng
// không nhận. Đã bỏ hẳn, vì mục nào lỡ hiện ra là bấm lưu sẽ lỗi.
export const POPULAR_ACTIVITIES: Activity[] = [
  // Đi bộ 2.8 tới 3.4 dặm mỗi giờ, mặt phẳng, nhịp vừa.
  { key: "walking", met: 3.8, code: "17190", icon: "🚶" },
  // Chạy bộ chậm, tốc độ tự chọn.
  { key: "jogging", met: 7.5, code: "12020", icon: "🏃" },
  // Cầu lông giao lưu, đánh đơn hoặc đôi.
  { key: "badminton", met: 5.5, code: "15030", icon: "🏸" },
  // Bóng chuyền không thi đấu, đội 6 tới 9 người.
  { key: "volleyball", met: 3.0, code: "15720", icon: "🏐" },
  // Bóng đá phong trào.
  { key: "football", met: 7.0, code: "15610", icon: "⚽" },
  // Compendium không có đá cầu/Jianzi. Shen và cộng sự (2025),
  // Sustainability 17(1):263, DOI 10.3390/su17010263, dùng 6.0 MET.
  {
    key: "shuttlecock",
    met: 6.0,
    code: "",
    source: "Shen et al. (2025), DOI 10.3390/su17010263",
    icon: "🪶",
  },
  // Đạp xe 10 tới 11.9 dặm mỗi giờ, thong thả, sức nhẹ.
  { key: "cycling", met: 6.8, code: "01020", icon: "🚴" },
  // Buổi tập gym tổng hợp, gồm lớp tập và tập tạ trong cùng một lần đến phòng gym.
  { key: "gym", met: 5.0, code: "02061", icon: "🏋️" },
  // Võ thuật ở nhịp chậm, phù hợp người mới tập.
  { key: "martial_arts", met: 5.3, code: "15425", icon: "🥋" },
  { key: "yoga", met: 2.3, code: "02175", icon: "🧘" },
  { key: "basketball", met: 7.5, code: "15055", icon: "🏀" },
  { key: "jump_rope", met: 11.0, code: "02068", icon: "🪢" },
  // Bơi thư giãn, không bơi theo vòng bể.
  { key: "swimming", met: 6.0, code: "18310", icon: "🏊" },
  { key: "table_tennis", met: 4.0, code: "15660", icon: "🏓" },
];

export const DURATION_PRESETS = [15, 30, 45, 60, 90];
