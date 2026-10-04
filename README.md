# MealMate

App theo dõi calo: ghi bữa ăn, chụp ảnh nhận món, AI coach.

- `frontend/`: app điện thoại (Expo SDK 57, Expo Router, TypeScript)
- `backend/`: API (Node chạy thẳng TypeScript, Express 5, PostgreSQL)

## Chạy trên máy

Cần: Node 24 trở lên, PostgreSQL, app Expo Go trên điện thoại.

### Backend

```bash
cd backend
npm install
cp .env.example .env      # rồi điền DATABASE_URL và JWT_SECRET
npm run migrate           # tạo bảng trong database
npm run dev               # chạy server ở cổng 3000
```

Mở `http://localhost:3000/health`, thấy `{"server":"ok","database":"ok"}` là được.

### App

```bash
cd frontend
npm install
cp .env.example .env      # rồi điền EXPO_PUBLIC_API_URL = địa chỉ IP laptop, ví dụ http://192.168.1.9:3000
npx expo start
```

Quét mã QR bằng Expo Go. Điện thoại và laptop phải chung mạng.

## Lệnh kiểm tra

```bash
npm run typecheck         # chạy trong backend/ hoặc frontend/
npm test                  # chạy trong backend/
```
