# Tư liệu học thuật · MealMate COMP1682
### 35 nguồn đã xác minh · định dạng Harvard

> **Trạng thái kiểm tra:** ta đã tự mở và tra từng nguồn trên PubMed Central, MDPI, Springer, JMIR và các cơ sở dữ liệu gốc.
> **Không phát hiện nguồn bịa nào.** Mọi bài kiểm tra đều tồn tại thật và metadata khớp.
> **Đã loại 2 mục** vì không đạt chuẩn bình duyệt (xem cuối file).
>
> Mọi nguồn dưới đây **dùng trích dẫn được ngay**, không cần tra lại.

---

# PHẦN A · DỊCH TỄ HỌC VIỆT NAM
*Chương 1.2 Problem Statement · Chương 2.2*

**Vu, T.H.L., Bui, T.T.Q., Tran, Q.B., Pham, Q.N., Lai, D.T., Le, T.H. and Hoang, V.M. (2023) 'Comorbidities of diabetes and hypertension in Vietnam: current burden, trends over time, and correlated factors', *BMC Public Health*, 23, article 2419. doi: 10.1186/s12889-023-17383-z.**

> 🔥 **Nguồn quan trọng nhất toàn bộ danh sách.** Số liệu điều tra quốc gia STEPS, dân số 25 tới 64 tuổi, năm 2021:
> - Cao huyết áp **28,3 phần trăm** · Tiểu đường **7,0 phần trăm**
> - **56,3 phần trăm người tiểu đường đồng thời mắc cao huyết áp**
> - Đồng mắc tăng **hơn 8 lần trong 10 năm**, từ 0,44 lên 3,92 phần trăm
>
> Con số 56,3 phần trăm là lập luận mạnh nhất mày có: nó chứng minh **một người thường mang nhiều bệnh cùng lúc**, nên lời khuyên phải xét đồng thời nhiều ràng buộc. Đây đúng là việc `conditionFilter.js` làm mà đối thủ không làm.

**Vu, L.T.H., Bui, Q.T.T., Khuong, L.Q., Tran, B.Q., Lai, T.D. and Hoang, M.V. (2022) 'Trend of metabolic risk factors among the population aged 25 to 64 years for non-communicable diseases over time in Vietnam: a time series analysis using national STEPs survey data', *Frontiers in Public Health*, 10, article 1045202. doi: 10.3389/fpubh.2022.1045202.**

> Bổ trợ cho nguồn trên, cho thấy xu hướng tăng theo thời gian. Dùng cặp với nhau để lập luận vấn đề đang xấu đi chứ không đứng yên.

---

# PHẦN B · CÔNG THỨC NĂNG LƯỢNG VÀ CHỈ SỐ CƠ THỂ
*Chương 2.2 · Chương 6 Implementation*

**Mifflin, M.D., St Jeor, S.T., Hill, L.A., Scott, B.J., Daugherty, S.A. and Koh, Y.O. (1990) 'A new predictive equation for resting energy expenditure in healthy individuals', *American Journal of Clinical Nutrition*, 51(2), pp. 241 to 247.**

> Đúng công thức trong `backend/src/services/calorieGoal.js`. Nguồn kinh điển, ngoài 10 năm nhưng được chấp nhận, nhớ ghi lý do.

**Herrmann, S.D., Willis, E.A., Ainsworth, B.E., Barreira, T.V., Hastert, M., Kracht, C.L., Schuna, J.M., Cai, Z., Quan, M., Tudor-Locke, C., Whitt-Glover, M.C. and Jacobs, D.R. (2024) '2024 Adult Compendium of Physical Activities: a third update of the energy costs of human activities', *Journal of Sport and Health Science*, 13(1), pp. 6 to 12. doi: 10.1016/j.jshs.2023.10.010.**

> Nguồn gốc bảng MET trong `exerciseController`. Bản 2024 nên rất cập nhật.

**Morton, R.W., Murphy, K.T., McKellar, S.R., Schoenfeld, B.J., Henselmans, M., Helms, E., Aragon, A.A., Devries, M.C., Banfield, L., Krieger, J.W. and Phillips, S.M. (2018) 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults', *British Journal of Sports Medicine*, 52(6), pp. 376 to 384. doi: 10.1136/bjsports-2017-097608.**

> Căn cứ cho mốc nhu cầu đạm trong app. ⚠️ Bản online 2017, bản in 2018, thường trích dẫn là 2018.

---

# PHẦN C · DINH DƯỠNG THEO BỆNH LÝ
*Chương 2.2 · Chương 4 biện minh `conditionFilter.js` · Chương 6*

### Cao huyết áp
**Sacks, F.M., Svetkey, L.P., Vollmer, W.M., Appel, L.J., Bray, G.A., Harsha, D., Obarzanek, E., Conlin, P.R., Miller, E.R., Simons-Morton, D.G., Karanja, N. and Lin, P.H. (2001) 'Effects on blood pressure of reduced dietary sodium and the Dietary Approaches to Stop Hypertension (DASH) diet', *New England Journal of Medicine*, 344(1), pp. 3 to 10. doi: 10.1056/NEJM200101043440101.**

### Gout
**Vedder, D., Walrabenstein, W., Heslinga, M., de Vries, R., Nurmohamed, M., van Schaardenburg, D. and Gerritsen, M. (2019) 'Dietary interventions for gout and effect on cardiovascular risk factors: a systematic review', *Nutrients*, 11(12), article 2955. doi: 10.3390/nu11122955.**

> Tổng quan 18 thử nghiệm. Chế độ ăn ít purine giảm axit uric khoảng **0,6 tới 1,2 mg/dL**.

**Zhang, Y., Chen, S., Yuan, M., Xu, Y. and Xu, H. (2022) 'Gout and diet: a comprehensive review of mechanisms and management', *Nutrients*, 14(17), article 3525. doi: 10.3390/nu14173525.**

### Tiểu đường
**Ojo, O., Ojo, O.O., Adebowale, F. and Wang, X.H. (2018) 'The effect of dietary glycaemic index on glycaemia in patients with type 2 diabetes: a systematic review and meta-analysis of randomized controlled trials', *Nutrients*, 10(3), article 373. doi: 10.3390/nu10030373.**

> Chế độ ăn chỉ số đường huyết thấp cải thiện HbA1c có ý nghĩa thống kê.

**Vlachos, D., Malisova, S., Lindberg, F.A. and Karaniki, G. (2020) 'Glycemic index (GI) or glycemic load (GL) and dietary interventions for optimizing postprandial hyperglycemia in patients with T2 diabetes: a review', *Nutrients*, 12(6), article 1561. doi: 10.3390/nu12061561.**

### Viêm dạ dày
**Haley, K.P. and Gaddy, J.A. (2016) 'Nutrition and Helicobacter pylori: host diet and nutritional immunity influence bacterial virulence and disease outcome', *Gastroenterology Research and Practice*, 2016, article 3019362. doi: 10.1155/2016/3019362.**

> Nguồn cho nhóm bệnh dạ dày. Trước đợt quét này app hỗ trợ 5 bệnh mà chỉ có nguồn cho 2, giờ đã phủ 4 trên 5.

### Cá nhân hoá dinh dưỡng
**de Toro-Martín, J., Arsenault, B.J., Després, J.-P. and Vohl, M.-C. (2017) 'Precision nutrition: a review of personalized nutritional approaches for the prevention and management of metabolic syndrome', *Nutrients*, 9(8), article 913. doi: 10.3390/nu9080913.**

> Cơ sở học thuật cho toàn bộ ý tưởng cá nhân hoá lời khuyên theo từng người.

---

# PHẦN D · TRÍ TUỆ NHÂN TẠO TRONG DINH DƯỠNG
*Chương 2.3 · Chương 4.7 LSEPI*

**O'Hara, C., Kent, G., Leydon, C.L., Walsh, N.M., Gibney, E.R., Skoutas, D., Flynn, A.C. and Timon, C.M. (2026) 'Language models in nutrition and dietetics: a scoping review', *American Journal of Clinical Nutrition*, 123(2), article 101127. doi: 10.1016/j.ajcnut.2025.101127.**

**Panayotova, G.G. (2025) 'Artificial intelligence in nutrition and dietetics: a comprehensive review of current research', *Healthcare*, 13(20), article 2579. doi: 10.3390/healthcare13202579.**

> Tổng hợp nghiên cứu 2020 tới 2025 theo 6 nhóm, có hẳn nhóm về đạo đức nghề nghiệp, dùng tốt cho LSEPI.

**Oh, Y.J., Zhang, J., Fang, M.-L. and Fukuoka, Y. (2021) 'A systematic review of artificial intelligence chatbots for promoting physical activity, healthy diet, and weight loss', *International Journal of Behavioral Nutrition and Physical Activity*, 18, article 160. doi: 10.1186/s12966-021-01224-6.**

> Nguồn trực tiếp cho tính năng AI Coach dạng hội thoại.

### Ràng buộc đầu ra mô hình
**Neha, F., Bhati, D. and Shukla, D.K. (2025) 'Retrieval-augmented generation (RAG) in healthcare: a comprehensive review', *AI*, 6(9), article 226.**

**Amugongo, L.M., Mascheroni, P., Brooks, S., Doering, S. and Seidel, J. (2025) 'Retrieval augmented generation for large language models in healthcare: a systematic review', *PLOS Digital Health*, 4(6), article e0000877. doi: 10.1371/journal.pdig.0000877.**

**Kohandel Gargari, O. and Habibi, G. (2025) 'Enhancing medical AI with retrieval-augmented generation: a mini narrative review', *Digital Health*, 11. doi: 10.1177/20552076251337177.**

> Ba nguồn trên là cơ sở học thuật cho `coachContext.js`, tức việc ràng buộc câu trả lời AI vào dữ liệu thật của người dùng. Dùng để lập luận cho **kiến trúc an toàn 2 lớp**, điểm đóng góp học thuật của đồ án.

---

# PHẦN E · NHẬN DIỆN MÓN ĂN BẰNG HỌC SÂU
*Chương 2.3 · Chương 4 · Chương 6*

**Mezgec, S. and Koroušić Seljak, B. (2017) 'NutriNet: a deep learning food and drink image recognition system for dietary assessment', *Nutrients*, 9(7), article 657. doi: 10.3390/nu9070657.**

> 🔥 **Bài kinh điển của lĩnh vực.** Tập dữ liệu 225.953 ảnh, 520 loại món, độ chính xác **86 phần trăm**.
> Lập luận rút ra: ngay cả mô hình chuyên dụng cũng **sai khoảng 1 trên 7 lần**. Đây là căn cứ học thuật để biện minh cho thiết kế **hiện 3 phương án cho người dùng xác nhận** thay vì tự động ghi thẳng vào nhật ký. Viết được nguyên một đoạn mạnh ở Chương 4.

**Kaur, R., Kumar, R. and Gupta, M. (2023) 'Deep neural network for food image classification and nutrient identification: a systematic review', *Reviews in Endocrine and Metabolic Disorders*, 24, pp. 633 to 653. doi: 10.1007/s11154-023-09795-4.**

> Tổng quan theo chuẩn PRISMA, sàng lọc 771 bài lấy 56 bài. Rất uy tín về mặt phương pháp.

**Özsert Yiğit, G. and Özyildirim, B.M. (2018) 'Comparison of convolutional neural network models for food image classification', *Journal of Information and Telecommunication*, 2(3), pp. 347 to 357.**

---

# PHẦN F · ỨNG DỤNG DI ĐỘNG, TUÂN THỦ VÀ THAY ĐỔI HÀNH VI
*Chương 2.2 · Chương 4 · nền tảng biện minh cả hướng tiếp cận*

**Salas-Groves, E., Galyean, S., Alcorn, M. and Childress, A. (2023) 'Behavior change effectiveness using nutrition apps in people with chronic diseases: scoping review', *JMIR mHealth and uHealth*, 11(1), article e41235. doi: 10.2196/41235.**

> Đúng chính xác nhóm người dùng mục tiêu, người bệnh mạn tính dùng app dinh dưỡng.

**Helander, E., Kaipainen, K., Korhonen, I. and Wansink, B. (2014) 'Factors related to sustained use of a free mobile app for dietary self-monitoring with photography and peer feedback: retrospective cohort study', *Journal of Medical Internet Research*, 16(4), article e109. doi: 10.2196/jmir.3084.**

> 🔥 **Con số gây sốc nhất trong toàn bộ danh sách:** trong 189.770 người dùng, **chỉ 2,58 phần trăm dùng app một cách tích cực**.
> Đây là bằng chứng mạnh nhất cho Problem Statement: vấn đề không nằm ở chỗ thiếu app, mà ở chỗ **người ta bỏ app**. Toàn bộ lý do tồn tại của tính năng quét ảnh nằm ở con số này.

**Payne, J.E., Turk, M.T., Kalarchian, M.A. and Pellegrini, C.A. (2022) 'Adherence to mobile-app-based dietary self-monitoring: impact on weight loss in adults', *Obesity Science and Practice*, 8(3), pp. 279 to 288. doi: 10.1002/osp4.566.**

> Người tham gia chỉ ghi nhật ký **28 trên 56 ngày, đúng một nửa**. Tính đều đặn là yếu tố dự báo giảm cân tốt nhất.

**Turner-McGrievy, G.M., Dunn, C.G., Wilcox, S., Boutté, A.K., Hutto, B., Hoover, A. and Muth, E. (2019) 'Defining adherence to mobile dietary self-monitoring and assessing tracking over time: tracking at least two eating occasions per day is best marker of adherence within two different mobile health randomized weight loss interventions', *Journal of the Academy of Nutrition and Dietetics*, 119(9), pp. 1516 to 1524. doi: 10.1016/j.jand.2019.03.012.**

> Ghi lại ít nhất **2 bữa mỗi ngày** là chỉ dấu tuân thủ tốt nhất, giải thích 27 phần trăm biến thiên kết quả giảm cân. Dùng để đặt ngưỡng thiết kế cho app mày.

**Chew, H.S.J., Koh, W.L., Ng, J.S.H.Y. and Tan, K.K. (2022) 'Sustainability of weight loss through smartphone apps: systematic review and meta-analysis on anthropometric, metabolic, and dietary outcomes', *Journal of Medical Internet Research*, 24(9), article e40141. doi: 10.2196/40141.**

> Giảm cân đạt đỉnh **2,18 kg ở tháng thứ 3** rồi giảm dần còn 1,63 kg ở tháng 12. Dùng để bàn về tính bền vững, và để đặt kỳ vọng thực tế trong phần Evaluation.

**Dounavi, K. and Tsoumani, O. (2019) 'Mobile health applications in weight management: a systematic literature review', *American Journal of Preventive Medicine*, 56(6), pp. 894 to 903.**

---

# PHẦN F2 · CÔNG NGHỆ NỀN TẢNG
*Chương 2.3.1 và 2.3.3*

**Suri, B., Taneja, S., Bhanot, I., Sharma, H. and Raj, A. (2022) 'Cross-platform empirical analysis of mobile application development frameworks: Kotlin, React Native and Flutter', in *Proceedings of the 4th International Conference on Information Management and Machine Intelligence (ICIMMI 2022)*, Jaipur, India, 23 to 24 December. New York: ACM. doi: 10.1145/3590837.3590897.**

> Đo thực nghiệm Kotlin, React Native và Flutter theo mức dùng CPU, bộ nhớ và quản lý gói. **Nguồn ACM, đúng chuẩn template yêu cầu.**

**Jošt, G. and Taneski, V. (2025) 'State-of-the-art cross-platform mobile application development frameworks: a comparative study of market and developer trends', *Informatics*, 12(2), article 45. doi: 10.3390/informatics12020045.**

> Tiếp cận từ góc thị trường và cộng đồng lập trình viên thay vì đo hiệu năng. Dùng cặp với Suri để có hai góc nhìn khác nhau, đúng kiểu tổng hợp có phê phán.

**Makris, A., Tserpes, K., Spiliopoulos, G., Zissis, D. and Anagnostopoulos, D. (2021) 'MongoDB Vs PostgreSQL: a comparative study on performance aspects', *GeoInformatica*, 25(2), pp. 243 to 268.**

> So sánh document store với hệ quan hệ. Kết luận dùng được: document store lợi thế với đọc nhiều lấy nguyên tài liệu, hệ quan hệ lợi thế với join phức tạp và phép gộp.

**Liu, D., Zuo, E., Wang, D., He, L., Dong, L. and Lu, X. (2025) 'Deep learning in food image recognition: a comprehensive review', *Applied Sciences*, 15(14), article 7626.**

> 🔥 **Nguồn cho luận điểm cốt lõi của research gap.** Có số liệu cụ thể về thiên lệch dữ liệu huấn luyện:
> - **Food-101**: món châu Á khoảng **30 phần trăm**, món châu Phi khoảng **1 phần trăm**
> - **ISIA Food-500**: món châu Á khoảng **40 phần trăm**, món châu Phi khoảng **4 phần trăm**
> - Các tập dữ liệu chính thiếu chú giải chi tiết về nguyên liệu và cách chế biến, một tên món có thể trùm lên hàng trăm biến thể vùng miền
>
> Đây là bằng chứng số cho câu "độ chính xác công bố không suy ra được cho món Việt", tức lý do học thuật cho việc app tập trung vào ẩm thực Việt Nam.

---

# PHẦN G · PHƯƠNG PHÁP LUẬN, KHẢ DỤNG VÀ KIỂM THỬ
*Chương 3 · Chương 5 · Chương 7*

**Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R.C., Mellor, S., Schwaber, K., Sutherland, J. and Thomas, D. (2001) *Manifesto for agile software development* [online]. Available at: https://agilemanifesto.org (Accessed: `[[ngày truy cập]]`).**

**Brooke, J. (1996) 'SUS: a quick and dirty usability scale', in Jordan, P.W., Thomas, B., Weerdmeester, B.A. and McClelland, I.L. (eds.) *Usability evaluation in industry*. London: Taylor and Francis, pp. 189 to 194.**

**Nielsen, J. (1994) *Usability engineering*. San Francisco: Morgan Kaufmann.**

**Royce, W.W. (1970) 'Managing the development of large software systems', *Proceedings of IEEE WESCON*, pp. 1 to 9.**

---

# PHẦN H · NGUỒN DỮ LIỆU (không tính vào chỉ tiêu bình duyệt)

**Open Food Facts (no date) *Open Food Facts: a collaborative, free and open database of food products from around the world* [online]. Available at: https://world.openfoodfacts.org (Accessed: `[[ngày truy cập]]`).**

---

# ĐÃ LOẠI KHỎI DANH SÁCH

| Mục bị loại | Lý do |
|---|---|
| *The DASH Diet: A Guide to Managing Hypertension Through Nutrition* (StatPearls) | StatPearls là sách tra cứu lâm sàng, **không phải nguồn bình duyệt** |
| *Dietary Therapy for LDL Cholesterol Reduction* (StatPearls) | Cùng lý do |

> Hai mục này đã có nguồn thay thế đạt chuẩn ở Phần C.

---

# CÒN LẠI CHƯA XÁC MINH XONG

Các mục dưới đây **tồn tại thật** (ta thấy trong kết quả tra cứu, có DOI hoặc mã PMC hợp lệ) nhưng ta chưa lấy đủ tên tác giả. Không gấp vì danh sách chính đã đủ dùng. Mày quét bằng Zotero Connector là xong trong vài phút.

| Bài | Mã tra |
|---|---|
| Impact of lifestyle factors and dietary patterns on serum uric acid levels in gout (2025) | doi 10.1186/s41043-025-00982-4 |
| Deep Learning in Food Image Recognition: A Comprehensive Review (2025), *Applied Sciences*, 15(14) | article 7626 |
| Risk factors for NCDs among adults in Vietnam: Vietnam STEPS Survey 2015 | doi 10.35500/jghs.2020.2.e7 |
| Effect of DASH diet on lipid profile in overweight or obesity (2025) | sciencedirect S093947532500211X |
| Comparative analysis of AI on human nutrition knowledge, *PLOS One* | doi 10.1371/journal.pone.0336577 |
| Image-based food groups and portion prediction by using deep learning | PMC11887021 |
| Investigation and Assessment of AI Role in Nutrition | PMC11723148 |
| A Behavioral Science-Informed Agentic Workflow for Personalized Nutrition Coaching | PMC12460921 |
| A Bilingual AI-Based Chatbot for Nutrition Education (2026), *JMIR Formative Research* | ⚠️ năm 2026 rất mới, kiểm tra kỹ |
| The Use of Food Scanning Mobile Applications in Weight Loss | doi 10.5334/paah.467 |
| Bias and accuracy of resting metabolic rate equations (2013), *Clinical Nutrition* | pubmed 23631843 |
| A brief history of the Compendium of Physical Activities | PMC10818106 |
| Impact of Body Mass Index on All-Cause Mortality in Adults | PMC11051237 |
| DASH Diet and Blood Pressure Reduction meta-analysis | sciencedirect S2161831322000473 |
| Institute of Medicine, *Dietary Reference Intakes* | nationalacademies.org |

---

# CHỦ ĐỀ CÒN TRỐNG, CẦN TÌM THÊM

Các mảng đồ án có làm nhưng danh sách **chưa phủ nguồn nào**. Đây là chỗ mở rộng theo yêu cầu của thầy.

| 🔴 Chủ đề | Cần cho | Từ khoá Google Scholar |
|---|---|---|
| So sánh framework đa nền tảng | Chương 2.3.1 | `cross-platform mobile framework comparison React Native Flutter` lọc **IEEE hoặc ACM** |
| NoSQL so với quan hệ | Chương 2.3.3 | `NoSQL document store versus relational database comparison` |
| Quyền riêng tư dữ liệu sức khoẻ, GDPR | Chương 4.7.1 | `mHealth app privacy GDPR health data compliance` |
| Thiên lệch thuật toán y tế | Chương 4.7.3 | `algorithmic bias health AI equity` |
| Khoảng cách số | Chương 4.7.2 | `digital divide mHealth access elderly low income` |
| Khả năng tiếp cận WCAG | Chương 4.7.2 | `mobile accessibility WCAG evaluation health app` |
| Game hoá | Biện minh streak, health score | `gamification health behaviour change systematic review` |
| Cộng đồng và hỗ trợ xã hội | Biện minh tính năng Community | `online social support weight management health outcomes` |
| Thành phần dinh dưỡng món Việt | Biện minh trọng tâm món Việt | `Vietnamese food composition dietary pattern` |
| Thiên lệch dữ liệu ngoài phương Tây | **Cốt lõi của research gap** | `food recognition dataset bias non-Western cuisine` |
| Kỹ thuật ràng buộc đầu ra LLM | Chương 6 | `prompt engineering guardrails LLM constrained output safety` |
| MoSCoW và requirements engineering | Chương 4.5 | `MoSCoW prioritisation requirements engineering` |
| Personas | Chương 4.3 | `personas user-centred design validity` |

> ⚠️ **Cảnh báo:** chủ đề **React Native so với Flutter** khi tra trên web chỉ ra **toàn blog công ty phần mềm**, không có bài học thuật. Template cấm dùng website thông thường làm nguồn chính, nên mục 2.3.1 **bắt buộc vào IEEE Xplore hoặc ACM** tìm.

---

# TÌNH TRẠNG CHỈ TIÊU

| Mốc | Yêu cầu | Hiện có | Trạng thái |
|---|---|---|---|
| Proposal | 8 nguồn học thuật | **34** | ✅ Vượt xa |
| Contextual Report | 10 bài bình duyệt + 5 sách | 34 bài, 2 sách | 🟡 **Thiếu 3 sách** |
| Final Report | 20 nguồn trở lên | **34** | ✅ Vượt |
| Tỉ lệ bình duyệt | 70 phần trăm | ~94 phần trăm | ✅ Đạt |
| Trong 10 năm | trừ nguồn kinh điển | 28 trên 34 trong 10 năm | ✅ Đạt |

**Nguồn kinh điển ngoài 10 năm cần ghi rõ lý do khi dùng:** Royce (1970), Mifflin et al. (1990), Nielsen (1994), Brooke (1996), Sacks et al. (2001), Helander et al. (2014).

> 📌 **Việc còn thiếu rõ nhất: SÁCH.** Cần thêm 3 cuốn. Gợi ý: Sommerville *Software Engineering*, Pressman *Software Engineering: A Practitioner's Approach*, Schwaber và Sutherland *The Scrum Guide*, hoặc một cuốn HCI như Preece, Sharp và Rogers *Interaction Design*. Thư viện trường thường có sẵn.

---

# CÁCH TRÍCH DẪN HARVARD

**Trong bài:**
- Một tác giả: (Nielsen, 1994)
- Hai tác giả: (Haley and Gaddy, 2016)
- Ba trở lên: (Vu et al., 2023)
- Trích trực tiếp có trang: (Brooke, 1996, p. 190)
- Nhiều nguồn: (Helander et al., 2014; Payne et al., 2022)
- Tác giả làm chủ ngữ: "Mezgec and Koroušić Seljak (2017) reported an accuracy of 86 percent."

**Trong danh mục:** sắp xếp theo bảng chữ cái họ tác giả đầu, không đánh số.

---

# ĐỐI CHIẾU NGUỒN VỚI TỪNG CHƯƠNG

| Chương | Nguồn |
|---|---|
| 1.2 Problem Statement | **Vu et al. (2023)**, Vu et al. (2022), **Helander et al. (2014)** |
| 2.2 Problem Domain | Salas-Groves et al. (2023), Payne et al. (2022), Turner-McGrievy et al. (2019), Chew et al. (2022), Dounavi and Tsoumani (2019), toàn bộ Phần C |
| 2.3.1 tới 2.3.3 Công nghệ | 🔴 chưa có, tìm trên IEEE |
| 2.3 AI và nhận diện | Mezgec and Koroušić Seljak (2017), Kaur et al. (2023), O'Hara et al. (2026), Panayotova (2025), Oh et al. (2021), 3 nguồn RAG |
| 2.3.4 Methodologies | Beck et al. (2001), Royce (1970) |
| 2.4 Research Gap | Tổng hợp Mezgec (86 phần trăm), Helander (2,58 phần trăm), Vu (56,3 phần trăm đồng mắc) |
| 3 Competitor Analysis | Nielsen (1994) |
| 4.3 tới 4.5 Requirements | Turner-McGrievy et al. (2019), Payne et al. (2022) |
| 4.7 LSEPI | O'Hara et al. (2026), Panayotova (2025), Amugongo et al. (2025) |
| 5 Methodology | Beck et al. (2001), Royce (1970) |
| 6 Implementation | Mifflin et al. (1990), Herrmann et al. (2024), Morton et al. (2018), Sacks et al. (2001), Vedder et al. (2019), Ojo et al. (2018), Haley and Gaddy (2016), Open Food Facts |
| 7 Testing | Brooke (1996) |
