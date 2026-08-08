// ═══ FILE NÀY LÀM GÌ ═══
// Chuẩn bị sẵn đường gọi tới Gemini, là AI mà app thuê nghĩ hộ.
// Nơi khác chỉ việc lấy ra dùng.
//
// Ai gọi tới: scanController (nhìn ảnh đoán món), coachController (trò chuyện,
//             chấm điểm sức khỏe), planController (tạo thực đơn tuần)
// Nhận vào:   khóa Gemini ghi trong file .env
// Trả ra:     bốn bộ, mỗi bộ chỉnh sẵn cho một việc
// Khi lỗi:    không có khóa thì in cảnh báo lúc mở server, và người dùng bấm
//             vào chức năng AI nào cũng sẽ báo lỗi
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gom khóa từ .env về một danh sách.
// Khai được nhiều khóa để hết lượt cái này còn cái kia.
// Mỗi dòng còn ghi được nhiều khóa nữa, ngăn nhau bằng dấu phẩy.
const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
]
  .filter(Boolean)
  .flatMap((k) => k.split(",").map((s) => s.trim()))
  .filter(Boolean);

// In ngay lúc mở server, để biết mình quên khóa từ đầu
// thay vì tới lúc người dùng bấm quét ảnh mới hỏng.
if (KEYS.length === 0) {
  console.warn("⚠️  No GEMINI_API_KEY set in .env — AI features will not work");
} else {
  console.log(`Gemini: ${KEYS.length} API key(s) loaded`);
}

// ══════════════════════════════════════════════════════════
// DỰNG BẢNG ĐƯỜNG GỌI AI
//
// Không ai gọi, cả khối chạy MỘT LẦN lúc server nạp file này.
// Ba bước, đọc từ trên xuống là đúng thứ tự.
// Xong thì các controller lấy bảng ra, thử lần lượt từ trên xuống,
// hỏng cách này thì tụt sang cách sau.
// ══════════════════════════════════════════════════════════

// DỰNG BẢNG BƯỚC 1. Mỗi khóa tạo một đường gọi riêng.
const clients = KEYS.map((k) => new GoogleGenerativeAI(k));

// DỰNG BẢNG BƯỚC 2. Model là các bản Gemini khác nhau, con khỏe con nhẹ.
// Đây là thứ tự gọi chứ không phải danh sách chọn: con đầu hỏng thì tụt xuống con sau.
const TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
// Model cho việc nhìn ảnh đoán món. Hiện dùng đúng danh sách như phần chữ.
const VISION_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
// Chat giữ flash ở đầu vì câu trả lời cần model mạnh nhất. flash-lite nằm giữa
// làm chỗ lui khi flash hết lượt, vì flash-latest hay chạm trần thời gian chờ.
const CHAT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];

// DỰNG BẢNG BƯỚC 3. Ghép mỗi khóa với mỗi model. Hiện có 3 khóa và 3 model nên ra 9 cách gọi.
// Cách này hỏng thì thử cách khác, nên hết lượt một khóa chưa làm app chết.
function buildModels(names, generationConfig) {
  return clients.flatMap((client) =>
    names.map((model) => client.getGenerativeModel({ model, generationConfig }))
  );
}

// Tắt bước suy nghĩ để AI trả lời nhanh hơn, vì các việc này đã có khuôn JSON sẵn.
const NO_THINKING = { thinkingConfig: { thinkingBudget: 0 } };

// temperature = mức được phép bịa. Để 0 là hỏi lại ra y hệt câu cũ.

// 0.2 nhìn ảnh, phải bám thứ nhìn thấy nên gần như không được đoán
const visionModels = buildModels(VISION_MODELS, { temperature: 0.2, responseMimeType: "application/json", ...NO_THINKING });

// 0.3 lời khuyên, linh hoạt vừa đủ để không lặp lại y hệt
const insightModels = buildModels(TEXT_MODELS, { temperature: 0.3, responseMimeType: "application/json", ...NO_THINKING });

// 0 tính calo, cùng một món phải luôn ra cùng một số
const nutritionModels = buildModels(TEXT_MODELS, { temperature: 0, responseMimeType: "application/json", ...NO_THINKING });

// 0.75 trò chuyện, cần tự nhiên nhất nên thả lỏng nhất
const chatModels = buildModels(CHAT_MODELS, { temperature: 0.75, responseMimeType: "application/json", ...NO_THINKING });

module.exports = { visionModels, insightModels, nutritionModels, chatModels };
