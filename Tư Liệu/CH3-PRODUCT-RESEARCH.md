# Chapter 3: Product Research (Competitor Analysis)

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối xám là ghi chú của ta, **không đưa vào**.
>
> 🔴 **CHƯƠNG NÀY KHÁC CÁC CHƯƠNG TRƯỚC.** Ta viết được khung, phương pháp, tiêu chí và bảng, nhưng **phần nhận xét từng ứng dụng thì mày phải tự dùng thật rồi điền**.
> Ta **không bịa** kết quả chấm điểm khả dụng, vì đó là dữ liệu quan sát và thầy sẽ hỏi mày đã dùng thật chưa.

---

## 3.1 Introduction

This chapter examines existing products in the problem space. It is distinct from Chapter 2 in both object and method. Where the literature review evaluates academic theory, this chapter evaluates deployed commercial software, and where the literature review synthesises published findings, this chapter reports direct observation.

The purpose is twofold. First, to establish what current products actually provide, so that the gap identified in Section 2.4 can be tested against practice rather than asserted from theory. Second, to identify usability strengths worth adopting and weaknesses worth avoiding in the design of this project's artefact.

Five products were evaluated. Each was installed on a physical device and used for a period of structured exploration covering registration, logging a Vietnamese meal, and reviewing the resulting summary.

`[[⚠️ SỬA CÂU CUỐI CHO ĐÚNG SỰ THẬT]]`

> 🔴 Câu cuối mô tả cách mày đánh giá. **Chỉ giữ nguyên nếu mày làm đúng như vậy.** Nếu mày dùng ít app hơn hoặc dùng cách khác thì phải sửa cho đúng. Đừng để nguyên rồi thầy hỏi mà không trả lời được.

## 3.2 Competitor Selection

Products were selected to cover both direct competition, meaning products serving the same user group with similar functionality, and indirect competition, meaning products addressing the same underlying problem by different means.

**Table 3.1 Selected competitors and rationale**

| Product | Type | Rationale for selection |
|---|---|---|
| MyFitnessPal | Direct | The most widely adopted nutrition tracking application internationally, representing the mainstream approach against which any new entrant is implicitly compared |
| Cronometer | Direct | Positioned around precision and micronutrient depth, representing the opposite end of the effort spectrum from casual tracking |
| Lifesum | Direct | Offers structured dietary programmes rather than logging alone, representing the guidance oriented segment |
| `[[CHỌN 1 ỨNG DỤNG VIỆT NAM]]` | Direct, domestic | Serves the same national user group and food culture, providing the closest comparison for Vietnamese dish coverage |
| Walking Charlie | Indirect | Addresses sustained engagement through gamification rather than through nutrition, included because engagement is the failure mode identified in Section 2.2.3 |

> 🔴 **Mày phải chọn một ứng dụng Việt Nam.** Tìm trên App Store hoặc CH Play với từ khoá "đếm calo", "dinh dưỡng", "giảm cân". Đây là mục quan trọng vì nó cho thấy mày **hiểu thị trường trong nước**, không chỉ so với app quốc tế.

## 3.3 Heuristic Evaluation

### 3.3.1 Method

Each product was assessed against the ten usability heuristics defined by Nielsen (1994). Issues identified were rated for severity on the five point scale shown in Table 3.2.

**Table 3.2 Severity rating scale (Nielsen, 1994)**

| Rating | Meaning |
|---|---|
| 0 | Not a usability problem |
| 1 | Cosmetic problem, need not be fixed unless time permits |
| 2 | Minor usability problem, low priority |
| 3 | Major usability problem, high priority |
| 4 | Usability catastrophe, imperative to fix |

**Table 3.3 Heuristics applied**

| # | Heuristic | Question asked of each product |
|---|---|---|
| 1 | Visibility of system status | Does the product give immediate feedback for every action |
| 2 | Match between system and real world | Does it use everyday language, and does it name food in terms the user recognises |
| 3 | User control and freedom | Can an action be undone, and can the user navigate away freely |
| 4 | Consistency and standards | Are controls, labels and flows consistent throughout |
| 5 | Error prevention | Are inputs validated, and are common mistakes prevented |
| 6 | Recognition rather than recall | Is information visible, or must the user remember it |
| 7 | Flexibility and efficiency of use | Are there shortcuts for repeated actions |
| 8 | Aesthetic and minimalist design | Is the interface focused, or cluttered with secondary content |
| 9 | Help users recognise and recover from errors | Are error messages in plain language with a route to recovery |
| 10 | Help and documentation | Is help available without leaving the current task |

### 3.3.2 Findings

`[[🔴 MÀY PHẢI TỰ ĐIỀN PHẦN NÀY]]`

> **Ta không viết thay được, và ta cũng không nên.** Đây là dữ liệu quan sát trực tiếp. Nếu ta bịa điểm số thì đó là ngụy tạo dữ liệu, cùng loại vi phạm với bịa kết quả khảo sát.
>
> **Cách làm, khoảng 30 phút mỗi app:**
> 1. Cài app, đăng ký tài khoản
> 2. Thử ghi lại **một món Việt Nam cụ thể**, ví dụ "phở bò" hoặc "cơm tấm sườn". Đây là phép thử quan trọng nhất, vì nó bộc lộ ngay điểm yếu về dữ liệu món Việt
> 3. Thử xem tổng kết ngày
> 4. Thử tìm xem có chỗ nào khai báo bệnh nền không, và nếu có thì app dùng thông tin đó làm gì
> 5. **Chụp màn hình mọi chỗ thấy khó dùng**
> 6. Với mỗi heuristic, ghi lại vấn đề gặp phải kèm mức độ nghiêm trọng 0 tới 4
>
> **Điền vào bảng mẫu dưới đây cho từng ứng dụng.**

**Table 3.4 Heuristic evaluation summary**

| Heuristic | MyFitnessPal | Cronometer | Lifesum | `[[App VN]]` | Walking Charlie |
|---|---|---|---|---|---|
| 1. Visibility of system status | | | | | |
| 2. Match with real world | | | | | |
| 3. User control and freedom | | | | | |
| 4. Consistency and standards | | | | | |
| 5. Error prevention | | | | | |
| 6. Recognition over recall | | | | | |
| 7. Flexibility and efficiency | | | | | |
| 8. Aesthetic and minimalist design | | | | | |
| 9. Error recovery | | | | | |
| 10. Help and documentation | | | | | |
| **Mean severity** | | | | | |

> 💡 **Gợi ý chỗ nên chú ý khi thử**, dựa trên đặc điểm chung của loại sản phẩm này:
> - **Heuristic 2** thường là chỗ lộ điểm yếu rõ nhất với món Việt. Gõ "phở bò" xem ra kết quả gì, tên món có đúng không, số liệu có hợp lý không
> - **Heuristic 7** liên quan trực tiếp tới vấn đề gánh nặng nhập liệu ở mục 2.2.3. Ghi lại **số thao tác cần thiết để log một bữa ăn**, con số này rất đắt giá vì so sánh được trực tiếp với app của mày
> - **Heuristic 5** xem app có cảnh báo gì khi nhập số liệu vô lý không
>
> Ghi **số thao tác để log một bữa** cho từng app. Đây là con số mày dùng lại được ở Chương 7 và Chương 8 để chứng minh app mình giảm ma sát thật.

## 3.4 Feature Comparison Matrix

**Table 3.5 Feature comparison**

| Capability | MyFitnessPal | Cronometer | Lifesum | `[[App VN]]` | Walking Charlie | **MealMate** |
|---|---|---|---|---|---|---|
| Manual meal logging | Yes | Yes | Yes | | No | Yes |
| Photograph based dish recognition | | | | | No | **Yes** |
| Barcode scanning | Yes | Yes | Yes | | No | Yes |
| Vietnamese dish coverage | Limited | Limited | Limited | | Not applicable | **Primary focus** |
| Declares chronic conditions | | | | | No | **Yes** |
| Guidance filtered by declared condition | | | | | No | **Yes** |
| Conversational nutrition assistant | | | | | No | **Yes** |
| Weekly meal plan generation | | | | | No | Yes |
| Exercise logging | Yes | Yes | Yes | | Steps only | Yes |
| Body weight tracking | Yes | Yes | Yes | | | Yes |
| Community sharing | Yes | Limited | | | | Yes |
| Available in Vietnamese | | | | Yes | | **Yes** |
| Free tier covers core features | | | | | | Yes |

`[[⚠️ CẦN MÀY KIỂM CHỨNG VÀ ĐIỀN Ô TRỐNG]]`

> 🔴 **Ta cố ý để trống nhiều ô.** Ứng dụng thương mại thay đổi tính năng và giá liên tục, nên nếu ta điền theo hiểu biết cũ thì rất dễ sai, mà sai một ô là thầy vặn được cả bảng.
>
> **Mày mở từng app kiểm chứng rồi điền.** Ô nào không chắc thì ghi "Not observed" chứ đừng đoán.
>
> ⚠️ Đặc biệt kiểm tra kỹ dòng **"Guidance filtered by declared condition"**. Đây là dòng quan trọng nhất bảng, vì nó chính là điểm khác biệt của mày. Nếu có app nào làm rồi thì mày phải biết trước để điều chỉnh luận điểm, chứ đừng để thầy phát hiện.

## 3.5 Summary and Implications

`[[⚠️ VIẾT SAU KHI ĐIỀN XONG BẢNG]]`

Khung lập luận ta dựng sẵn, mày điền số liệu thật vào rồi hoàn thiện:

The evaluation supports three conclusions.

**First**, the products reviewed are constructed around quantification. Each records consumption accurately and computes totals against a target, and each does so competently. The interpretive question of whether a given item is appropriate for a given medical condition is not addressed by any product reviewed.

`[[⚠️ Câu trên chỉ giữ nếu bảng 3.5 xác nhận đúng như vậy sau khi mày kiểm chứng]]`

**Second**, coverage of Vietnamese cuisine is a consistent weakness among the international products. `[[Bổ sung quan sát cụ thể: gõ tên món Việt ra kết quả gì]]` This corroborates from practice the dataset composition problem identified in the literature (Liu et al., 2025).

**Third**, the effort required to record a single meal is substantial across the products reviewed. `[[Bổ sung số thao tác đo được cho từng app]]` This observation corroborates the abandonment problem identified by Helander et al. (2014) and reinforces the design priority stated in Section 2.2.3.

These findings inform three design decisions in this project. Recognition by photograph is prioritised in order to reduce logging effort. Vietnamese dish naming and nutritional estimation are treated as a primary requirement rather than a localisation task. Declared condition is made an active constraint on guidance rather than a stored profile attribute.

---

# TÓM TẮT VIỆC MÀY PHẢI LÀM

| # | Việc | Thời gian | Mức |
|---|---|---|---|
| 1 | Chọn 1 ứng dụng dinh dưỡng Việt Nam làm đối thủ nội địa | 15 phút | 🔴 |
| 2 | Cài và dùng thử 5 app, mỗi app khoảng 30 phút | 2 tới 3 giờ | 🔴 |
| 3 | Chấm 10 heuristic cho từng app, điền bảng 3.4 | Làm cùng lúc | 🔴 |
| 4 | Đếm **số thao tác để log một bữa ăn** ở từng app | Làm cùng lúc | 🔴 Rất giá trị |
| 5 | Kiểm chứng và điền ô trống bảng 3.5 | Làm cùng lúc | 🔴 |
| 6 | Chụp màn hình mọi chỗ thấy khó dùng, để làm phụ lục | Làm cùng lúc | 🔴 |
| 7 | Hoàn thiện mục 3.5 với số liệu thật | 30 phút | 🔴 |

> 💡 **Mẹo:** vừa dùng vừa ghi luôn vào file này, đừng để dùng xong mới nhớ lại. Chi tiết khó chịu nhất là thứ quên nhanh nhất.
>
> **Con số đáng giá nhất mày thu được ở đây là số thao tác để log một bữa ăn.** Nếu MyFitnessPal cần 8 thao tác mà app mày cần 3, đó là bằng chứng định lượng cho toàn bộ luận điểm giảm ma sát. Dùng lại được ở cả Chương 7 lẫn Chương 8.

**Đã trích dẫn:** Nielsen (1994), Liu et al. (2025), Helander et al. (2014). Cả ba đều có trong danh mục đã xác minh.
