# Chapter 5: Methodology and Project Planning

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối xám là ghi chú của ta, **không đưa vào**.
> Các ví dụ cá nhân trong chương này lấy từ **lịch sử phát triển thật** của mày, không bịa.

---

## 5.1 Development Methodology

### 5.1.1 Methodology Comparison

Two methodological families were evaluated before a decision was taken. Table 5.1 summarises the comparison.

**Table 5.1 Comparison of methodological approaches**

| Criterion | Waterfall (Royce, 1970) | Agile Scrum (Beck et al., 2001) |
|---|---|---|
| Structure | Sequential phases, each completed before the next begins | Iterative cycles, each producing a working increment |
| Requirements | Fixed at the outset | Expected to evolve throughout |
| Testing | Concentrated late in the lifecycle | Continuous within each iteration |
| Strengths | Clear milestones, comprehensive documentation, straightforward progress tracking | Adapts to change, working software at every stage, early defect detection |
| Weaknesses | No mechanism to revisit earlier phases, risk concentrated at the end | Requires discipline, scope can expand without control |
| Fit for this project | Poor | Good |

The sequential model was rejected for a specific reason rather than a general preference. This project's requirements depend on user research conducted during the project itself, as stated in Objective 2. A methodology that closes the requirements phase before implementation begins provides no route to incorporate findings that arrive afterwards. Adopting it would mean either conducting no user research or ignoring its results, and both outcomes are unacceptable.

The iterative approach was selected because it accommodates evolving requirements by design, and because it produces a demonstrable artefact continuously rather than only at completion. The latter property materially reduces risk in a project assessed on a fixed date.

The acknowledged weakness of the iterative approach, namely uncontrolled scope expansion, was addressed through the explicit scope boundary defined in Section 1.5 and through the practice described in Section 5.1.3.

> 💡 **Ghi chú:** template và thầy đều cảnh báo chỉ viết "tôi dùng Agile" là gần như không có điểm. Ở đây mày **so sánh có tiêu chí, chốt lựa chọn, và nêu lý do cụ thể gắn với objective của mình**, chứ không nói chung chung.

### 5.1.2 Scrum Adapted for Solo Development

Scrum presupposes a development team. Several of its ceremonies exist to coordinate work between people rather than to produce software, so applying the framework unmodified to a single developer project would introduce ritual without benefit. Table 5.2 records how each element was adapted and why.

**Table 5.2 Scrum adaptation for single developer working**

| Standard Scrum element | Purpose in a team | Adaptation applied |
|---|---|---|
| Product Owner | Prioritises the backlog on behalf of stakeholders | The student holds this role. The supervisor acts as the approving stakeholder at scheduled meetings, providing the external challenge that a solo developer otherwise lacks |
| Scrum Master | Removes impediments for the team | Self managed. Impediments are raised at supervisor meetings, which is where an obstacle beyond the student's control can be escalated |
| Development Team | Delivers the increment | The student is the sole member |
| Daily Standup | Synchronises the team daily | Replaced by a short written progress note at the end of each working session. The coordination purpose does not apply, but the reflective purpose does, so the practice was retained in written form |
| Sprint Planning | Selects work for the coming iteration | Retained. Work for each two week cycle is selected at the start of the cycle |
| Sprint Review | Demonstrates the increment to stakeholders | Retained as the supervisor meeting at the end of each cycle, at which working software rather than a progress description is presented |
| Sprint Retrospective | Improves the team's process | Retained as written self reflection. Recorded adjustments are described in Section 5.1.3 |

The guiding principle in this adaptation was to retain any ceremony whose purpose survives the removal of the team, and to convert rather than discard those whose purpose is partially coordination. The daily standup is the clearest example. Its coordination function is void for a single developer, but its function of forcing a daily articulation of progress and obstacles is not, so it was preserved in a form that serves the surviving purpose.

> 💡 **Ghi chú:** đoạn cuối là chỗ ăn điểm. Mày không chỉ liệt kê "tôi bỏ cái này giữ cái kia", mà nêu **nguyên tắc chung** để quyết định giữ hay bỏ. Đó là dấu hiệu hiểu bản chất chứ không làm theo mẫu.

### 5.1.3 Applied Practice and Recorded Adjustments

The value of a retrospective lies in whether it changes subsequent behaviour. Three adjustments made during this project are recorded here.

**Scope reduction to protect the schedule.** The community feature was originally specified to support video as well as photographs. During the cycle in which the feature was implemented, it became apparent that video introduced disproportionate additional work in upload handling, storage cost, playback and thumbnail generation, none of which advanced the project's central aim. Video was removed from scope and recorded as future work. This decision is an instance of the scope discipline described in Section 5.1.1, and it protected the schedule at the cost of a feature that was peripheral to the research question.

**Rework in response to usability feedback.** The exercise logging feature was initially implemented as a catalogue of twenty six activities with numeric duration entry. Informal testing indicated that this imposed excessive effort for an estimate that is inherently approximate. The feature was reworked in a later cycle into a simplified set of common activities with preset duration options. The original catalogue was retained internally to support matching, so the rework did not discard prior work entirely.

**Defensive redesign following a risk reassessment.** The dietary safety mechanism was initially implemented through prompt instruction alone. Reassessment during a later cycle concluded that an instruction to a generative model constitutes a request rather than a guarantee, and that the consequence of non compliance in this domain is a dietary recommendation unsuitable for a person with a medical condition. A deterministic filtering layer independent of the model was therefore added, as described in Section 6.3.3.

Each of these adjustments originated in a review or retrospective rather than in the original plan, which is the mechanism the iterative approach was selected to provide.

> 💡 **Ghi chú:** **ĐÂY LÀ MỤC QUAN TRỌNG NHẤT CHƯƠNG 5.** Thầy nhấn mạnh phải có ví dụ cá nhân thật. Ba ví dụ này đều là chuyện thật trong quá trình mày làm, và mỗi cái minh hoạ một khía cạnh khác nhau: cắt phạm vi, làm lại theo phản hồi, và thiết kế phòng thủ sau khi đánh giá lại rủi ro. Mày kể lại được trơn tru khi bảo vệ vì mày sống qua nó thật.

---

## 5.2 Project Plan and Timeline

### 5.2.1 Key Milestones

**Table 5.3 Project milestones**

| Milestone | Description | Target |
|---|---|---|
| Project Proposal | Scope, aim and plan formally defined | Week 4 |
| Contextual Report | Chapters 1 to 4 complete | Week 12 |
| Product Demonstration | All Must Have requirements implemented and demonstrable | Week 22 |
| Testing Complete | Documented test plan executed with results recorded | Week 25 |
| User Acceptance Testing Complete | Data collected from a minimum of five participants | Week 28 |
| Final Report | All chapters complete with appendices | Week 30 |

### 5.2.2 Development Cycles

**Table 5.4 Iteration plan**

| Cycle | Weeks | Delivered | Definition of Done |
|---|---|---|---|
| 1 | 10 to 11 | Authentication, user profile, body metric calculation | User can register, sign in and declare conditions. Unit tests pass |
| 2 | 12 to 13 | Meal diary, energy and macronutrient tracking | Meals can be created, edited and deleted. Daily totals correct |
| 3 | 14 to 15 | Photograph recognition, barcode lookup | Image returns candidate dishes with nutrition. User confirms before saving |
| 4 | 16 to 17 | AI coach, condition aware safety layer | All generated output passes the filter. Filter is unit tested |
| 5 | 18 to 19 | Weekly meal plan, exercise logging | Seven day plan generated. Activity logged with computed expenditure |
| 6 | 20 to 22 | Community, bilingual interface, interface refinement | Ready for demonstration and User Acceptance Testing |

`[[⚠️ CẦN MÀY ĐỐI CHIẾU với lịch thật của trường]]`

> ⚠️ Số tuần ở hai bảng trên là **khung đề xuất**, mày phải chỉnh cho khớp lịch học thật. Quan trọng là hai bảng này và biểu đồ Gantt phải **thống nhất với nhau**, người chấm sẽ đối chiếu.

### 5.2.3 Gantt Chart

`[[⚠️ CẦN CHÈN ẢNH BIỂU ĐỒ GANTT]]`

> 💡 **Ta làm được cái này cho mày.** Ta có công cụ tạo file Excel, dựng được biểu đồ Gantt 30 tuần với các nhóm công việc tô màu, mày chỉ việc chỉnh số tuần cho khớp lịch trường rồi chụp ảnh chèn vào.
> Các nhóm cần thể hiện: Research and Proposal (tuần 1 tới 4), Literature Review (4 tới 9), User Research (6 tới 9), Requirements and Design (9 tới 12), Cycle 1 tới 6 (10 tới 22), Testing (22 tới 25), UAT and Evaluation (25 tới 28), Report Writing (4 tới 30, chạy xuyên suốt).
> **Nói ta một tiếng là ta dựng.**

---

## 5.3 Risk Register

Risks were identified at the outset and reviewed at each cycle boundary. Likelihood and impact are rated on a three point scale.

**Table 5.5 Risk register**

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | Generative model API quota exhausted or pricing changed | Medium | High | Multiple API keys and model variants used in rotation with automatic fallback. Quota exhaustion surfaces an explicit message to the user rather than a silent failure | Mitigated and occurred. Fallback operated as designed |
| 2 | Dish recognition returns incorrect nutritional values | High | Medium | Multiple candidates presented for user confirmation rather than automatic entry. Design rationale in Section 6.3.4 | Mitigated by design |
| 3 | Generative model produces advice unsafe for a declared condition | Medium | High | Two independent layers. Constraint expressed in the prompt, and deterministic filtering applied to output in code | Mitigated. See Section 5.1.3 |
| 4 | Insufficient participants recruited for User Acceptance Testing | Medium | High | Recruitment begun in advance of the testing window. Target set at double the required minimum | Open |
| 5 | Scope expansion causes schedule overrun | High | High | Explicit out of scope boundary defined in Section 1.5. Emergent ideas recorded as future work rather than implemented | Mitigated and occurred. See the video decision in Section 5.1.3 |
| 6 | Source code or data loss | Low | High | Repository pushed to remote hosting after each working session. Database hosted on a managed service with provider backup | Mitigated |
| 7 | Report writing deferred to the end of the project | High | High | Report sections drafted alongside the cycle that produces the corresponding material | Open |
| 8 | Ethical approval delays user research | Medium | High | Application prepared and submitted as early as possible. Chapters not dependent on participant data written in parallel while approval is pending | Open |

> 💡 **Ghi chú:** cột **Status** là thứ khiến bảng này khác hẳn một bảng rủi ro chép mẫu. Nó cho thấy mày **thực sự theo dõi rủi ro qua thời gian**, và có hai rủi ro đã xảy ra thật rồi được xử lý đúng như kế hoạch. Người chấm thấy ngay đây là bảng sống chứ không phải bảng trang trí.

---

## 5.4 Evaluation Plan and Success Metrics

### 5.4.1 Evaluation Approach

Evaluation comprises three components, each addressing a different question.

**Functional testing** establishes whether the system does what it was specified to do. Every functional requirement is expressed as one or more documented test cases with a recorded pass or fail outcome. Automated unit tests additionally cover the calculation logic and the condition filtering service, since these encode rules whose correctness cannot be judged by inspection of the interface.

**User Acceptance Testing** establishes whether the system meets a real user need. A minimum of five external participants complete structured tasks and then respond to the System Usability Scale (Brooke, 1996), a ten item instrument selected because it is widely validated and produces a score comparable against an established benchmark.

**Critical reflection** establishes whether the project achieved what it set out to achieve. Each objective is assessed as met, partially met or not met, supported by evidence rather than assertion.

### 5.4.2 Success Metrics

**Table 5.6 Success criteria by objective**

| Obj | Objective (abbreviated) | Success criterion |
|---|---|---|
| 1 | Literature review | Minimum 10 peer reviewed sources covering all identified themes |
| 2 | User research | Minimum 5 interviews and 20 survey responses collected and analysed, producing a prioritised requirements set |
| 3 | Design and develop | All Must Have requirements implemented and demonstrable on a physical device |
| 4 | Verification | Minimum 90 percent of documented functional test cases pass |
| 5 | Evaluation | Mean System Usability Scale score of at least 68 from a minimum of 5 participants |

The threshold of 68 for the System Usability Scale is not an arbitrary figure. It is the established average across a large body of evaluated systems, so a score at or above it indicates usability that is at least typical rather than merely acceptable to the developer.

> 💡 **Ghi chú:** câu cuối quan trọng. Template cảnh báo tiêu chí mơ hồ kiểu "app sẽ chạy tốt" là mất điểm. Ở đây mọi con số đều **có căn cứ**, và mày giải thích được vì sao chọn 68 chứ không phải số khác.

---

# TÓM TẮT VIỆC CẦN LÀM CHO CHƯƠNG 5

| # | Việc | Mức |
|---|---|---|
| 1 | Đối chiếu số tuần ở bảng 5.3 và 5.4 với lịch thật của trường | 🔴 Bắt buộc |
| 2 | Chèn biểu đồ Gantt (**ta dựng được, nói một tiếng**) | 🔴 Bắt buộc |
| 3 | Bổ sung thêm ví dụ điều chỉnh nếu mày nhớ ra chuyện khác | 🟡 Nên có |

**Đã trích dẫn:** Royce (1970), Beck et al. (2001), Brooke (1996). Cả ba đều có trong danh mục đã xác minh.

**Lưu ý:** Chương 5 và Chương 2 mục 2.3.4 cùng bàn về phương pháp luận. Chương 2 lập luận **vì sao chọn**, Chương 5 mô tả **áp dụng thế nào**. Khi ghép báo cáo nhớ kiểm tra hai chỗ không lặp lại nhau.
