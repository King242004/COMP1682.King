# Sơ đồ cho Chương 4.8 (mã Mermaid)

> **Cách dùng:**
> 1. Mở `https://mermaid.live`
> 2. Xoá hết nội dung mẫu bên trái, dán mã của một sơ đồ vào
> 3. Hình hiện bên phải, bấm **Actions > PNG** để tải ảnh
> 4. Chèn ảnh vào Word, đánh số hình và viết chú thích bên dưới
>
> **Lưu ý:** mọi tên và quan hệ trong sơ đồ đều lấy từ **code thật** của mày, không phải mô hình lý tưởng hoá.

---

## 4.8.2 Rich Picture

Bức tranh tổng thể về bối cảnh vấn đề, gồm cả yếu tố con người chứ không chỉ kỹ thuật.

```mermaid
flowchart TB
    subgraph clinical["Clinical setting"]
        doctor["Doctor<br/>gives dietary advice<br/>at appointment"]
    end

    subgraph daily["Daily life, between appointments"]
        user["Person managing<br/>a chronic condition"]
        meal["Everyday meal<br/>Is this suitable for me?"]
        family["Family members<br/>who cook and shop"]
    end

    subgraph system["MealMate"]
        app["Mobile application"]
        ai["Condition aware<br/>guidance"]
        filter["Safety filter"]
    end

    subgraph external["External services"]
        model["Generative model"]
        food["Open Food Facts"]
    end

    doctor -->|"advice given once,<br/>applied for months"| user
    user -->|"faces many times a day"| meal
    meal -->|"uncertainty"| user
    family -->|"influences what is eaten"| meal

    user -->|"photographs meal"| app
    app --> ai
    model --> ai
    ai --> filter
    filter -->|"guidance filtered by<br/>declared condition"| user
    food --> app

    user -.->|"shares meals"| community["Other users"]
    community -.->|"motivation"| user

    style system fill:#e3f2fd
    style clinical fill:#fff3e0
    style daily fill:#f1f8e9
    style external fill:#fce4ec
```

> 💡 Rich Picture khác sơ đồ kỹ thuật ở chỗ nó **có con người và bối cảnh xã hội**. Chú ý mũi tên từ bác sĩ ghi "advice given once, applied for months", đó chính là vấn đề trung tâm của đồ án mày.

---

## 4.8.3 System Context Diagram (C4 Level 1)

Hệ thống nhìn từ ngoài vào, ai dùng và nối với dịch vụ nào.

```mermaid
flowchart TB
    person["<b>User</b><br/><br/>Adult managing one or more<br/>diet related chronic conditions"]

    system["<b>MealMate</b><br/><br/>Mobile application providing<br/>condition aware dietary tracking<br/>and guidance"]

    model["<b>Google Gemini API</b><br/><br/>Multimodal generative model.<br/>Dish recognition and<br/>guidance generation"]
    cloudinary["<b>Cloudinary</b><br/><br/>Image storage and delivery"]
    off["<b>Open Food Facts</b><br/><br/>Packaged product<br/>nutrition database"]
    mail["<b>Email service</b><br/><br/>Password recovery codes"]

    person -->|"Logs meals, views guidance,<br/>shares posts"| system
    system -->|"Sends photograph,<br/>receives candidates"| model
    system -->|"Uploads and retrieves images"| cloudinary
    system -->|"Looks up barcode"| off
    system -->|"Sends one time codes"| mail

    style person fill:#08427b,color:#fff
    style system fill:#1168bd,color:#fff
    style model fill:#999,color:#fff
    style cloudinary fill:#999,color:#fff
    style off fill:#999,color:#fff
    style mail fill:#999,color:#fff
```

---

## 4.8.4 Container Diagram (C4 Level 2)

Bên trong hệ thống có những khối chạy độc lập nào.

```mermaid
flowchart TB
    person["<b>User</b>"]

    subgraph boundary["MealMate system"]
        mobile["<b>Mobile Application</b><br/>React Native, Expo<br/><br/>Presentation and<br/>user interaction"]
        api["<b>API Server</b><br/>Node.js, Express<br/><br/>Business logic, safety<br/>enforcement, service<br/>integration"]
        db[("<b>Database</b><br/>MongoDB Atlas<br/><br/>11 collections")]
    end

    model["Google Gemini API"]
    cloudinary["Cloudinary"]
    off["Open Food Facts"]
    mail["Email service"]

    person -->|"Uses"| mobile
    mobile -->|"JSON over HTTPS<br/>JWT authenticated"| api
    api -->|"Reads and writes<br/>via Mongoose"| db
    api -->|"HTTPS"| model
    api -->|"HTTPS"| cloudinary
    api -->|"HTTPS"| off
    api -->|"SMTP"| mail

    style person fill:#08427b,color:#fff
    style mobile fill:#1168bd,color:#fff
    style api fill:#1168bd,color:#fff
    style db fill:#1168bd,color:#fff
    style boundary fill:#f5f5f5
```

> 💡 Nhớ chỉ ra trong bài rằng **lớp lọc an toàn nằm ở API Server chứ không ở Mobile Application**. Đó là quyết định kiến trúc quan trọng nhất, đã lập luận ở mục 4.8.1 và 6.3.3.

---

## 4.8.5 Data Design

Sơ đồ quan hệ 11 collection, lấy đúng theo model thật trong `backend/src/models/`.

```mermaid
erDiagram
    USER ||--o{ MEAL : logs
    USER ||--o{ EXERCISE : logs
    USER ||--o{ WEIGHTLOG : records
    USER ||--o{ PLANMEAL : plans
    USER ||--o{ PLANWORKOUT : plans
    USER ||--o{ CHATMESSAGE : sends
    USER ||--o{ POST : authors
    USER ||--o{ FOLLOW : follows
    USER ||--o{ NOTIFICATION : receives
    POST ||--o{ NOTIFICATION : triggers

    USER {
        ObjectId _id PK
        string email UK
        string password "bcrypt hash"
        string name
        string gender
        number age
        number weight
        number height
        string goal
        string activityLevel
        array conditions "five supported"
        number calorieGoal
        boolean customGoal
        number targetWeight
        string language
        boolean isPrivate
        string avatar
    }

    MEAL {
        ObjectId _id PK
        ObjectId user FK
        string name
        string date "YYYY-MM-DD"
        string mealType
        number calories
        number protein
        number carbs
        number fat
    }

    EXERCISE {
        ObjectId _id PK
        ObjectId user FK
        string name
        string date
        number met
        number durationMin
        number caloriesBurned "computed"
    }

    WEIGHTLOG {
        ObjectId _id PK
        ObjectId user FK
        string date "unique per user"
        number weight
    }

    PLANMEAL {
        ObjectId _id PK
        ObjectId user FK
        string date
        string mealType
        string name
        number calories
        boolean done
    }

    PLANWORKOUT {
        ObjectId _id PK
        ObjectId user FK
        string date
        string name
        number met
        number durationMin
        boolean done
    }

    CHATMESSAGE {
        ObjectId _id PK
        ObjectId user FK
        string role
        string content
        string image
    }

    POST {
        ObjectId _id PK
        ObjectId user FK
        string caption
        array images "max 10"
        object meal "frozen snapshot"
        array likes
        array saves
    }

    FOLLOW {
        ObjectId _id PK
        ObjectId follower FK
        ObjectId following FK
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK "recipient"
        ObjectId actor FK
        string type "like or follow"
        ObjectId post FK
        boolean read
    }

    OTP {
        ObjectId _id PK
        string email
        string code
        date expiresAt
    }
```

> 💡 **Ba điểm nên nêu trong bài khi mô tả sơ đồ này:**
> 1. `POST.meal` là **bản sao đông cứng** chứ không phải tham chiếu, nên sửa hay xoá món trong nhật ký không làm hỏng bài đã đăng
> 2. `WEIGHTLOG` có **chỉ mục duy nhất theo user và date**, chặn trùng ở tầng cơ sở dữ liệu chứ không phải ở mã ứng dụng
> 3. `OTP` liên kết bằng **email chứ không phải user id**, vì luồng quên mật khẩu diễn ra khi chưa đăng nhập

---

## 4.8.6 Use Case Diagram

```mermaid
flowchart LR
    user(("User"))
    guest(("Guest"))
    model(("Gemini API"))

    subgraph sys["MealMate"]
        uc1["Register and sign in"]
        uc2["Declare health profile<br/>and conditions"]
        uc3["Log meal manually"]
        uc4["Recognise dish<br/>from photograph"]
        uc5["Scan barcode"]
        uc6["View daily summary"]
        uc7["Ask AI coach"]
        uc8["Generate weekly plan"]
        uc9["Log exercise"]
        uc10["Track body weight"]
        uc11["Share post"]
        uc12["Follow other users"]
        uc13["Delete account<br/>and all data"]
    end

    guest --> uc1
    user --> uc2
    user --> uc3
    user --> uc4
    user --> uc5
    user --> uc6
    user --> uc7
    user --> uc8
    user --> uc9
    user --> uc10
    user --> uc11
    user --> uc12
    user --> uc13

    uc4 -.-> model
    uc7 -.-> model
    uc8 -.-> model

    style sys fill:#f5f5f5
```

---

## 4.8.7 Sequence Diagram: luồng quét ảnh nhận diện món

Chọn luồng này vì nó phức tạp nhất và thể hiện rõ **quyết định thiết kế bắt người dùng xác nhận**.

```mermaid
sequenceDiagram
    actor U as User
    participant M as Mobile App
    participant A as API Server
    participant G as Gemini API
    participant D as MongoDB

    U->>M: Takes photograph of meal
    M->>M: Compress to 1024px JPEG
    Note over M: Reduces 3 to 8 MB<br/>to a few hundred KB
    M->>A: POST /api/scan with image
    A->>A: Verify JWT
    A->>G: Send image with prompt<br/>prioritising Vietnamese dishes
    G-->>A: Three candidate dishes<br/>with nutrition estimates
    A-->>M: Candidates returned
    M-->>U: Display three options

    Note over U,M: Design decision.<br/>86 percent accuracy means<br/>1 in 7 is wrong, so the user<br/>confirms rather than the<br/>system deciding

    U->>M: Selects correct dish
    M->>A: POST /api/meals with selection
    A->>A: Validate, reject future date
    A->>D: Insert meal document
    D-->>A: Saved
    A-->>M: Confirmation
    M-->>U: Meal appears in diary
```

> 💡 Khối Note ở giữa là chỗ mày **gắn quyết định thiết kế vào bằng chứng học thuật** ngay trên sơ đồ. Người chấm nhìn hình là hiểu vì sao có bước xác nhận.

---

## 4.8.8 Sequence Diagram: lớp an toàn theo bệnh nền

Sơ đồ phụ, thể hiện kiến trúc 2 lớp, tức đóng góp học thuật của đồ án.

```mermaid
sequenceDiagram
    actor U as User
    participant A as API Server
    participant C as coachContext
    participant G as Gemini API
    participant F as conditionFilter
    participant D as MongoDB

    U->>A: Request weekly meal plan
    A->>D: Fetch profile, conditions,<br/>recent meals and exercise
    D-->>A: User context
    A->>C: Assemble grounding context
    C-->>A: Context with condition guide

    rect rgb(230, 245, 255)
    Note over A,G: Layer 1. Constraint expressed in prompt
    A->>G: Prompt with condition constraints
    G-->>A: Generated seven day plan
    end

    rect rgb(255, 235, 235)
    Note over A,F: Layer 2. Deterministic check in code
    A->>F: Pass generated plan
    F->>F: Apply blocklist patterns<br/>Vietnamese and English
    F-->>A: Violating items removed
    end

    A->>D: Store filtered plan
    A-->>U: Safe plan displayed

    Note over A,F: A prompt is a request,<br/>not a guarantee.<br/>Layer 2 does not depend<br/>on the model complying.
```

---

## 4.8.9 Wireframes

`[[🔴 TA KHÔNG DỰNG ĐƯỢC, CẦN MÀY]]`

> Wireframe là bản phác giao diện. Vì app mày **đã làm xong**, cách nhanh nhất là **chụp màn hình app thật trên iPhone** rồi trình bày như thiết kế giao diện, kèm một sơ đồ luồng người dùng.
>
> Cần chụp: Home, Scan, Diary, Coach, Plan, Community, Profile.
>
> Nếu thầy yêu cầu wireframe phác thảo trước khi code thì vẽ tay hoặc dùng Figma, nhưng ảnh chụp app thật thường được chấp nhận và còn thuyết phục hơn.

Luồng người dùng chính, dùng luôn được:

```mermaid
flowchart LR
    start([Open app]) --> auth{Signed in?}
    auth -->|No| login[Sign in or register]
    login --> onboard[Onboarding<br/>profile and conditions]
    onboard --> home
    auth -->|Yes| home[Home<br/>daily summary]

    home --> scan[Scan meal]
    home --> diary[Diary]
    home --> coach[AI Coach]
    home --> plan[Weekly plan]
    home --> community[Community]
    home --> profile[Profile]

    scan --> candidates[Three candidates]
    candidates --> confirm[Confirm dish]
    confirm --> diary

    coach --> advice[Condition aware<br/>guidance]
    plan --> generate[Generate seven days]
    generate --> eat["Mark as eaten"]
    eat --> diary

    profile --> progress[Progress and weight]
    profile --> settings[Settings]
    settings --> delete[Delete account]

    style home fill:#e3f2fd
    style scan fill:#fff3e0
    style coach fill:#f1f8e9
```

---

# HƯỚNG DẪN CHÈN VÀO BÁO CÁO

| Sơ đồ | Mục | Ghi chú khi viết |
|---|---|---|
| Rich Picture | 4.8.2 | Nhấn vào chuyện lời dặn của bác sĩ chỉ có một lần mà phải áp dụng hàng tháng |
| C4 Level 1 | 4.8.3 | Liệt kê 4 dịch vụ ngoài và hành vi khi chúng lỗi |
| C4 Level 2 | 4.8.4 | **Nhấn mạnh lớp lọc nằm ở server chứ không ở client** |
| Data Design | 4.8.5 | Nêu 3 điểm: snapshot, chỉ mục duy nhất, OTP theo email |
| Use Case | 4.8.6 | 13 use case, 3 cái phụ thuộc dịch vụ ngoài |
| Sequence quét ảnh | 4.8.7 | Gắn với con số 86 phần trăm của Mezgec |
| Sequence an toàn | 4.8.7 | Đây là đóng góp học thuật, nhắc lại ở Chương 8 |
| User flow | 4.8.9 | Kèm ảnh chụp màn hình thật |

**Đánh số hình theo chương**, ví dụ Figure 4.1, Figure 4.2, và mỗi hình phải có **câu chú thích bên dưới** cùng ít nhất một câu nhắc tới nó trong phần văn.
