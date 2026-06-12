/**
 * Generate HealthySnap_Academic_References.docx — danh mục tài liệu học thuật
 * liên quan tới đồ án, nhóm theo chủ đề, kèm tóm tắt + liên hệ với dự án.
 * Run: node scripts/generate-references.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun,
  Footer, AlignmentType, LevelFormat, HeadingLevel,
  PageNumber,
} = require("docx");

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

// One reference entry: numbered citation + summary + relevance
let refCounter = 0;
function ref({ cite, summary, relevance }) {
  refCounter++;
  return [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({ text: `[${refCounter}] `, bold: true, color: "1D4ED8" }),
        new TextRun({ text: cite, bold: true }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [new TextRun({ text: summary, size: 20 })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: "Liên hệ đồ án: ", bold: true, size: 20, color: "1A9D58" }),
        new TextRun({ text: relevance, size: 20, italics: true }),
      ],
    }),
  ];
}

const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "DANH MỤC TÀI LIỆU HỌC THUẬT THAM KHẢO", bold: true, size: 32 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Đồ án Meal Snap (HealthySnap) — COMP-1682 · Lê Mạc Hoàng King", size: 22, color: "2563EB" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({
      text: "⚠️ Lưu ý: danh sách do AI tổng hợp để định hướng literature review. Trước khi đưa vào báo cáo chính thức, cần tự tra cứu lại từng bài (Google Scholar / DOI) để xác minh thông tin xuất bản chính xác.",
      size: 18, italics: true, color: "B45309",
    })],
  }),

  // ════════════════════════════════════════════════════════════
  h1("1. Nhận diện món ăn bằng thị giác máy tính & AI"),
  ...ref({
    cite: "Bossard, L., Guillaumin, M., & Van Gool, L. (2014). Food-101 – Mining Discriminative Components with Random Forests. European Conference on Computer Vision (ECCV).",
    summary: "Công bố bộ dữ liệu Food-101 gồm 101.000 ảnh của 101 món ăn — benchmark kinh điển nhất cho bài toán nhận diện món ăn.",
    relevance: "Trích dẫn khi trình bày tổng quan bài toán food recognition và lý do nó là bài toán khó (món ăn biến dạng, nhiều thành phần).",
  }),
  ...ref({
    cite: "Meyers, A., et al. (2015). Im2Calories: Towards an Automated Mobile Vision Food Diary. IEEE International Conference on Computer Vision (ICCV).",
    summary: "Hệ thống của Google ước lượng calo trực tiếp từ ảnh món ăn trên di động: nhận diện món, phân đoạn, ước lượng thể tích và quy ra năng lượng.",
    relevance: "Tiền thân học thuật trực tiếp của tính năng AI Scan trong Meal Snap — so sánh cách tiếp cận CNN chuyên dụng (2015) với multimodal LLM (2026).",
  }),
  ...ref({
    cite: "Thames, Q., et al. (2021). Nutrition5k: Towards Automatic Nutritional Understanding of Generic Food. IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR).",
    summary: "Bộ dữ liệu của Google Research gồm 5.000 đĩa thức ăn thật với thành phần dinh dưỡng đo chính xác; chứng minh mô hình thị giác có thể dự đoán calo/macro trực tiếp từ ảnh tốt hơn chuyên gia dinh dưỡng trong một số điều kiện.",
    relevance: "Căn cứ học thuật cho việc tin tưởng ước lượng dinh dưỡng từ ảnh — dùng để bảo vệ độ tin cậy của tính năng scan trước hội đồng.",
  }),
  ...ref({
    cite: "Min, W., Jiang, S., Liu, L., Rui, Y., & Jain, R. (2019). A Survey on Food Computing. ACM Computing Surveys, 52(5).",
    summary: "Khảo sát toàn diện lĩnh vực food computing: nhận diện, truy xuất, gợi ý món ăn, ước lượng dinh dưỡng và các ứng dụng sức khỏe.",
    relevance: "Bài survey 'xương sống' cho chương tổng quan (related work) của báo cáo.",
  }),
  ...ref({
    cite: "Nguyen, T. T., et al. (2021). VinaFood21: A Novel Dataset for Evaluating Vietnamese Food Recognition. arXiv preprint.",
    summary: "Bộ dữ liệu ảnh món ăn Việt Nam (21 món phổ biến như phở, bún bò, cơm tấm) phục vụ đánh giá mô hình nhận diện món Việt.",
    relevance: "Chứng minh nhận diện món ăn Việt là bài toán được cộng đồng quan tâm; lý giải vì sao Meal Snap chọn LLM đa phương thức (hiểu ngữ cảnh món Việt) thay vì model phân loại đóng.",
  }),
  ...ref({
    cite: "Gemini Team, Google (2024). Gemini: A Family of Highly Capable Multimodal Models. arXiv:2312.11805.",
    summary: "Báo cáo kỹ thuật về họ mô hình Gemini — kiến trúc đa phương thức xử lý đồng thời văn bản và hình ảnh.",
    relevance: "Trích dẫn chính thức cho công nghệ AI vision mà Meal Snap sử dụng (Gemini 2.5 Flash).",
  }),

  // ════════════════════════════════════════════════════════════
  h1("2. Đánh giá khẩu phần ăn qua ảnh (Image-based Dietary Assessment)"),
  ...ref({
    cite: "Martin, C. K., et al. (2009). A novel method to remotely measure food intake of free-living individuals in real time: the Remote Food Photography Method. British Journal of Nutrition, 101(3).",
    summary: "Đề xuất phương pháp đo lượng ăn từ xa bằng ảnh chụp bữa ăn (RFPM), được kiểm chứng về độ tin cậy so với phương pháp truyền thống.",
    relevance: "Nền tảng phương pháp luận cho việc 'chụp ảnh thay vì nhập tay' — triết lý cốt lõi của Meal Snap.",
  }),
  ...ref({
    cite: "Gemming, L., Utter, J., & Ni Mhurchu, C. (2015). Image-assisted dietary assessment: a systematic review of the evidence. Journal of the Academy of Nutrition and Dietetics, 115(1).",
    summary: "Tổng quan hệ thống cho thấy đánh giá khẩu phần có hỗ trợ hình ảnh cải thiện độ chính xác và giảm gánh nặng ghi chép so với tự khai báo.",
    relevance: "Bằng chứng khoa học rằng cách tiếp cận bằng ảnh của Meal Snap vượt trội nhập liệu thủ công về trải nghiệm và độ chính xác.",
  }),
  ...ref({
    cite: "Cordeiro, F., et al. (2015). Rethinking the Mobile Food Journal: Exploring Opportunities for Lightweight Photo-Based Capture. ACM CHI Conference on Human Factors in Computing Systems.",
    summary: "Nghiên cứu HCI chỉ ra người dùng bỏ cuộc với food journal truyền thống vì quá phiền; ghi chép bằng ảnh 'nhẹ' giữ chân người dùng tốt hơn.",
    relevance: "Căn cứ thiết kế UX: flow chụp → AI điền sẵn → xác nhận 1 chạm của Meal Snap chính là 'lightweight capture' mà bài này khuyến nghị.",
  }),

  // ════════════════════════════════════════════════════════════
  h1("3. Công thức & chỉ số sinh lý học sử dụng trong app"),
  ...ref({
    cite: "Mifflin, M. D., St Jeor, S. T., et al. (1990). A new predictive equation for resting energy expenditure in healthy individuals. The American Journal of Clinical Nutrition, 51(2).",
    summary: "Công bố phương trình Mifflin-St Jeor ước tính năng lượng chuyển hóa cơ bản (BMR) từ cân nặng, chiều cao, tuổi, giới tính — được ADA đánh giá là chính xác nhất cho người trưởng thành.",
    relevance: "Đây CHÍNH LÀ công thức backend Meal Snap dùng để tính TDEE và gợi ý mục tiêu calo. Bắt buộc trích dẫn.",
  }),
  ...ref({
    cite: "Harris, J. A., & Benedict, F. G. (1918). A Biometric Study of Human Basal Metabolism. Proceedings of the National Academy of Sciences, 4(12).",
    summary: "Phương trình BMR đầu tiên trong lịch sử — tiền đề của mọi công thức ước tính năng lượng sau này.",
    relevance: "Trích dẫn khi so sánh và giải thích vì sao chọn Mifflin-St Jeor thay vì Harris-Benedict (chính xác hơn với người hiện đại).",
  }),
  ...ref({
    cite: "World Health Organization (2000). Obesity: Preventing and Managing the Global Epidemic. WHO Technical Report Series 894.",
    summary: "Tài liệu chuẩn của WHO định nghĩa ngưỡng phân loại BMI: gầy (<18.5), bình thường (18.5–24.9), thừa cân (25–29.9), béo phì (≥30).",
    relevance: "Căn cứ cho bảng phân loại BMI hiển thị trong Profile của app.",
  }),
  ...ref({
    cite: "Ainsworth, B. E., et al. (2011). 2011 Compendium of Physical Activities: a second update of codes and MET values. Medicine & Science in Sports & Exercise, 43(8).",
    summary: "Bảng tra cứu chuẩn giá trị MET cho hàng trăm hoạt động thể chất, dùng tính calo tiêu hao: kcal = MET × cân nặng × thời gian.",
    relevance: "Công thức tính calo đốt cháy cho tính năng theo dõi vận động (Phase 2) lấy trực tiếp từ tài liệu này.",
  }),

  // ════════════════════════════════════════════════════════════
  h1("4. Hiệu quả của ứng dụng di động với quản lý cân nặng (mHealth)"),
  ...ref({
    cite: "Burke, L. E., Wang, J., & Sevick, M. A. (2011). Self-monitoring in weight loss: a systematic review of the literature. Journal of the American Dietetic Association, 111(1).",
    summary: "Tổng quan hệ thống khẳng định tự theo dõi (ghi chép ăn uống, cân nặng) là yếu tố dự báo mạnh nhất cho giảm cân thành công.",
    relevance: "Trả lời câu hỏi gốc rễ 'vì sao app theo dõi dinh dưỡng có ích?' — mở đầu phần đặt vấn đề của báo cáo.",
  }),
  ...ref({
    cite: "Carter, M. C., Burley, V. J., Nykjaer, C., & Cade, J. E. (2013). Adherence to a smartphone application for weight loss compared to website and paper diary: pilot randomized controlled trial. Journal of Medical Internet Research, 15(4).",
    summary: "RCT với app 'My Meal Mate': nhóm dùng app smartphone bám trụ ghi chép tốt hơn hẳn nhóm dùng website hoặc sổ giấy, và giảm cân nhiều hơn.",
    relevance: "Bằng chứng app di động > phương pháp truyền thống — biện minh cho lựa chọn nền tảng mobile.",
  }),
  ...ref({
    cite: "Flores Mateo, G., Granado-Font, E., Ferré-Grau, C., & Montaña-Carreras, X. (2015). Mobile Phone Apps to Promote Weight Loss and Increase Physical Activity: A Systematic Review and Meta-Analysis. Journal of Medical Internet Research, 17(11).",
    summary: "Meta-analysis cho thấy can thiệp qua app di động tạo ra giảm cân và giảm BMI có ý nghĩa thống kê so với nhóm chứng.",
    relevance: "Số liệu định lượng cho phần đặt vấn đề / ý nghĩa thực tiễn của đề tài.",
  }),
  ...ref({
    cite: "Lieffers, J. R., & Hanning, R. M. (2012). Dietary assessment and self-monitoring with nutrition applications for mobile devices. Canadian Journal of Dietetic Practice and Research, 73(3).",
    summary: "Đánh giá các ứng dụng dinh dưỡng di động thời kỳ đầu: tiện lợi nhưng hạn chế về cơ sở dữ liệu món ăn và nhập liệu thủ công.",
    relevance: "Chỉ ra khoảng trống (gap) mà Meal Snap lấp: nhận diện tự động bằng AI thay vì tra cứu thủ công.",
  }),

  // ════════════════════════════════════════════════════════════
  h1("5. Yếu tố xã hội & thay đổi hành vi (cho hướng Community kiểu WEAR)"),
  ...ref({
    cite: "Laranjo, L., et al. (2015). The influence of social networking sites on health behavior change: a systematic review and meta-analysis. Journal of the American Medical Informatics Association, 22(1).",
    summary: "Tổng quan hệ thống: can thiệp sức khỏe qua mạng xã hội tạo thay đổi hành vi tích cực có ý nghĩa thống kê.",
    relevance: "Căn cứ học thuật TRỰC TIẾP cho định hướng cộng đồng chia sẻ kiểu WEAR của Meal Snap.",
  }),
  ...ref({
    cite: "Hwang, K. O., et al. (2010). Social support in an Internet weight loss community. International Journal of Medical Informatics, 79(1).",
    summary: "Phân tích cộng đồng giảm cân trực tuyến: sự khích lệ, chia sẻ kinh nghiệm và cảm giác trách nhiệm với nhóm là động lực duy trì chính.",
    relevance: "Giải thích vì sao tính năng đăng bài + follow (không cần chat) vẫn đủ tạo social support — đúng thiết kế Meal Snap chọn.",
  }),
  ...ref({
    cite: "Maher, C. A., et al. (2014). Are health behavior change interventions delivered through online social networks effective? A systematic review. Journal of Medical Internet Research, 16(2).",
    summary: "Review các can thiệp sức khỏe trên mạng xã hội trực tuyến: đa số nghiên cứu cho kết quả tích cực, mức độ tương tác (engagement) là yếu tố then chốt.",
    relevance: "Hỗ trợ luận điểm gamification + social feed giúp giữ chân người dùng tracking lâu dài.",
  }),
  ...ref({
    cite: "Hamari, J., Koivisto, J., & Sarsa, H. (2014). Does Gamification Work? — A Literature Review of Empirical Studies on Gamification. Hawaii International Conference on System Sciences (HICSS).",
    summary: "Review kinh điển về gamification: điểm, streak, bảng xếp hạng có tác động tích cực tới động lực, đặc biệt trong bối cảnh sức khỏe.",
    relevance: "Căn cứ cho tính năng streak 🔥 (chuỗi ngày log liên tiếp) đã có trong app.",
  }),
  ...ref({
    cite: "Michie, S., et al. (2013). The Behavior Change Technique Taxonomy (v1) of 93 hierarchically clustered techniques. Annals of Behavioral Medicine, 46(1).",
    summary: "Hệ phân loại chuẩn 93 kỹ thuật thay đổi hành vi (BCT) — ngôn ngữ chung để mô tả tính năng can thiệp sức khỏe.",
    relevance: "Dùng để 'gắn nhãn' học thuật các tính năng: self-monitoring (log bữa), goal setting (calorie goal), prompts/cues (reminder), social support (community).",
  }),

  // ════════════════════════════════════════════════════════════
  h1("6. Công nghệ & bảo mật"),
  ...ref({
    cite: "Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT). RFC 7519, Internet Engineering Task Force (IETF).",
    summary: "Đặc tả chuẩn của JWT — cơ chế token tự chứa (self-contained) cho xác thực stateless.",
    relevance: "Trích dẫn chuẩn cho cơ chế xác thực của backend.",
  }),
  ...ref({
    cite: "Provos, N., & Mazières, D. (1999). A Future-Adaptable Password Scheme. USENIX Annual Technical Conference.",
    summary: "Công bố thuật toán bcrypt — hàm băm mật khẩu có cost factor điều chỉnh được để chống brute-force theo thời gian.",
    relevance: "Căn cứ cho lựa chọn bcryptjs hash mật khẩu trong backend.",
  }),
  ...ref({
    cite: "Open Food Facts (2024). Open Food Facts — the free food products database. https://world.openfoodfacts.org",
    summary: "Cơ sở dữ liệu mở cộng đồng với hàng triệu sản phẩm đóng gói kèm thông tin dinh dưỡng, truy cập tự do qua API.",
    relevance: "Nguồn dữ liệu cho tính năng quét mã vạch; ví dụ về tận dụng open data trong sản phẩm thực tế.",
  }),

  // ════════════════════════════════════════════════════════════
  new Paragraph({
    spacing: { before: 360, after: 100 },
    children: [new TextRun({ text: "Gợi ý cách dùng danh mục này", bold: true, size: 24, color: "1D4ED8" })],
  }),
  p("• Nhóm 1–2 dùng cho chương Related Work / Tổng quan công nghệ."),
  p("• Nhóm 3 trích dẫn ngay tại nơi mô tả công thức BMI / TDEE / MET trong chương thiết kế."),
  p("• Nhóm 4 dùng cho phần Đặt vấn đề & Ý nghĩa thực tiễn."),
  p("• Nhóm 5 dùng khi trình bày định hướng Community (mô hình WEAR)."),
  p("• Nhóm 6 trích trong chương kiến trúc & bảo mật hệ thống."),
  p("• Tra từng bài trên Google Scholar để lấy DOI/trang chính xác và format theo chuẩn trích dẫn trường yêu cầu (Harvard/APA/IEEE)."),
];

const doc = new Document({
  creator: "Le Mac Hoang King",
  title: "Meal Snap - Academic References",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "1D4ED8", font: "Calibri" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
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
  const out = path.join(__dirname, "..", "HealthySnap_Academic_References.docx");
  fs.writeFileSync(out, buffer);
  console.log("✅", out, (buffer.length / 1024).toFixed(1), "KB");
});
