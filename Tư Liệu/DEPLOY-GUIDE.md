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

Kéo xuống mục **Environment Variables**, bấm **Add Environment Variable** cho từng dòng.
Lấy giá trị từ file `backend/.env` trên máy mày, dán vào cột value.

Cần đủ **8 biến** (bỏ PORT, Render tự cấp):

| Key | Lấy giá trị từ đâu |
|---|---|
| MONGODB_URI | dòng MONGODB_URI trong .env |
| JWT_SECRET | dòng JWT_SECRET |
| CLOUDINARY_CLOUD_NAME | .env |
| CLOUDINARY_API_KEY | .env |
| CLOUDINARY_API_SECRET | .env |
| GMAIL_USER | .env |
| GMAIL_APP_PASSWORD | .env |
| GEMINI_API_KEY | .env |

> ⚠️ **KHÔNG thêm biến PORT.** Render tự đặt cổng riêng, mà server.js đã đọc `process.env.PORT` nên tự khớp.

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
3. Xem tab **Logs**, thấy 2 dòng này là thành công:
   ```
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
| 3 | Khai 8 biến môi trường (không có PORT) | ⬜ |
| 4 | Atlas Network Access mở `0.0.0.0/0` | ⬜ |
| 5 | Build xong, thấy MongoDB connected trong Logs | ⬜ |
| 6 | Mở được trang /api-docs | ⬜ |
| 7 | Tạo frontend/.env với EXPO_PUBLIC_API_URL | ⬜ |
| 8 | Restart Metro, test app gọi lên Render | ⬜ |
| 9 | Viết mục 6.5 Deployment với địa chỉ thật | ⬜ |
