/**
 * Generate HealthySnap_Requirements_v2.docx — Vietnamese requirement spec
 * for graduation thesis tracking. Run: node scripts/generate-requirements.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents,
} = require("docx");

// ─── Helpers ────────────────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// Status badges
const ST_DONE = "✅ Done";
const ST_DOING = "🟡 Đang làm";
const ST_TODO = "⏸️ Chưa làm";

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: [new TextRun({ text, ...opts.run })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, bold: true })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 160 },
  children: [new TextRun({ text, bold: true })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 180, after: 120 },
  children: [new TextRun({ text, bold: true })],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});

const num = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});

const cell = (text, opts = {}) => new TableCell({
  borders, margins: cellMargins,
  width: { size: opts.width || 4680, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
  children: Array.isArray(text)
    ? text.map((t) => new Paragraph({ children: [new TextRun({ text: t, bold: opts.bold, size: 20 })] }))
    : [new Paragraph({ children: [new TextRun({ text, bold: opts.bold, size: 20 })] })],
});

// Simple 2-col table for key/value rows
const kvTable = (rows, leftWidth = 3000, rightWidth = 6360) => new Table({
  width: { size: leftWidth + rightWidth, type: WidthType.DXA },
  columnWidths: [leftWidth, rightWidth],
  rows: rows.map(([k, v]) => new TableRow({
    children: [
      cell(k, { width: leftWidth, bold: true, fill: "F2F4F8" }),
      cell(v, { width: rightWidth }),
    ],
  })),
});

// N-col table with header row
const dataTable = (headers, dataRows, widths) => {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => cell(h, { width: widths[i], bold: true, fill: "D5E8F0" })),
      }),
      ...dataRows.map((row) => new TableRow({
        children: row.map((c, i) => cell(c, { width: widths[i] })),
      })),
    ],
  });
};

// Given/When/Then table for acceptance criteria
const gwtTable = (items) => dataTable(
  ["#", "Given", "When", "Then"],
  items.map((it, i) => [String(i + 1), it.given, it.when, it.then]),
  [600, 2920, 2920, 2920]
);

// Build a full feature section block
function featureSection({ id, name, status, description, actions, validations, acceptance }) {
  const blocks = [
    h3(`${id}. ${name}`),
    kvTable([
      ["Trạng thái", status],
      ["Mô tả", description],
    ]),
    p(""),
    new Paragraph({ children: [new TextRun({ text: "User actions:", bold: true })], spacing: { after: 80 } }),
    ...actions.map(bullet),
  ];
  if (validations && validations.length) {
    blocks.push(new Paragraph({ children: [new TextRun({ text: "Validation rules:", bold: true })], spacing: { before: 120, after: 80 } }));
    blocks.push(...validations.map(bullet));
  }
  if (acceptance && acceptance.length) {
    blocks.push(new Paragraph({ children: [new TextRun({ text: "Acceptance Criteria:", bold: true })], spacing: { before: 120, after: 80 } }));
    blocks.push(gwtTable(acceptance));
  }
  blocks.push(p(""));
  return blocks;
}

// ─── Content ────────────────────────────────────────────────────────────────

const titlePage = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 200 },
    children: [new TextRun({ text: "TÀI LIỆU YÊU CẦU HỆ THỐNG", bold: true, size: 36 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: "Đồ án tốt nghiệp — COMP-1682", italics: true, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Meal Snap (HealthySnap)", bold: true, size: 48, color: "0B2A6F" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
    children: [new TextRun({ text: "Smart Nutrition Tracking & Personal Health App", italics: true, size: 22 })],
  }),
  kvTable([
    ["Sinh viên thực hiện", "Lê Mạc Hoàng King"],
    ["Mã số sinh viên", "(điền MSSV)"],
    ["Giảng viên hướng dẫn", "(điền GVHD)"],
    ["Môn học", "COMP-1682 — Final Year Project"],
    ["Deadline", "Tháng 8 năm 2026"],
    ["Phiên bản tài liệu", "v2.0"],
    ["Ngày cập nhật", new Date().toLocaleDateString("vi-VN")],
  ], 4000, 5360),
  new Paragraph({ children: [new PageBreak()] }),
];

const overviewSection = [
  h1("1. Thông tin chung"),
  p("Tài liệu này mô tả chi tiết yêu cầu chức năng và phi chức năng của ứng dụng Meal Snap — đề tài đồ án tốt nghiệp môn COMP-1682. Mục đích của tài liệu nhằm giúp giảng viên hướng dẫn theo dõi tiến độ thực hiện, đồng thời làm cơ sở để kiểm thử và nghiệm thu sản phẩm cuối cùng."),
  p("Mỗi tính năng đều có mô tả, hành động người dùng, quy tắc xác thực dữ liệu và bộ tiêu chí chấp nhận theo định dạng Given/When/Then chuẩn BDD (Behavior-Driven Development)."),

  h1("2. Tổng quan dự án"),
  p("Meal Snap là ứng dụng di động đa nền tảng giúp người dùng theo dõi dinh dưỡng cá nhân thông minh. Sản phẩm tích hợp công nghệ AI nhận diện món ăn từ ảnh chụp, cung cấp gợi ý cá nhân hóa dựa trên mục tiêu sức khỏe và bệnh lý của người dùng, đồng thời hỗ trợ lập kế hoạch bữa ăn theo tuần."),
  p("Ứng dụng phục vụ nhóm người dùng quan tâm sức khỏe: sinh viên, người tập gym, người mắc bệnh lý cần kiểm soát chế độ ăn (tiểu đường, cao huyết áp), người muốn giảm cân hoặc tăng cơ. Khác biệt chính so với các app theo dõi calo truyền thống nằm ở khả năng nhận diện ảnh chụp món ăn Việt Nam và tư vấn AI cá nhân hóa."),

  h1("3. Phạm vi & 9 tính năng đã chốt"),
  p("Phạm vi dự án đã thống nhất với giảng viên hướng dẫn, bao gồm 9 nhóm tính năng chính:"),
  num("Xác thực người dùng — đăng ký, đăng nhập, hồ sơ cá nhân, khai báo mục tiêu sức khỏe & bệnh lý."),
  num("Quét AI nhận diện món ăn — chụp ảnh, AI phân tích, trả về top 3 món có thể với thông tin dinh dưỡng."),
  num("Theo dõi calo và macro hàng ngày — protein, carbs, fat."),
  num("AI Coach — phân tích thói quen ăn uống, cảnh báo món không phù hợp bệnh lý/mục tiêu, gợi ý chủ động."),
  num("Lập kế hoạch thực đơn tuần — tính tổng dinh dưỡng, nhắc theo bữa."),
  num("Health companion — nhắc uống nước, theo dõi vận động."),
  num("Báo cáo & thống kê — biểu đồ xu hướng theo tuần/tháng."),
  num("Cộng đồng nhẹ — chia sẻ bữa ăn lên feed, follow người dùng (không có chat realtime)."),
  num("Đa ngôn ngữ — Tiếng Anh (chính) và Tiếng Việt (nếu kịp thời gian)."),

  h1("4. Kiến trúc hệ thống"),
  p("Hệ thống được xây dựng theo mô hình client-server với REST API, sử dụng các công nghệ hiện đại và phù hợp cho ứng dụng di động:"),
  dataTable(
    ["Tầng", "Công nghệ", "Mục đích"],
    [
      ["Mobile App", "React Native + Expo SDK + TypeScript", "Phát triển ứng dụng di động đa nền tảng iOS/Android"],
      ["Navigation", "Expo Router", "Định tuyến theo file (file-based routing)"],
      ["State Management", "React Context API", "Quản lý state cho Auth, Meals"],
      ["Storage (Client)", "AsyncStorage", "Lưu JWT token, user data offline"],
      ["Backend", "Node.js v22 + Express 5", "REST API server"],
      ["Database", "MongoDB Atlas (Cloud)", "NoSQL database lưu users, meals, OTP"],
      ["Authentication", "JWT (JSON Web Token) + bcryptjs", "Bảo mật, hash password"],
      ["AI Vision", "Google Gemini 2.5 Flash", "Nhận diện món ăn từ ảnh + ước lượng dinh dưỡng"],
      ["Barcode DB", "Open Food Facts API", "Tra cứu sản phẩm đóng gói (miễn phí, open source)"],
      ["Image Hosting", "Cloudinary", "Lưu trữ avatar, ảnh món ăn"],
      ["Email", "Nodemailer + Gmail SMTP", "Gửi OTP reset password"],
      ["API Documentation", "Swagger UI", "Tài liệu API tự động"],
    ],
    [1800, 3200, 4360]
  ),
];

// ─── Module 5: Functional Requirements ──────────────────────────────────────
const moduleAuth = featureSection({
  id: "5.1",
  name: "Xác thực người dùng (Authentication)",
  status: ST_DONE,
  description: "Cho phép người dùng đăng ký tài khoản, đăng nhập, đăng xuất và khôi phục mật khẩu qua email OTP.",
  actions: [
    "Đăng ký tài khoản mới với tên, email, mật khẩu.",
    "Đăng nhập bằng email và mật khẩu.",
    "Quên mật khẩu → nhận OTP 6 số qua Gmail → đặt lại mật khẩu mới.",
    "Đăng xuất, xóa JWT khỏi thiết bị.",
  ],
  validations: [
    "Tên: tối thiểu 2 ký tự, chỉ chứa chữ cái và khoảng trắng (hỗ trợ dấu tiếng Việt qua regex \\p{L}).",
    "Email: định dạng hợp lệ (example@domain.com), lưu chữ thường trong database.",
    "Mật khẩu: tối thiểu 6 ký tự, có ít nhất 1 chữ in hoa và 1 chữ số.",
    "OTP: 6 chữ số, hết hạn sau 10 phút.",
  ],
  acceptance: [
    { given: "User mới chưa có tài khoản", when: "Đăng ký với email hợp lệ và mật khẩu đúng quy tắc", then: "Tạo tài khoản trong DB, trả về JWT token, chuyển vào màn hình chính" },
    { given: "User đã đăng ký", when: "Đăng nhập với đúng email + mật khẩu", then: "Trả về JWT token, chuyển vào tabs" },
    { given: "User nhập sai mật khẩu", when: "Bấm đăng nhập", then: "Hiển thị thông báo \"Invalid credentials\"" },
    { given: "User quên mật khẩu", when: "Nhập email và bấm gửi OTP", then: "Hệ thống gửi mã OTP 6 số đến email" },
    { given: "User nhập OTP hợp lệ và mật khẩu mới", when: "Bấm xác nhận", then: "Mật khẩu được cập nhật, OTP cũ bị xóa" },
  ],
});

const moduleProfile = featureSection({
  id: "5.2",
  name: "Hồ sơ người dùng (Profile)",
  status: ST_DONE,
  description: "Quản lý thông tin cá nhân, mục tiêu sức khỏe, bệnh lý. Tự động tính BMI và TDEE (Total Daily Energy Expenditure).",
  actions: [
    "Xem hồ sơ: tên, email, avatar, BMI, TDEE, calorie goal.",
    "Chỉnh sửa: tên, giới tính, tuổi, cân nặng, chiều cao, mục tiêu (lose_weight/gain_muscle/eat_healthy), mức vận động (sedentary/moderate/active), bệnh lý.",
    "Upload avatar (chụp/chọn ảnh) → lưu Cloudinary.",
    "Khai báo bệnh lý (multi-select): tiểu đường, cao huyết áp, dị ứng, hoặc \"Không\".",
  ],
  validations: [
    "Tuổi: 10-120.",
    "Cân nặng: 20-300 kg.",
    "Chiều cao: 50-250 cm.",
    "Tên: tối thiểu 2 ký tự, chỉ chữ cái + khoảng trắng (hỗ trợ Unicode).",
    "Avatar: ảnh ≤ 5MB, JPG/PNG.",
  ],
  acceptance: [
    { given: "User đã đăng nhập", when: "Mở tab Profile", then: "Hiển thị thông tin user, BMI và TDEE tính sẵn" },
    { given: "User nhập cân nặng 65kg, chiều cao 170cm", when: "Lưu profile", then: "BMI = 22.5 (Normal), TDEE tính theo công thức Mifflin-St Jeor" },
    { given: "User bấm vào avatar tròn", when: "Chọn ảnh từ thư viện", then: "Ảnh upload lên Cloudinary, URL lưu vào DB" },
    { given: "User chọn bệnh lý \"diabetes\"", when: "Lưu profile", then: "Conditions array trong DB chứa [\"diabetes\"]" },
  ],
});

const moduleMealCRUD = featureSection({
  id: "5.3",
  name: "Quản lý bữa ăn (Meal CRUD)",
  status: ST_DONE,
  description: "Người dùng có thể thêm bữa ăn thủ công, xem theo ngày/lịch sử, chỉnh sửa và xóa.",
  actions: [
    "Thêm bữa ăn: tên, loại bữa (breakfast/lunch/dinner/snack), calories, protein, carbs, fat, ngày, ghi chú, ảnh (optional).",
    "Xem các bữa ăn trong ngày trên màn hình Home với tổng calo và macro.",
    "Xem lịch sử bữa ăn theo khoảng ngày trong tab History.",
    "Chỉnh sửa bữa ăn (qua nút bút chì).",
    "Xóa bữa ăn (có xác nhận).",
  ],
  validations: [
    "Tên món: 2-100 ký tự.",
    "Calories: bắt buộc, > 0, ≤ 9999.",
    "Protein/Carbs/Fat: optional, ≥ 0, ≤ 9999.",
    "Ngày: định dạng YYYY-MM-DD.",
    "Loại bữa: 1 trong 4 giá trị enum.",
  ],
  acceptance: [
    { given: "User đã đăng nhập", when: "Thêm bữa \"Phở bò\" 450 kcal, lunch, hôm nay", then: "Meal lưu vào DB, hiển thị trong Home với tổng calo tăng 450" },
    { given: "Có 3 bữa hôm nay (450+380+200 kcal)", when: "Mở Home", then: "Tổng calo hiển thị 1030 kcal" },
    { given: "User bấm Edit trên 1 bữa", when: "Sửa calo từ 450 thành 500, save", then: "DB và UI cập nhật, tổng ngày tăng 50 kcal" },
    { given: "User bấm Delete trên 1 bữa", when: "Xác nhận xóa", then: "Meal biến mất khỏi cả Home và History, tổng ngày giảm tương ứng" },
  ],
});

const moduleScan = featureSection({
  id: "5.4",
  name: "Quét AI nhận diện món ăn (AI Photo Scan)",
  status: ST_DONE + " (UX đang refactor)",
  description: "Người dùng chụp/chọn ảnh món ăn → AI Gemini Vision nhận diện và trả về top 3 món có thể với ước lượng dinh dưỡng.",
  actions: [
    "Mở tab Scan → chụp ảnh từ camera.",
    "Hoặc chọn ảnh từ thư viện.",
    "Hệ thống gửi ảnh lên backend → Gemini Vision phân tích.",
    "Hiển thị top 3 candidates với % confidence, calo, macro, mô tả khẩu phần.",
    "User chọn 1 candidate → tự động pre-fill form Add Meal.",
    "User chỉnh sửa nếu cần → Save.",
    "Tùy chọn: nhập thủ công nếu không có candidate phù hợp.",
  ],
  validations: [
    "Ảnh: JPG/PNG, ≤ 8MB.",
    "Top 3 candidates phải sum confidence ~ 1.0.",
    "Nếu ảnh không phải món ăn → API trả 422 \"No food detected\".",
    "Auto-set meal type theo giờ hiện tại (6-10h: breakfast, 11-14h: lunch, 17-21h: dinner, khác: snack).",
  ],
  acceptance: [
    { given: "User chụp ảnh tô phở bò", when: "AI xử lý xong", then: "Trả về 3 candidates, top 1 là \"Phở Bò\" với confidence ≥ 70%" },
    { given: "Modal kết quả hiện 3 candidates", when: "User tap candidate đầu", then: "Chuyển vào Meal-add với name + calo + macro đã pre-fill" },
    { given: "User chụp ảnh tường trắng", when: "AI xử lý", then: "Hiển thị Alert \"No food detected\", quay lại scan" },
    { given: "Đang là 12:30 trưa", when: "User pick candidate", then: "Meal type tự đặt là \"lunch\"" },
  ],
});

const moduleBarcode = featureSection({
  id: "5.5",
  name: "Quét mã vạch sản phẩm đóng gói (Barcode Scan)",
  status: ST_TODO + " (Backend đã có, Frontend UI chưa làm)",
  description: "Quét mã vạch EAN/UPC trên sản phẩm đóng gói → tra cứu thông tin dinh dưỡng từ Open Food Facts API.",
  actions: [
    "Mở tab Scan → chuyển sang chế độ Barcode.",
    "Quét mã vạch bằng camera (sử dụng expo-camera barcode scanner).",
    "Hệ thống gọi Open Food Facts API.",
    "Hiển thị thông tin sản phẩm: tên, thương hiệu, ảnh, dinh dưỡng theo khẩu phần và 100g.",
    "User confirm → pre-fill Meal-add.",
  ],
  validations: [
    "Barcode: 8-14 chữ số.",
    "Nếu không tìm thấy → hiển thị \"Product not found\".",
    "Hiển thị đồng thời nutrition per 100g và per serving.",
  ],
  acceptance: [
    { given: "User quét barcode mì Hảo Hảo 8934563138189", when: "API trả về kết quả", then: "Hiển thị \"Mì Hảo Hảo Tôm Chua Cay\", calo ~285 kcal/gói" },
    { given: "Barcode không có trong DB", when: "User quét", then: "Hiển thị \"Product not found, enter manually?\" với nút redirect" },
    { given: "User confirm sản phẩm", when: "Bấm Add to meal", then: "Chuyển vào Meal-add với data đã pre-fill" },
  ],
});

const moduleMealPlan = featureSection({
  id: "5.6",
  name: "Kế hoạch bữa ăn theo tuần (Meal Plan)",
  status: ST_TODO,
  description: "Lên kế hoạch các bữa ăn cho cả tuần, tính tổng dinh dưỡng dự kiến, nhắc nhở theo bữa.",
  actions: [
    "Tạo plan tuần mới: chọn ngày bắt đầu (Thứ 2).",
    "Thêm bữa ăn vào từng slot (7 ngày x 4 bữa).",
    "Xem tổng calo/macro dự kiến cả tuần.",
    "Bật notification nhắc theo giờ từng bữa.",
    "Sao chép plan từ tuần trước.",
    "Đánh dấu đã hoàn thành / thay thế khi ăn bữa khác.",
  ],
  validations: [
    "Plan: bắt đầu thứ 2, kéo dài đúng 7 ngày.",
    "Notification time: HH:mm format.",
    "Không có giới hạn số plan / user.",
  ],
  acceptance: [
    { given: "User mở tab Meal Plan tuần mới", when: "Bấm \"Create plan\" cho tuần 12-18/8", then: "Hiển thị grid 7x4 trống" },
    { given: "User add món \"Cháo yến mạch\" vào breakfast thứ 3", when: "Lưu plan", then: "Slot Tue/Breakfast hiện món đó" },
    { given: "Plan có 21 bữa", when: "Xem tổng tuần", then: "Hiển thị tổng kcal + macro tính từ 21 bữa" },
    { given: "Bật reminder breakfast 7:00 AM", when: "Đến 7h sáng", then: "Push notification \"Đến giờ ăn sáng: Cháo yến mạch\"" },
  ],
});

const moduleHealth = featureSection({
  id: "5.7",
  name: "Theo dõi sức khỏe đồng hành (Health Companion)",
  status: ST_TODO,
  description: "Nhắc uống nước, theo dõi lượng vận động cơ bản.",
  actions: [
    "Log lượng nước uống: + 250ml, + 500ml, custom.",
    "Xem tổng nước uống trong ngày, so với mục tiêu (mặc định 2L).",
    "Log hoạt động vận động: loại, thời gian, calo đốt cháy ước lượng.",
    "Nhắc uống nước mỗi 2 giờ (toggle on/off).",
  ],
  validations: [
    "Water log: 10ml ≤ amount ≤ 5000ml mỗi lần.",
    "Exercise duration: 1-600 phút.",
    "Calo đốt cháy: tính theo công thức MET × cân nặng × thời gian.",
  ],
  acceptance: [
    { given: "User chưa uống nước hôm nay", when: "Bấm \"+ 500ml\"", then: "Tổng hôm nay = 500ml, progress bar 25%" },
    { given: "User vận động đi bộ 30 phút", when: "Save", then: "Tính ~100-150 kcal đốt cháy, lưu vào exercise log" },
    { given: "Bật reminder uống nước", when: "Đã 2h chưa log", then: "Push notification \"Đến giờ uống nước!\"" },
  ],
});

const moduleCoach = featureSection({
  id: "5.8",
  name: "AI Coach — Tư vấn cá nhân hóa",
  status: ST_TODO,
  description: "AI phân tích lịch sử ăn uống, đưa ra cảnh báo và gợi ý chủ động phù hợp với mục tiêu/bệnh lý của user.",
  actions: [
    "Xem tab AI Coach: hiện các insight gần đây.",
    "Nhận cảnh báo: \"Bạn đã ăn quá nhiều đường trong tuần\".",
    "Gợi ý: \"Hôm nay nên ăn nhiều rau xanh để bù vitamin\".",
    "Cảnh báo bệnh lý: \"Pho bo nhiều natri, không phù hợp người cao huyết áp\".",
    "Phân tích xu hướng tuần.",
  ],
  validations: [
    "Cần ít nhất 3 ngày data để generate insight có ý nghĩa.",
    "Mỗi insight phải có actionable suggestion (không chỉ phàn nàn).",
    "Cảnh báo bệnh lý priority cao hơn gợi ý dinh dưỡng thông thường.",
  ],
  acceptance: [
    { given: "User khai báo có bệnh tiểu đường", when: "Ăn món có nhiều đường", then: "AI Coach cảnh báo \"Lưu ý: món này có nhiều đường, không phù hợp với bệnh tiểu đường\"" },
    { given: "User ăn dưới protein goal 7 ngày liên tiếp", when: "Mở tab Coach", then: "Insight: \"Bạn đang thiếu protein, hãy bổ sung thịt/cá/đậu\"" },
    { given: "User có goal lose_weight", when: "Ăn vượt 110% calo target 3 ngày", then: "Insight: \"Cẩn thận! Bạn đang vượt mục tiêu calo\"" },
  ],
});

const moduleStats = featureSection({
  id: "5.9",
  name: "Thống kê và báo cáo (Stats & Reports)",
  status: ST_TODO + " (Skeleton có)",
  description: "Biểu đồ xu hướng dinh dưỡng theo tuần/tháng, so sánh với mục tiêu.",
  actions: [
    "Xem biểu đồ calo theo tuần (7 cột).",
    "Xem biểu đồ macro trung bình (pie chart: P/C/F).",
    "Xem trends tháng (line chart 30 điểm).",
    "Export PDF báo cáo tháng (optional).",
    "So sánh % completion với calorie goal.",
  ],
  validations: [
    "Hiển thị tối thiểu 7 ngày data.",
    "Charts responsive với screen size.",
    "Skip ngày không có meal log.",
  ],
  acceptance: [
    { given: "User có data 14 ngày", when: "Mở tab Progress", then: "Bar chart 7 ngày hiện tại, line chart 14 ngày trend" },
    { given: "Tổng calo tuần này 14000", when: "Calorie goal 2000/ngày", then: "Hiển thị 100% completion (14000/14000)" },
    { given: "User chia macro: 30% P, 40% C, 30% F", when: "Xem pie chart", then: "3 slice với % tương ứng và label" },
  ],
});

const moduleCommunity = featureSection({
  id: "5.10",
  name: "Cộng đồng nhẹ (Community Feed)",
  status: ST_TODO,
  description: "Người dùng chia sẻ bữa ăn lên feed, follow user khác, xem feed những người mình follow. KHÔNG có chat realtime.",
  actions: [
    "Đăng post: ảnh + caption, đính kèm meal đã log (optional).",
    "Xem feed: list post từ users đang follow.",
    "Like post.",
    "Follow/Unfollow user khác.",
    "Xem profile public của user.",
    "Xem danh sách meal lịch sử công khai của user khác.",
  ],
  validations: [
    "Caption: ≤ 500 ký tự.",
    "Ảnh post: ≤ 5MB.",
    "User không follow chính mình.",
    "Feed pagination: 20 post/lần load.",
  ],
  acceptance: [
    { given: "User A và B đã follow nhau", when: "A đăng 1 post", then: "B thấy post trong feed của mình" },
    { given: "User C chưa follow A", when: "C xem feed", then: "Không thấy post của A" },
    { given: "User like post", when: "Bấm icon trái tim", then: "Post like count +1, icon đổi màu đỏ" },
    { given: "User B follow user A", when: "Mở profile A", then: "Nút \"Following\" hiện thay vì \"Follow\"" },
  ],
});

const moduleI18n = featureSection({
  id: "5.11",
  name: "Đa ngôn ngữ (Internationalization)",
  status: ST_TODO,
  description: "Hỗ trợ Tiếng Anh (chính) và Tiếng Việt (nếu kịp thời gian).",
  actions: [
    "Tự động detect ngôn ngữ device.",
    "Cho phép user manually chọn ngôn ngữ trong Profile → Settings.",
    "Toàn bộ UI string đổi theo ngôn ngữ chọn.",
    "Lưu preference vào AsyncStorage.",
  ],
  validations: [
    "Mặc định: English nếu device không phải vi_VN.",
    "Toggle trong Profile lưu ngay lập tức.",
    "Backend error message cũng cần i18n.",
  ],
  acceptance: [
    { given: "User đang dùng English", when: "Chuyển sang Tiếng Việt trong Profile", then: "Mọi text trong app đổi sang tiếng Việt ngay" },
    { given: "User mở app lần đầu trên máy Vietnamese", when: "Detect language", then: "App tự đặt tiếng Việt" },
    { given: "Bug \"Email already in use\" từ backend", when: "User đang dùng tiếng Việt", then: "Hiển thị \"Email đã được sử dụng\"" },
  ],
});

const functionalRequirements = [
  h1("5. Yêu cầu chức năng"),
  p("Phần này mô tả chi tiết yêu cầu cho 11 module chính của hệ thống. Mỗi module có mô tả, hành động người dùng, quy tắc xác thực và tiêu chí chấp nhận theo định dạng Given/When/Then (BDD)."),
  ...moduleAuth,
  ...moduleProfile,
  ...moduleMealCRUD,
  ...moduleScan,
  ...moduleBarcode,
  ...moduleMealPlan,
  ...moduleHealth,
  ...moduleCoach,
  ...moduleStats,
  ...moduleCommunity,
  ...moduleI18n,
];

// ─── Section 6: Non-functional Requirements ─────────────────────────────────
const nonFunctional = [
  h1("6. Yêu cầu phi chức năng"),

  h2("6.1 Bảo mật (Security)"),
  bullet("Mật khẩu hash bằng bcryptjs với salt rounds = 10."),
  bullet("JWT token có thời hạn 30 ngày, lưu trong AsyncStorage."),
  bullet("Backend xác thực mọi endpoint cần auth bằng middleware protect."),
  bullet("Không log mật khẩu hoặc API key vào console hoặc file."),
  bullet("Sử dụng HTTPS khi deploy production."),
  bullet("File .env không commit lên git (đã có trong .gitignore)."),
  bullet("Validate input ở cả frontend và backend."),
  bullet("OTP reset password hết hạn sau 10 phút."),

  h2("6.2 Hiệu năng (Performance)"),
  bullet("Thời gian phản hồi API < 2 giây cho 95% request."),
  bullet("AI Scan response < 5 giây."),
  bullet("App khởi động < 3 giây trên thiết bị mid-range."),
  bullet("Image upload tối đa 8MB, tự nén còn ≤ 1MB trước khi gửi."),
  bullet("MongoDB query có index trên user.id và date."),

  h2("6.3 Khả dụng (Usability)"),
  bullet("UI tuân thủ Material Design (Android) và Human Interface Guidelines (iOS)."),
  bullet("Tất cả button có vùng tap ≥ 44x44pt."),
  bullet("Error message tiếng Việt rõ ràng, không thuần kỹ thuật."),
  bullet("Loading state có spinner và text mô tả."),
  bullet("Form validation cảnh báo ngay khi user rời input (onBlur)."),
  bullet("Hỗ trợ dark mode (theo system)."),

  h2("6.4 Khả mở rộng (Scalability)"),
  bullet("Backend stateless, có thể horizontal scale nhiều instances."),
  bullet("MongoDB Atlas tự scale storage và compute."),
  bullet("Image hosting tách rời (Cloudinary CDN)."),

  h2("6.5 Khả bảo trì (Maintainability)"),
  bullet("Code chia thành layer rõ ràng: routes/controllers/models/middleware."),
  bullet("Frontend dùng TypeScript để giảm bug runtime."),
  bullet("API documented bằng Swagger tự sinh từ JSDoc."),
  bullet("Comment chỉ viết cho logic phức tạp (Firebase, filter, state)."),
  bullet("Git commit message theo convention: feat/fix/chore/docs/refactor."),

  h2("6.6 Tương thích thiết bị"),
  bullet("iOS: 13.0 trở lên."),
  bullet("Android: API 24 (Android 7.0 Nougat) trở lên."),
  bullet("Responsive cho màn hình 5\" - 6.7\"."),
];

// ─── Section 7: Progress Tracker ────────────────────────────────────────────
const progressTracker = [
  h1("7. Bảng tiến độ tổng"),
  p("Bảng dưới đây tóm tắt tiến độ của từng module. Cập nhật ngày: " + new Date().toLocaleDateString("vi-VN") + "."),
  dataTable(
    ["Mã", "Module", "Trạng thái", "Tiến độ"],
    [
      ["5.1", "Authentication", ST_DONE, "100% - đã test register, login, logout, forgot password"],
      ["5.2", "Profile + BMI/TDEE", ST_DONE, "100% - đã test edit health info, name, avatar"],
      ["5.3", "Meal CRUD", ST_DONE, "100% - add, edit, delete, history đều OK"],
      ["5.4", "AI Photo Scan", ST_DONE, "90% - backend + frontend xong, đang refactor UX camera permission"],
      ["5.5", "Barcode Scan", ST_DOING, "50% - backend Open Food Facts xong, frontend UI chưa làm"],
      ["5.6", "Meal Plan tuần", ST_TODO, "0%"],
      ["5.7", "Water + Exercise", ST_TODO, "0%"],
      ["5.8", "AI Coach", ST_TODO, "0%"],
      ["5.9", "Stats & Charts", ST_TODO, "10% - skeleton screen có sẵn"],
      ["5.10", "Community", ST_TODO, "0%"],
      ["5.11", "i18n EN/VI", ST_TODO, "0%"],
    ],
    [800, 2900, 2400, 3260]
  ),
];

// ─── Section 8: Timeline ────────────────────────────────────────────────────
const timeline = [
  h1("8. Timeline 5 Phase"),
  p("Kế hoạch 5 phase tới deadline tháng 8/2026:"),
  dataTable(
    ["Phase", "Nội dung", "Module", "Tuần dự kiến"],
    [
      ["Phase 1", "Core AI features", "5.4 + 5.5", "Tuần 1-3 (đang ở đây)"],
      ["Phase 2", "Health & Planning", "5.6 + 5.7", "Tuần 4-6"],
      ["Phase 3", "AI Coach + Stats", "5.8 + 5.9", "Tuần 7-8"],
      ["Phase 4", "Community", "5.10", "Tuần 9-10"],
      ["Phase 5", "Polish + i18n + Deploy", "5.11 + bugfix", "Tuần 11-12"],
    ],
    [1100, 3300, 1900, 3060]
  ),
  p(""),
  h2("Buffer & Risk"),
  bullet("Buffer 2 tuần cho test cuối + viết báo cáo (tuần 13-14)."),
  bullet("Risk lớn nhất: AI Coach (Phase 3) — phụ thuộc Claude/Gemini API limits."),
  bullet("Risk trung bình: Community (Phase 4) — có thể cắt nếu thiếu thời gian."),
  bullet("Có thể skip i18n nếu deadline gấp (chỉ giữ English)."),

  p(""),
  h2("Tài liệu này được cập nhật liên tục"),
  p("Tài liệu sẽ được commit version mới mỗi khi hoàn thành 1 module hoặc thay đổi scope. Phiên bản hiện tại: v2.0."),
];

// ─── Final Document ─────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Le Mac Hoang King",
  title: "HealthySnap Requirements v2",
  description: "Tài liệu yêu cầu hệ thống Meal Snap - đồ án tốt nghiệp COMP-1682",

  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } }, // Calibri supports Vietnamese well
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "0B2A6F", font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "0B2A6F", font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "1A4380", font: "Calibri" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 } },
    ],
  },

  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Meal Snap — Requirements v2", italics: true, size: 18, color: "888888" })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Trang ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
            new TextRun({ text: " / ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888" }),
          ],
        })],
      }),
    },
    children: [
      ...titlePage,
      ...overviewSection,
      ...functionalRequirements,
      ...nonFunctional,
      ...progressTracker,
      ...timeline,
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "..", "HealthySnap_Requirements_v2.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("✅ Generated:", outPath);
  console.log("📄 File size:", (buffer.length / 1024).toFixed(1), "KB");
});
