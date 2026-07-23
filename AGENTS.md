# Meal Snap App (product name: MealMate)
- Frontend: React Native (Expo Router) — `frontend/`. Backend: Node/Express + MongoDB — `backend/`.
- Prefer full copy-paste-ready code
- Comment only on heavy logic (API, filter, state)
- JSX comments use {/* */} syntax
- Styles: gom toàn bộ vào `const styles = StyleSheet.create({...})` đặt CUỐI file (JSX chỉ tham chiếu `styles.x`); style động dùng mảng `[styles.x, cond && styles.xActive]`. Không viết object style inline trong JSX, trừ giá trị chỉ biết lúc runtime (vd `width: pct%`).
- Cấu trúc: `app/` chỉ chứa route (màn hình mỏng); ruột từng màn ở `src/features/<màn>/`; đồ ≥2 màn dùng ở `src/ui|context|utils`.
