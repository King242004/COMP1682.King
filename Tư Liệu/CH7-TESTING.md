# Chapter 7: Testing

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối xám là ghi chú của ta, **không đưa vào**.
>
> **Trạng thái:** ✅ 7.1, 7.2, 7.3, 7.5 viết xong · 🔴 7.4 UAT và 7.6 chờ dữ liệu người tham gia
> Mọi test case dưới đây **lấy từ bộ test thật đang chạy trong repo**, không phải liệt kê lý thuyết.

---

## 7.1 Test Strategy

### 7.1.1 Scope

Testing covers the server side application logic, the integration between the client and the server, and the usability of the completed system. Three levels are applied, each answering a different question.

**Unit testing** verifies that individual calculation and filtering functions produce correct results for given inputs. These functions encode rules whose correctness cannot be established by inspecting the interface, because an incorrect energy target or an incorrect safety decision looks identical to a correct one on screen.

**Integration testing** verifies that the API endpoints behave correctly end to end against a live database, including authentication, validation, error handling and data lifecycle.

**User Acceptance Testing** verifies that the completed system meets a real user need, which no automated test can establish.

Out of scope are performance and load testing, which are not meaningful for a project with no production user base, and automated user interface testing, which was judged a poor use of limited time relative to manual verification on a physical device.

### 7.1.2 Test Environment

**Table 7.1 Test environment**

| Element | Configuration |
|---|---|
| Unit test framework | Jest 30.4.2 |
| Integration test harness | Custom Node.js script executing against a running server |
| Database | MongoDB Atlas, the same managed service used in normal operation |
| Client verification device | Physical iPhone running the application through Expo Go |
| Secondary verification | Web build served by the development server, used for rapid iteration |

Integration tests execute against a live database rather than a mocked one. This was a deliberate choice. A mocked database verifies that the application calls the database correctly, but not that the schema constraints, unique indexes and validation rules behave as intended, and several of the system's guarantees are enforced at exactly that layer.

The integration suite creates disposable user accounts, exercises the full lifecycle and then deletes those accounts, so it leaves no residue and can be run repeatedly.

> 💡 **Ghi chú:** đoạn giải thích vì sao dùng database thật thay vì giả lập là chỗ ăn điểm. Mày nêu **lý do kỹ thuật cụ thể**: nhiều ràng buộc của hệ thống nằm ở tầng database (chỉ mục duy nhất, validation), mock thì không kiểm được.

### 7.1.3 Entry and Exit Criteria

**Table 7.2 Entry and exit criteria**

| Level | Entry criteria | Exit criteria |
|---|---|---|
| Unit | Function implemented and its expected behaviour specified | All assertions pass |
| Integration | Server running, database reachable, unit tests passing | All checks pass, no residual test data |
| User Acceptance | All Must Have requirements implemented, integration suite passing, ethical approval obtained | Minimum five participants completed, mean SUS score recorded |

## 7.2 Test Plan

Testing was conducted continuously rather than as a terminal phase. Each development cycle concluded with the full automated suite being executed, and a cycle was not considered complete while any test failed. This corresponds to the Definition of Done stated in Section 5.2.2.

**Table 7.3 Test coverage by area**

| Area | Unit tests | Integration checks |
|---|---|---|
| Energy requirement calculation | 11 | 2 |
| Condition filtering | 10 | 0 |
| Authentication and password management | 0 | 8 |
| Account deletion and data erasure | 0 | 4 |
| Meal logging | 0 | 7 |
| Meal planning | 0 | 6 |
| Community | 0 | 5 |
| Exercise logging | 0 | 3 |
| Weight tracking | 0 | 3 |
| Error handling | 0 | 2 |
| Coach | 0 | 1 |
| **Total** | **21** | **41** |

Every test in both suites passes. Execution output is included in Appendix `[[X]]`.

> ⚠️ **Số liệu đã đối chiếu với lần chạy thật ngày 19/7/2026.** Nếu thêm test thì cập nhật lại bảng, đếm bằng `npm test` và `npm run test:api` trong thư mục `backend`.

## 7.3 Test Cases

### 7.3.1 Unit Tests: Energy Requirement Calculation

These tests verify the implementation of the Mifflin St Jeor equation (Mifflin et al., 1990) and the goal adjustment applied to it.

**Table 7.4 Unit test cases, energy calculation**

| ID | Test case | Expected result | Status |
|---|---|---|---|
| UT01 | Male, 70 kg, 175 cm, 25 years, moderate activity | 2594 kcal | Pass |
| UT02 | Female, 45 kg, 150 cm, 25 years, sedentary | 1322 kcal | Pass |
| UT03 | Unrecognised activity level supplied | Falls back to moderate multiplier | Pass |
| UT04 | One or more body metrics missing | Returns null rather than a wrong number | Pass |
| UT05 | Goal set to lose weight | 500 kcal subtracted from requirement | Pass |
| UT06 | Goal set to gain muscle | 300 kcal added to requirement | Pass |
| UT07 | Goal set to eat healthily | Requirement unchanged | Pass |
| UT08 | Small female user with weight loss goal | Floor of 1200 kcal enforced | Pass |
| UT09 | Small male user with weight loss goal | Floor of 1500 kcal enforced | Pass |
| UT10 | Complete user object supplied | Full automatic goal computed | Pass |
| UT11 | Incomplete user object supplied | Returns null | Pass |

Test cases UT08 and UT09 warrant comment. The safety floor prevents the system from ever recommending an energy target below a level considered safe, regardless of what the arithmetic produces. A very small user with an aggressive weight loss goal would otherwise receive a target low enough to be harmful. This is an instance of the Public Interest obligation discussed in Section 4.7.4, implemented as a tested constraint rather than as an intention.

Test case UT04 is equally deliberate. Returning null when data is missing forces the calling code to handle the absence explicitly, whereas returning a plausible looking default would allow an unfounded number to propagate into guidance.

> 💡 **Ghi chú:** hai đoạn giải thích này biến bảng test từ danh sách khô khan thành **lập luận thiết kế**. Người chấm thấy mày hiểu vì sao viết test đó chứ không chỉ viết cho đủ.

### 7.3.2 Unit Tests: Condition Filtering

These tests verify the safety layer described in Section 6.3.3, which is the component with the highest consequence of failure in the system.

**Table 7.5 Unit test cases, condition filtering**

| ID | Test case | Expected result | Status |
|---|---|---|---|
| UT12 | Gout condition, dishes containing shellfish, red meat, organ meat or beer | All flagged as forbidden | Pass |
| UT13 | Gout condition, dishes without purine rich ingredients | All permitted | Pass |
| UT14 | Diabetes condition, sugary desserts and drinks | All flagged | Pass |
| UT15 | Hypertension condition, salty and processed foods | All flagged | Pass |
| UT16 | High cholesterol condition, fried food and organ meat | All flagged | Pass |
| UT17 | Gastritis condition, spicy and sour dishes and coffee | All flagged | Pass |
| UT18 | No conditions declared | Nothing blocked | Pass |
| UT19 | Multiple conditions declared, dish violates more than one | First violated condition reported | Pass |
| UT20 | Mixed list of safe and violating dishes | Safe dishes kept, violating dishes removed with a stated reason | Pass |
| UT21 | No conditions declared, mixed list supplied | Entire list returned unchanged | Pass |

Test case UT19 addresses the comorbidity finding established in Section 1.2, namely that a majority of individuals with diabetes in the target population also have hypertension (Vu et al., 2023). The filter must therefore evaluate a dish against every declared condition rather than only the first, and this test verifies that behaviour.

Test case UT18 verifies the negative case. A filter that blocks nothing when no condition is declared is as important as one that blocks correctly when a condition is present, because over blocking would make the application useless to users without a diagnosed condition.

### 7.3.3 Integration Tests

The integration suite exercises each API area against a live server and database. Table 7.6 presents the checks grouped by concern.

**Table 7.6 Integration test cases**

| ID | Area | Test case | Expected | Status |
|---|---|---|---|---|
| IT01 | Auth | Register new account | 201 Created | Pass |
| IT02 | Auth | Register with an email already in use | 400 rejected | Pass |
| IT03 | Auth | Sign in with incorrect password | 400 rejected | Pass |
| IT04 | Auth | Request with a malformed token | 401 rejected | Pass |
| IT05 | Auth | Change password with wrong current password | 400 rejected | Pass |
| IT06 | Auth | Change password with correct current password | 200 succeeded | Pass |
| IT07 | Auth | Sign in with the new password | 200 succeeded | Pass |
| IT08 | Auth | Request recovery code for unknown email | 404 rejected | Pass |
| IT09 | Error | Malformed JSON request body | 400 with JSON error, not HTML | Pass |
| IT10 | Error | Malformed identifier in path | 400 Invalid id | Pass |
| IT11 | Meals | Log a meal for today | 201 Created | Pass |
| IT12 | Meals | Log a meal for a past date | 201 Created | Pass |
| IT13 | Meals | Log a meal for a future date | 400 rejected | Pass |
| IT14 | Meals | Edit macronutrients to zero | Zero persisted, not treated as absent | Pass |
| IT15 | Meals | Move an existing meal to a future date | 400 rejected | Pass |
| IT16 | Meals | Retrieve meals by date with totals | Correct totals returned | Pass |
| IT17 | Meals | Retrieve history | Both logged meals present | Pass |
| IT18 | Exercise | Log a workout | 201 with energy expenditure computed | Pass |
| IT19 | Exercise | Log a workout for a future date | 400 rejected | Pass |
| IT20 | Exercise | Delete a workout | 200 succeeded | Pass |
| IT21 | Plan | Add a planned meal for today | 201 Created | Pass |
| IT22 | Plan | Add a planned meal for a future date | 201 Created, plans may be future | Pass |
| IT23 | Plan | Mark a future planned meal as eaten | 400 rejected | Pass |
| IT24 | Plan | Mark today's planned meal as eaten | 200, diary entry created | Pass |
| IT25 | Plan | Mark the same planned meal as eaten twice | 400 rejected, operation idempotent | Pass |
| IT26 | Plan | Request shopping list for an empty date range | 400 rejected | Pass |
| IT27 | Weight | Log a weight for a future date | 400 rejected | Pass |
| IT28 | Weight | Log a weight entry | 201 Created | Pass |
| IT29 | Weight | Automatic goal follows a weight change | Recalculated to 2063 kcal at 68 kg | Pass |
| IT30 | Weight | Custom goal survives a weight change | Remains 1800 kcal | Pass |
| IT31 | Community | Create a post carrying a caption but no photograph | 400 rejected | Pass |
| IT32 | Community | Create a post with a photograph | 201 Created | Pass |
| IT33 | Community | Created post carries an identifier | Identifier present | Pass |
| IT34 | Community | Explore feed contains the user's own post | Post present | Pass |
| IT35 | Community | Like toggles on and off | State toggles correctly | Pass |
| IT36 | Coach | Retrieve conversation history | 200 with list | Pass |
| IT37 | Account | Delete account with wrong password | 400 rejected | Pass |
| IT38 | Account | Delete account with correct password | 200 succeeded | Pass |
| IT39 | Account | Sign in after deletion | 400 rejected | Pass |
| IT40 | Account | All meal data removed after deletion | No records remain | Pass |
| IT41 | Weight | Weight entries returned for the user | List returned | Pass |

Three groups of these cases deserve specific comment.

**Temporal validation.** Cases IT13, IT15, IT19, IT23 and IT27 all verify the same underlying rule, expressed across different resources. A record of something that happened cannot be dated in the future, whereas a plan for something intended can be. The distinction is that a diary is a record of the past and a plan is an intention for the future, and the system enforces this consistently rather than resource by resource.

**Idempotency.** Case IT25 verifies that marking a planned meal as eaten twice does not create two diary entries. Without this guarantee, an accidental double tap would silently double the recorded energy intake for that meal.

**Data erasure.** Cases IT37 to IT40 verify the right to erasure discussed in Section 4.7.1. Verifying that sign in fails after deletion is necessary but not sufficient, so IT40 additionally verifies that the underlying records are gone rather than merely inaccessible.

**A stale expectation discovered during documentation.** Case IT31 originally asserted that a post consisting of a caption without a photograph would be accepted. That assertion was written before the rule requiring every post to carry at least one photograph was introduced, and the test was not updated when the rule changed. Re-running the suite while preparing this chapter surfaced the discrepancy, which had two consequences. The check reported a failure that reflected an outdated expectation rather than a defect, and because the subsequent line read a field from a response that no longer contained it, the run terminated early and eight further checks did not execute.

Both problems were corrected. The expectation was inverted so that the case now verifies the photograph requirement, a companion case was added to create a post correctly, and a guard was introduced so that a single failure no longer prevents the remaining checks from running. The episode is recorded here rather than quietly fixed because it illustrates a general risk. A test suite encodes the behaviour expected at the time it was written, so changing a business rule without revisiting the tests produces a suite that reports confidently on the wrong thing.

> 💡 **Ghi chú:** ba đoạn này rất giá trị. Đặc biệt đoạn temporal validation, nó cho thấy mày nhận ra **một quy tắc chung áp dụng nhất quán qua nhiều tài nguyên** chứ không phải sửa lỗi lẻ tẻ từng chỗ.

## 7.4 User Acceptance Testing

`[[🔴 CHỜ DỮ LIỆU NGƯỜI THAM GIA]]`

### 7.4.1 Session Design

Cấu trúc ta dựng sẵn, mày chạy xong điền kết quả vào:

Each session lasts approximately twenty minutes and follows the same structure for every participant. Participants use a pre-created test account so that no personal health information is entered.

**Table 7.7 User Acceptance Testing task list**

| # | Task | Requirement verified | Success measure |
|---|---|---|---|
| 1 | Complete the profile and declare a health condition | Profile and condition declaration | Completed without assistance |
| 2 | Log a meal by photographing it | Photograph recognition | Correct dish selected from candidates |
| 3 | Log a meal manually | Manual logging | Completed within the time budget |
| 4 | Review the daily summary | Summary presentation | Participant correctly states remaining energy |
| 5 | Ask the coach whether a named dish is suitable | Condition aware guidance | Participant receives and understands guidance |
| 6 | Record a workout | Exercise logging | Completed without assistance |

For each task the following are recorded: whether it was completed, time taken, number of errors, and whether assistance was required.

### 7.4.2 SUS Scoring

After completing the tasks, each participant responds to the ten item System Usability Scale (Brooke, 1996) on a five point agreement scale. Scoring follows the standard procedure. For odd numbered items the score contribution is the response minus one, for even numbered items it is five minus the response, and the sum is multiplied by 2.5 to produce a value between 0 and 100.

A mean score of 68 represents the established average across evaluated systems, and this is the threshold stated in the success criteria in Section 5.4.2.

### 7.4.3 Results

`[[🔴 ĐIỀN SAU KHI CHẠY UAT]]`

**Table 7.8 Task completion (template)**

| Participant | T1 | T2 | T3 | T4 | T5 | T6 | Completed |
|---|---|---|---|---|---|---|---|
| P1 | | | | | | | |
| P2 | | | | | | | |
| P3 | | | | | | | |
| P4 | | | | | | | |
| P5 | | | | | | | |

**Table 7.9 SUS scores (template)**

| Participant | SUS score |
|---|---|
| P1 | |
| P2 | |
| P3 | |
| P4 | |
| P5 | |
| **Mean** | |

> 💡 **Con số đáng đo nhất trong buổi UAT:** thời gian và số thao tác để hoàn thành tác vụ 2 và tác vụ 3, tức ghi một bữa ăn.
> Đem so trực tiếp với số thao tác mày đếm được ở các app đối thủ tại Chương 3. Nếu app mày ít thao tác hơn thật, đó là **bằng chứng định lượng cho toàn bộ luận điểm giảm ma sát** đã dựng từ Chương 2. Dùng lại ở Chương 8.

## 7.5 Requirements Traceability Matrix

The matrix links each functional requirement to the test cases that verify it, demonstrating that no requirement is unverified and that no test is orphaned.

`[[⚠️ CỘT REQUIREMENT ID CHỜ MoSCoW Ở MỤC 4.5]]`

**Table 7.10 Requirements traceability**

| Req ID | Requirement | Test cases | Verified |
|---|---|---|---|
| FR01 | User can register and authenticate | IT01 to IT04, IT08 | ✅ |
| FR02 | User can declare profile and health conditions | IT01, UAT T1 | 🟡 Pending UAT |
| FR03 | System computes an energy requirement from profile | UT01 to UT11, IT29, IT30 | ✅ |
| FR04 | User can log a meal manually | IT11 to IT17, UAT T3 | 🟡 Pending UAT |
| FR05 | User can log a meal by photograph | UAT T2 | 🔴 Pending UAT |
| FR06 | System prevents recording events in the future | IT13, IT15, IT19, IT27 | ✅ |
| FR07 | User can log physical activity | IT18 to IT20, UAT T6 | 🟡 Pending UAT |
| FR08 | User can record body weight | IT27 to IT30 | ✅ |
| FR09 | System generates a weekly plan | IT21, IT22 | ✅ |
| FR10 | User can mark a planned meal as eaten | IT24, IT25 | ✅ |
| FR11 | Guidance is filtered by declared condition | UT12 to UT21 | ✅ |
| FR12 | User can converse with the coach | IT35, UAT T5 | 🟡 Pending UAT |
| FR13 | User can share and interact with community posts | IT31 to IT35 | ✅ |
| FR14 | User can permanently delete their account and data | IT37 to IT40 | ✅ |
| FR15 | System handles errors without exposing internal detail | IT09, IT10 | ✅ |

> ⚠️ Mã FR01 tới FR15 hiện là **tạm đặt**. Khi mày có dữ liệu khảo sát và lập bảng MoSCoW ở mục 4.5, phải **đánh lại mã cho khớp** rồi cập nhật bảng này.

## 7.6 Test Report Summary

`[[🔴 HOÀN THIỆN SAU KHI CÓ UAT]]`

Khung sẵn, mày điền số vào:

Automated testing comprises 21 unit tests and 41 integration checks, all of which pass. Unit testing covers the energy calculation and condition filtering logic in full. Integration testing covers every API area, verifying authentication, validation, temporal rules, idempotency and data erasure against a live database.

`[[Bổ sung: tỉ lệ pass của kiểm thử chức năng, so với ngưỡng 90 phần trăm ở mục 5.4.2]]`

`[[Bổ sung: kết quả UAT, điểm SUS trung bình, so với ngưỡng 68]]`

`[[Bổ sung: các lỗi phát hiện trong UAT và cách xử lý]]`

---

# TÓM TẮT VIỆC CẦN LÀM

| # | Việc | Chặn bởi |
|---|---|---|
| 1 | Chạy UAT với tối thiểu 5 người, điền bảng 7.8 và 7.9 | Ethical approval |
| 2 | **Đo thời gian và số thao tác ghi một bữa ăn** trong UAT | Ethical approval |
| 3 | Đánh lại mã FR cho khớp bảng MoSCoW mục 4.5 | Dữ liệu khảo sát |
| 4 | Hoàn thiện mục 7.6 với số thật | Mục 1 và 2 |
| 5 | Chụp ảnh kết quả chạy `npm test` và `npm run test:api` làm phụ lục | Không, làm được ngay |

**Đã trích dẫn:** Mifflin et al. (1990), Vu et al. (2023), Brooke (1996). Cả ba đều có trong danh mục đã xác minh.

> 📌 Chương này dùng Brooke (1996), nguồn trước đó đang ở trạng thái chờ trong bảng kiểm tra REFERENCES.md. Giờ đã được trích thật.
