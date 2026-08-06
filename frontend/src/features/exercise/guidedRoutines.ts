// ═══ FILE NÀY LÀM GÌ ═══
// Thư viện bài tập tại nhà, kèm từng động tác và số giây của mỗi động tác.
//
// Ai gọi tới: GuidedRoutineScreen
// Nhận vào:   mã bài tập và thời lượng muốn tập
// Trả ra:     danh sách động tác đã nhân đủ số vòng
// Khi lỗi:    mã lạ thì trả rỗng, màn hình hiện lời nhắc thay vì màn trắng

// Phiên bản 20 và 30 phút lặp lại vòng tập, nên thời gian trên card luôn khớp bộ đếm.
export type GuidedStep = {
  vi: string;
  en: string;
  seconds: number;
  rest?: boolean;
};

export type RoutineCategory = "everyday" | "recovery" | "strength" | "cardio";
export type RoutineLevel = "light" | "moderate";

export const ROUTINE_DURATIONS = [10, 15, 20, 30] as const;
export type RoutineDuration = (typeof ROUTINE_DURATIONS)[number];

export type GuidedRoutine = {
  key: string;
  icon: string;
  durationMin: RoutineDuration;
  exerciseCount: number;
  category: RoutineCategory;
  level: RoutineLevel;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  steps: GuidedStep[];
};

type RoutineFamily = Omit<GuidedRoutine, "key" | "durationMin" | "exerciseCount" | "steps"> & {
  key: string;
  steps10: GuidedStep[];
};

export const ROUTINE_CATEGORIES: RoutineCategory[] = ["everyday", "recovery", "strength", "cardio"];

const ROUTINE_FAMILIES: RoutineFamily[] = [
  {
    key: "wakeUp",
    icon: "☀️",
    category: "everyday",
    level: "light",
    title: { vi: "Đánh thức cơ thể", en: "Wake up your body" },
    description: { vi: "Khởi động nhẹ để cơ thể sẵn sàng cho ngày mới.", en: "A gentle reset to get your body ready for the day." },
    steps10: [
      { vi: "Xoay cổ và thả lỏng vai", en: "Neck circles and shoulder release", seconds: 100 },
      { vi: "Vươn người sang hai bên", en: "Standing side reaches", seconds: 100 },
      { vi: "Xoay thân trên", en: "Upper-body twists", seconds: 100 },
      { vi: "Tư thế mèo–bò nhẹ nhàng", en: "Gentle cat-cow", seconds: 100 },
      { vi: "Mở hông luân phiên", en: "Alternating hip openers", seconds: 100 },
      { vi: "Gập người và cuộn lưng đứng dậy", en: "Forward fold and slow roll-up", seconds: 100 },
    ],
  },
  {
    key: "deskReset",
    icon: "🪑",
    category: "everyday",
    level: "light",
    title: { vi: "Vận động giữa giờ", en: "Desk break" },
    description: { vi: "Thả lỏng cổ, vai và lưng sau khi ngồi lâu.", en: "Release your neck, shoulders and back after sitting." },
    steps10: [
      { vi: "Nghiêng cổ sang hai bên", en: "Side neck stretches", seconds: 100 },
      { vi: "Xoay vai ra sau", en: "Backward shoulder rolls", seconds: 100 },
      { vi: "Mở ngực", en: "Chest opener", seconds: 100 },
      { vi: "Xoay thân trên", en: "Upper-body twists", seconds: 100 },
      { vi: "Giãn hông khi đứng", en: "Standing hip stretch", seconds: 100 },
      { vi: "Đứng lên ngồi xuống chậm", en: "Slow sit-to-stands", seconds: 100 },
    ],
  },
  {
    key: "fullWarmup",
    icon: "🤸",
    category: "everyday",
    level: "light",
    title: { vi: "Khởi động toàn thân", en: "Full-body warm-up" },
    description: { vi: "Làm nóng các khớp và tăng nhịp vận động từ từ.", en: "Warm up your joints and gradually raise your pace." },
    steps10: [
      { vi: "Xoay cổ tay và cổ chân", en: "Wrist and ankle circles", seconds: 100 },
      { vi: "Xoay hông và vai", en: "Hip and shoulder circles", seconds: 100 },
      { vi: "Đi bộ tại chỗ", en: "March in place", seconds: 100 },
      { vi: "Đá gót chạm mông nhẹ", en: "Easy butt kicks", seconds: 100 },
      { vi: "Nâng gối nhẹ nhàng", en: "Easy knee raises", seconds: 100 },
      { vi: "Vươn giãn tay và lưng", en: "Arm and back stretches", seconds: 100 },
    ],
  },
  {
    key: "eveningStretch",
    icon: "🌙",
    category: "everyday",
    level: "light",
    title: { vi: "Giãn cơ cuối ngày", en: "Evening wind-down" },
    description: { vi: "Một nhịp chậm để thả lỏng cơ thể trước khi nghỉ ngơi.", en: "A slow routine to relax before you rest." },
    steps10: [
      { vi: "Giãn cổ và vai", en: "Neck and shoulder stretch", seconds: 100 },
      { vi: "Giãn tay và ngực", en: "Arm and chest stretch", seconds: 100 },
      { vi: "Gập người về trước", en: "Forward fold", seconds: 100 },
      { vi: "Mở hông nhẹ", en: "Gentle hip opener", seconds: 100 },
      { vi: "Giãn đùi trước mỗi bên", en: "Quad stretch each side", seconds: 100 },
      { vi: "Tư thế em bé và thở sâu", en: "Child's pose and deep breathing", seconds: 100 },
    ],
  },
  {
    key: "postureReset",
    icon: "🧍",
    category: "everyday",
    level: "light",
    title: { vi: "Điều chỉnh tư thế", en: "Posture reset" },
    description: { vi: "Mở ngực, vai và lưng cho cơ thể thoải mái hơn.", en: "Open your chest, shoulders and back for a more comfortable posture." },
    steps10: [
      { vi: "Thu cằm nhẹ", en: "Gentle chin tucks", seconds: 100 },
      { vi: "Trượt tay trên tường", en: "Wall slides", seconds: 100 },
      { vi: "Ép bả vai", en: "Shoulder blade squeezes", seconds: 100 },
      { vi: "Mở ngực ở cửa", en: "Doorway chest opener", seconds: 100 },
      { vi: "Bird-dog – tay chân đối bên chậm", en: "Slow bird-dogs", seconds: 100 },
      { vi: "Vươn dài cột sống", en: "Spine lengthening stretch", seconds: 100 },
    ],
  },
  {
    key: "gentleRecovery",
    icon: "🌿",
    category: "recovery",
    level: "light",
    title: { vi: "Phục hồi nhẹ nhàng", en: "Gentle recovery" },
    description: { vi: "Chuyển động chậm cho những ngày cơ thể cần nghỉ.", en: "Slow movement for days when your body needs a break." },
    steps10: [
      { vi: "Thở sâu và thả lỏng vai", en: "Deep breathing and shoulder release", seconds: 100 },
      { vi: "Tư thế mèo–bò chậm", en: "Slow cat-cow", seconds: 100 },
      { vi: "Luồn kim mở vai", en: "Thread-the-needle shoulder opener", seconds: 100 },
      { vi: "Xoay hông khi nằm", en: "Lying hip rotations", seconds: 100 },
      { vi: "Giãn đùi sau", en: "Hamstring stretch", seconds: 100 },
      { vi: "Tư thế em bé", en: "Child's pose", seconds: 100 },
    ],
  },
  {
    key: "fullMobility",
    icon: "🧘",
    category: "recovery",
    level: "light",
    title: { vi: "Linh hoạt toàn thân", en: "Full-body mobility" },
    description: { vi: "Cải thiện chuyển động của vai, cột sống, hông và cổ chân.", en: "Improve movement through your shoulders, spine, hips and ankles." },
    steps10: [
      { vi: "Xoay vai có kiểm soát", en: "Controlled shoulder circles", seconds: 100 },
      { vi: "Tư thế mèo–bò", en: "Cat-cow", seconds: 100 },
      { vi: "Xoay cột sống ngực", en: "Thoracic rotations", seconds: 100 },
      { vi: "Chuyển hông 90/90", en: "90/90 hip switches", seconds: 100 },
      { vi: "Lunge mở hông", en: "Hip-opening lunges", seconds: 100 },
      { vi: "Đẩy gối qua mũi chân", en: "Knee-over-toe ankle rocks", seconds: 100 },
    ],
  },
  {
    key: "lowerRecovery",
    icon: "🦵",
    category: "recovery",
    level: "light",
    title: { vi: "Phục hồi thân dưới", en: "Lower-body recovery" },
    description: { vi: "Thả lỏng hông và chân sau một ngày vận động nhiều.", en: "Release your hips and legs after an active day." },
    steps10: [
      { vi: "Kéo gối về ngực", en: "Knee-to-chest stretch", seconds: 100 },
      { vi: "Giãn cơ hình số 4 mỗi bên", en: "Figure-four stretch each side", seconds: 100 },
      { vi: "Xoay hông 90/90", en: "90/90 hip rotations", seconds: 100 },
      { vi: "Giãn cơ gấp hông", en: "Hip flexor stretch", seconds: 100 },
      { vi: "Giãn đùi sau", en: "Hamstring stretch", seconds: 100 },
      { vi: "Giãn bắp chân", en: "Calf stretch", seconds: 100 },
    ],
  },
  {
    key: "neckShoulderRecovery",
    icon: "🙆",
    category: "recovery",
    level: "light",
    title: { vi: "Thả lỏng vai gáy", en: "Neck and shoulder release" },
    description: { vi: "Giảm cảm giác căng cứng sau khi ngồi hoặc dùng điện thoại lâu.", en: "Ease stiffness after long periods of sitting or phone use." },
    steps10: [
      { vi: "Thu cằm và thở chậm", en: "Chin tucks with slow breathing", seconds: 100 },
      { vi: "Nghiêng cổ mỗi bên", en: "Side neck stretches", seconds: 100 },
      { vi: "Xoay vai chậm", en: "Slow shoulder rolls", seconds: 100 },
      { vi: "Luồn kim mở vai", en: "Thread-the-needle stretch", seconds: 100 },
      { vi: "Mở ngực", en: "Chest opener", seconds: 100 },
      { vi: "Tư thế em bé vươn sang bên", en: "Side-reaching child's pose", seconds: 100 },
    ],
  },
  {
    key: "hipBackRelease",
    icon: "🧎",
    category: "recovery",
    level: "light",
    title: { vi: "Mở hông và lưng", en: "Hip and back release" },
    description: { vi: "Tập trung vào hông, lưng dưới và khả năng xoay người.", en: "Focus on your hips, lower back and rotational mobility." },
    steps10: [
      { vi: "Nghiêng chậu khi nằm", en: "Supine pelvic tilts", seconds: 100 },
      { vi: "Kéo hai gối về ngực", en: "Double knee-to-chest stretch", seconds: 100 },
      { vi: "Giãn cơ hình số 4 mỗi bên", en: "Figure-four stretch each side", seconds: 100 },
      { vi: "Xoắn cột sống khi nằm", en: "Supine spinal twist", seconds: 100 },
      { vi: "Chuyển hông 90/90", en: "90/90 hip switches", seconds: 100 },
      { vi: "Tư thế em bé", en: "Child's pose", seconds: 100 },
    ],
  },
  {
    key: "strongCore",
    icon: "⚡",
    category: "strength",
    level: "moderate",
    title: { vi: "Core vững chắc", en: "Strong core" },
    description: { vi: "Tăng sức mạnh vùng bụng, lưng và khả năng giữ thăng bằng.", en: "Build abdominal, back and balance strength." },
    steps10: [
      { vi: "Khởi động core", en: "Core warm-up", seconds: 60 },
      { vi: "Dead bug – tay chân đối bên", en: "Dead bugs", seconds: 70 },
      { vi: "Bird-dog – tay chân đối bên", en: "Bird-dogs", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Gập bụng", en: "Crunches", seconds: 70 },
      { vi: "Glute bridge", en: "Glute bridges", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Plank chống gối nếu cần", en: "Plank, knees down if needed", seconds: 70 },
      { vi: "Plank nghiêng luân phiên", en: "Alternating side planks", seconds: 70 },
      { vi: "Thả lỏng", en: "Cool-down", seconds: 40 },
    ],
  },
  {
    key: "fullBodyStrength",
    icon: "💪",
    category: "strength",
    level: "moderate",
    title: { vi: "Sức mạnh toàn thân", en: "Full-body strength" },
    description: { vi: "Tập toàn thân tại nhà chỉ với trọng lượng cơ thể.", en: "Train your whole body at home using bodyweight only." },
    steps10: [
      { vi: "Khởi động tại chỗ", en: "Warm up in place", seconds: 60 },
      { vi: "Squat", en: "Squats", seconds: 70 },
      { vi: "Hít đất, chống gối nếu cần", en: "Push-ups, knees down if needed", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Lunge tại chỗ", en: "Stationary lunges", seconds: 70 },
      { vi: "Plank", en: "Plank", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Glute bridge", en: "Glute bridges", seconds: 70 },
      { vi: "Bird-dog – tay chân đối bên", en: "Bird-dogs", seconds: 70 },
      { vi: "Thả lỏng toàn thân", en: "Full-body cool-down", seconds: 40 },
    ],
  },
  {
    key: "lowerStrength",
    icon: "🦿",
    category: "strength",
    level: "moderate",
    title: { vi: "Thân dưới khỏe", en: "Lower-body strength" },
    description: { vi: "Tăng sức mạnh cho chân, hông và vùng mông.", en: "Build strength through your legs, hips and glutes." },
    steps10: [
      { vi: "Khởi động hông và gối", en: "Hip and knee warm-up", seconds: 60 },
      { vi: "Squat", en: "Squats", seconds: 70 },
      { vi: "Chùng chân lùi", en: "Reverse lunges", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Glute bridge", en: "Glute bridges", seconds: 70 },
      { vi: "Nâng bắp chân", en: "Calf raises", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Squat giữ", en: "Squat hold", seconds: 70 },
      { vi: "Nâng chân nằm nghiêng", en: "Side-lying leg raises", seconds: 70 },
      { vi: "Giãn chân", en: "Leg cool-down", seconds: 40 },
    ],
  },
  {
    key: "upperStrength",
    icon: "🙌",
    category: "strength",
    level: "moderate",
    title: { vi: "Thân trên không dụng cụ", en: "Equipment-free upper body" },
    description: { vi: "Tập vai, ngực, tay và lưng bằng trọng lượng cơ thể.", en: "Train your shoulders, chest, arms and back with bodyweight." },
    steps10: [
      { vi: "Khởi động vai", en: "Shoulder warm-up", seconds: 60 },
      { vi: "Hít đất tường hoặc sàn", en: "Wall or floor push-ups", seconds: 70 },
      { vi: "Shoulder tap", en: "Shoulder taps", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Plank lên xuống", en: "Plank up-downs", seconds: 70 },
      { vi: "Superman", en: "Supermans", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Hít đất tay hẹp, chống gối nếu cần", en: "Close-grip push-ups, knees down if needed", seconds: 70 },
      { vi: "Nâng tay chữ Y-T-W", en: "Y-T-W arm raises", seconds: 70 },
      { vi: "Thả lỏng vai", en: "Shoulder cool-down", seconds: 40 },
    ],
  },
  {
    key: "balanceStrength",
    icon: "⚖️",
    category: "strength",
    level: "light",
    title: { vi: "Cân bằng và ổn định", en: "Balance and stability" },
    description: { vi: "Củng cố core và khả năng kiểm soát cơ thể.", en: "Strengthen your core and improve body control." },
    steps10: [
      { vi: "Khởi động cổ chân", en: "Ankle warm-up", seconds: 60 },
      { vi: "Đứng một chân có hỗ trợ", en: "Supported single-leg stand", seconds: 70 },
      { vi: "Bird-dog – tay chân đối bên", en: "Bird-dogs", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Dead bug – tay chân đối bên", en: "Dead bugs", seconds: 70 },
      { vi: "Lunge chạm gối", en: "Lunge with knee drive", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Single-leg hinge có hỗ trợ", en: "Supported single-leg hinges", seconds: 70 },
      { vi: "Plank vai", en: "Plank shoulder taps", seconds: 70 },
      { vi: "Thả lỏng", en: "Cool-down", seconds: 40 },
    ],
  },
  {
    key: "lowImpactCardio",
    icon: "❤️",
    category: "cardio",
    level: "light",
    title: { vi: "Cardio nhẹ không nhảy", en: "Low-impact cardio" },
    description: { vi: "Tăng nhịp vận động nhẹ nhàng, phù hợp không gian nhỏ.", en: "Raise your pace gently in a small space with no jumping." },
    steps10: [
      { vi: "Đi bộ khởi động", en: "Warm-up march", seconds: 60 },
      { vi: "Bước ngang chạm chân", en: "Step touches", seconds: 70 },
      { vi: "Nâng gối luân phiên", en: "Alternating knee raises", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Đấm gió", en: "Shadow boxing", seconds: 70 },
      { vi: "Đá gót ra trước", en: "Heel digs", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Bước ngang kết hợp vươn tay", en: "Side steps with arm reaches", seconds: 70 },
      { vi: "Bước ngang kết hợp đưa tay lên", en: "Step jacks", seconds: 70 },
      { vi: "Đi bộ chậm thả lỏng", en: "Slow cool-down march", seconds: 40 },
    ],
  },
  {
    key: "fullBodyCardio",
    icon: "🔥",
    category: "cardio",
    level: "moderate",
    title: { vi: "Cardio toàn thân", en: "Full-body cardio" },
    description: { vi: "Bài cardio tại nhà có thể giảm biên độ nếu cần.", en: "At-home cardio that can be made lower impact when needed." },
    steps10: [
      { vi: "Đi bộ nhanh khởi động", en: "Brisk warm-up march", seconds: 60 },
      { vi: "Bước ngang kết hợp đưa tay lên", en: "Step jacks", seconds: 70 },
      { vi: "Squat kết hợp vươn tay", en: "Squat with arm reach", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Leo núi chậm", en: "Slow mountain climbers", seconds: 70 },
      { vi: "Đấm gió", en: "Shadow boxing", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Nâng gối kết hợp kéo tay", en: "Knee drives with arm pulls", seconds: 70 },
      { vi: "Bước ngang nhanh", en: "Quick side steps", seconds: 70 },
      { vi: "Đi bộ chậm thả lỏng", en: "Slow cool-down march", seconds: 40 },
    ],
  },
  {
    key: "indoorWalk",
    icon: "🚶",
    category: "cardio",
    level: "light",
    title: { vi: "Đi bộ tại chỗ", en: "Indoor walking" },
    description: { vi: "Chuỗi bước đơn giản giúp bạn vận động mà không cần nhiều không gian.", en: "Simple steps that get you moving without needing much space." },
    steps10: [
      { vi: "Đi bộ chậm khởi động", en: "Easy warm-up march", seconds: 60 },
      { vi: "Đi bộ nâng gối", en: "High-knee march", seconds: 70 },
      { vi: "Bước chữ V", en: "V-steps", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Bước ngang", en: "Side steps", seconds: 70 },
      { vi: "Đá gót về sau", en: "Hamstring curls", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Đi bộ kết hợp vươn tay", en: "March with arm reaches", seconds: 70 },
      { vi: "Đi bộ nhanh tại chỗ", en: "Brisk march in place", seconds: 70 },
      { vi: "Đi bộ chậm thả lỏng", en: "Easy cool-down march", seconds: 40 },
    ],
  },
  {
    key: "cardioBoxing",
    icon: "🥊",
    category: "cardio",
    level: "moderate",
    title: { vi: "Cardio boxing nhẹ", en: "Light cardio boxing" },
    description: { vi: "Phối hợp bước chân và đấm gió, không cần bao cát.", en: "Combine footwork and shadow boxing with no bag needed." },
    steps10: [
      { vi: "Khởi động vai và bước chân", en: "Shoulder and footwork warm-up", seconds: 60 },
      { vi: "Jab luân phiên", en: "Alternating jabs", seconds: 70 },
      { vi: "Jab-cross", en: "Jab-cross combinations", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Hook luân phiên", en: "Alternating hooks", seconds: 70 },
      { vi: "Đấm kết hợp bước ngang", en: "Punches with side steps", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Uppercut luân phiên", en: "Alternating uppercuts", seconds: 70 },
      { vi: "Tổ hợp jab-cross-hook", en: "Jab-cross-hook combination", seconds: 70 },
      { vi: "Thả lỏng vai", en: "Shoulder cool-down", seconds: 40 },
    ],
  },
  {
    key: "coordinationCardio",
    icon: "🎵",
    category: "cardio",
    level: "moderate",
    title: { vi: "Cardio phối hợp", en: "Coordination cardio" },
    description: { vi: "Kết hợp tay và chân để tăng nhịp vận động và sự linh hoạt.", en: "Coordinate your arms and legs to build rhythm and mobility." },
    steps10: [
      { vi: "Đi bộ theo nhịp", en: "Rhythm march", seconds: 60 },
      { vi: "Bước ngang vươn tay", en: "Side steps with reaches", seconds: 70 },
      { vi: "Chạm gối đối bên", en: "Opposite hand-to-knee taps", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Bước tới lui", en: "Forward and back steps", seconds: 70 },
      { vi: "Gót chạm tay đối bên", en: "Opposite hand-to-heel taps", seconds: 70 },
      { vi: "Nghỉ", en: "Rest", seconds: 40, rest: true },
      { vi: "Bước chữ V kết hợp tay", en: "V-steps with arm patterns", seconds: 70 },
      { vi: "Grapevine đơn giản", en: "Simple grapevines", seconds: 70 },
      { vi: "Đi bộ chậm thả lỏng", en: "Easy cool-down march", seconds: 40 },
    ],
  },
];

function buildVariants(family: RoutineFamily): GuidedRoutine[] {
  const exerciseCount = family.steps10.filter((step) => !step.rest).length;

  return ROUTINE_DURATIONS.map((durationMin) => {
    if (durationMin === 15) {
      return {
        key: `${family.key}${durationMin}`,
        icon: family.icon,
        durationMin,
        exerciseCount,
        category: family.category,
        level: family.level,
        title: family.title,
        description: family.description,
        steps: family.steps10.map((step) => ({ ...step, seconds: step.seconds * 1.5 })),
      };
    }

    const rounds = durationMin / 10;
    const steps = Array.from({ length: rounds }, (_, index) =>
      family.steps10.map((step) => rounds === 1 ? { ...step } : {
        ...step,
        vi: `Vòng ${index + 1}: ${step.vi}`,
        en: `Round ${index + 1}: ${step.en}`,
      }),
    ).flat();

    return {
      key: `${family.key}${durationMin}`,
      icon: family.icon,
      durationMin,
      exerciseCount,
      category: family.category,
      level: family.level,
      title: family.title,
      description: family.description,
      steps,
    };
  });
}

export const GUIDED_ROUTINES: GuidedRoutine[] = ROUTINE_FAMILIES.flatMap(buildVariants);

// Kế hoạch tuần chỉ lưu nhóm bài và độ dài do AI chọn, chứ không lưu tên bài,
// vì AI không được phép tự đặt ra bài tập. Ngày được dùng làm hạt giống để chọn,
// nên mở lại cùng một ngày luôn ra cùng một bài chứ không đổi mỗi lần bấm.
export function resolvePlannedRoutine(
  category: RoutineCategory,
  durationMin: number,
  date: string,
): GuidedRoutine | null {
  const matches = GUIDED_ROUTINES.filter(
    (routine) => routine.category === category && routine.durationMin === durationMin,
  );
  if (!matches.length) return null;
  const seed = Array.from(date).reduce((total, char) => total + char.charCodeAt(0), 0);
  return matches[seed % matches.length];
}
