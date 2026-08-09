// ═══ FILE NÀY LÀM GÌ ═══
// Bỏ dấu tiếng Việt và hạ chữ thường, để so khớp chữ không phụ thuộc cách gõ.
//
// Ai gọi tới: services/nutrition/foodSafetyFilter (so tên món), services/coach/
//             coachScope (dò từ khóa ngoài phạm vi), coachLanguage (dò câu xin
//             đổi ngôn ngữ), coachResponse (so hai câu trả lời có trùng nhau không)
// Nhận vào:   một chuỗi bất kỳ, hoặc null
// Trả ra:     chuỗi chỉ còn a tới z, số, và một dấu cách giữa các từ
// Khi lỗi:    không có nhánh lỗi, giá trị lạ được ép về chuỗi rỗng
//
// Nhớ: bỏ dấu làm mất nghĩa của từ tiếng Việt NGẮN, ví dụ bò bó bơ bỏ đều thành bo.
//      Nơi nào cần phân biệt mấy từ đó thì phải so thêm trên chuỗi CÓ dấu.
const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    // NFD bỏ được dấu thanh nhưng không chuyển đ thành d, nên xử lý đ riêng.
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

module.exports = { normalizeText };
