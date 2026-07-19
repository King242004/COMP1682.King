# Chapter 4: Requirements and Design

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối xám là ghi chú của ta, **không đưa vào**.
>
> **Trạng thái các mục:**
> - ✅ 4.1 Research Methodology · 4.6 Non-Functional Requirements · 4.7 LSEPI · 4.8 System Architecture (phần mô tả)
> - 🔴 4.2 Findings · 4.3 Personas · 4.4 User Stories · 4.5 MoSCoW → **chờ dữ liệu người dùng**
> - 🟡 4.8 Sơ đồ → **ta dựng được, xem cuối file**

---

## 4.1 Research Methodology

### 4.1.1 Research Approach

A mixed methods approach was adopted. Quantitative data was collected through an anonymous online questionnaire in order to establish the prevalence of behaviours and to prioritise requirements across a reasonable sample. Qualitative data was collected through semi structured interviews in order to understand the reasoning behind those behaviours, which a fixed response instrument cannot capture.

The two methods address different weaknesses. A questionnaire reaches enough respondents to support prioritisation but cannot explain why a respondent answered as they did. An interview explains reasoning but cannot establish how widely that reasoning is held. Used together, the questionnaire identifies what to build and the interviews explain why it matters.

Ethical approval was obtained before any data collection commenced. `[[⚠️ ĐIỀN MÃ SỐ PHÊ DUYỆT]]` All participants were adults, participation was voluntary and unpaid, and consent was obtained in advance.

### 4.1.2 Interview Design

Semi structured interviews of approximately fifteen minutes were conducted with participants who manage a diet related condition or who live with someone who does. The semi structured format was selected so that a consistent set of topics is covered across participants while leaving room to follow an unanticipated line of response.

The interview covered four topic areas.

1. Current practice, namely how the participant decides what to eat on an ordinary day
2. Points of difficulty, namely occasions when the participant was uncertain whether a food was suitable
3. Prior experience with tracking applications, including reasons for discontinuing use
4. Reactions to the proposed concept

Participants are identified as P1 to P5 throughout this report. No participant is named.

### 4.1.3 Survey Design

The questionnaire comprised seventeen items across five sections, distributed online and completed anonymously.

Two principles governed its design.

**Behaviour before opinion.** Questions concerning past behaviour precede questions concerning desired features. A respondent's account of what they have actually done is a more reliable indicator than their prediction of what they would do, so the behavioural questions were placed first and were not primed by any description of the proposed product.

**Neutral phrasing.** Feature questions were framed as a ranking exercise rather than as approval statements. Asking whether a respondent would find an artificial intelligence feature useful invites agreement and yields data of little value. Asking a respondent to rank eight features by importance forces discrimination between them.

**Table 4.1 Survey structure**

| Section | Items | Purpose |
|---|---|---|
| Consent | 1 | Informed consent, mandatory before proceeding |
| Demographics | Q1 to Q4 | Age, gender, condition status, health goal |
| Current behaviour | Q5 to Q9 | Prior app use, reasons for discontinuation, decision making under uncertainty |
| Specific difficulties | Q10 to Q12 | Rated difficulty of logging tasks, trust in AI generated advice |
| Feature validation | Q13 to Q15 | Feature importance ranking, decisive feature, acceptable daily effort |

Question 3 divides respondents into those who manage a diet related condition and those who do not, permitting comparison between the target group and a control group. Question 7 asks those who discontinued a tracking application for their reason, which tests directly the abandonment mechanism identified by Helander et al. (2014). Question 13 produces the ranking from which the MoSCoW prioritisation in Section 4.5 is derived. Question 15 establishes an acceptable time budget for logging a meal, which is expressed as a non functional requirement in Section 4.6.

> 💡 **Ghi chú:** mục 4.1.3 này là chỗ ăn điểm mà nhiều người bỏ lỡ. Mày không chỉ liệt kê câu hỏi, mà **giải thích nguyên tắc thiết kế** và **chỉ rõ câu nào phục vụ mục nào về sau**. Nó cho thấy khảo sát được thiết kế có chủ đích chứ không phải hỏi bừa.

## 4.2 User Research Findings

`[[🔴 CHỜ DỮ LIỆU THẬT]]`

> **Cấu trúc để mày điền khi có dữ liệu:**
>
> **4.2.1 Interview Findings** — nhóm phát hiện theo **chủ đề**, không kể lần lượt từng người. Mỗi chủ đề dẫn 1 tới 2 câu trích nguyên văn, ghi P1 tới P5.
> Chủ đề dự kiến sẽ nổi lên: cách quyết định khi không chắc, lý do bỏ app cũ, mức tin tưởng lời khuyên tự động.
>
> **4.2.2 Survey Findings** — biểu đồ cho Q7, Q8, Q13, Q15. **So sánh nhóm có bệnh nền với nhóm không** dựa trên Q3, đây là phân tích giá trị nhất.
>
> Khi có dữ liệu, đưa file CSV cho ta, ta viết phần phân tích.

## 4.3 User Personas

`[[🔴 CHỜ DỮ LIỆU THẬT]]`

> Persona phải **rút ra từ dữ liệu thật**, không phải nhân vật tưởng tượng. Karolita et al. (2023) chỉ ra rằng giá trị của persona nằm ở chỗ nó neo yêu cầu vào người dùng thật, nên persona bịa ra thì phản tác dụng.
> Dự kiến 2 persona: một người có bệnh nền lớn tuổi hơn, một người trẻ quan tâm sức khoẻ chung.

## 4.4 User Stories

`[[🔴 CHỜ DỮ LIỆU THẬT]]`

> Định dạng: "As a `[vai trò]`, I want `[hành động]`, so that `[lợi ích]`", kèm tiêu chí chấp nhận cho mỗi story.

## 4.5 Functional Requirements (MoSCoW)

`[[🔴 CHỜ DỮ LIỆU Q13]]`

> Thứ tự ưu tiên lấy từ điểm trung bình câu 13 khảo sát. Tính năng điểm cao nhất xếp Must Have, thấp nhất xếp Could Have hoặc Won't Have.
> **Đây là chỗ biến dữ liệu khảo sát thành yêu cầu có căn cứ**, đúng thứ thầy muốn thấy. Đừng tự xếp theo cảm tính.

## 4.6 Non-Functional Requirements

**Table 4.2 Non-functional requirements**

| ID | Requirement | Justification |
|---|---|---|
| NFR1 | Recording a meal shall be completable within sixty seconds | Derived from the acceptable effort budget reported in survey question 15 `[[⚠️ điều chỉnh theo dữ liệu thật]]` |
| NFR2 | The application shall meet WCAG 2.1 Level AA accessibility guidelines | Stated accessibility commitment, see Section 4.7.2 |
| NFR3 | All dietary guidance shall pass condition filtering before display | Safety requirement, see Section 6.3.3 |
| NFR4 | Passwords shall be stored only as salted hashes | Security baseline for a system holding sensitive data |
| NFR5 | All client to server communication shall use encrypted transport | Data in transit protection |
| NFR6 | The interface shall be available in Vietnamese and English | Target user group is Vietnamese, and the report is assessed in English |
| NFR7 | The application shall present a disclaimer stating that it does not replace professional medical advice | Ethical and legal requirement, see Section 4.7 |
| NFR8 | A user shall be able to permanently delete their account and all associated data | Right to erasure, see Section 4.7.1 |
| NFR9 | Failure of the generative model service shall produce an explanatory message rather than a silent failure | Reliability, informed by risk 1 in Section 5.3 |

## 4.7 Legal, Social, Ethical and Professional Issues

### 4.7.1 Legal

**Data protection.** The application collects personal data comprising an email address, body measurements and self declared health conditions. Health data attracts a higher standard of protection than ordinary personal data, and the system is designed accordingly.

The lawful basis for processing is explicit consent, obtained at registration and again at the point where health conditions are declared. Data minimisation is applied by collecting only fields with a functional purpose, so body weight and height are collected because they are inputs to the energy requirement calculation, and conditions are collected because they are inputs to the safety filter. No field is collected speculatively.

The right to erasure is implemented as a functional feature rather than as a policy statement. A user may permanently delete their account after password confirmation, and doing so removes every record associated with that user across all collections together with all uploaded images. Data is protected in storage by hashing passwords with a salted algorithm, by transmitting all traffic over encrypted connections, and by hosting the database on a managed service with access control.

**An acknowledged limitation.** Session tokens are stateless, so a token issued before account deletion remains technically valid until it expires. This is a recognised property of the chosen authentication mechanism rather than an oversight, and it is disclosed here because a limitation concealed is a limitation that will be discovered.

The privacy expectations of users in this domain are well documented. Alhammad et al. (2024) review patient perspectives on mobile health data confidentiality and identify transparency about what is collected and why as a principal determinant of trust, which supports the decision to state the purpose of each collected field at the point of collection.

**Software licensing.** `[[⚠️ CẦN CHẠY LỆNH]]`

> 🔴 Chạy `npx license-checker --summary` trong cả `frontend` và `backend`, rồi điền bảng bản quyền. Đa số sẽ là MIT và Apache 2.0, đều cho phép sử dụng tự do, nhưng phải kiểm tra chứ không được giả định.

**Intellectual property.** `[[⚠️ CẦN TRA]]` Tra chính sách sở hữu trí tuệ trong sổ tay sinh viên và ghi lại kết luận ai sở hữu mã nguồn.

### 4.7.2 Social

**Intended benefit.** The application provides a means for adults managing diet related conditions to interpret an everyday meal against their own circumstances, narrowing the gap between clinical instruction and practical decision making. The emphasis on Vietnamese cuisine makes guidance culturally actionable rather than proposing foods that are unfamiliar or unavailable.

**Potential for exclusion.** The intervention is not equally available to everyone who might benefit from it, and this must be stated plainly rather than assumed away.

Yang et al. (2025) demonstrate through systematic review and meta analysis that inequalities in mobile health persist across every phase of utilisation, from initial access through adoption to sustained use. The populations they identify as disadvantaged, namely older adults, those on lower incomes and those with lower digital literacy, overlap substantially with the population most affected by diet related chronic conditions. The application therefore risks serving best those who need it least.

This project cannot resolve that tension. It mitigates it in three limited respects, by keeping core functionality free rather than behind a subscription, by providing a Vietnamese interface rather than English only, and by designing for low interaction cost, which reduces the digital fluency required. The residual limitation is acknowledged in Section 8.2.2.

**Risk of over reliance.** A user may treat generated guidance as clinical instruction. This is mitigated by a persistent disclaimer and by phrasing guidance as suggestion rather than direction, but it cannot be eliminated by design alone.

**Accessibility.** The project targets WCAG 2.1 Level AA. Three specific provisions are implemented.

1. Text maintains a contrast ratio of at least 4.5 to 1 against its background
2. Every icon only control carries an accessible label for screen reader users
3. State is never conveyed by colour alone, and is always accompanied by text or an icon

### 4.7.3 Ethical

**Research ethics.** Ethical approval was obtained before data collection. `[[⚠️ ĐIỀN MÃ SỐ]]` Every participant received a participant information sheet and gave informed consent in advance. Participants were informed of their right to withdraw without giving a reason, and were told that anonymous questionnaire responses cannot be withdrawn after submission because they cannot be identified. Participants are referred to as P1 to P5 and are never named.

Research data is stored in a password protected location, separately from consent forms, and is destroyed after assessment.

**Algorithmic bias.** The system generates dietary suggestions, so it can systematically disadvantage particular groups. Two distinct mechanisms apply.

The first concerns the language model. Models are trained predominantly on English language material, which biases suggestion towards Western foods and disadvantages users whose accessible ingredients are local. This is mitigated by explicit instruction to prioritise Vietnamese dishes and by manual inspection of generated output during testing.

The second concerns recognition. Liu et al. (2025) document that widely used food image datasets substantially under represent non Western cuisine, reporting Asian representation of approximately 30 percent in Food-101 and approximately 40 percent in ISIA Food-500. Recognition accuracy for Vietnamese dishes cannot therefore be assumed to match published benchmarks, which is why the system presents candidates for confirmation rather than committing a single prediction.

The wider literature on bias in health artificial intelligence identifies these as instances of a general pattern in which bias enters through training data and propagates into deployment (Nazer et al., 2023). Ueda et al. (2024) argue that fairness must be addressed across the development lifecycle rather than treated as a final check, a position this project follows by embedding the condition filter in the generation pipeline rather than applying review after the fact.

> 💡 **Ghi chú:** mục thiên lệch thuật toán này rất mạnh. Mày **phân tách hai cơ chế thiên lệch khác nhau** trong chính hệ thống của mình, có số liệu cụ thể, và nối vào lý thuyết chung. Đây là mức phân tích Level 6 mà template đòi hỏi.

### 4.7.4 Professional

**BCS Code of Conduct.** Two clauses bear directly on this project.

**Public Interest.** The product operates in a health adjacent domain, so incorrect guidance carries potential for harm. This clause is upheld through the independent filtering layer described in Section 6.3.3, which does not rely on the generative model complying with instruction, and through a disclaimer stating that the application does not replace professional medical advice.

**Competence.** The author works within the limits of their competence. Nutritional thresholds are not invented but are taken from established sources, namely the Mifflin St Jeor equation for energy requirement (Mifflin et al., 1990) and the Compendium of Physical Activities for energy expenditure (Herrmann et al., 2024). Known technical limitations are disclosed rather than concealed, including the session token limitation in Section 4.7.1 and the recognition accuracy limitation in Section 1.5.2.

**Professional practice.** Version control with meaningful commit messages, consistent code style enforced by linting, automated testing covering calculation and safety logic, and documented reasoning for design decisions.

## 4.8 System Architecture

### 4.8.1 Architectural Overview

The system follows a three tier client server architecture. The mobile client handles presentation and user interaction. The application server holds business logic, integrates external services and enforces the safety layer. The data tier comprises a managed document database and a media store.

The most consequential architectural decision is the placement of the condition filtering logic on the server rather than the client. Logic executing on a user controlled device can be inspected and bypassed, so a safety constraint enforced only on the client provides the appearance of protection rather than protection itself.

**Table 4.3 External service dependencies**

| Service | Purpose | Failure behaviour |
|---|---|---|
| Generative model API | Dish recognition, coach conversation, plan generation | Fallback across keys and model variants, then an explanatory message to the user |
| Media storage | Post and meal photograph hosting | Upload failure reported, post creation rolled back |
| Open Food Facts | Packaged product nutritional lookup | Barcode not found reported, manual entry offered |
| Email service | Password recovery codes | Delivery failure reported at request time |

### 4.8.2 to 4.8.6 Diagrams

`[[🟡 TA DỰNG ĐƯỢC, xem cuối file]]`

Template yêu cầu 5 loại sơ đồ:

| Mục | Sơ đồ | Nội dung cần thể hiện |
|---|---|---|
| 4.8.2 | Rich Picture | Bức tranh tổng thể: người dùng, bệnh nền, bác sĩ, app, dịch vụ ngoài, và các mối quan hệ |
| 4.8.3 | System Context (C4 Level 1) | Hệ thống ở giữa, xung quanh là người dùng và 4 dịch vụ ngoài |
| 4.8.4 | Container Diagram (C4 Level 2) | Mobile client, API server, database, media store, và luồng giữa chúng |
| 4.8.5 | Data Design | Sơ đồ 11 collection và quan hệ giữa chúng |
| 4.8.6 | UML | Use case diagram và ít nhất 1 sequence diagram, nên chọn luồng quét ảnh vì nó phức tạp nhất |
| 4.8.7 | Wireframes | Màn hình chính và luồng người dùng |

---

# 🔴 VIỆC CẦN MÀY

## Cần dữ liệu người dùng (chặn 4 mục)

| Mục | Cần gì | Từ đâu |
|---|---|---|
| 4.2.1 | Ghi chép 5 buổi phỏng vấn | Phỏng vấn sau khi có ethics |
| 4.2.2 | File CSV kết quả khảo sát | Google Form, tối thiểu 20 phiếu |
| 4.3 | Dữ liệu trên | Rút persona từ dữ liệu |
| 4.5 | Điểm trung bình câu 13 | Xếp MoSCoW |

> **Khi có dữ liệu, đưa file CSV cho ta là ta viết luôn phần phân tích.**

## Cần mày trải nghiệm hoặc tra cứu

| # | Việc | Mục |
|---|---|---|
| 1 | Chạy `npx license-checker --summary` ở frontend và backend | 4.7.1 |
| 2 | Tra chính sách sở hữu trí tuệ trong sổ tay sinh viên | 4.7.1 |
| 3 | Điền mã số phê duyệt ethics sau khi được duyệt | 4.1.1, 4.7.3 |
| 4 | Xác nhận NFR1 sáu mươi giây có đúng với dữ liệu câu 15 không | 4.6 |

## Ta làm được ngay nếu mày muốn

**Ta dựng được toàn bộ sơ đồ ở mục 4.8** dưới dạng mã Mermaid. Mày dán vào `mermaid.live`, nó vẽ ra hình, chụp lại chèn vào Word. Gồm C4 Level 1, C4 Level 2, sơ đồ dữ liệu 11 collection, use case, và sequence diagram luồng quét ảnh.

**Ta cũng dựng được biểu đồ Gantt** cho Chương 5 dưới dạng file Excel.

Nói một tiếng là ta làm.

---

**Đã trích dẫn trong chương:** Helander et al. (2014), Karolita et al. (2023), Alhammad et al. (2024), Yang et al. (2025), Liu et al. (2025), Nazer et al. (2023), Ueda et al. (2024), Mifflin et al. (1990), Herrmann et al. (2024).

> 📌 Chương này dùng tới **6 nguồn trước đó đang ở trạng thái chờ** trong bảng kiểm tra của REFERENCES.md. Giờ chúng đã được trích thật.
