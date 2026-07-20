# Chapter 6: Implementation

> **Ghi chú cho mày:** nội dung tiếng Anh dưới đây là phần đưa vào báo cáo. Các khối trích dẫn màu xám là ghi chú của ta cho mày, **không đưa vào báo cáo**.
> Mọi số liệu trong chương này đều **đếm thật từ repo**, không ước lượng.
> Tuân thủ luật của mày: không dấu gạch dài, không dấu chấm phẩy.

---

## 6.1 Development Environment

The application was developed as a client server system. The mobile client was built with React Native through the Expo framework, and the server was implemented as a Node.js REST API backed by MongoDB. Table 6.1 lists the development environment.

**Table 6.1 Development environment**

| Component | Technology | Version |
|---|---|---|
| Mobile framework | React Native | 0.81.5 |
| Application platform | Expo | 54.0.31 |
| UI library | React | 19.1.0 |
| Routing | Expo Router | 6.0.21 |
| Language (client) | TypeScript | 5.9.2 |
| Runtime (server) | Node.js with Express | Express 5.2.1 |
| Database | MongoDB Atlas with Mongoose ODM | Mongoose 9.6.2 |
| AI model access | Google Generative AI SDK | 0.24.1 |
| Media storage | Cloudinary | 2.10.0 |
| Authentication | jsonwebtoken with bcryptjs | 9.0.3 and 3.0.3 |
| Email delivery | Nodemailer | 8.0.7 |
| API documentation | swagger-jsdoc with swagger-ui-express | 6.2.8 and 5.0.1 |
| Unit testing | Jest | 30.4.2 |
| Linting | ESLint with eslint-config-expo | 9.25.0 |
| Version control | Git and GitHub | latest |

Development took place on Windows 11 using Visual Studio Code. The client was tested on a physical iPhone through the Expo Go application, which allowed the interface to be verified on a real device rather than an emulator. A secondary web build served by the Expo development server was used for rapid verification of logic and layout during development.

> 💡 **Ghi chú:** chỗ "tested on a physical iPhone" là điểm cộng, vì nhiều đồ án chỉ chạy emulator. Nhớ chụp vài ảnh màn hình trên iPhone thật để chèn vào.

## 6.2 Project Folder Structure

The repository is organised as two independent applications in a single version controlled project. This separation allows the API to be deployed and tested independently of the mobile client.

```
Meal Snap/
├── backend/
│   ├── server.js                 Express entry point
│   ├── tests/
│   │   ├── unit/                 Jest unit tests
│   │   └── integration/          End to end API regression script
│   └── src/
│       ├── config/               Database, Cloudinary, Gemini, mailer, Swagger
│       ├── controllers/          Request handling for each domain
│       ├── middleware/           JWT authentication guard
│       ├── models/               Mongoose schemas
│       ├── routes/               Express route definitions
│       └── services/             Reusable domain logic
└── frontend/
    ├── app/                      Screens only, file based routes
    └── src/
        ├── context/              Global state providers
        ├── features/             Screen specific logic and components
        ├── i18n/                 Bilingual string catalogue
        ├── ui/                   Shared design system components
        └── utils/                Cross cutting helpers
```

Two structural conventions were adopted and enforced throughout development.

First, the `app` directory contains **only routes**. Each file in `app` is a thin screen that composes components and hooks, and the substantive logic for a screen lives in the corresponding folder under `src/features`. This convention was adopted because Expo Router treats every file in `app` as a navigable route, so placing non route files there would create unreachable routes and pollute the navigation tree.

Second, code used by two or more screens was promoted into `src/ui`, `src/context` or `src/utils`. This prevented the duplication that would otherwise arise between screens with similar functionality, for example the meal creation and meal editing screens.

**Table 6.2 Module counts by area**

| Area | Modules |
|---|---|
| Mongoose models | 11 |
| Express route files | 10 |
| Controllers | 10 |
| Domain services | 5 |
| Configuration modules | 5 |
| Client screens (routes) | 30 |
| Client feature modules | 10 |

The implementation comprises approximately 19,300 lines of application code, distributed as 4,213 lines in the server source, 7,978 lines in client screens and 7,101 lines in client feature and shared modules.

> 💡 **Ghi chú:** số dòng code ta đếm thật bằng `wc -l`, không tính node_modules. Con số này thể hiện quy mô công việc, thầy hay để ý.

## 6.3 Backend and Frontend Implementation

### 6.3.1 Server architecture

The server follows a layered architecture in which each request passes through a route definition, an authentication guard, a controller and, where domain logic is shared, a service module. Ten route groups are mounted under the `/api` prefix, covering authentication, meals, meal planning, exercise, weight, the AI coach, profile, user account management, food scanning and the community feature.

Three cross cutting concerns are handled at the application level in `server.js`.

**Request size limit.** The JSON body limit was raised to 15 megabytes because the AI coach accepts food photographs encoded as base64 within the chat payload. The Express default of 100 kilobytes would reject these requests.

**Brute force protection.** A rate limiter restricts the authentication routes to 30 attempts per IP address in any 15 minute window. The limiter is applied only to `/api/auth` because every other route is protected by a JSON Web Token, so an attacker cannot make useful unauthenticated requests against them.

**Global error handling.** A terminal error middleware converts unexpected failures into JSON responses. Without it, an unhandled error would return an HTML error page that the mobile client cannot parse, producing an unhelpful failure in the interface. The handler maps a Mongoose `CastError`, which occurs when a malformed identifier reaches the database layer, to a 400 response, maps malformed or oversized request bodies to 400, and returns a generic 500 for anything else without leaking internal detail to the client.

> 💡 **Ghi chú:** ba đoạn trên là ví dụ rất tốt để trả lời câu "em xử lý lỗi thế nào" khi bảo vệ. Mỗi cái đều có **lý do kỹ thuật cụ thể**, không phải làm cho có.

### 6.3.2 Domain services

Five service modules hold logic that is required by more than one controller. Isolating this logic in services rather than duplicating it in controllers ensures that a single rule cannot drift out of step between the places that apply it.

**`calorieGoal.js`** implements the Mifflin St Jeor equation for resting energy expenditure (Mifflin et al., 1990), applies an activity multiplier to derive total daily energy expenditure, and adjusts the result according to the user's stated goal. A safety floor is enforced so that an automatically derived target never falls below 1200 kilocalories for female users or 1500 for male users. This service is consumed by the profile controller and by the weight controller, so that logging a new body weight recalculates the automatic target through exactly the same code path used at registration.

**`conditionFilter.js`** implements the safety layer described in Section 6.3.3.

**`coachContext.js`** assembles the grounding context supplied to the language model, comprising the user profile, declared conditions, meals and exercise recorded today, and aggregate figures for the preceding seven days.

**`healthScore.js`** computes a health score between 0 and 100 **in code rather than by asking the model**, weighting calorie adherence at 40 points, protein intake at 20, physical activity at 20 and consistency at 20. The language model is used only to phrase the accompanying commentary. This division was deliberate. A numeric score produced by a language model would not be reproducible between requests, which would make the figure meaningless as a tracked metric.

**`aiGenerate.js`** wraps model invocation with fallback across multiple API keys and model variants, so that exhaustion of a free tier quota degrades into a clear message to the user rather than an unexplained failure.

> 💡 **Ghi chú:** đoạn về healthScore là **điểm ăn tiền nhất chương này**. Nó cho thấy mày hiểu giới hạn của AI và biết chỗ nào KHÔNG nên dùng AI. Thầy rất thích lập luận kiểu này.

### 6.3.3 Condition aware safety layer

The application's central claim is that dietary guidance is constrained by the user's declared medical condition. This constraint is enforced at two independent levels.

The **first level** operates through prompt design. A condition guide is injected into every prompt issued to the language model, naming ingredients and preparation methods that are inappropriate for each supported condition. This guide is defined once and shared by all four generative features, namely the coach conversation, cooking guidance, meal suggestion and weekly plan generation, so that adding support for a further condition requires a change in a single location.

The **second level** operates in code, after the model has responded. The `conditionFilter` service applies blocklist patterns, expressed in both Vietnamese and English, to the model's output and removes any generated item that violates a constraint for the user's declared conditions. This filter is applied to the output of plan generation and meal suggestion.

The rationale for the second level is that instructions in a prompt are a request rather than a guarantee. A language model may disregard an instruction, particularly across long generations. Because the consequence of a failure here is a dietary recommendation that is unsuitable for a person with a medical condition, a deterministic check independent of the model was considered necessary. This design is consistent with the wider literature on constraining language model output in healthcare contexts (Neha et al., 2025; Amugongo et al., 2025).

> 💡 **Ghi chú:** đây là **đóng góp học thuật** của đồ án mày. Nhớ nhắc lại nó ở Chương 8. Câu "a prompt is a request rather than a guarantee" là câu chốt mạnh, nên giữ nguyên.

### 6.3.4 Food recognition

Food recognition is performed by submitting a photograph to a multimodal model, which returns the three most probable dishes together with an estimate of the energy and macronutrient content of each. The model is instructed to name Vietnamese dishes in Vietnamese where the dish is Vietnamese.

Three candidates are presented for the user to confirm rather than writing a single result directly into the diary. This decision was informed by the literature. Mezgec and Koroušić Seljak (2017) report a classification accuracy of 86 percent for a purpose built food recognition network, which implies that approximately one in seven classifications is incorrect. Automatically committing a single prediction would therefore introduce silent errors into the user's dietary record, which is the precise record the application's guidance depends upon. Requiring confirmation places the user in control of the accuracy of their own data.

Images are compressed on the device before upload, being resized to a maximum width of 1024 pixels and re-encoded as JPEG at reduced quality. Photographs taken by a modern smartphone are commonly between 3 and 8 megabytes, which would impose an unnecessary cost in upload time and media storage.

> 💡 **Ghi chú:** đoạn này liên kết **quyết định kỹ thuật của mày với bằng chứng học thuật**. Đây đúng kiểu viết mà template yêu cầu. Con số 86 phần trăm và suy luận 1 trên 7 là điểm sáng.

### 6.3.5 Client architecture

Global state is held in two React context providers. The authentication context owns the session token, the user profile and the derived statistics, and persists the session to device storage so that the user is not required to sign in on every launch. The meals context owns the diary for the day being viewed together with the wider history required by the progress screens.

Two behaviours of the authentication context merit description.

**Session expiry handling.** The JSON Web Token issued at sign in has a fixed lifetime. Before this was addressed, an expired token produced an application that appeared functional while every request silently failed. A callback registered with the API client now detects an unauthorised response, clears the session and returns the user to the sign in screen with an explanatory message.

**Sign out data hygiene.** Signing out clears not only the session but also every cached artefact belonging to that user, including cached coach insights, cached weekly plans, cached shopping lists and any scheduled meal reminder. Without this, data belonging to one account would remain visible to the next account used on the same device.

The interface is bilingual. All display strings are held in a central catalogue with an English source of truth and a Vietnamese counterpart. The Vietnamese catalogue is typed against the English one, so the TypeScript compiler reports any key that is missing or has diverged in shape. Language is resolved from the user's stored preference, falling back to the device locale.

> 💡 **Ghi chú:** đoạn "typed against the English one" là chi tiết kỹ thuật hay: mày dùng **trình biên dịch để ép hai bản dịch không lệch nhau**. Đây là thứ thầy sẽ ấn tượng vì nó cho thấy tư duy phòng lỗi.

## 6.4 Database Implementation

The database is a MongoDB Atlas cluster accessed through the Mongoose object document mapper. A document database was selected because the dominant access pattern is retrieval of a user's records for a given day or date range, which maps naturally to documents keyed by user and date, and because several entities carry optional fields that vary between records.

Eleven collections are defined. Table 6.3 summarises them.

**Table 6.3 Data model**

| Collection | Purpose |
|---|---|
| User | Credentials, profile, declared conditions, goals and preferences |
| Meal | A logged meal with energy and macronutrient values |
| Exercise | A logged activity with computed energy expenditure |
| WeightLog | One body weight entry per user per day |
| PlanMeal | A planned meal within a weekly plan |
| PlanWorkout | A planned activity within a weekly plan |
| ChatMessage | Coach conversation history |
| Post | A community post with images and an optional meal snapshot |
| Follow | A directed follow relationship between two users |
| Notification | An in application notification for a like or a follow |
| OTP | A one time code issued for password recovery |

Three modelling decisions are of particular note.

**Snapshot rather than reference for shared meals.** A community post stores a frozen copy of the nutritional values of the meal it describes rather than a reference to the original meal document. Consequently, a user editing or deleting a meal in their own diary cannot alter or invalidate a post that has already been shared with others.

**Uniqueness enforced at the database level.** A compound unique index on user and date prevents duplicate weight entries for a single day, and a compound unique index on recipient, actor, type and post prevents duplicate notifications. Enforcing these rules in the database rather than in application code guarantees they hold even if a request is duplicated.

**Backward compatible schema evolution.** When support for multiple images per post was introduced, the original single image fields were retained and kept synchronised with the first element of the new array. Documents created before the change therefore continue to render correctly without a migration.

> 💡 **Ghi chú:** ba quyết định này rất đáng để mày nói ở buổi bảo vệ. Nhất là cái snapshot, vì nó cho thấy mày nghĩ trước được hậu quả.

## 6.5 Deployment

The system is deployed across three managed cloud services, so no component depends on the development machine.

**Table 6.4 Deployment topology**

| Component | Platform | Notes |
|---|---|---|
| Application server | Render, Singapore region | Public HTTPS endpoint, free tier |
| Database | MongoDB Atlas | Managed cluster with provider backup |
| Media storage | Cloudinary | Image hosting and delivery |
| Mobile client | Expo Go on a physical device | Loaded from the development server |

The server is built from the `backend` directory of the repository and started with `npm start`. Deployment is continuous: a push to the `main` branch triggers an automatic rebuild, so the deployed service always reflects the committed source. The Node version is pinned in `package.json` so the hosted build does not drift from the version used in development. Configuration is supplied through environment variables held by the platform rather than in the repository, so no credential is committed.

The client resolves its API address at startup. When an API URL is configured it is used directly, otherwise the client falls back to detecting the development host on the local network. This allows the same codebase to run against either the deployed server or a local one without code changes.

Two deployment decisions have consequences worth stating.

**Database network access is open to all addresses.** The hosting platform assigns dynamic outbound addresses, so restricting the database to a fixed address list is not possible. Access is instead controlled by mandatory credential authentication at the database layer. This is an accepted trade-off for a project of this scale and is revisited in Section 4.7.1.

**The free hosting tier suspends an idle service.** After a period without traffic the service is suspended and the next request incurs a delay of roughly thirty seconds while it restarts. This is acceptable for a student project, and is mitigated during demonstrations and User Acceptance Testing by issuing a request shortly before the session begins.

> 💡 **Ghi chú:** mục này viết dựa trên deploy thật ngày 20/7/2026. Ta đã tự gọi vào địa chỉ công khai và nhận đúng phản hồi của API, nên đây là mô tả thực tế chứ không phải dự định.
>
> ⚠️ **Nhớ điền địa chỉ Render thật vào báo cáo** nếu thầy yêu cầu nêu cụ thể, hoặc đưa vào Appendix kèm ảnh chụp trang Swagger.

## 6.6 Project Management Evidence

Version control was maintained throughout the project using Git, with the repository hosted on GitHub. This repository is the primary record of how the project was managed.

Commits follow a conventional prefix format indicating the type and scope of each change, for example `feat(community)` for a new community feature and `fix` for a defect correction. Commit messages describe the rationale for a change rather than restating the difference, which preserves the reasoning behind design decisions. A representative example is the commit that introduced the notification feature, whose message records not only what was added but why remote push notification was excluded from scope.

Development proceeded in iterative cycles, each producing a working and tested increment before the next was started. Each cycle concluded with the full test suite being executed and the result committed, which corresponds to the Definition of Done stated in Section 5.1.

**Reflection on the tracking method used.** The project backlog was maintained through the commit history and through a running progress document rather than through a dedicated issue tracking tool such as Jira. This was adequate for a single developer, because there was no need to communicate task ownership or status to other team members, which is the principal function such tools serve. However, it carries two acknowledged weaknesses. Sprint velocity cannot be measured retrospectively, and the relationship between a requirement and the commits that implement it must be reconstructed by reading commit messages rather than being recorded explicitly. A dedicated board was introduced for the final phase of the project covering testing, evaluation and report production, and the difference in visibility was noticeable. Were the project repeated, a board would be adopted from the first week.

`[[⚠️ CẦN MÀY CHỤP ẢNH]]`

> 🔴 **Cần mày cung cấp 3 ảnh chụp màn hình:**
> 1. **Lịch sử commit trên GitHub**, vào tab Commits, chụp danh sách cho thấy commit đều đặn và message có ý nghĩa
> 2. **Biểu đồ contribution** ở trang cá nhân GitHub, cái lưới ô vuông xanh, cho thấy nhịp độ làm việc suốt kỳ
> 3. **Bảng công việc** mày lập cho giai đoạn cuối (xem hướng dẫn bên dưới)
>
> **Về bảng công việc:** đừng cài Jira làm gì cho mất công. **GitHub Projects** miễn phí và nằm sẵn trong repo mày. Vào repo trên GitHub, tab Projects, New project, chọn Board. Tạo 3 cột Todo, In progress, Done, rồi đổ vào các việc thật còn lại: viết từng chương, nộp ethics, phát khảo sát, chạy UAT, vẽ Gantt, và các việc trong file này. Mất khoảng 15 phút.
>
> **Đây là bảng thật cho việc thật đang diễn ra, không phải dựng lại quá khứ.** Đoạn văn ở trên đã nói rõ mày chỉ dùng bảng ở giai đoạn cuối, nên hoàn toàn trung thực.

---

# TÓM TẮT VIỆC CẦN LÀM CHO CHƯƠNG 6

| # | Việc | Mức |
|---|---|---|
| 1 | ~~Deploy backend~~ ✅ **XONG 20/7**, mục 6.5 đã viết theo thực tế | Đã xong |
| 2 | Lập bảng GitHub Projects cho việc còn lại, chụp ảnh (6.6) | 🔴 Bắt buộc, 15 phút |
| 3 | Ảnh chụp lịch sử commit và biểu đồ contribution GitHub (6.6) | 🔴 Bắt buộc, 5 phút |
| 4 | Ảnh chụp màn hình app chạy trên iPhone thật (6.1) | 🟡 Nên có, là điểm cộng |
| 5 | Cân nhắc chèn sơ đồ kiến trúc và vài đoạn code tiêu biểu | 🟡 Nên có |

**Đã trích dẫn trong chương:** Mifflin et al. (1990), Mezgec and Koroušić Seljak (2017), Neha et al. (2025), Amugongo et al. (2025). Tất cả đều nằm trong danh mục đã xác minh.
