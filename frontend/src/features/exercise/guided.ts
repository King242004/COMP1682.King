// Guided mini workouts: static, equipment-free routines with per-step timers.
// CONTENT lives here bilingual-inline (same pattern as the Vietnamese starter
// meals in meals/add) — UI chrome strings stay in the i18n catalog.
// METs are conservative averages; finishing a routine auto-logs an Exercise.

export type GuidedStep = { vi: string; en: string; seconds: number };

export type GuidedRoutine = {
  key: string;
  icon: string;
  met: number;
  durationMin: number; // sum of steps, rounded
  title: { vi: string; en: string };
  steps: GuidedStep[];
};

export const GUIDED_ROUTINES: GuidedRoutine[] = [
  {
    key: "warmup10",
    icon: "🤸",
    met: 3,
    durationMin: 10,
    title: { vi: "Khởi động toàn thân 10 phút", en: "10-minute full-body warm-up" },
    steps: [
      { vi: "Xoay cổ tay, cổ chân", en: "Wrist and ankle circles", seconds: 90 },
      { vi: "Xoay hông và vai", en: "Hip and shoulder circles", seconds: 90 },
      { vi: "Giậm chân tại chỗ", en: "March in place", seconds: 120 },
      { vi: "Đá gót chạm mông", en: "Butt kicks", seconds: 120 },
      { vi: "Nâng cao gối nhẹ nhàng", en: "Easy high knees", seconds: 90 },
      { vi: "Vươn giãn tay và lưng", en: "Arm and back stretches", seconds: 90 },
    ],
  },
  {
    key: "fullbody20",
    icon: "💪",
    met: 5,
    durationMin: 20,
    title: { vi: "Full body 20 phút tại nhà", en: "20-minute full-body at home" },
    steps: [
      { vi: "Jumping jack khởi động", en: "Jumping jacks warm-up", seconds: 150 },
      { vi: "Squat", en: "Squats", seconds: 180 },
      { vi: "Hít đất (chống gối nếu cần)", en: "Push-ups (knees if needed)", seconds: 150 },
      { vi: "Nghỉ, uống nước", en: "Rest, sip water", seconds: 60 },
      { vi: "Lunge tại chỗ", en: "Stationary lunges", seconds: 180 },
      { vi: "Plank", en: "Plank", seconds: 90 },
      { vi: "Glute bridge", en: "Glute bridges", seconds: 150 },
      { vi: "Nghỉ", en: "Rest", seconds: 60 },
      { vi: "Squat vòng cuối", en: "Final squat round", seconds: 120 },
      { vi: "Plank kết thúc", en: "Closing plank", seconds: 60 },
    ],
  },
  {
    key: "core15",
    icon: "⚡",
    met: 4,
    durationMin: 15,
    title: { vi: "Core 15 phút", en: "15-minute core" },
    steps: [
      { vi: "Plank mở đầu", en: "Opening plank", seconds: 60 },
      { vi: "Gập bụng (crunch)", en: "Crunches", seconds: 120 },
      { vi: "Bird-dog", en: "Bird-dogs", seconds: 120 },
      { vi: "Nghỉ", en: "Rest", seconds: 45 },
      { vi: "Xoay người kiểu Nga", en: "Russian twists", seconds: 120 },
      { vi: "Glute bridge", en: "Glute bridges", seconds: 120 },
      { vi: "Nghỉ", en: "Rest", seconds: 45 },
      { vi: "Leo núi (mountain climber)", en: "Mountain climbers", seconds: 90 },
      { vi: "Plank nghiêng mỗi bên", en: "Side plank each side", seconds: 120 },
      { vi: "Plank kết thúc", en: "Closing plank", seconds: 60 },
    ],
  },
  {
    key: "cardio15",
    icon: "❤️",
    met: 6.5,
    durationMin: 15,
    title: { vi: "Cardio nhẹ 15 phút tại chỗ", en: "15-minute light cardio in place" },
    steps: [
      { vi: "Nâng cao gối", en: "High knees", seconds: 90 },
      { vi: "Jumping jack", en: "Jumping jacks", seconds: 90 },
      { vi: "Nghỉ nhịp thở", en: "Breathing rest", seconds: 45 },
      { vi: "Đá gót chạm mông", en: "Butt kicks", seconds: 90 },
      { vi: "Đấm gió (shadow boxing)", en: "Shadow boxing", seconds: 120 },
      { vi: "Nghỉ", en: "Rest", seconds: 45 },
      { vi: "Nâng cao gối vòng 2", en: "High knees round 2", seconds: 90 },
      { vi: "Jumping jack vòng 2", en: "Jumping jacks round 2", seconds: 90 },
      { vi: "Đi bộ tại chỗ hạ nhịp", en: "Cool-down march in place", seconds: 240 },
    ],
  },
  {
    key: "stretch12",
    icon: "🌙",
    met: 2.5,
    durationMin: 12,
    title: { vi: "Giãn cơ buổi tối 12 phút", en: "12-minute evening stretch" },
    steps: [
      { vi: "Giãn cổ và vai", en: "Neck and shoulder stretch", seconds: 90 },
      { vi: "Giãn tay và ngực", en: "Arm and chest stretch", seconds: 90 },
      { vi: "Gập người chạm mũi chân", en: "Forward fold", seconds: 120 },
      { vi: "Giãn hông tư thế ếch", en: "Hip opener", seconds: 120 },
      { vi: "Giãn đùi trước mỗi bên", en: "Quad stretch each side", seconds: 120 },
      { vi: "Xoắn cột sống nhẹ", en: "Gentle spinal twist", seconds: 90 },
      { vi: "Tư thế em bé, thở sâu", en: "Child's pose, deep breaths", seconds: 90 },
    ],
  },
];
