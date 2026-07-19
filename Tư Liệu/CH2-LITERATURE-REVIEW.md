# Chapter 2: Literature Review

> **Ghi chú:** nội dung tiếng Anh là phần đưa vào báo cáo. Khối trích dẫn xám là ghi chú của ta, **không đưa vào**.
> Toàn bộ trích dẫn lấy từ [ACADEMIC-SOURCES.md](ACADEMIC-SOURCES.md), đều đã xác minh thật.
> Viết theo **CHỦ ĐỀ** đúng yêu cầu template, không viết theo kiểu "tác giả A nói, tác giả B nói".

---

## 2.1 Introduction

This chapter establishes the academic foundation for the project. It is organised thematically rather than by source. Section 2.2 analyses the problem domain across three themes, namely the burden of diet related chronic conditions, the evidence for dietary self management as an intervention, and the effectiveness and limitations of mobile applications as a delivery mechanism. Section 2.3 critically reviews the technologies and methodologies that enable the proposed solution. Section 2.4 synthesises these strands to identify the specific gap this project addresses.

Sources were located through Google Scholar, PubMed Central, IEEE Xplore and the ACM Digital Library. Priority was given to systematic reviews and meta analyses, since these aggregate evidence across multiple primary studies. Except where a work is seminal to its field, sources were restricted to the last ten years.

---

## 2.2 Problem Domain Analysis

### 2.2.1 The burden of diet related chronic conditions

Diet related chronic conditions represent a substantial and accelerating share of the disease burden in Vietnam. National surveillance data from the STEPS survey shows that among adults aged 25 to 64, the prevalence of hypertension is 28.3 percent and the prevalence of diabetes is 7.0 percent (Vu et al., 2023). The trajectory is more concerning than the absolute figures. Analysis of successive national surveys demonstrates a sustained upward trend in metabolic risk factors across the decade to 2021 (Vu et al., 2022).

Of particular relevance to the design of any dietary support tool is the extent of comorbidity. Vu et al. (2023) report that 56.3 percent of individuals with diabetes also have hypertension, and that the prevalence of this comorbidity increased more than eightfold in ten years, rising from 0.44 percent to 3.92 percent of the population studied.

This finding carries a direct design implication. A person seeking dietary guidance frequently manages **more than one condition simultaneously**, and the dietary constraints associated with different conditions are not identical. Guidance that addresses a single condition in isolation is therefore insufficient for a majority of individuals with diabetes in this population.

> 💡 **Ghi chú:** đoạn này là **nền móng của cả báo cáo**. Nó dùng số liệu thật để chứng minh vì sao app phải xử lý nhiều bệnh cùng lúc, tức đúng thứ `conditionFilter.js` làm. Đừng sửa đoạn này.

### 2.2.2 Dietary management as a clinical intervention

Dietary modification is an established first line intervention across the conditions this project addresses, and the evidence base for each is mature.

For **hypertension**, the DASH sodium trial demonstrated that reducing dietary sodium in combination with the DASH dietary pattern produces clinically meaningful reductions in blood pressure (Sacks et al., 2001). For **type 2 diabetes**, meta analysis of randomised controlled trials shows that low glycaemic index diets significantly improve glycated haemoglobin and fasting blood glucose relative to higher glycaemic index comparators (Ojo et al., 2018), a finding supported by review evidence indicating that either reducing carbohydrate quantity or increasing soluble fibre intake favourably affects postprandial glucose (Vlachos et al., 2020). For **gout**, systematic review evidence indicates that purine restricted diets reduce serum uric acid by approximately 0.6 to 1.2 milligrams per decilitre, although the same review concludes that Mediterranean style patterns offer broader benefit by addressing cardiovascular risk concurrently (Vedder et al., 2019). Zhang et al. (2022) extend this position by examining the underlying metabolic mechanisms, arguing that dietary strategy should be integrated with wider metabolic syndrome management rather than treated as purine avoidance alone. For **gastritis**, Haley and Gaddy (2016) demonstrate that host dietary composition, particularly salt and micronutrient intake, influences Helicobacter pylori virulence expression and disease outcome.

Two observations follow from reading this literature as a whole rather than condition by condition.

First, the evidence is **specific and actionable**. It does not merely establish that diet matters, but identifies particular dietary components that should be increased or restricted for particular conditions. This specificity is what makes computational encoding of the guidance feasible.

Second, the recommendations for different conditions **can conflict**. A dietary pattern optimised for one condition is not automatically appropriate for another. Combined with the comorbidity finding in Section 2.2.1, this establishes that any system offering dietary guidance to this population must reason over multiple simultaneous constraints rather than applying a single condition profile.

The broader field of precision nutrition provides the theoretical frame for this position, arguing that nutritional recommendations should be tailored to individual phenotype rather than delivered as population level advice (de Toro-Martín et al., 2017).

> 💡 **Ghi chú:** đoạn "recommendations for different conditions can conflict" là **lập luận riêng của mày**, rút ra từ việc đọc nhiều nguồn cùng lúc. Đây đúng là "critical synthesis" mà template đòi, khác hẳn với tóm tắt từng bài.

### 2.2.3 Mobile applications as a delivery mechanism

If dietary management is effective but must occur between clinical appointments, the question becomes how guidance reaches the individual at the point of decision. Mobile applications are the dominant proposed answer, and the literature on their effectiveness is substantial but qualified.

**The evidence for effectiveness is positive but modest and time limited.** Systematic review evidence supports mobile health technology as a facilitator of weight management behaviours (Dounavi and Tsoumani, 2019), and scoping review evidence specifically concerning people with chronic diseases finds that nutrition applications can produce measurable behaviour change (Salas-Groves et al., 2023). However, Chew et al. (2022) introduce an important caveat through meta analysis, finding that weight loss achieved through smartphone applications peaks at approximately 2.18 kilograms at three months and decays to approximately 1.63 kilograms by twelve months. The intervention works, but its effect diminishes.

**The decay is explained by disengagement, and disengagement is severe.** The most striking figure in this literature comes from Helander et al. (2014), who examined a cohort of 189,770 users of a free dietary self monitoring application and found that **only 2.58 percent used the application actively**. This is not a marginal attrition problem. It indicates that the overwhelming majority of people who install such an application never derive benefit from it.

**Adherence, rather than installation, is the operative variable.** Payne et al. (2022) found that participants recorded their dietary intake on an average of 28 days out of a 56 day study period, and that consistency of self monitoring explained more variance in weight loss outcomes than completeness of individual records. Turner-McGrievy et al. (2019) converge on the same conclusion from a different angle, identifying the number of days on which a participant recorded at least two eating occasions as the strongest single marker of adherence, explaining 27 percent of variance in six month weight loss.

Reading these findings together produces the central argument of this review. The literature does not suggest that dietary tracking is ineffective. It suggests that **tracking is effective when sustained, and that sustaining it is where existing tools fail**. The barrier repeatedly identified is the burden of manual entry, which Helander et al. (2014) associate directly with abandonment.

The design implication is therefore precise. The highest value intervention available to a new entrant in this domain is **not additional analytical sophistication, but reduction of the friction involved in recording a meal**.

> 💡 **Ghi chú:** đây là **đoạn hay nhất chương này**. Nó dựng một chuỗi lập luận từ 5 nguồn khác nhau để đi tới kết luận rằng việc quan trọng nhất là giảm ma sát nhập liệu, tức chính là lý do tồn tại của tính năng quét ảnh. Chuỗi này sẽ được nhắc lại ở Chương 4 và Chương 8.

---

## 2.3 Critical Review of Enabling Technologies and Methodologies

### 2.3.1 Frontend and mobile frameworks

The client must run on both iOS and Android, which presents a choice between native development for each platform and a cross platform framework.

Empirical comparison of the leading options provides the basis for this decision. Suri et al. (2022) measured Kotlin, React Native and Flutter against processor usage, memory consumption and package management, and found that native Kotlin retains an advantage in raw resource efficiency while the cross platform frameworks substantially reduce development effort by requiring a single codebase. Jošt and Taneski (2025) approach the question from a different angle, analysing developer sentiment, community engagement and job market adoption rather than runtime metrics, and confirm React Native and Flutter as the dominant frameworks in current practice.

Reading these two studies together clarifies the trade off. The performance advantage of native development is real but bounded, and it is most pronounced in graphically intensive workloads. The advantage of a cross platform framework is a halving of implementation effort, since one codebase serves both platforms.

For this project the decision follows from the constraint rather than from the benchmark. The application is composed predominantly of forms, lists and summary views rather than sustained animation or graphical rendering, so it does not occupy the workload category in which the native advantage is material. The project is also undertaken by a single developer within a fixed thirty week period, which makes the reduction in implementation effort decisive. React Native was selected over Flutter on the further ground that it uses JavaScript and TypeScript, in which the author already has competence, thereby removing the learning overhead that adopting Dart would introduce.

> 💡 **Ghi chú:** đoạn này ăn điểm vì mày **không chọn theo cái nào nhanh hơn**, mà chọn theo ràng buộc thực tế của đồ án, và nói rõ vì sao lợi thế của native không quan trọng với loại app này.

### 2.3.2 Backend technologies

The alternative to a custom server is a backend as a service platform such as Firebase, which supplies authentication, storage and a database without server code.

The deciding consideration is not performance but the location of the trust boundary. The condition aware filtering described in Section 6.3.3 must execute where it cannot be circumvented. Logic that runs on the client can be inspected, modified or bypassed by anyone in control of the device, so a safety constraint enforced only on the client is not a constraint at all. A backend as a service platform provides limited scope for interposing custom server side logic between a generative model and the client, and the filtering step is not a data access rule of the kind such platforms are designed to express.

A custom Node.js and Express server was therefore selected, because it permits the safety filter, the model invocation and the grounding context assembly to be co-located on the server, under the developer's control and out of reach of client side modification. The event driven, non blocking model of Node.js is additionally well matched to a workload dominated by waiting on external services, namely the database, the media store and the generative model API, rather than by computation.

> ⚠️ **Mục này chưa có trích dẫn.** Ta tra nhiều lần nhưng chủ đề Node.js chỉ ra blog và bài không bình duyệt.
> **Gợi ý cho mày:** lập luận về ranh giới tin cậy ở trên là lập luận kỹ thuật phần mềm chuẩn mực, chỉ cần **một cuốn sách giáo trình** chống lưng là đủ. Sommerville *Software Engineering* hoặc Pressman đều có chương về kiến trúc client server và bảo mật. Mày mượn thư viện rồi trích một câu là xong, **lại giải quyết luôn chỉ tiêu thiếu sách**.

### 2.3.3 Database systems

The dominant access pattern in this application is retrieval of one user's records for a given day or date range, for example the meals logged today or the weight entries of the last thirty days. A secondary consideration is that several entities carry optional fields that vary between records, since a meal may or may not carry macronutrient detail and a post may or may not reference a meal.

Makris et al. (2021) compared MongoDB with PostgreSQL across a range of operations and found the document store advantageous for read heavy workloads retrieving whole documents, while the relational system retained an advantage for complex joins and aggregate operations.

This distinction maps directly onto the requirements of this project. The application performs many simple reads keyed by user and date, and performs no complex relational joins, because the domain entities are naturally owned by a single user rather than shared across users. The flexible schema additionally accommodates the optional fields noted above without requiring migration or sparse columns. MongoDB was therefore selected.

The acknowledged cost of this choice is that referential integrity is not enforced by the database. This project mitigates that cost in two ways. Uniqueness constraints that matter are declared as compound indexes, and data that must remain stable independently of its source is stored as a snapshot rather than a reference, as described in Section 6.4.

> 💡 **Ghi chú:** đoạn cuối là điểm mạnh. Mày **thừa nhận nhược điểm của lựa chọn** rồi nói cách khắc phục. Người chấm đánh giá cao chỗ này hơn là chỉ khen ưu điểm.

### 2.3.4 Development methodologies

Two methodological families were considered.

The sequential model articulated by Royce (1970) proceeds through fixed phases with requirements settled at the outset. Its strengths are clear milestones and comprehensive documentation. Its weakness in this context is decisive. Requirements for this project could not be fully determined in advance, because they depend on user research conducted during the project, and the sequential model provides no mechanism for incorporating findings that emerge after the requirements phase closes.

The iterative and incremental philosophy expressed in the Agile Manifesto (Beck et al., 2001) prioritises responding to change over following a plan, and working software over comprehensive documentation. This aligns with the conditions of this project, in which requirements evolve as user research and testing proceed, and in which a demonstrable artefact is required at the point of assessment.

Scrum was therefore adopted, with the adaptations for single developer working described in Chapter 5. The adaptation is necessary because Scrum presupposes a team, and several of its ceremonies exist to coordinate between people rather than to produce software.

> 💡 **Ghi chú:** đoạn cuối rất quan trọng. Template cảnh báo rằng chỉ viết "tôi dùng Agile" là gần như không có điểm. Ở đây mày **so sánh, chọn, và nêu rõ phải thích nghi vì Scrum vốn thiết kế cho nhóm**. Đó là thứ ăn điểm.

### 2.3.5 Automated food recognition

Image based food recognition is the technology through which the friction identified in Section 2.2.3 can be reduced, and the literature establishes both its viability and its limits.

Mezgec and Koroušić Seljak (2017) present a purpose built deep convolutional architecture trained on 225,953 images spanning 520 food and drink items, reporting a classification accuracy of 86 percent. Kaur et al. (2023) extend the picture through a systematic review conducted under PRISMA protocol, screening 771 articles and analysing 56, and confirm deep neural approaches as the dominant paradigm for food classification and nutrient identification. Özsert Yiğit and Özyildirim (2018) examine the comparative performance of convolutional architectures for this specific task.

The critical observation concerns what an accuracy figure of 86 percent means in deployment. It implies that **approximately one classification in seven is incorrect**. In a system where the recognised item is written directly into a dietary record, and where that record subsequently forms the basis of generated health guidance, misclassification does not merely inconvenience the user. It silently corrupts the evidence on which later advice depends.

This project therefore treats recognition output as a **proposal requiring confirmation rather than a determination**, presenting multiple candidates for user selection. The design decision is derived from the reported accuracy of the technology rather than from interface preference.

A further and more fundamental limitation concerns the composition of the datasets on which these systems are trained, which is examined in Section 2.4.

> 💡 **Ghi chú:** đây là chỗ mày biến một con số học thuật thành **quyết định thiết kế cụ thể**. Người chấm tìm chính xác kiểu lập luận này.

### 2.3.6 Language models for dietary guidance

The application of large language models to nutrition is an active and rapidly developing area. O'Hara et al. (2026) provide the most current scoping review of language models in nutrition and dietetics, and Panayotova (2025) reviews artificial intelligence in the field across six categories including dietary assessment, chronic disease management and ethical considerations. Oh et al. (2021) review artificial intelligence chatbots specifically as instruments for promoting physical activity and dietary change, finding promise for physical activity outcomes while noting that evidence for dietary and weight outcomes remains limited.

The consistent concern across this literature is reliability. A language model generates plausible text, and plausibility is not accuracy. In a health adjacent application, a fluent but incorrect recommendation is more dangerous than an obvious failure, because it does not signal to the user that it should be questioned.

The principal technical response in the literature is grounding, that is, constraining generation using retrieved factual context rather than relying on parametric knowledge alone. Neha et al. (2025) and Amugongo et al. (2025) both review retrieval augmented generation in healthcare and identify it as a primary mechanism for reducing unsupported output, a position supported by Kohandel Gargari and Habibi (2025).

This project applies grounding by supplying the model with the user's actual recorded data and declared conditions. It additionally applies a deterministic filter to model output, on the reasoning that an instruction within a prompt constitutes a request rather than a guarantee of compliance. The rationale and implementation of this two layer approach are described in Section 6.3.3.

---

## 2.4 Summary and Research Gap Identification

The literature reviewed supports four positions. Diet related chronic conditions impose a substantial and growing burden in Vietnam, and comorbidity is the common case rather than the exception (Vu et al., 2023). Dietary management is an effective intervention for these conditions, and the evidence identifies specific and actionable dietary constraints for each (Sacks et al., 2001; Ojo et al., 2018; Vedder et al., 2019; Haley and Gaddy, 2016). Mobile applications are an effective delivery mechanism when sustained, but sustained use is rare, with abandonment attributable substantially to the burden of manual entry (Helander et al., 2014; Payne et al., 2022). Automated recognition and language model guidance offer routes to reduce that burden, subject to reliability and cultural coverage constraints that must be designed around (Mezgec and Koroušić Seljak, 2017; Liu et al., 2025; O'Hara et al., 2026).

**A clear gap emerges from reading these strands together.**

The clinical literature establishes what a person with a given condition should and should not eat. The mobile health literature establishes that applications can support dietary behaviour when the recording burden is low enough to sustain engagement. Yet the applications evaluated in that literature, and the commercial products reviewed in Chapter 3, are constructed around **quantification** rather than **interpretation**. They record what a user has eaten and compute totals against a target. They do not evaluate whether a specific item is appropriate for a specific declared condition at the moment it is recorded.

The gap is compounded for the population this project addresses in two respects.

First, comorbidity is the norm rather than the exception in this group (Vu et al., 2023), so guidance must reason over multiple simultaneous dietary constraints rather than applying a single condition profile.

Second, the recognition technology on which low friction logging depends is **culturally biased in its training data**. Liu et al. (2025) document this directly, reporting that in the widely used Food-101 benchmark, Asian dishes constitute approximately 30 percent of the dataset and African dishes approximately 1 percent, while in ISIA Food-500 the corresponding proportions are approximately 40 percent and 4 percent. They further note that mainstream datasets lack fine grained annotation of ingredients and preparation methods, and that a single dish label may span numerous regional preparation variants. The published accuracy benchmarks for food recognition therefore cannot be assumed to transfer to Vietnamese cuisine, and a system intended for Vietnamese users must treat dish naming and nutritional estimation for local dishes as a first order design concern rather than as a matter of adding a language translation.

**This project addresses that gap by developing an application in which a declared chronic condition operates as an active constraint on every item of generated dietary guidance, enforced both through prompt design and through an independent deterministic filtering layer, and in which dish recognition and dietary suggestion are oriented towards Vietnamese cuisine.**

> ⚠️ **Một chỗ cần mày bổ sung nguồn:** câu về "recognition systems are trained predominantly on Western food imagery" hiện **chưa có trích dẫn**. Đây là luận điểm quan trọng trong research gap nên **bắt buộc phải có nguồn**.
> Từ khoá tra: `food recognition dataset bias non-Western cuisine`, `cultural bias food image dataset`, `Asian food recognition dataset`
> Nếu tìm không ra nguồn, phải **hạ giọng câu đó** thành nhận định thận trọng hơn, ví dụ "the datasets described in the reviewed literature are not reported to include substantial Vietnamese representation", vì câu đó mày kiểm chứng được ngay từ chính các bài đã trích.

---

# TÌNH TRẠNG CHƯƠNG 2

## ✅ Đã hoàn chỉnh

Toàn bộ 4 chỗ trống ban đầu đã được lấp bằng nguồn thật, tra và xác minh trong phiên này:

| Mục | Nguồn bổ sung |
|---|---|
| 2.3.1 Framework | Suri et al. (2022) ACM · Jošt and Taneski (2025) Informatics |
| 2.3.3 Database | Makris et al. (2021) GeoInformatica |
| 2.4 Thiên lệch dữ liệu | Liu et al. (2025) Applied Sciences, **có số liệu cụ thể** |

## 🟡 Còn một việc duy nhất

**Mục 2.3.2 Backend chưa có trích dẫn.** Ta tra nhiều lần nhưng chủ đề Node.js chỉ ra blog và bài không bình duyệt.

Lập luận trong mục đó đã **tự đứng vững về mặt kỹ thuật** (ranh giới tin cậy, logic chạy trên client thì bị bỏ qua được), chỉ thiếu một nguồn chống lưng. **Chỉ cần một cuốn giáo trình:** Sommerville *Software Engineering* hoặc Pressman, chương về kiến trúc client server. Mượn thư viện, trích một câu là xong, **và giải quyết luôn chỉ tiêu thiếu sách**.

## Nguồn đã trích dẫn trong Chương 2

Vu et al. (2023) · Vu et al. (2022) · Sacks et al. (2001) · Ojo et al. (2018) · Vlachos et al. (2020) · Vedder et al. (2019) · Zhang et al. (2022) · Haley and Gaddy (2016) · de Toro-Martín et al. (2017) · Dounavi and Tsoumani (2019) · Salas-Groves et al. (2023) · Chew et al. (2022) · Helander et al. (2014) · Payne et al. (2022) · Turner-McGrievy et al. (2019) · Royce (1970) · Beck et al. (2001) · Mezgec and Koroušić Seljak (2017) · Kaur et al. (2023) · Özsert Yiğit and Özyildirim (2018) · Liu et al. (2025) · O'Hara et al. (2026) · Panayotova (2025) · Oh et al. (2021) · Neha et al. (2025) · Amugongo et al. (2025) · Kohandel Gargari and Habibi (2025) · Suri et al. (2022) · Jošt and Taneski (2025) · Makris et al. (2021)

**Tổng 30 nguồn được trích dẫn trong riêng Chương 2.**
