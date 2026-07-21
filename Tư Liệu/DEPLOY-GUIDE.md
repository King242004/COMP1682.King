# Hướng dẫn deploy backend lên Render

> Code đã chuẩn bị sẵn (commit 6c91d16d). Phần dưới là các bước mày tự làm trên web Render.
> **Ta không tự bấm nút trên Render giúp được, nhưng làm theo đây là xong.**
> ⚠️ Các giá trị bí mật (khóa API, chuỗi kết nối) mày lấy từ file `backend/.env` trên máy, dán thẳng vào Render, KHÔNG gửi cho ai.

---

## BƯỚC 1 · Tạo tài khoản Render

1. Vào `https://render.com`
2. Bấm **Get Started**, đăng nhập bằng **chính tài khoản GitHub** đang chứa repo (King242004)
3. Cho phép Render truy cập repo khi nó hỏi

---

## BƯỚC 2 · Tạo Web Service

1. Trong Dashboard bấm **New +** rồi chọn **Web Service**
2. Chọn repo **COMP1682.King**
3. Điền cấu hình:

| Ô | Điền |
|---|---|
| Name | `mealmate-api` (hoặc tên gì tuỳ mày) |
| Region | Singapore (gần Việt Nam nhất) |
| Branch | `main` |
| **Root Directory** | `backend` ← **QUAN TRỌNG, phải điền** |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | **Free** |

> ⚠️ **Root Directory = `backend` là bước dễ quên nhất.** Không điền thì Render tìm package.json ở thư mục gốc và fail, vì repo mày có backend nằm trong thư mục con.

---

## BƯỚC 3 · Khai báo biến môi trường

### Cách nhanh và chắc nhất

Bấm nút **"Add from .env"**, mở file `backend/.env` trên máy, **copy toàn bộ nội dung dán vào**. Render tự tách hết các biến, không sót cái nào, không gõ nhầm.

Sau đó **xoá dòng PORT** đi là xong.

### Nếu gõ tay thì cần đủ 10 biến

Bỏ PORT (Render tự cấp), còn lại phải có đủ:

| Key | Ghi chú |
|---|---|
| MONGODB_URI | |
| JWT_SECRET | |
| CLOUDINARY_CLOUD_NAME | ⚠️ là tên cloud ngắn, KHÔNG phải chữ ".env" |
| CLOUDINARY_API_KEY | |
| CLOUDINARY_API_SECRET | |
| BREVO_API_KEY | API key bắt đầu bằng `xkeysib-` |
| BREVO_SENDER_EMAIL | Email người gửi đã xác minh trên Brevo |
| GEMINI_API_KEY | |
| **GEMINI_API_KEY_2** | 🔴 dễ quên |
| **GEMINI_API_KEY_3** | 🔴 dễ quên |

> ⚠️ **KHÔNG thêm biến PORT.** Render tự đặt cổng riêng, mà server.js đã đọc `process.env.PORT` nên tự khớp.

> 🔴 **Ba key Gemini phải khai đủ cả ba.** Code đọc từ ba biến riêng và xoay vòng khi một key hết hạn mức. Chỉ khai một key thì app vẫn chạy nhưng **hết lượt AI nhanh gấp ba lần**, rất dễ dính giữa buổi demo hoặc UAT.
>
> Kiểm tra sau khi deploy: trong tab Logs phải thấy dòng `Gemini: 3 API key(s) loaded`. Nếu thấy số 1 hoặc 2 là còn thiếu key.

---

### Phần Advanced: không cần làm gì

Cứ để mặc định, nhưng nhớ một chỗ:

| Mục | Làm gì |
|---|---|
| Secret Files | Bỏ qua |
| **Health Check Path** | 🔴 **ĐỂ TRỐNG.** Chữ `/healthz` màu xám chỉ là gợi ý mẫu chứ chưa được đặt. Gõ nó vào là hỏng, vì app không có đường dẫn đó, Render kiểm tra thất bại rồi báo lỗi deploy |
| Pre-Deploy Command | Để trống, app không cần chạy gì trước |
| Auto-Deploy: On Commit | Giữ nguyên. Sau này push code lên GitHub là Render tự deploy lại |
| Build Filters | Để mặc định |

---

## BƯỚC 4 · Cho phép Atlas nhận kết nối từ Render

MongoDB Atlas chặn IP lạ, mà Render có IP thay đổi. Cần mở:

1. Vào `https://cloud.mongodb.com`, mở project của mày
2. Menu trái chọn **Network Access**
3. Bấm **Add IP Address**
4. Chọn **Allow Access from Anywhere** (nó điền `0.0.0.0/0`)
5. Bấm Confirm

> 💡 Với đồ án thì mở toàn bộ là chấp nhận được. Không làm bước này thì Render kết nối Atlas sẽ lỗi timeout.

---

## BƯỚC 5 · Deploy và lấy địa chỉ

1. Bấm **Create Web Service**
2. Render tự build, chờ khoảng 2 tới 4 phút
3. Xem tab **Logs**, thấy đủ 3 dòng này là thành công:
   ```
   Gemini: 3 API key(s) loaded     ← phải là 3, không phải 1
   Server running on port ...
   ✅ MongoDB connected
   ```
4. Trên cùng trang có địa chỉ kiểu `https://mealmate-api.onrender.com` → **copy lại**
5. Thử mở `https://mealmate-api.onrender.com/api-docs` trên trình duyệt, thấy trang Swagger là backend sống thật

---

## BƯỚC 6 · Cho app trỏ vào backend mới

1. Tạo file mới tên `.env` trong thư mục **`frontend`** (nếu chưa có)
2. Thêm đúng một dòng, thay bằng địa chỉ Render của mày:
   ```
   EXPO_PUBLIC_API_URL=https://mealmate-api.onrender.com
   ```
   (không có `/api` ở cuối, không có dấu gạch chéo cuối)
3. **Tắt Metro rồi mở lại** (`npx expo start`), vì biến môi trường chỉ nạp lúc khởi động
4. Mở app trong Expo Go, giờ nó gọi thẳng lên Render

> 💡 Muốn quay lại chạy backend localhost thì xoá dòng đó đi (hoặc đổi tên file thành `.env.bak`) rồi khởi động lại Metro.

---

## LƯU Ý VỀ BẬC MIỄN PHÍ

- Server **ngủ sau 15 phút không ai dùng**. Lần gọi đầu sau khi ngủ phải chờ khoảng **30 tới 50 giây** để thức dậy, các lần sau nhanh bình thường.
- **Trước buổi demo hoặc UAT:** mở `https://...onrender.com/api-docs` trước vài phút cho server thức, rồi mới cho người dùng vào app. Tránh cảnh chờ lần đầu ngay trước mặt thầy.
- Bậc miễn phí đủ cho đồ án, không cần trả tiền.

---

## VIẾT VÀO BÁO CÁO (mục 6.5 Deployment)

Sau khi deploy xong, mục 6.5 trong `CH6-IMPLEMENTATION.md` viết được:

> The application server is deployed to Render, a cloud platform, and is reachable at a public HTTPS endpoint rather than only on localhost. The database runs on MongoDB Atlas and media on Cloudinary, both managed cloud services, so the entire backend operates independently of the development machine. The free hosting tier suspends the service after inactivity, which introduces a cold-start delay on the first request, an accepted trade-off for a student project.

Nhớ điền đúng địa chỉ Render vào chỗ mô tả.

---

## CHECKLIST

| # | Việc | ✓ |
|---|---|---|
| 1 | Tạo tài khoản Render bằng GitHub | ⬜ |
| 2 | Tạo Web Service, Root Directory = `backend` | ⬜ |
| 3 | Khai đủ **10 biến** (dùng Add from .env, xoá dòng PORT) | ⬜ |
| 4 | Kiểm CLOUDINARY_CLOUD_NAME không phải chữ ".env" | ⬜ |
| 5 | Kiểm có đủ GEMINI_API_KEY, _2 và _3 | ⬜ |
| 6 | Advanced để trống, KHÔNG điền Health Check Path | ⬜ |
| 7 | Atlas Network Access mở `0.0.0.0/0` | ⬜ |
| 8 | Logs hiện `3 API key(s) loaded` và `MongoDB connected` | ⬜ |
| 9 | Mở được trang /api-docs | ⬜ |
| 10 | Tạo frontend/.env với EXPO_PUBLIC_API_URL | ⬜ |
| 11 | Restart Metro, test app gọi lên Render | ⬜ |
| 12 | Viết mục 6.5 Deployment với địa chỉ thật | ⬜ |
