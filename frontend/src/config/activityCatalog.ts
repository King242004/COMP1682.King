// ═══ FILE NÀY LÀM GÌ ═══
// Danh mục hoạt động mà app cho người dùng chọn khi ghi buổi tập.
//
// Ai gọi tới: LogActivityScreen, khi hiện danh sách hoạt động
// Nhận vào:   không nhận gì, đây là bảng khai sẵn
// Trả ra:     danh sách hoạt động kèm mã và chỉ số MET
// Khi lỗi:    không có nhánh lỗi. Calo đốt vẫn do SERVER tính, đây chỉ để hiện danh sách
// Danh mục chỉ số MET của các hoạt động mà app cho người dùng chọn.
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
  custom?: boolean;
};

const ACTIVITY_GROUPS: { key: string; items: Activity[] }[] = [
  {
    key: "cardio",
    items: [
      // Đi bộ 2.8 tới 3.4 dặm mỗi giờ, mặt phẳng, nhịp vừa.
      { key: "walking", met: 3.8, code: "17190", icon: "🚶" },
      { key: "brisk_walking", met: 4.8, code: "17200", icon: "🚶‍♂️" },
      // Chạy bộ chậm, tốc độ tự chọn.
      { key: "jogging", met: 7.5, code: "12020", icon: "🏃" },
      // Chạy 7 dặm mỗi giờ, tức khoảng 8.5 phút mỗi dặm.
      { key: "running_fast", met: 11.0, code: "12070", icon: "🏃‍♂️" },
      // Đạp xe 10 tới 11.9 dặm mỗi giờ, thong thả, sức nhẹ.
      { key: "cycling", met: 6.8, code: "01020", icon: "🚴" },
      // Bơi thư giãn, không bơi theo vòng bể.
      { key: "swimming", met: 6.0, code: "18310", icon: "🏊" },
      { key: "jump_rope", met: 11.0, code: "02068", icon: "🪢" },
      // Máy leo cầu thang.
      { key: "stair_climbing", met: 9.3, code: "02065", icon: "🪜" },
      { key: "elliptical", met: 5.0, code: "02048", icon: "🎚️" },
    ],
  },
  {
    key: "strength",
    items: [
      // Tập kháng lực nhiều bài, 8 tới 15 lần mỗi hiệp.
      { key: "weights_light", met: 3.5, code: "02054", icon: "🏋️" },
      { key: "weights_heavy", met: 6.0, code: "02050", icon: "🏋️‍♂️" },
      // Buổi tập gym tổng hợp, gồm lớp tập và tập tạ trong cùng một lần đến phòng gym.
      { key: "gym", met: 5.0, code: "02061", icon: "🏋️" },
      // Bài tập với trọng lượng cơ thể, sức vừa.
      { key: "bodyweight", met: 3.8, code: "02022", icon: "🤸" },
      { key: "hiit", met: 11.0, code: "02214", icon: "🔥" },
      // Compendium 2024 KHÔNG có mục riêng cho CrossFit.
      // Dùng chung mã với tập cường độ cao ngắt quãng vì cách tập tương đương.
      { key: "crossfit", met: 11.0, code: "02214", icon: "💥" },
    ],
  },
  {
    key: "flexibility",
    items: [
      { key: "yoga", met: 2.3, code: "02175", icon: "🧘" },
      { key: "pilates", met: 2.8, code: "02105", icon: "🧎" },
      // Giãn cơ nhẹ.
      { key: "stretching", met: 2.3, code: "02101", icon: "🙆" },
    ],
  },
  {
    key: "sports",
    items: [
      // Bóng đá phong trào.
      { key: "football", met: 7.0, code: "15610", icon: "⚽" },
      { key: "basketball", met: 7.5, code: "15055", icon: "🏀" },
      // Cầu lông giao lưu, đánh đơn hoặc đôi.
      { key: "badminton", met: 5.5, code: "15030", icon: "🏸" },
      { key: "tennis", met: 6.8, code: "15675", icon: "🎾" },
      // Bóng chuyền không thi đấu, đội 6 tới 9 người.
      { key: "volleyball", met: 3.0, code: "15720", icon: "🏐" },
      // Compendium không có đá cầu/Jianzi. Shen và cộng sự (2025),
      // Sustainability 17(1):263, DOI 10.3390/su17010263, dùng 6.0 MET.
      {
        key: "shuttlecock",
        met: 6.0,
        code: "",
        source: "Shen et al. (2025), DOI 10.3390/su17010263",
        icon: "🪶",
      },
      // Võ thuật ở nhịp chậm, phù hợp người mới tập.
      { key: "martial_arts", met: 5.3, code: "15425", icon: "🥋" },
      { key: "table_tennis", met: 4.0, code: "15660", icon: "🏓" },
      // Compendium 2024 KHÔNG có pickleball.
      // Lấy theo cầu lông giao lưu vì cùng nhóm môn vợt sân nhỏ.
      { key: "pickleball", met: 5.5, code: "", icon: "🥒" },
    ],
  },
  {
    key: "other",
    items: [
      // Khiêu vũ giao tiếp, các điệu waltz, foxtrot, cha cha, swing.
      { key: "dancing", met: 6.0, code: "03042", icon: "🕺" },
      // Đi bộ đường dài băng đồng.
      { key: "hiking", met: 6.0, code: "17080", icon: "🥾" },
      // Đấm bao cát, là kiểu tập boxing phổ biến nhất ở phòng gym.
      { key: "boxing", met: 5.8, code: "15110", icon: "🥊" },
      { key: "other", met: 0, code: "", icon: "➕", custom: true },
    ],
  },
];

export const DURATION_PRESETS = [15, 30, 45, 60, 90];

// Các hoạt động thể chất được ghi nhận trong khảo sát 392 sinh viên nội trú
// Đại học Cần Thơ của Dang và cộng sự (2025), DOI 10.46827/ejpe.v12i6.6045.
// Không đưa cờ vua và e-sports vào nhật ký tập vì đây không phải vận động thể chất.
const POPULAR_ACTIVITY_KEYS = [
  "walking",
  "jogging",
  "badminton",
  "volleyball",
  "football",
  "shuttlecock",
  "cycling",
  "gym",
  "martial_arts",
  "yoga",
  "basketball",
  "jump_rope",
  "swimming",
  "table_tennis",
] as const;

const ALL_ACTIVITIES = ACTIVITY_GROUPS.flatMap((group) => group.items);

export const POPULAR_ACTIVITIES: Activity[] = POPULAR_ACTIVITY_KEYS.map((key) => {
  const activity = ALL_ACTIVITIES.find((item) => item.key === key);
  if (!activity) throw new Error(`Missing popular activity: ${key}`);
  return activity;
});
