/**
 * Generate Architecture_Diagram.docx — Data Flow Documentation
 *
 * For each use case: Input Variables | Algorithm/Framework | Output Variables
 * Pseudocode + Math formulas where applicable.
 *
 * Run: node scripts/generate-architecture.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
} = require("docx");

// ─── Style constants ────────────────────────────────────────────────────────
const COLORS = {
  input: "DBEAFE",       // light blue
  inputBorder: "1E3A8A",
  process: "FEF3C7",     // light yellow
  processBorder: "B45309",
  output: "D1FAE5",      // light green
  outputBorder: "047857",
  code: "F3F4F6",        // light gray for code
  headerFill: "0B2A6F",  // dark navy for table header
};

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" };

// ─── Helpers ────────────────────────────────────────────────────────────────
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: [new TextRun({ text, ...opts.run })],
});

const code = (text) => new Paragraph({
  spacing: { after: 40, before: 40 },
  children: [new TextRun({ text, font: "Consolas", size: 18, color: "1F2937" })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  pageBreakBefore: true,
  children: [new TextRun({ text, bold: true })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 160 },
  children: [new TextRun({ text, bold: true })],
});

const h3 = (text, opts = {}) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 180, after: 120 },
  children: [new TextRun({ text, bold: true, ...opts.run })],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});

// Section header for use case (with status badge)
const useCaseHeader = (id, name, status) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 280, after: 100 },
  children: [
    new TextRun({ text: `${id}. ${name}  `, bold: true, size: 26 }),
    new TextRun({
      text: status === "DONE" ? "✅ Done" : status === "DOING" ? "🟡 Đang làm" : "⏸️ Chưa làm",
      size: 18,
      color: status === "DONE" ? "047857" : status === "DOING" ? "B45309" : "6B7280",
      italics: true,
    }),
  ],
});

// Block label (INPUT / ALGORITHM / OUTPUT)
const blockLabel = (label, color) => new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [new TextRun({
    text: label, bold: true, size: 22, color, font: "Calibri",
  })],
});

// Input/Output variable table
// rows: [{name, type, constraint, example}]
const varTable = (rows, headerFill) => {
  if (!rows || rows.length === 0) return p("(no variables)", { run: { italics: true, color: "888888" } });
  const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
  const widths = [1800, 1600, 2600, 3360]; // sum 9360
  const headerCell = (text, width) => new TableCell({
    borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
    margins: cellMargins,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: headerFill, type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF" })],
    })],
  });
  const dataCell = (text, width, mono = false) => new TableCell({
    borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
    margins: cellMargins,
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({
        text: text || "—",
        size: 18,
        font: mono ? "Consolas" : "Calibri",
        color: mono ? "1F2937" : "111827",
      })],
    })],
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("Variable", widths[0]),
          headerCell("Type", widths[1]),
          headerCell("Constraint / Note", widths[2]),
          headerCell("Example", widths[3]),
        ],
      }),
      ...rows.map((r) => new TableRow({
        children: [
          dataCell(r.name, widths[0], true),
          dataCell(r.type, widths[1], true),
          dataCell(r.constraint, widths[2]),
          dataCell(r.example, widths[3], true),
        ],
      })),
    ],
  });
};

// Algorithm pseudocode block (boxed monospace text)
const algorithmBlock = (lines) => {
  const cellMargins = { top: 200, bottom: 200, left: 240, right: 240 };
  const border = { style: BorderStyle.SINGLE, size: 8, color: COLORS.processBorder };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders, margins: cellMargins,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: COLORS.code, type: ShadingType.CLEAR },
        children: lines.map((line) => new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({
            text: line || " ",
            font: "Consolas", size: 18, color: "1F2937",
          })],
        })),
      })],
    })],
  });
};

// Helper to build a use case block
function useCase({ id, name, status, description, input, algorithm, output, formula }) {
  const blocks = [
    useCaseHeader(id, name, status),
    p(description, { run: { italics: true } }),

    blockLabel("📥 INPUT VARIABLES", COLORS.inputBorder),
    varTable(input, COLORS.inputBorder),

    blockLabel("⚙️ ALGORITHM / FRAMEWORK XỬ LÝ", COLORS.processBorder),
    algorithmBlock(algorithm),
  ];

  if (formula && formula.length) {
    blocks.push(new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: "📐 Công thức toán học:", bold: true, size: 20 })],
    }));
    formula.forEach((f) => blocks.push(code("    " + f)));
  }

  blocks.push(blockLabel("📤 OUTPUT VARIABLES", COLORS.outputBorder));
  blocks.push(varTable(output, COLORS.outputBorder));
  blocks.push(p(""));
  return blocks;
}

// ─── Title Page ─────────────────────────────────────────────────────────────
const titlePage = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2400, after: 200 },
    children: [new TextRun({ text: "LUỒNG XỬ LÝ DỮ LIỆU", bold: true, size: 36 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: "Input Variables — Algorithm — Output Variables", italics: true, size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
    children: [new TextRun({ text: "Meal Snap (HealthySnap)", bold: true, size: 48, color: "0B2A6F" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Sinh viên: Lê Mạc Hoàng King", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Đồ án tốt nghiệp — COMP-1682", size: 22 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: "Ngày cập nhật: " + new Date().toLocaleDateString("vi-VN"), italics: true, size: 20, color: "666666" })],
  }),
];

// ─── Overview ───────────────────────────────────────────────────────────────
const overview = [
  h1("1. Giới thiệu tài liệu"),
  p("Tài liệu này mô tả chi tiết luồng xử lý dữ liệu của ứng dụng Meal Snap theo mô hình 3 khối:"),
  bullet("📥 INPUT VARIABLES — Biến đầu vào (data type, ràng buộc, ví dụ)"),
  bullet("⚙️ ALGORITHM / FRAMEWORK — Thuật toán xử lý (pseudocode + công thức toán)"),
  bullet("📤 OUTPUT VARIABLES — Biến đầu ra (data type, ví dụ)"),
  p(""),
  p("Mỗi tính năng của hệ thống đều được mô tả theo cấu trúc trên, đảm bảo người đọc hiểu rõ:"),
  bullet("Cần truyền vào những gì."),
  bullet("Hệ thống xử lý các bước nào (có công thức toán nếu có)."),
  bullet("Kết quả trả về có cấu trúc thế nào."),
  p(""),
  p("Tài liệu bao gồm 26 use case chia thành 7 nhóm:"),
  bullet("1. Helper functions (BMI, TDEE) — 2 use case"),
  bullet("2. Authentication — 5 use case"),
  bullet("3. Profile — 4 use case"),
  bullet("4. Meal CRUD — 5 use case"),
  bullet("5. AI Scan — 2 use case"),
  bullet("6. Planned features — 7 use case (Meal Plan, Water, Exercise, AI Coach, Stats, Community, i18n)"),
  bullet("7. Common patterns — 1 use case"),
];

// ─── 2. Helper Functions ─────────────────────────────────────────────────────
const sectionHelpers = [
  h1("2. Helper Functions"),
  p("Các hàm tính toán tái sử dụng trong nhiều use case."),

  ...useCase({
    id: "2.1", name: "Tính BMI (Body Mass Index)", status: "DONE",
    description: "Hàm tính chỉ số khối cơ thể từ cân nặng và chiều cao, kèm phân loại sức khỏe theo WHO.",
    input: [
      { name: "weight", type: "Number", constraint: "20–300 kg, bắt buộc > 0", example: "65" },
      { name: "height", type: "Number", constraint: "50–250 cm, bắt buộc > 0", example: "170" },
    ],
    algorithm: [
      "FUNCTION calculateBMI(weight, height):",
      "    IF weight is NULL OR height is NULL:",
      "        RETURN NULL",
      "    heightM = height / 100              // cm → m",
      "    bmi = weight / (heightM × heightM)",
      "    RETURN ROUND(bmi × 10) / 10         // làm tròn 1 chữ số thập phân",
      "",
      "FUNCTION getBMICategory(bmi):",
      "    IF bmi < 18.5:  RETURN \"Underweight\"",
      "    IF bmi < 25:    RETURN \"Normal\"",
      "    IF bmi < 30:    RETURN \"Overweight\"",
      "    RETURN \"Obese\"",
    ],
    formula: [
      "BMI = weight (kg) / [height (m)]²",
      "    = 65 / (1.70)²  =  65 / 2.89  ≈  22.5",
    ],
    output: [
      { name: "bmi", type: "Number", constraint: "1 chữ số thập phân", example: "22.5" },
      { name: "bmiCategory", type: "String", constraint: "Underweight / Normal / Overweight / Obese", example: "\"Normal\"" },
    ],
  }),

  ...useCase({
    id: "2.2", name: "Tính TDEE (Total Daily Energy Expenditure)", status: "DONE",
    description: "Tổng năng lượng tiêu thụ trong ngày, tính theo công thức Mifflin-St Jeor (1990) — chuẩn y khoa hiện đại.",
    input: [
      { name: "weight", type: "Number", constraint: "kg", example: "65" },
      { name: "height", type: "Number", constraint: "cm", example: "170" },
      { name: "age", type: "Number", constraint: "10–120 năm", example: "21" },
      { name: "gender", type: "String", constraint: "\"male\" | \"female\"", example: "\"male\"" },
      { name: "activityLevel", type: "String", constraint: "sedentary | moderate | active", example: "\"moderate\"" },
    ],
    algorithm: [
      "FUNCTION calculateTDEE(weight, height, age, gender, activityLevel):",
      "    // Bước 1: Tính BMR (Basal Metabolic Rate) theo Mifflin-St Jeor",
      "    IF gender == \"male\":",
      "        bmr = 10 × weight + 6.25 × height − 5 × age + 5",
      "    ELSE:",
      "        bmr = 10 × weight + 6.25 × height − 5 × age − 161",
      "",
      "    // Bước 2: Nhân với hệ số vận động",
      "    multipliers = {",
      "        sedentary: 1.2,    // ngồi nhiều, ít vận động",
      "        moderate:  1.55,   // tập 3-5 lần/tuần",
      "        active:    1.725,  // tập 6-7 lần/tuần",
      "    }",
      "    tdee = bmr × multipliers[activityLevel]",
      "    RETURN ROUND(tdee)",
    ],
    formula: [
      "BMR (nam) = 10W + 6.25H − 5A + 5",
      "BMR (nữ)  = 10W + 6.25H − 5A − 161",
      "TDEE      = BMR × ActivityMultiplier",
      "",
      "Ví dụ: Nam 65kg, 170cm, 21 tuổi, moderate",
      "  BMR  = 10×65 + 6.25×170 − 5×21 + 5  = 1612.5",
      "  TDEE = 1612.5 × 1.55                ≈ 2499 kcal/day",
    ],
    output: [
      { name: "tdee", type: "Number", constraint: "kcal/ngày, làm tròn", example: "2499" },
    ],
  }),
];

// ─── 3. Authentication ──────────────────────────────────────────────────────
const sectionAuth = [
  h1("3. Authentication"),

  ...useCase({
    id: "3.1", name: "Register — Đăng ký tài khoản", status: "DONE",
    description: "Xác minh quyền sở hữu email bằng OTP trước khi tạo user, sau đó hash password và trả JWT để auto login.",
    input: [
      { name: "name", type: "String", constraint: "≥ 2 ký tự, chỉ chữ + space (hỗ trợ tiếng Việt)", example: "\"Nguyễn Văn A\"" },
      { name: "email", type: "String", constraint: "Format email hợp lệ, unique trong DB", example: "\"a@gmail.com\"" },
      { name: "password", type: "String", constraint: "≥ 6 ký tự, có ít nhất 1 chữ in hoa + 1 số", example: "\"Pass123\"" },
      { name: "otp", type: "String", constraint: "6 chữ số, đúng purpose registration, chưa hết hạn", example: "\"482931\"" },
    ],
    algorithm: [
      "FUNCTION register(name, email, password, otp):",
      "    // Validate",
      "    IF NOT isValidName(name):     RETURN 400 \"Invalid name\"",
      "    IF NOT isValidEmail(email):   RETURN 400 \"Invalid email\"",
      "    IF NOT isValidPassword(pwd):  RETURN 400 \"Invalid password\"",
      "",
      "    // Verify email ownership before checking account uniqueness",
      "    record = OTP.findOne({ email, purpose: \"registration\" }).select(\"+codeHash\")",
      "    IF NOT record OR expired:  RETURN 400 \"Invalid verification code\"",
      "    IF NOT timingSafeMatch(HMAC(otp), record.codeHash): increment attempts; RETURN 400",
      "    existing = User.findOne({ email: email.toLowerCase() })",
      "    IF existing:  RETURN 400 \"Unable to create account\"",
      "",
      "    // Hash password",
      "    salt = bcrypt.genSalt(10)",
      "    hashedPassword = bcrypt.hash(password, salt)",
      "",
      "    // Create user",
      "    user = User.create({",
      "        name: name.trim(),",
      "        email: email.toLowerCase(),",
      "        emailVerifiedAt: NOW(),",
      "        password: hashedPassword,",
      "    })",
      "",
      "    // Generate JWT (expires in 30 days)",
      "    token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: \"30d\" })",
      "",
      "    RETURN 201 { token, user }",
    ],
    output: [
      { name: "token", type: "String", constraint: "JWT, hết hạn sau 30 ngày", example: "\"eyJhbGciOi...\"" },
      { name: "user._id", type: "String", constraint: "MongoDB ObjectId", example: "\"6a0f0269...\"" },
      { name: "user.name", type: "String", constraint: "trim sạch khoảng trắng", example: "\"Nguyễn Văn A\"" },
      { name: "user.email", type: "String", constraint: "lưu chữ thường", example: "\"a@gmail.com\"" },
      { name: "user.calorieGoal", type: "Number", constraint: "default 2000", example: "2000" },
    ],
  }),

  ...useCase({
    id: "3.2", name: "Login — Đăng nhập", status: "DONE",
    description: "Xác thực user bằng email + password, trả JWT nếu đúng.",
    input: [
      { name: "email", type: "String", constraint: "case-insensitive", example: "\"a@gmail.com\"" },
      { name: "password", type: "String", constraint: "plain text (sẽ compare với hash trong DB)", example: "\"Pass123\"" },
    ],
    algorithm: [
      "FUNCTION login(email, password):",
      "    user = User.findOne({ email: email.toLowerCase() })",
      "    IF NOT user:  RETURN 400 \"Invalid credentials\"",
      "",
      "    // bcrypt.compare lấy salt từ hash, hash lại password và so sánh constant-time",
      "    isMatch = bcrypt.compare(password, user.password)",
      "    IF NOT isMatch:  RETURN 400 \"Invalid credentials\"",
      "",
      "    token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: \"30d\" })",
      "    RETURN 200 { token, user }",
    ],
    output: [
      { name: "token", type: "String", constraint: "JWT", example: "\"eyJhbGciOi...\"" },
      { name: "user", type: "Object", constraint: "loại bỏ field password", example: "{ _id, name, email, ... }" },
    ],
  }),

  ...useCase({
    id: "3.3", name: "Get Current User — Lấy thông tin user đang đăng nhập", status: "DONE",
    description: "Endpoint dùng để verify token còn valid và đồng bộ user info.",
    input: [
      { name: "Authorization header", type: "String", constraint: "\"Bearer <JWT>\"", example: "\"Bearer eyJ...\"" },
    ],
    algorithm: [
      "FUNCTION getMe(req):",
      "    // Middleware protect đã decode token và set req.user.id",
      "    user = User.findById(req.user.id).select(\"-password\")",
      "    IF NOT user:  RETURN 404 \"User not found\"",
      "    RETURN 200 { user }",
    ],
    output: [
      { name: "user", type: "Object", constraint: "không có password", example: "{ _id, name, email, weight, ... }" },
    ],
  }),

  ...useCase({
    id: "3.4", name: "Forgot Password — Gửi OTP qua email", status: "DONE",
    description: "User quên password → gửi OTP 6 số đến email, hết hạn 10 phút.",
    input: [
      { name: "email", type: "String", constraint: "phải tồn tại trong DB", example: "\"a@gmail.com\"" },
    ],
    algorithm: [
      "FUNCTION sendPasswordOTP(email):",
      "    user = User.findOne({ email: email.toLowerCase() })",
      "    IF NOT user:  RETURN 404 \"No account found\"",
      "",
      "    // Generate 6-digit OTP with a cryptographic RNG",
      "    otp = crypto.randomInt(100000, 1000000).toString()",
      "    expiresAt = NOW() + 10 minutes",
      "",
      "    // Xóa OTP cũ cho email này (tránh nhiều OTP cùng lúc)",
      "    OTP.deleteMany({ email })",
      "",
      "    // Chỉ lưu HMAC digest, gắn với email + password_reset purpose",
      "    OTP.create({ email, purpose: \"password_reset\", codeHash: HMAC(otp), expiresAt })",
      "",
      "    // Gửi email qua Brevo HTTPS API",
      "    sendOTP(email, otp)",
      "    RETURN 200 \"OTP sent to your email\"",
    ],
    output: [
      { name: "message", type: "String", constraint: "Không trả OTP về client (chỉ qua email)", example: "\"OTP sent to your email\"" },
    ],
  }),

  ...useCase({
    id: "3.5", name: "Reset Password — Đặt lại password bằng OTP", status: "DONE",
    description: "Verify OTP, đổi password mới (hash), xóa OTP đã dùng.",
    input: [
      { name: "email", type: "String", constraint: "email đăng ký", example: "\"a@gmail.com\"" },
      { name: "otp", type: "String", constraint: "6 chữ số, chưa hết hạn", example: "\"482931\"" },
      { name: "newPassword", type: "String", constraint: "≥ 6 ký tự, 1 in hoa + 1 số", example: "\"NewPass123\"" },
    ],
    algorithm: [
      "FUNCTION resetPassword(email, otp, newPassword):",
      "    // Validate new password",
      "    IF len(newPassword) < 6 OR NOT hasUppercase OR NOT hasDigit:",
      "        RETURN 400 \"Password must be 6+ chars, 1 uppercase, 1 number\"",
      "",
      "    // Find OTP record",
      "    record = OTP.findOne({ email, purpose: \"password_reset\" }).select(\"+codeHash\")",
      "    IF NOT record:                  RETURN 400 \"Invalid OTP\"",
      "    IF record.expiresAt < NOW():    RETURN 400 \"OTP has expired\"",
      "    IF NOT timingSafeMatch(HMAC(otp), record.codeHash): increment attempts; RETURN 400",
      "",
      "    // Hash + update password",
      "    hashed = bcrypt.hash(newPassword, 10)",
      "    User.findOneAndUpdate({ email }, { password: hashed })",
      "",
      "    // Xóa tất cả OTP của email này",
      "    OTP.deleteMany({ email })",
      "    RETURN 200 \"Password changed successfully\"",
    ],
    output: [
      { name: "message", type: "String", constraint: "Confirmation", example: "\"Password changed successfully\"" },
    ],
  }),
];

// ─── 4. Profile ─────────────────────────────────────────────────────────────
const sectionProfile = [
  h1("4. Profile"),

  ...useCase({
    id: "4.1", name: "Get Profile — Xem hồ sơ + BMI + TDEE", status: "DONE",
    description: "Trả về thông tin user kèm chỉ số sức khỏe tính sẵn.",
    input: [
      { name: "req.user.id", type: "String", constraint: "Từ JWT đã decode", example: "\"6a0f0269...\"" },
    ],
    algorithm: [
      "FUNCTION getProfile(req):",
      "    user = User.findById(req.user.id).select(\"-password\")",
      "    IF NOT user:  RETURN 404",
      "",
      "    bmi          = calculateBMI(user.weight, user.height)",
      "    bmiCategory  = getBMICategory(bmi)",
      "    tdee         = calculateTDEE(user.weight, user.height, user.age,",
      "                                  user.gender, user.activityLevel)",
      "",
      "    RETURN 200 { user, stats: { bmi, bmiCategory, tdee } }",
    ],
    output: [
      { name: "user", type: "Object", constraint: "full profile, no password", example: "{ _id, name, weight, height, ... }" },
      { name: "stats.bmi", type: "Number | NULL", constraint: "NULL nếu thiếu weight/height", example: "22.5" },
      { name: "stats.bmiCategory", type: "String", constraint: "Underweight/Normal/...", example: "\"Normal\"" },
      { name: "stats.tdee", type: "Number | NULL", constraint: "kcal/ngày", example: "2499" },
    ],
  }),

  ...useCase({
    id: "4.2", name: "Update Profile — Cập nhật hồ sơ & tự tính calorieGoal", status: "DONE",
    description: "Update các field profile, tự động tính lại calorieGoal dựa trên goal (lose_weight: TDEE-500, gain_muscle: TDEE+300, eat_healthy: TDEE).",
    input: [
      { name: "name", type: "String?", constraint: "optional", example: "\"Nguyễn Văn A\"" },
      { name: "gender", type: "String?", constraint: "male/female", example: "\"male\"" },
      { name: "age", type: "Number?", constraint: "10–120", example: "21" },
      { name: "weight", type: "Number?", constraint: "20–300 kg", example: "65" },
      { name: "height", type: "Number?", constraint: "50–250 cm", example: "170" },
      { name: "goal", type: "String?", constraint: "lose_weight/gain_muscle/eat_healthy", example: "\"lose_weight\"" },
      { name: "activityLevel", type: "String?", constraint: "sedentary/moderate/active", example: "\"moderate\"" },
      { name: "conditions", type: "Array<String>?", constraint: "[\"diabetes\", \"hypertension\"...]", example: "[\"diabetes\"]" },
      { name: "calorieGoal", type: "Number?", constraint: "nếu không gửi → tự tính", example: "1900" },
    ],
    algorithm: [
      "FUNCTION updateProfile(req):",
      "    body = req.body",
      "    // Validation",
      "    IF body.age && (body.age < 10 OR body.age > 120):  RETURN 400",
      "    IF body.weight && (body.weight < 20 OR > 300):     RETURN 400",
      "    IF body.height && (body.height < 50 OR > 250):     RETURN 400",
      "    IF body.gender NOT IN [male,female]:               RETURN 400",
      "    IF body.goal NOT IN [lose_weight,gain_muscle,eat_healthy]: RETURN 400",
      "    IF body.activityLevel NOT IN [sedentary,moderate,active]:  RETURN 400",
      "",
      "    // Auto-calc calorieGoal nếu user không tự nhập",
      "    finalCalorieGoal = body.calorieGoal",
      "    IF NOT body.calorieGoal:",
      "        tdee = calculateTDEE(weight, height, age, gender, activityLevel)",
      "        IF tdee:",
      "            IF goal == \"lose_weight\":   finalCalorieGoal = tdee − 500",
      "            ELIF goal == \"gain_muscle\": finalCalorieGoal = tdee + 300",
      "            ELSE:                       finalCalorieGoal = tdee",
      "",
      "    // Update (chỉ field nào có trong body)",
      "    updated = User.findByIdAndUpdate(req.user.id, body, { new: true })",
      "",
      "    // Tính lại stats để trả về",
      "    bmi  = calculateBMI(updated.weight, updated.height)",
      "    tdee = calculateTDEE(...)",
      "    RETURN 200 { user: updated, stats: { bmi, bmiCategory, tdee } }",
    ],
    formula: [
      "calorieGoal = TDEE − 500     // mục tiêu giảm cân (deficit 500 kcal/day ≈ 0.5 kg/tuần)",
      "calorieGoal = TDEE + 300     // mục tiêu tăng cơ (surplus 300 kcal/day)",
      "calorieGoal = TDEE           // duy trì cân nặng",
    ],
    output: [
      { name: "user", type: "Object", constraint: "đã update", example: "{ _id, name, weight, height, goal, calorieGoal, ... }" },
      { name: "stats", type: "Object", constraint: "BMI + TDEE tính lại", example: "{ bmi: 22.5, tdee: 2499 }" },
    ],
  }),

  ...useCase({
    id: "4.3", name: "Change Name — Đổi tên user", status: "DONE",
    description: "Đổi riêng tên user, validate trước khi save.",
    input: [
      { name: "name", type: "String", constraint: "≥ 2 ký tự, chỉ chữ + space (regex \\p{L}\\s)", example: "\"Trần Thị B\"" },
    ],
    algorithm: [
      "FUNCTION changeName(name):",
      "    IF len(name.trim()) < 2:",
      "        RETURN 400 \"Name must be at least 2 characters\"",
      "    IF NOT regex /^[\\p{L}\\s]+$/u.test(name.trim()):",
      "        RETURN 400 \"Name must contain only letters\"",
      "    user = User.findByIdAndUpdate(req.user.id, { name: name.trim() }, { new: true })",
      "    RETURN 200 { user }",
    ],
    output: [
      { name: "user", type: "Object", constraint: "không có password", example: "{ _id, name: \"Trần Thị B\", ... }" },
    ],
  }),

  ...useCase({
    id: "4.4", name: "Upload Avatar — Up ảnh đại diện lên Cloudinary", status: "DONE",
    description: "Nhận file ảnh, resize 300×300, upload Cloudinary, lưu URL vào user.avatar.",
    input: [
      { name: "image (file)", type: "Buffer", constraint: "multipart/form-data, ≤ 5MB", example: "<binary jpg/png>" },
    ],
    algorithm: [
      "FUNCTION uploadAvatar(req):",
      "    IF NOT req.file:  RETURN 400 \"No image provided\"",
      "",
      "    // Stream upload với transformation",
      "    result = cloudinary.uploader.upload_stream({",
      "        folder: \"healthysnap/avatars\",",
      "        transformation: [{ width: 300, height: 300, crop: \"fill\" }]",
      "    }, callback)",
      "    result.end(req.file.buffer)",
      "",
      "    // Trong callback:",
      "    User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url })",
      "    RETURN 200 { avatar: result.secure_url }",
    ],
    output: [
      { name: "avatar", type: "String (URL)", constraint: "URL Cloudinary CDN", example: "\"https://res.cloudinary.com/.../avatar.jpg\"" },
    ],
  }),
];

// ─── 5. Meal CRUD ───────────────────────────────────────────────────────────
const sectionMeal = [
  h1("5. Meal CRUD"),

  ...useCase({
    id: "5.1", name: "Add Meal — Thêm bữa ăn", status: "DONE",
    description: "Lưu bữa ăn vào DB cho user hiện tại.",
    input: [
      { name: "name", type: "String", constraint: "≥ 2 ký tự, ≤ 100", example: "\"Phở bò\"" },
      { name: "mealType", type: "String", constraint: "breakfast/lunch/dinner/snack", example: "\"lunch\"" },
      { name: "calories", type: "Number", constraint: "0 ≤ x ≤ 9999", example: "450" },
      { name: "protein", type: "Number?", constraint: "default 0", example: "28" },
      { name: "carbs", type: "Number?", constraint: "default 0", example: "60" },
      { name: "fat", type: "Number?", constraint: "default 0", example: "12" },
      { name: "date", type: "String", constraint: "format YYYY-MM-DD", example: "\"2026-06-03\"" },
      { name: "image", type: "String?", constraint: "URL", example: "null" },
      { name: "note", type: "String?", constraint: "free text", example: "\"Thêm chả lụa\"" },
    ],
    algorithm: [
      "FUNCTION addMeal(body):",
      "    // Validation",
      "    IF !body.name OR !body.mealType OR body.calories === undefined OR !body.date:",
      "        RETURN 400 \"Required fields missing\"",
      "    IF body.mealType NOT IN [breakfast,lunch,dinner,snack]:  RETURN 400",
      "    IF body.calories < 0:                                    RETURN 400",
      "    IF NOT regex /^\\d{4}-\\d{2}-\\d{2}$/.test(body.date):      RETURN 400",
      "",
      "    meal = Meal.create({",
      "        user: req.user.id,",
      "        name: body.name.trim(),",
      "        mealType, calories,",
      "        protein: protein || 0,",
      "        carbs:   carbs || 0,",
      "        fat:     fat || 0,",
      "        date, image, note",
      "    })",
      "    RETURN 201 { meal }",
    ],
    output: [
      { name: "meal._id", type: "String", constraint: "MongoDB ObjectId", example: "\"66ff..\"" },
      { name: "meal.user", type: "String", constraint: "FK đến User", example: "\"6a0f0269...\"" },
      { name: "meal.name", type: "String", example: "\"Phở bò\"" },
      { name: "meal.createdAt", type: "Date", constraint: "auto timestamp", example: "\"2026-06-03T05:30:00Z\"" },
    ],
  }),

  ...useCase({
    id: "5.2", name: "Get Meals by Date — Lấy bữa ăn theo ngày + tính tổng", status: "DONE",
    description: "Trả về list meals trong 1 ngày kèm tổng calories và macros.",
    input: [
      { name: "date (query)", type: "String", constraint: "YYYY-MM-DD", example: "\"2026-06-03\"" },
    ],
    algorithm: [
      "FUNCTION getMealsByDate(date):",
      "    IF NOT regex /^\\d{4}-\\d{2}-\\d{2}$/.test(date):  RETURN 400",
      "",
      "    meals = Meal.find({ user: req.user.id, date })",
      "                .sort({ createdAt: 1 })",
      "",
      "    // Aggregate daily totals",
      "    totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }",
      "    FOR EACH m IN meals:",
      "        totals.calories += m.calories",
      "        totals.protein  += m.protein",
      "        totals.carbs    += m.carbs",
      "        totals.fat      += m.fat",
      "",
      "    RETURN 200 { date, meals, totals }",
    ],
    formula: [
      "totals.<macro> = Σ meal[i].<macro>  for i in meals(today)",
    ],
    output: [
      { name: "date", type: "String", constraint: "echo back", example: "\"2026-06-03\"" },
      { name: "meals", type: "Array<Meal>", constraint: "có thể rỗng", example: "[{...}, {...}]" },
      { name: "totals.calories", type: "Number", example: "1450" },
      { name: "totals.protein", type: "Number", example: "78" },
      { name: "totals.carbs", type: "Number", example: "185" },
      { name: "totals.fat", type: "Number", example: "38" },
    ],
  }),

  ...useCase({
    id: "5.3", name: "Get Meal History — Lịch sử bữa ăn theo khoảng ngày", status: "DONE",
    description: "Trả về meals trong khoảng [startDate, endDate], sort theo ngày giảm dần.",
    input: [
      { name: "startDate?", type: "String", constraint: "YYYY-MM-DD, optional", example: "\"2026-05-01\"" },
      { name: "endDate?", type: "String", constraint: "YYYY-MM-DD, optional", example: "\"2026-05-31\"" },
    ],
    algorithm: [
      "FUNCTION getMealHistory(startDate, endDate):",
      "    filter = { user: req.user.id }",
      "    IF startDate AND endDate:",
      "        filter.date = { $gte: startDate, $lte: endDate }",
      "    meals = Meal.find(filter).sort({ date: -1, createdAt: -1 })",
      "    RETURN 200 { meals }",
    ],
    output: [
      { name: "meals", type: "Array<Meal>", constraint: "sort theo date desc", example: "[{...}, {...}]" },
    ],
  }),

  ...useCase({
    id: "5.4", name: "Update Meal — Cập nhật bữa ăn", status: "DONE",
    description: "Update các field của 1 meal cụ thể (chỉ field nào được gửi mới update).",
    input: [
      { name: "id (param)", type: "String", constraint: "MongoDB ObjectId", example: "\"66ff...\"" },
      { name: "name?, mealType?, calories?, protein?, carbs?, fat?, image?, note?, date?", type: "varies", constraint: "tất cả optional", example: "{ calories: 500 }" },
    ],
    algorithm: [
      "FUNCTION updateMeal(id, body):",
      "    meal = Meal.findById(id)",
      "    IF NOT meal:                                    RETURN 404",
      "    IF meal.user.toString() !== req.user.id:        RETURN 403  // không phải của user",
      "",
      "    // Validate optional fields",
      "    IF body.mealType && NOT in [breakfast,...]:    RETURN 400",
      "    IF body.calories !== undefined && < 0:         RETURN 400",
      "    IF body.date && NOT YYYY-MM-DD:                RETURN 400",
      "",
      "    // Apply chỉ các field được gửi (partial update)",
      "    IF body.name !== undefined:      meal.name = body.name.trim()",
      "    IF body.calories !== undefined:  meal.calories = body.calories",
      "    ... (các field khác tương tự)",
      "",
      "    meal.save()",
      "    RETURN 200 { meal }",
    ],
    output: [
      { name: "meal", type: "Object", constraint: "đã update", example: "{ _id, name, calories, ... }" },
    ],
  }),

  ...useCase({
    id: "5.5", name: "Delete Meal — Xóa bữa ăn", status: "DONE",
    description: "Xóa meal khỏi DB nếu user là owner.",
    input: [
      { name: "id (param)", type: "String", constraint: "ObjectId của meal", example: "\"66ff...\"" },
    ],
    algorithm: [
      "FUNCTION deleteMeal(id):",
      "    meal = Meal.findById(id)",
      "    IF NOT meal:                              RETURN 404",
      "    IF meal.user.toString() !== req.user.id:  RETURN 403",
      "    meal.deleteOne()",
      "    RETURN 200 \"Meal deleted successfully\"",
    ],
    output: [
      { name: "message", type: "String", example: "\"Meal deleted successfully\"" },
    ],
  }),
];

// ─── 6. AI Scan ─────────────────────────────────────────────────────────────
const sectionScan = [
  h1("6. AI Scan (Photo + Barcode)"),

  ...useCase({
    id: "6.1", name: "Scan Photo — Nhận diện món ăn từ ảnh (Gemini Vision)", status: "DONE",
    description: "Upload ảnh → Gemini Vision phân tích → trả top 3 candidates với ước lượng dinh dưỡng.",
    input: [
      { name: "image (file)", type: "Buffer", constraint: "JPG/PNG, ≤ 8MB, multipart", example: "<binary>" },
    ],
    algorithm: [
      "FUNCTION scanPhoto(req):",
      "    IF NOT req.file:  RETURN 400 \"No image provided\"",
      "",
      "    // 1) Convert image → base64",
      "    imageBase64 = req.file.buffer.toString(\"base64\")",
      "    mimeType    = req.file.mimetype OR \"image/jpeg\"",
      "",
      "    // 2) Build prompt cho Gemini (yêu cầu JSON top 3 candidates)",
      "    prompt = `You are a nutrition expert...",
      "             Return top 3 candidates as JSON:",
      "             { candidates: [{ name, confidence, calories,",
      "                              protein, carbs, fat,",
      "                              portionDescription }, ...] }`",
      "",
      "    // 3) Call Gemini API",
      "    result = visionModel.generateContent([",
      "        prompt,",
      "        { inlineData: { data: imageBase64, mimeType } }",
      "    ])",
      "",
      "    // 4) Parse JSON response (Gemini đã force responseMimeType=application/json)",
      "    text = result.response.text()",
      "    TRY:",
      "        parsed = JSON.parse(text)",
      "    EXCEPT:",
      "        RETURN 500 \"AI returned invalid format\"",
      "",
      "    IF parsed.error:",
      "        RETURN 422 { message: parsed.error, candidates: [] }",
      "",
      "    RETURN 200 { candidates: parsed.candidates }",
    ],
    output: [
      { name: "candidates", type: "Array<Candidate>", constraint: "top 3, sort theo confidence desc", example: "[{...}, {...}, {...}]" },
      { name: "candidate.name", type: "String", constraint: "tên món (tiếng Việt nếu món Việt)", example: "\"Phở Bò\"" },
      { name: "candidate.confidence", type: "Number", constraint: "0.0 – 1.0", example: "0.92" },
      { name: "candidate.calories", type: "Number", constraint: "ước lượng theo khẩu phần", example: "450" },
      { name: "candidate.protein/carbs/fat", type: "Number", constraint: "grams", example: "28, 60, 12" },
      { name: "candidate.portionDescription", type: "String", constraint: "mô tả khẩu phần", example: "\"1 medium bowl\"" },
    ],
  }),

  ...useCase({
    id: "6.2", name: "Scan Barcode — Tra cứu sản phẩm đóng gói (Open Food Facts)", status: "DONE (backend only)",
    description: "Lookup mã vạch trong DB Open Food Facts, normalize nutrition về per-100g và per-serving.",
    input: [
      { name: "barcode", type: "String", constraint: "8–14 chữ số", example: "\"8934563138189\"" },
    ],
    algorithm: [
      "FUNCTION scanBarcode(barcode):",
      "    IF NOT regex /^\\d{8,14}$/.test(barcode):  RETURN 400",
      "",
      "    url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`",
      "    data = axios.get(url, timeout: 5000)",
      "",
      "    IF data.status !== 1 OR NOT data.product:",
      "        RETURN 404 \"Product not found\"",
      "",
      "    p = data.product",
      "    nutriments = p.nutriments OR {}",
      "",
      "    // Normalize per-100g → per-serving",
      "    servingQty = parseFloat(p.serving_quantity) OR 100",
      "    ratio = servingQty / 100",
      "",
      "    RETURN 200 {",
      "        product: {",
      "            name:     p.product_name OR \"Unknown\",",
      "            brand:    p.brands,",
      "            image:    p.image_url,",
      "            servingSize: p.serving_size OR \"100g\",",
      "            calories:  ROUND(nutriments.energy_kcal_100g × ratio),",
      "            protein:   ROUND(nutriments.proteins_100g × ratio × 10) / 10,",
      "            carbs:     ROUND(nutriments.carbohydrates_100g × ratio × 10) / 10,",
      "            fat:       ROUND(nutriments.fat_100g × ratio × 10) / 10,",
      "            per100g:   { calories, protein, carbs, fat }   // reference",
      "        }",
      "    }",
    ],
    formula: [
      "ratio = servingQuantity / 100",
      "calories_per_serving = calories_per_100g × ratio",
      "Ví dụ: Mì gói 75g, 380 kcal/100g → 380 × 0.75 = 285 kcal/gói",
    ],
    output: [
      { name: "product.name", type: "String", example: "\"Mì Hảo Hảo Tôm Chua Cay\"" },
      { name: "product.brand", type: "String | NULL", example: "\"Acecook\"" },
      { name: "product.image", type: "String (URL)", example: "\"https://...\"" },
      { name: "product.servingSize", type: "String", example: "\"75g\"" },
      { name: "product.calories", type: "Number", constraint: "per serving", example: "285" },
      { name: "product.per100g", type: "Object", constraint: "reference per 100g", example: "{ calories: 380, ... }" },
    ],
  }),
];

// ─── 7. Planned use cases ──────────────────────────────────────────────────
const sectionPlanned = [
  h1("7. Planned Use Cases (Chưa triển khai)"),

  ...useCase({
    id: "7.1", name: "Create Meal Plan — Tạo kế hoạch bữa ăn tuần", status: "TODO",
    description: "Tạo plan 7 ngày với các slot meal (breakfast/lunch/dinner/snack).",
    input: [
      { name: "weekStartDate", type: "String", constraint: "thứ 2, YYYY-MM-DD", example: "\"2026-08-10\"" },
      { name: "slots", type: "Array<Slot>", constraint: "tối đa 7×4 = 28 slot", example: "[{day:1, mealType:'breakfast', mealId:...}]" },
    ],
    algorithm: [
      "FUNCTION createMealPlan(weekStartDate, slots):",
      "    // Validate weekStartDate là thứ 2",
      "    IF dayOfWeek(weekStartDate) !== MONDAY:  RETURN 400",
      "",
      "    // Validate slots",
      "    FOR slot IN slots:",
      "        IF slot.day NOT IN 0..6:                       RETURN 400",
      "        IF slot.mealType NOT IN [breakfast,...]:       RETURN 400",
      "",
      "    plan = MealPlan.create({",
      "        user: req.user.id,",
      "        weekStartDate,",
      "        slots,",
      "        weeklyTotals: aggregateNutrition(slots)  // tính tổng tuần",
      "    })",
      "    RETURN 201 { plan }",
    ],
    formula: [
      "weeklyTotals.calories = Σ slot.calories  for slot in plan.slots",
    ],
    output: [
      { name: "plan._id", type: "String", example: "\"...\"" },
      { name: "plan.weekStartDate", type: "String", example: "\"2026-08-10\"" },
      { name: "plan.slots", type: "Array", example: "[{day, mealType, mealId, name, calories, ...}]" },
      { name: "plan.weeklyTotals", type: "Object", example: "{ calories: 14000, protein: 700, ... }" },
    ],
  }),

  ...useCase({
    id: "7.2", name: "Log Water — Ghi nhận lượng nước uống", status: "TODO",
    description: "Log 1 lần uống nước, accumulate tổng ngày.",
    input: [
      { name: "amount", type: "Number", constraint: "ml, 10 ≤ x ≤ 5000", example: "250" },
      { name: "date", type: "String?", constraint: "default today", example: "\"2026-06-03\"" },
    ],
    algorithm: [
      "FUNCTION logWater(amount, date):",
      "    IF amount < 10 OR amount > 5000:  RETURN 400",
      "    date = date OR TODAY()",
      "",
      "    log = WaterLog.create({ user: req.user.id, amount, date })",
      "    dailyTotal = WaterLog.aggregate({ user, date }) sum amount",
      "    RETURN 201 { log, dailyTotal, goal: 2000 }",
    ],
    output: [
      { name: "log", type: "Object", example: "{ _id, amount: 250, date, createdAt }" },
      { name: "dailyTotal", type: "Number", constraint: "ml uống trong ngày", example: "1750" },
      { name: "goal", type: "Number", constraint: "default 2000ml", example: "2000" },
    ],
  }),

  ...useCase({
    id: "7.3", name: "Log Exercise — Ghi nhận vận động + tính calo đốt", status: "TODO",
    description: "Log hoạt động + tính calo đốt theo MET formula.",
    input: [
      { name: "activity", type: "String", constraint: "walking/running/cycling/...", example: "\"running\"" },
      { name: "durationMin", type: "Number", constraint: "1–600 phút", example: "30" },
      { name: "intensity?", type: "String", constraint: "low/moderate/high", example: "\"moderate\"" },
    ],
    algorithm: [
      "FUNCTION logExercise(activity, durationMin, intensity):",
      "    user = User.findById(req.user.id)",
      "    weight = user.weight",
      "    metValue = MET_TABLE[activity][intensity]   // bảng MET chuẩn",
      "",
      "    // Calo đốt = MET × weight(kg) × duration(hour)",
      "    caloriesBurned = metValue × weight × (durationMin / 60)",
      "",
      "    log = ExerciseLog.create({",
      "        user, activity, durationMin, intensity,",
      "        caloriesBurned: ROUND(caloriesBurned),",
      "        date: TODAY()",
      "    })",
      "    RETURN 201 { log }",
    ],
    formula: [
      "Calories burned = MET × Weight(kg) × Time(hours)",
      "Ví dụ: Running moderate (MET=7), 65kg, 30 phút",
      "    = 7 × 65 × 0.5 = 227.5 kcal",
    ],
    output: [
      { name: "log.activity", type: "String", example: "\"running\"" },
      { name: "log.durationMin", type: "Number", example: "30" },
      { name: "log.caloriesBurned", type: "Number", constraint: "tính bằng MET formula", example: "228" },
    ],
  }),

  ...useCase({
    id: "7.4", name: "AI Coach Analyze — Phân tích thói quen và gợi ý", status: "TODO",
    description: "Phân tích meal history → AI sinh insights cá nhân hóa dựa trên goal + conditions.",
    input: [
      { name: "user.id", type: "String", constraint: "Từ JWT", example: "\"6a0f...\"" },
      { name: "daysToAnalyze?", type: "Number", constraint: "default 7", example: "7" },
    ],
    algorithm: [
      "FUNCTION analyzeWithAI(userId, days):",
      "    user = User.findById(userId)",
      "    meals = Meal.find({ user: userId, date: last N days })",
      "",
      "    IF meals.length < 3:",
      "        RETURN 200 { insights: [], message: \"Need more data\" }",
      "",
      "    // Compute stats",
      "    avgDailyCalories  = Σ calories / days",
      "    avgDailyProtein   = Σ protein / days",
      "    macroRatios       = (P : C : F) in percentages",
      "    excessSugarDays   = count(days where sugar > 50g)",
      "    missingMeals      = count(slots empty)",
      "",
      "    // Build context for AI",
      "    prompt = `User profile: goal=${user.goal}, conditions=${user.conditions},",
      "             calorieGoal=${user.calorieGoal}.",
      "             Stats: ${avgDailyCalories}, ${macroRatios}, ...",
      "             Generate 3 actionable insights in Vietnamese,",
      "             prioritize health condition warnings.`",
      "",
      "    response = geminiTextModel.generateContent(prompt)",
      "    insights = JSON.parse(response.text)",
      "    RETURN 200 { insights, stats }",
    ],
    output: [
      { name: "insights", type: "Array<Insight>", constraint: "3 items, có priority", example: "[{type, severity, message, suggestion}]" },
      { name: "insights[i].type", type: "String", constraint: "warning/suggestion/info", example: "\"warning\"" },
      { name: "insights[i].severity", type: "String", constraint: "low/medium/high", example: "\"high\"" },
      { name: "stats", type: "Object", example: "{ avgCalories, macroRatios, ... }" },
    ],
  }),

  ...useCase({
    id: "7.5", name: "Get Weekly Stats — Thống kê tuần (chart data)", status: "TODO",
    description: "Aggregate meals trong 7 ngày, trả chart data sẵn cho frontend render.",
    input: [
      { name: "endDate?", type: "String", constraint: "default today", example: "\"2026-06-03\"" },
    ],
    algorithm: [
      "FUNCTION getWeeklyStats(endDate):",
      "    end   = endDate OR TODAY()",
      "    start = end − 6 days",
      "",
      "    meals = Meal.find({ user, date: { $gte: start, $lte: end } })",
      "",
      "    // Group by date",
      "    daily = {}",
      "    FOR d IN range(start, end):",
      "        daily[d] = { calories: 0, protein: 0, carbs: 0, fat: 0 }",
      "    FOR m IN meals:",
      "        daily[m.date].calories += m.calories",
      "        ... (các macro khác)",
      "",
      "    // Compute totals + averages",
      "    totals      = aggregateAll(daily)",
      "    averages    = totals / 7",
      "    completion  = totals.calories / (user.calorieGoal × 7) × 100",
      "",
      "    RETURN 200 { daily, totals, averages, completion }",
    ],
    formula: [
      "completion (%) = totalKcalThisWeek / (calorieGoal × 7) × 100",
      "macroRatio (%) = macro × 4 (or 9 for fat) / totalKcal × 100",
    ],
    output: [
      { name: "daily", type: "Object", constraint: "7 entries, key = date", example: "{ '2026-06-03': { calories: 1800, ... } }" },
      { name: "totals", type: "Object", example: "{ calories: 14000, ... }" },
      { name: "averages", type: "Object", example: "{ calories: 2000, ... }" },
      { name: "completion", type: "Number", constraint: "% completion calorie goal", example: "95" },
    ],
  }),

  ...useCase({
    id: "7.6", name: "Create Post — Đăng bài lên feed (Community)", status: "TODO",
    description: "Tạo post chia sẻ bữa ăn, attach meal (optional), upload ảnh.",
    input: [
      { name: "caption", type: "String", constraint: "≤ 500 ký tự", example: "\"Bữa trưa nay thanh đạm 😋\"" },
      { name: "mealId?", type: "String", constraint: "ObjectId của meal đã log", example: "\"66ff...\"" },
      { name: "image?", type: "File", constraint: "≤ 5MB", example: "<binary>" },
    ],
    algorithm: [
      "FUNCTION createPost(caption, mealId, image):",
      "    IF caption.length > 500:  RETURN 400",
      "",
      "    // Upload ảnh nếu có",
      "    imageUrl = NULL",
      "    IF image:",
      "        imageUrl = cloudinary.upload(image, { folder: \"healthysnap/posts\" })",
      "",
      "    // Validate meal (nếu có) phải của chính user",
      "    IF mealId:",
      "        meal = Meal.findById(mealId)",
      "        IF meal.user !== req.user.id:  RETURN 403",
      "",
      "    post = Post.create({",
      "        user: req.user.id,",
      "        caption, mealId, image: imageUrl,",
      "        likes: [], createdAt: NOW()",
      "    })",
      "    RETURN 201 { post }",
    ],
    output: [
      { name: "post._id", type: "String", example: "\"...\"" },
      { name: "post.caption", type: "String", example: "\"Bữa trưa nay thanh đạm\"" },
      { name: "post.mealId", type: "String | NULL", example: "\"66ff...\"" },
      { name: "post.image", type: "String (URL) | NULL", example: "\"https://...\"" },
      { name: "post.likes", type: "Array<UserId>", constraint: "default []", example: "[]" },
    ],
  }),

  ...useCase({
    id: "7.7", name: "Toggle Language — Đổi ngôn ngữ UI", status: "TODO",
    description: "Lưu lựa chọn ngôn ngữ và áp dụng i18n cho toàn bộ UI strings.",
    input: [
      { name: "lang", type: "String", constraint: "en | vi", example: "\"vi\"" },
    ],
    algorithm: [
      "FUNCTION toggleLanguage(lang):",
      "    IF lang NOT IN [\"en\", \"vi\"]:  RETURN 400",
      "",
      "    // Lưu vào AsyncStorage (frontend)",
      "    AsyncStorage.setItem(\"language\", lang)",
      "",
      "    // Update user preference trong DB",
      "    User.findByIdAndUpdate(req.user.id, { language: lang })",
      "",
      "    // Reload i18n",
      "    i18n.changeLanguage(lang)",
      "",
      "    RETURN 200 { language: lang }",
    ],
    output: [
      { name: "language", type: "String", example: "\"vi\"" },
    ],
  }),
];

// ─── 8. Common Patterns ─────────────────────────────────────────────────────
const sectionCommon = [
  h1("8. Common Pattern — JWT Authentication Middleware"),
  p("Mọi protected endpoint đều đi qua middleware này TRƯỚC khi vào controller chính."),

  ...useCase({
    id: "8.1", name: "Auth Middleware (protect)", status: "DONE",
    description: "Middleware verify JWT từ Authorization header, set req.user.id để các controller bên dưới dùng.",
    input: [
      { name: "req.headers.authorization", type: "String", constraint: "\"Bearer <JWT>\"", example: "\"Bearer eyJ...\"" },
    ],
    algorithm: [
      "FUNCTION protect(req, res, next):",
      "    authHeader = req.headers.authorization",
      "    IF NOT authHeader OR NOT startsWith(\"Bearer \"):",
      "        RETURN 401 \"No token provided\"",
      "",
      "    token = authHeader.split(\" \")[1]",
      "",
      "    TRY:",
      "        decoded = jwt.verify(token, JWT_SECRET)",
      "    EXCEPT InvalidTokenError:",
      "        RETURN 401 \"Invalid or expired token\"",
      "",
      "    // Gắn user.id vào request cho controller tiếp theo",
      "    req.user = { id: decoded.id }",
      "    next()  // chuyển sang controller",
    ],
    output: [
      { name: "req.user.id (side effect)", type: "String", constraint: "Có sẵn cho controllers bên dưới", example: "\"6a0f...\"" },
    ],
  }),
];

// ─── Final Document ────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Le Mac Hoang King",
  title: "Data Flow - Meal Snap",
  description: "Input/Algorithm/Output documentation cho mỗi use case",

  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
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
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Meal Snap — Luồng xử lý dữ liệu", italics: true, size: 18, color: "888888" })],
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
      ...overview,
      ...sectionHelpers,
      ...sectionAuth,
      ...sectionProfile,
      ...sectionMeal,
      ...sectionScan,
      ...sectionPlanned,
      ...sectionCommon,
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "..", "Architecture_Diagram_v2.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("✅ Generated:", outPath);
  console.log("📄 File size:", (buffer.length / 1024).toFixed(1), "KB");
});
