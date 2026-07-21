# Chapter 8: Evaluation and Conclusion

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối xám là ghi chú của ta, **không đưa vào**.
>
> **Trạng thái:** 🔴 8.1 chờ UAT · ✅ 8.2 viết được phần lớn · 🟡 8.3 cần giọng của mày · ✅ 8.4 viết đầy đủ · 🟡 8.5 viết sau cùng

---

## 8.1 Summary of Achievements

### 8.1.1 Was the Project Aim Achieved?

`[[🔴 CHỜ KẾT QUẢ UAT]]`

> Khung để mày điền. Nhắc lại aim ở mục 1.3 rồi trả lời thẳng đạt hay không, kèm bằng chứng.

### 8.1.2 Objectives Evaluation

`[[🔴 CHỜ KẾT QUẢ UAT cho objective 2 và 5]]`

**Table 8.1 Objective evaluation**

| # | Objective | Status | Evidence |
|---|---|---|---|
| 1 | Literature review, minimum 10 peer reviewed sources | **Met** | 43 sources verified, 30 cited in Chapter 2 across three themes |
| 2 | User research, 5 interviews and 20 survey responses | `[[chờ]]` | `[[số thật]]` |
| 3 | Develop all Must Have requirements | `[[chờ MoSCoW]]` | Chapter 6, demonstrable on a physical device |
| 4 | Verification, minimum 90 percent pass rate | **Met** | 31 unit tests and 56 integration checks, all passing. Chapter 7 |
| 5 | UAT with 5 participants, mean SUS at least 68 | `[[chờ]]` | `[[điểm SUS thật]]` |

> ⚠️ **Trả lời trung thực.** Nếu objective nào chỉ đạt một phần thì ghi "Partially met" kèm lý do. Template nói rõ đánh giá trung thực có bằng chứng mới được điểm, còn tự khen hết thì mất điểm. Người chấm đọc hàng trăm báo cáo, họ nhận ra ngay bản nào tô hồng.

---

## 8.2 Critical Project Evaluation

### 8.2.1 Strengths and Successes

**Design decisions derived from evidence rather than preference.** Several core design choices in this project trace directly to a cited finding rather than to intuition. Presenting three recognition candidates for confirmation rather than committing one follows from the reported accuracy of 86 percent for purpose built food recognition systems (Mezgec and Koroušić Seljak, 2017), which implies that roughly one classification in seven is wrong. Prioritising reduction of logging effort over analytical sophistication follows from the finding that only 2.58 percent of users of a comparable application used it actively (Helander et al., 2014). Requiring the safety filter to evaluate every declared condition rather than the first follows from the finding that 56.3 percent of Vietnamese adults with diabetes also have hypertension (Vu et al., 2023). Each of these is testable, and each is tested.

**A safety architecture that does not depend on model compliance.** The condition filtering described in Section 6.3.3 operates in two independent layers, one expressed in the prompt and one enforced in code. The reasoning is that an instruction to a generative model is a request rather than a guarantee, and that in a health adjacent domain the consequence of non compliance is a recommendation unsuitable for a person with a medical condition. This separation means the guarantee survives a model that ignores its instructions.

**Computation kept out of the model where determinism matters.** The health score is calculated in code and the language model is used only to phrase the accompanying commentary. A score produced by a generative model would not be reproducible between requests, which would make it meaningless as a tracked metric. Recognising where a language model is the wrong tool is as consequential as recognising where it is the right one.

**Verification concentrated where failure costs most.** The automated test suite does not attempt uniform coverage. It concentrates on the energy calculation and the condition filter, being the two components whose incorrect behaviour is invisible in the interface and harmful in effect. The safety floor tests in particular encode an ethical obligation as an executable constraint rather than as a stated intention.

**Scope discipline maintained under pressure.** Video support was removed from the community feature when its cost became apparent, and the decision was recorded rather than quietly absorbed. A single developer project that ships a smaller working system is in a stronger position than one that ships a larger broken one.

`[[⚠️ Bổ sung sau UAT: điểm mạnh nào được người dùng xác nhận]]`

### 8.2.2 Challenges and Weaknesses

> 💡 **Mục này quan trọng hơn mục trên.** Người chấm dùng nó để phân biệt sinh viên hiểu việc mình làm với sinh viên chỉ làm xong. Viết thẳng thắn, mỗi điểm yếu nêu rõ vì sao xảy ra và học được gì.

**Recognition accuracy for Vietnamese dishes is unquantified.** The project asserts that Vietnamese dish coverage is a differentiator, and the literature supports the premise that mainstream datasets under represent non Western cuisine, with Asian dishes forming approximately 30 percent of Food-101 (Liu et al., 2025). However, this project did not measure the accuracy of its own recognition against a labelled set of Vietnamese dishes. The claim of improvement therefore rests on prompt design and on informal observation rather than on measurement. A benchmark of one hundred labelled Vietnamese dish photographs would have converted an assertion into a finding, and its absence is the most significant methodological gap in this work.

**Project tracking was informal for most of the project.** Work was tracked through the commit history and a running progress document rather than through an issue tracking tool, and a board was introduced only for the final phase. This was adequate for coordination, since there was nobody to coordinate with, but it means sprint velocity cannot be measured retrospectively and the link between a requirement and the commits implementing it must be reconstructed by reading commit messages. Adopting a board from the first week would have cost little and produced better evidence.

**The evaluation establishes usability, not efficacy.** User Acceptance Testing with five participants establishes whether the system can be used. It does not establish whether using it improves dietary outcomes, which would require a controlled longitudinal study with clinical measures. This distinction is stated because the project's aim concerns supporting decisions rather than improving biomarkers, but the limitation should not be understated.

**The population most in need is the population least served.** Yang et al. (2025) demonstrate that inequalities in mobile health persist across access, adoption and sustained use, and the disadvantaged groups they identify overlap substantially with those most affected by diet related chronic conditions. This project mitigates the problem in limited ways, by keeping core features free, by providing a Vietnamese interface and by minimising interaction cost, but it does not solve it. A smartphone application is inherently unavailable to those without a smartphone.

**Session invalidation is incomplete.** Authentication uses stateless tokens, so a token issued before account deletion remains valid until expiry. This was a considered trade off rather than an oversight, since stateless tokens avoid a database lookup on every request, but the correct resolution is a revocation list checked at authentication time.

**Deployment was introduced late in the project.** The database and media storage were already hosted on managed cloud services, but the application server was deployed to Render only during the final phase. This produced a working public HTTPS API and continuous deployment from the main branch, but it also exposed environment and platform issues later than they should have been discovered. Deployment should have formed part of an earlier development cycle so that hosted behaviour was verified continuously rather than near completion.

**Testing did not cover the client.** The automated suite covers server logic and API behaviour. Client behaviour was verified manually on a physical device, which is effective for detecting visible problems but does not regress automatically. A component test suite for the client would have caught interface regressions that manual verification can miss.

---

## 8.3 Personal Reflection and Key Learnings

`[[🟡 CẦN GIỌNG CỦA MÀY, ta chỉ gợi khung]]`

> Mục này **phải là lời của mày**, viết ở ngôi thứ nhất. Ta gợi bốn hướng, mày chọn và kể bằng chuyện thật.

**Về kỹ thuật.** Điều gì mày không biết lúc bắt đầu mà giờ biết? Gợi ý: cách ràng buộc đầu ra của mô hình ngôn ngữ, cách thiết kế nhiều lớp bảo vệ, hoặc bài học rằng có những chỗ không nên dùng AI.

**Về quản lý dự án.** Chuyện cắt tính năng video là ví dụ tốt. Lúc đó mày cảm thấy thế nào, và giờ nhìn lại thấy quyết định đó ra sao?

**Về làm việc một mình.** Không có ai review code, không có ai cản khi mày định làm thừa. Mày xoay xở bằng cách nào?

**Về khoảng cách giữa làm xong và làm đúng.** Chuyện lớp lọc an toàn đáng kể nhất. Ban đầu mày nghĩ viết chỉ thị trong prompt là xong, sau mới nhận ra chỉ thị chỉ là lời đề nghị. Đó là lúc mày chuyển từ "code chạy" sang "hệ thống đáng tin".

> 💡 Đừng viết chung chung kiểu "em học được rất nhiều". Kể **một chuyện cụ thể** rồi rút ra bài học từ đó. Một chuyện thật có sức nặng hơn mười câu tổng kết.

---

## 8.4 Recommendations for Future Development

The following directions are grouped by the concern they address. Items marked as constrained were excluded from this project for a stated reason recorded in Section 1.5.

### 8.4.1 Closing the gaps identified in this evaluation

**Benchmark recognition accuracy on Vietnamese dishes.** Assemble a labelled set of at least one hundred photographs spanning common Vietnamese dishes, including regional variants of the same dish name, and measure top one and top three accuracy. This converts the project's central claim from an assertion into a measured finding, and it is the single highest value next step.

**Fine tune or augment recognition for local cuisine.** Given a labelled set, the options range from few shot prompting with reference images through to fine tuning a vision model. Liu et al. (2025) note that a single dish name may span numerous regional preparations, so the labelling scheme matters as much as the volume.

**Portion size estimation.** The system currently estimates nutrition for a typical serving. Estimating portion from image cues, for example by reference to a bowl or utensil of known size, would address a source of error that users cannot easily correct.

**Client side automated testing.** A component test suite would regress interface behaviour automatically rather than relying on manual verification.

**Token revocation.** A revocation list checked at authentication would close the session invalidation gap, at the cost of one lookup per request.

### 8.4.2 Extending the core proposition

**Condition specific thresholds rather than blocklists.** The filter currently operates on ingredient patterns. A more precise system would reason over quantities, for example flagging sodium above a threshold for a hypertensive user rather than blocking named salty foods. This requires nutritional data of a granularity the current sources do not reliably provide.

**Medication and food interaction.** Certain medications interact with foods, and a user managing a chronic condition is likely to be taking them. This is valuable and also carries the highest clinical risk of any proposal here, so it would require clinical partnership rather than independent implementation.

**Explanation rather than instruction.** Survey question 12 asks what would increase trust in generated advice. If explanation ranks highly, guidance should state why a dish is unsuitable rather than that it is unsuitable, which also supports user learning rather than dependence.

**Support for additional conditions.** Chronic kidney disease and pregnancy were excluded on risk grounds. Both are common and both are dietary managed, so with clinical oversight they represent the most natural extension of the user group.

**Blood glucose and blood pressure logging.** The application tracks weight but not the biomarkers most relevant to the conditions it addresses. Manual entry would be straightforward and would allow guidance to reference trend rather than diet alone.

### 8.4.3 Engagement and retention

The literature identifies disengagement rather than availability as the failure mode of this product category (Helander et al., 2014), so retention mechanisms deserve treatment as core functionality rather than as decoration.

**Remote push notification.** The application delivers scheduled local reminders, which operate while it is closed, but cannot deliver notifications triggered by server side events such as a like or a follow. This requires a development build with push credentials, which was excluded from scope because it precludes distribution through the standard development client used throughout this project.

**Gamification grounded in evidence.** Edwards et al. (2016) reviewed behaviour change techniques in gamified health applications and found feedback and monitoring present in 94 percent of them, and reward mechanics in 81 percent, but found no correlation between the number of techniques used and user rating. Any gamification added here should therefore be evaluated rather than assumed beneficial. A companion character whose state reflects the composite health score would be one candidate, drawing on the approach observed in Walking Charlie during competitor analysis.

**Streaming coach responses.** Responses currently appear only when generation completes. Streaming them token by token substantially reduces perceived latency without changing the underlying model call.

**Proactive rather than reactive coaching.** The coach currently answers questions. A version that initiates contact, for example noting that sodium intake has been elevated across three days, would shift the product from a tool consulted to a companion that notices. This is the strongest expression of the project's original proposition and remains only partially realised.

**Long term conversational memory.** Context is currently assembled from recent records. Retaining salient facts across sessions, for example a stated dislike or an intolerance, would make guidance feel continuous rather than repeatedly reintroduced.

### 8.4.4 Data quality and coverage

**A curated Vietnamese food composition database.** Nutritional values currently derive from model estimation and from Open Food Facts, whose coverage of Vietnamese prepared dishes is limited. A curated dataset, potentially built collaboratively with users and verified against published composition tables, would improve accuracy for exactly the dishes this project prioritises.

**Additional product data sources.** Barcode lookup depends on a single open database. Falling back to further sources would reduce the frequency of an unrecognised product.

**Offline capability.** The application requires connectivity for most operations. Local logging with deferred synchronisation would suit intermittent connectivity, which is a realistic condition for parts of the intended user base.

### 8.4.5 Clinical and institutional integration

**Export for clinical consultation.** A summary suitable for presentation at an appointment, covering intake trends, adherence and weight trajectory, would connect self management back to the clinical setting rather than leaving the two disconnected. This addresses the disconnection described in Section 1.1 from the opposite direction to the rest of the system.

**Clinician facing view.** With consent, a treating clinician could review a patient's record between appointments. This raises substantial data protection questions and would require the consent architecture to be revisited in full.

**Longitudinal efficacy study.** The natural successor to this project is not a further feature but a study. A controlled trial measuring whether use of the application improves dietary adherence or clinical markers over months would establish efficacy, which usability testing cannot.

### 8.4.6 Platform and technical debt

**Wearable and health platform integration.** Automatic step and activity data would remove the manual logging that this project's own evaluation identified as burdensome. Excluded here because it requires a development build and physical devices, presenting unacceptable demonstration risk for a fixed assessment date.

**Error message localisation.** Server messages are returned in English and surfaced directly in the interface, which breaks the bilingual guarantee at exactly the moment a user is confused. Server responses should carry an error code that the client translates.

**Shared form component.** The meal creation and meal editing screens share the majority of their implementation. Extracting a common component would reduce the risk of the two diverging.

**Removal of unused endpoints.** Two API endpoints remain from an earlier design and are no longer called by the client. Unused code invites the assumption that it is maintained.

**Video in community posts.** Removed from scope during development, as recorded in Section 5.1.3. Reintroduction requires upload handling, transcoding, poster frame generation and playback, and would be justified only if user research indicated demand.

**Private messaging and follow approval.** The privacy model is currently a single toggle. A full private account model with follow requests, and direct messaging between users, would deepen the community feature but expands the moderation and safeguarding burden considerably.

### 8.4.7 Accessibility and reach

**Verification against WCAG rather than adherence to it.** The project targets Level AA and implements specific provisions, but does not evidence conformance through audit. Testing with assistive technology, particularly with a screen reader, would establish whether the intent is realised.

**Additional languages.** The interface supports Vietnamese and English. Extending coverage would widen reach, and the existing catalogue architecture is designed to accommodate it, since the compiler enforces parity between language files.

**Design for lower digital literacy.** Yang et al. (2025) identify digital fluency as a barrier to adoption. A simplified mode with fewer options and larger controls would address the older segment of the target population directly, and would be a suitable subject for a dedicated round of user research.

---

## 8.5 Final Conclusion

`[[🟡 VIẾT SAU CÙNG, sau khi có kết quả UAT]]`

> Cấu trúc bốn đoạn:
> 1. Nhắc lại vấn đề và aim trong hai câu
> 2. Nêu thứ đã xây dựng và cách nó giải quyết research gap
> 3. Nêu trung thực mức độ đạt được, gồm cả chỗ chưa đạt
> 4. Kết bằng đóng góp và hướng đi tiếp
>
> ⚠️ **Không giới thiệu thông tin mới** ở mục này. Kết luận chỉ tổng hợp những gì đã trình bày.

---

# TÓM TẮT VIỆC CẦN LÀM

| # | Việc | Chặn bởi |
|---|---|---|
| 1 | Điền bảng 8.1 objectives 2 và 5 | Dữ liệu khảo sát và UAT |
| 2 | Bổ sung mục 8.2.1 với điểm mạnh người dùng xác nhận | UAT |
| 3 | ~~Sửa đoạn deployment ở 8.2.2 theo tình trạng thật~~ | ✅ Đã xong theo deployment Render ngày 20/7 |
| 4 | **Viết mục 8.3 bằng lời của mày** | Không, làm được ngay |
| 5 | Viết mục 8.5 | Sau khi xong 1 và 2 |

**Đã trích dẫn:** Mezgec and Koroušić Seljak (2017), Helander et al. (2014), Vu et al. (2023), Liu et al. (2025), Yang et al. (2025), Edwards et al. (2016).

> 📌 Chương này dùng **Edwards et al. (2016)** và **Yang et al. (2025)**, hai nguồn trước đó đang chờ trong bảng kiểm tra REFERENCES.md. Giờ đã được trích thật.
>
> 📌 Mục 8.4 có **34 đề xuất** chia 7 nhóm. Nhiều hơn mức template đòi, nhưng mỗi cái đều **nêu lý do** chứ không phải liệt kê tên tính năng. Nếu thấy dài quá thì cắt bớt nhóm 8.4.6, giữ nguyên 8.4.1 vì nhóm đó nối thẳng vào phần điểm yếu.
