# HealthySnap - Architecture & Rules

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo + TypeScript |
| Navigation | Expo Router |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT |
| AI Scan (photo) | Claude API (food recognition) + Nutritionix API (nutrition data) |
| Barcode Scan | Open Food Facts API (packaged food products) |

---

## Working Rules

### Before making any changes
- Discuss with team before modifying logic
- Do not change agreed rules without approval
- Follow this document as the single source of truth

### Testing
- Every feature must be tested immediately after implementation
- Do not move on to the next feature before testing the current one
- Backend: test with Postman
- Frontend: test with Expo Go

---

## Responsibility Split

### BACKEND responsibilities

**Auth**
- Validate all incoming data (name, email, password)
- Hash password with bcryptjs
- Generate JWT token
- Check duplicate email

**User & Profile**
- Store and update user profile
- Calculate BMI (from weight, height)
- Calculate TDEE (daily calorie need based on age, weight, height, activity level)
- Update calorie goal based on user's health goal

**Meal**
- Save meals to database
- Calculate total calories + macros (protein/carb/fat) per day
- Calculate % of daily calorie goal completed
- Return meal history by day/week/month

**AI Scan (photo)**
- Receive image from frontend
- Call Claude API to recognize food from photo
- Call Nutritionix API to get nutrition data
- Return results to frontend

**Barcode Scan**
- Receive barcode/QR code from frontend
- Call Open Food Facts API to get packaged food info
- Return product name + nutrition data to frontend

**AI Coach**
- Analyze eating habits over time
- Detect patterns (skipping meals, low protein, etc.)
- Generate personalized suggestions
- Warn about foods incompatible with user's health conditions

**Meal Plan**
- Save weekly meal plans
- Calculate total nutrition for entire plan

**Water & Exercise**
- Save water intake logs
- Save exercise activity logs
- Calculate daily totals

**Community**
- Save posts
- Handle follow/unfollow logic
- Return feed based on who user follows

**Statistics & Reports**
- Calculate nutrition trends by week/month
- Generate chart data

---

### FRONTEND responsibilities

**Auth**
- Display login/register forms
- UX validation (immediate feedback without API call)
- Store JWT token in AsyncStorage

**UI & Navigation**
- Render all screens
- Handle navigation between tabs/screens

**Meal**
- Manual meal entry form
- Display meal list
- Display total calories/macros returned from backend

**Scan screen**
- Quét QR/Barcode sản phẩm đóng gói → gửi mã lên backend → hiển thị kết quả
- Chụp ảnh món ăn → gửi ảnh lên backend → AI nhận diện → hiển thị kết quả
- Cả 2 đều dẫn tới form Add Meal để review trước khi save

**Add Meal**
- Nhập thông tin thủ công
- Có thể thêm ảnh từ thư viện (không bắt buộc)
- Có trường thời gian dùng bữa cụ thể (giờ:phút)

**AI Coach**
- Display suggestions and warnings returned from backend

**Meal Plan**
- Meal plan creation form
- Display weekly meal calendar

**Water & Exercise**
- Water and exercise input forms
- Display daily progress

**Community**
- Display feed
- Post creation form, follow button

**Statistics**
- Render charts from backend data
- No self-calculation

---

## Validation Rules

### Name
- Minimum 2 characters
- Letters and spaces only (no numbers or special characters)
- Vietnamese characters allowed

### Email
- Valid format: `example@domain.com`
- Case insensitive (stored as lowercase in DB)

### Password
- Minimum 6 characters
- At least 1 uppercase letter
- At least 1 number

---

## API Response Format

### Success
```json
{
  "data": {},
  "message": "Success"
}
```

### Error
```json
{
  "message": "Error description"
}
```

---

## Project Structure

```
HealthySnap/
  backend/
    src/
      config/       - Database connection
      controllers/  - Business logic & validation
      middleware/   - Auth middleware
      models/       - MongoDB schemas
      routes/       - API routes
    server.js
    .env
  frontend/
    app/
      auth/         - Login, Register screens
      context/      - AuthContext, MealsContext
      tabs/         - Main app screens
      ui/           - Reusable components
      utils/        - API helper
    app.json
```

---

## System Architecture Diagram

High-level overview of components and how they connect:

```mermaid
flowchart TB
    Client["📱 CLIENT - MOBILE APP<br/>React Native + Expo + TypeScript<br/>iOS / Android"]:::client

    Backend["⚙️ BACKEND - API SERVER<br/>Node.js 22 + Express 5<br/>Routes → Middleware → Controllers → Models"]:::backend

    DB[("🗄️ DATABASE<br/>MongoDB Atlas<br/>users / meals / otps")]:::db
    Gemini["🧠 AI VISION<br/>Google Gemini 2.5 Flash<br/>(food recognition)"]:::ext
    Cloudinary["🖼️ IMAGE HOSTING<br/>Cloudinary CDN<br/>(avatars, food photos)"]:::ext
    OpenFood["🏷️ BARCODE DB<br/>Open Food Facts<br/>(packaged products)"]:::ext
    Gmail["📧 EMAIL<br/>Gmail SMTP<br/>(OTP reset password)"]:::ext

    Client -- "HTTPS / REST API<br/>+ JWT Bearer Token" --> Backend
    Backend --> DB
    Backend --> Gemini
    Backend --> Cloudinary
    Backend --> OpenFood
    Backend --> Gmail

    classDef client fill:#DBEAFE,stroke:#1E3A8A,stroke-width:2px,color:#1E3A8A
    classDef backend fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#92400E
    classDef db fill:#D1FAE5,stroke:#047857,stroke-width:2px,color:#065F46
    classDef ext fill:#EDE9FE,stroke:#6D28D9,stroke-width:2px,color:#5B21B6
```

---

## Logic Flow Diagram (Input → Processing → Output)

Every user interaction follows the same 3-block pattern:

```mermaid
flowchart TB
    subgraph INPUT["🔵 KHỐI ĐẦU VÀO (Input Block)"]
        direction TB
        I1["📝 User Form Input<br/>(tên, email, calories...)"]
        I2["📷 Camera Capture<br/>(ảnh món ăn)"]
        I3["🖼️ Photo Library<br/>(ảnh có sẵn)"]
        I4["🏷️ Barcode Scanner"]
        I5["👆 Touch / Gesture"]
        I6["🔔 System Events<br/>(notification, app launch)"]
    end

    subgraph PROCESS["🟡 KHỐI XỬ LÝ TRUNG TÂM (Processing Block)"]
        direction TB
        P1["1. Route Resolver<br/>(Express router)"]
        P2["2. Auth Middleware<br/>(verify JWT)"]
        P3["3. Input Validation<br/>(format, range, business rules)"]
        P4["4. Controller Logic<br/>(business logic)"]
        P5["5. Database Operations<br/>(MongoDB CRUD)"]
        P6["6. External API Calls<br/>(Gemini, Cloudinary, Gmail)"]
        P7["7. Response Builder<br/>(JSON 200/400/422/500)"]
        P1 --> P2 --> P3 --> P4 --> P5
        P4 --> P6
        P5 --> P7
        P6 --> P7
    end

    subgraph OUTPUT["🟢 KHỐI ĐẦU RA (Output Block)"]
        direction TB
        O1["📱 UI Update<br/>(meal list, charts, profile)"]
        O2["💾 Local Storage<br/>(AsyncStorage JWT, cache)"]
        O3["🗄️ Persistent DB<br/>(MongoDB write)"]
        O4["🔔 Push Notification<br/>(meal reminder)"]
        O5["📧 Email Output<br/>(OTP)"]
        O6["🖼️ Cloud Storage<br/>(Cloudinary upload)"]
        O7["🚨 Error Toast / Alert"]
    end

    INPUT -- "Validate → HTTPS" --> PROCESS
    PROCESS -- "JSON response" --> OUTPUT

    classDef inputStyle fill:#DBEAFE,stroke:#1E3A8A,stroke-width:2px
    classDef procStyle fill:#FEF3C7,stroke:#B45309,stroke-width:2px
    classDef outStyle fill:#D1FAE5,stroke:#047857,stroke-width:2px

    class I1,I2,I3,I4,I5,I6 inputStyle
    class P1,P2,P3,P4,P5,P6,P7 procStyle
    class O1,O2,O3,O4,O5,O6,O7 outStyle
```

---

## Example: AI Photo Scan flow

Concrete walkthrough of the 3-block model when a user scans food:

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Frontend (Expo)
    participant BE as Backend (Express)
    participant G as Gemini Vision API
    participant DB as MongoDB Atlas

    U->>FE: 📷 Take photo of phở bò
    FE->>FE: Validate file size, attach JWT
    FE->>BE: POST /api/scan/photo (multipart)
    BE->>BE: protect middleware: verify JWT → req.user.id
    BE->>BE: multer parses image → req.file.buffer
    BE->>G: Send base64 image + prompt
    G-->>BE: JSON { candidates: [Phở Bò 92%, Phở gà 5%, ...] }
    BE-->>FE: 200 OK { candidates }
    FE->>U: 🪟 Show modal with top 3 candidates
    U->>FE: 👆 Tap "Phở Bò"
    FE->>FE: Navigate to Meal-add with prefill (name, calories, macros)
    U->>FE: ✏️ Confirm and save
    FE->>BE: POST /api/meals
    BE->>DB: Insert Meal document
    DB-->>BE: { _id, ... }
    BE-->>FE: 201 Created
    FE->>U: ✅ Meal appears in Home tab
```

---

## Data shape per use case

| Use Case | Input | Processing | Output |
|---|---|---|---|
| **Register** | name, email, password | Validate → bcrypt hash → check duplicate → save → sign JWT | JWT in AsyncStorage, user in DB |
| **Login** | email, password | Find user → bcrypt.compare → sign JWT 30 days | JWT token, user object |
| **Add meal** | name, calories, macros, date, mealType | Validate → save Meal → recompute daily totals | Meal in Home, total kcal updated |
| **AI Scan** | JPEG image (≤ 8MB) | Base64 encode → Gemini API → parse JSON → top 3 candidates | Modal with 3 cards, prefill Meal-add |
| **Update Profile** | weight, height, age, goal | Validate range → save → compute BMI + TDEE | Profile UI, stats refresh, AsyncStorage sync |

---

## Architecture principles

1. **Separation of Concerns** — Frontend = UI/UX, Backend = business logic + persistence.
2. **Single Responsibility** — Each controller handles one domain (auth/meal/profile/scan).
3. **Statelessness** — Backend does not store sessions; every request carries JWT.
4. **Fail Fast** — Validate at frontend (UX) AND backend (security).
5. **Loose Coupling** — Vision API, image host, DB are all swappable via config.
6. **Security First** — bcrypt hash, JWT verify, `.env` secrets, input sanitize.
