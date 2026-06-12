/**
 * Generate HealthySnap_Requirements.docx — bản gọn: định hướng + tech stack + requirement list
 * Run: node scripts/generate-requirements.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber,
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: [new TextRun({ text, ...opts.run })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 160 },
  children: [new TextRun({ text, bold: true })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 220, after: 120 },
  children: [new TextRun({ text, bold: true })],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 50 },
  children: [new TextRun(text)],
});

const cell = (text, { width, bold, fill } = {}) => new TableCell({
  borders, margins: cellMargins,
  width: { size: width, type: WidthType.DXA },
  shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
  children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })],
});

const dataTable = (headers, rows, widths) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((t, i) => cell(t, { width: widths[i], bold: true, fill: "D5E8F0" })),
    }),
    ...rows.map((r) => new TableRow({
      children: r.map((t, i) => cell(t, { width: widths[i] })),
    })),
  ],
});

const DONE = "✅ Hoàn thành";
const DOING = "🟡 Đang làm";
const TODO = "⏳ Chưa làm";

const children = [
  // ── Header info ──
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "TÀI LIỆU YÊU CẦU DỰ ÁN", bold: true, size: 32 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: "Meal Snap (HealthySnap) — Smart Nutrition Tracking & Personal Health App", size: 24, color: "2563EB", bold: true })],
  }),
  dataTable([], [], [3000, 6360]) && new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      ["Sinh viên", "Lê Mạc Hoàng King"],
      ["Môn học", "COMP-1682 — Final Year Project"],
      ["Deadline", "Tháng 8/2026"],
      ["Phiên bản", "v3 — " + new Date().toLocaleDateString("vi-VN")],
    ].map(([k, v]) => new TableRow({
      children: [
        cell(k, { width: 3000, bold: true, fill: "F2F4F8" }),
        cell(v, { width: 6360 }),
      ],
    })),
  }),

  // ── 1. Định hướng ──
  h1("1. Định hướng dự án"),
  p("Meal Snap là ứng dụng di động theo dõi dinh dưỡng cá nhân, điểm nhấn là dùng AI nhận diện món ăn từ ảnh chụp (hỗ trợ tốt món ăn Việt Nam) và tự động ước lượng calo, macro. Ứng dụng tính toán chỉ số sức khỏe (BMI, TDEE), gợi ý mục tiêu calo theo mục tiêu cá nhân (giảm cân / tăng cơ / ăn lành mạnh) và nhắc nhở thói quen hằng ngày."),
  p("Về dài hạn, dự án phát triển theo mô hình mạng xã hội chia sẻ tương tự ứng dụng WEAR (Nhật Bản) nhưng dành cho đồ ăn healthy: người dùng đăng bài chia sẻ bữa ăn (kèm thẻ dinh dưỡng lấy từ dữ liệu đã log/scan), kinh nghiệm tập luyện và quản lý cân nặng; tương tác bằng like / lưu bài / follow — không có tính năng chat. Điểm khác biệt so với mạng xã hội thông thường: mỗi bài đăng gắn dữ liệu dinh dưỡng thật, người xem có thể lưu món về nhật ký của chính mình."),

  // ── 2. Tech stack ──
  h1("2. Công nghệ sử dụng"),
  dataTable(
    ["Thành phần", "Công nghệ", "Ghi chú"],
    [
      ["Mobile app", "React Native + Expo + TypeScript", "iOS & Android, Expo Router"],
      ["State", "React Context API + AsyncStorage", "Auth, Meals; lưu JWT offline"],
      ["Backend", "Node.js + Express 5", "REST API, Swagger docs"],
      ["Database", "MongoDB Atlas", "Cloud, collections: users/meals/otps"],
      ["Xác thực", "JWT + bcryptjs", "Token 30 ngày, hash password"],
      ["AI nhận diện món ăn", "Google Gemini 2.5 Flash (Vision)", "Top-3 candidates + ước lượng dinh dưỡng, free tier"],
      ["Tra cứu mã vạch", "Open Food Facts API", "Miễn phí, không cần API key"],
      ["Lưu ảnh", "Cloudinary CDN", "Avatar, ảnh món ăn"],
      ["Email", "Nodemailer + Gmail SMTP", "OTP đặt lại mật khẩu"],
      ["Thông báo", "expo-notifications", "Nhắc bữa ăn hằng ngày"],
    ],
    [2400, 3400, 3560]
  ),

  // ── 3. Requirement list ──
  h1("3. Danh sách yêu cầu chức năng"),

  h2("3.1 Xác thực người dùng — " + DONE),
  bullet("Đăng ký / đăng nhập bằng email + mật khẩu (JWT)."),
  bullet("Quên mật khẩu: gửi OTP 6 số qua email, hết hạn 10 phút."),
  bullet("Validation: tên ≥ 2 ký tự (hỗ trợ tiếng Việt), mật khẩu ≥ 6 ký tự có chữ hoa + số."),

  h2("3.2 Hồ sơ & chỉ số sức khỏe — " + DONE),
  bullet("Quản lý thông tin: giới tính, tuổi, cân nặng, chiều cao, mục tiêu, mức vận động, bệnh lý."),
  bullet("Tự tính BMI (phân loại WHO) và TDEE (công thức Mifflin-St Jeor)."),
  bullet("Mục tiêu calo tự động theo mục tiêu (giảm cân −500, tăng cơ +300) hoặc đặt tay trong Settings."),
  bullet("Đổi tên, upload avatar (Cloudinary)."),

  h2("3.3 Quản lý bữa ăn — " + DONE),
  bullet("Thêm / sửa / xóa bữa ăn: tên, loại bữa, calo, protein, carbs, fat, ngày, ghi chú."),
  bullet("Xem theo ngày (tổng calo + macro) và lịch sử theo nhóm ngày."),

  h2("3.4 Quét AI món ăn bằng ảnh — " + DONE),
  bullet("Chụp ảnh hoặc chọn từ thư viện; ảnh được nén trước khi gửi (1024px)."),
  bullet("Gemini Vision trả về top 3 món khả dĩ kèm độ tin cậy, calo, macro, mô tả khẩu phần."),
  bullet("Người dùng chọn 1 kết quả → tự điền form thêm bữa ăn (loại bữa tự đặt theo giờ)."),

  h2("3.5 Quét mã vạch sản phẩm — " + DOING),
  bullet("Backend tra cứu Open Food Facts theo mã vạch, chuẩn hóa dinh dưỡng theo khẩu phần — đã xong."),
  bullet("Giao diện quét mã vạch trên app — chưa làm."),

  h2("3.6 Thống kê & tiến trình — " + DOING),
  bullet("Biểu đồ calo 7 ngày, macro trung bình tuần, streak, ngày đạt mục tiêu — đã có."),
  bullet("Xem các tuần cũ hơn, biểu đồ tháng — chưa làm."),

  h2("3.7 Kế hoạch bữa ăn tuần — " + TODO),
  bullet("Lên thực đơn 7 ngày × 4 bữa, tính tổng dinh dưỡng tuần, nhắc theo bữa."),

  h2("3.8 Theo dõi nước & vận động — " + TODO),
  bullet("Log nước uống theo ngày (mục tiêu 2L), log vận động (tính calo đốt theo MET)."),

  h2("3.9 AI Coach — " + TODO),
  bullet("Phân tích thói quen ăn uống, cảnh báo món không phù hợp bệnh lý/mục tiêu, gợi ý chủ động."),

  h2("3.10 Cộng đồng chia sẻ (mô hình WEAR) — " + TODO),
  bullet("MVP: đăng bài (ảnh + caption + thẻ dinh dưỡng từ meal đã log), feed theo follow, like, trang cá nhân công khai."),
  bullet("Mở rộng: lưu bài, \"thêm vào nhật ký của tôi\", hashtag, 3 loại bài (bữa ăn / tập luyện / câu chuyện cân nặng)."),
  bullet("Không có chat giữa người dùng."),

  h2("3.11 Đa ngôn ngữ — " + TODO),
  bullet("Tiếng Anh (mặc định) + Tiếng Việt nếu kịp tiến độ. Đã đặt sẵn mục Language trong Settings."),

  // ── 4. Phi chức năng ──
  h1("4. Yêu cầu phi chức năng (tóm tắt)"),
  bullet("Bảo mật: hash mật khẩu (bcrypt), JWT cho mọi endpoint riêng tư, secret trong .env không commit."),
  bullet("Hiệu năng: API < 2s; AI scan < 5s (ảnh nén trước khi upload)."),
  bullet("Giao diện: tông xanh dương thân thiện (#2563EB), validate form ngay khi nhập, hỗ trợ tiếng Việt."),
  bullet("Khả mở rộng: backend stateless; AI vision / image host thay được qua config."),

  // ── 5. Lộ trình ──
  h1("5. Lộ trình"),
  dataTable(
    ["Giai đoạn", "Nội dung", "Trạng thái"],
    [
      ["Phase 1", "Auth, Profile, Meal CRUD, AI Scan ảnh, UI", "✅ Gần xong (còn Barcode UI)"],
      ["Phase 2", "Meal Plan tuần, Nước & Vận động", TODO],
      ["Phase 3", "AI Coach, Thống kê nâng cao", TODO],
      ["Phase 4", "Cộng đồng chia sẻ (mô hình WEAR)", TODO],
      ["Phase 5", "Đa ngôn ngữ, hoàn thiện, deploy", TODO],
    ],
    [1600, 5160, 2600]
  ),
];

const doc = new Document({
  creator: "Le Mac Hoang King",
  title: "Meal Snap - Requirements",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: "1D4ED8", font: "Calibri" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "1D4ED8", font: "Calibri" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Trang ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = path.join(__dirname, "..", "HealthySnap_Requirements.docx");
  fs.writeFileSync(out, buffer);
  console.log("✅", out, (buffer.length / 1024).toFixed(1), "KB");
});
