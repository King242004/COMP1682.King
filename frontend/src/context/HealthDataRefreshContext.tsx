// ═══ FILE NÀY LÀM GÌ ═══
// Giữ đúng MỘT con số đếm, gọi là revision, làm tín hiệu báo "dữ liệu đã đổi".
//
// Ai gọi tới: MealsContext tăng số này sau mỗi lần thêm sửa xóa món.
//             Trang chủ, Tiến trình và Coach theo dõi số này để tự tải lại.
// Nhận vào:   không nhận gì, chỉ có lệnh markHealthDataChanged
// Trả ra:     con số hiện tại, và hàm để tăng nó lên
// Khi lỗi:    không có nhánh lỗi, đây chỉ là một con số trong bộ nhớ
//
// Vì sao cần: thêm một món ở màn Thêm món thì ba màn khác phải đổi theo.
// Để các màn tự gọi nhau thì rối như mạng nhện, nên dùng chung một con số
// làm tín hiệu. Màn nào quan tâm thì đặt nó vào useEffect là xong.
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type HealthDataRefreshContextValue = {
  revision: number;
  markHealthDataChanged: () => void;
};

// File này chỉ giữ MỘT con số đếm, gọi là revision.
// Vì sao cần: thêm một món ở màn Thêm món thì Trang chủ, Tiến trình và Coach
// đều phải đổi theo. Nếu để các màn tự gọi nhau thì rối, nên dùng chung
// một con số làm tín hiệu. Màn nào quan tâm thì đặt nó vào useEffect.
const HealthDataRefreshContext = createContext<HealthDataRefreshContextValue | null>(null);

export function HealthDataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);
  const markHealthDataChanged = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ revision, markHealthDataChanged }),
    [markHealthDataChanged, revision]
  );

  return (
    <HealthDataRefreshContext.Provider value={value}>
      {children}
    </HealthDataRefreshContext.Provider>
  );
}

export function useHealthDataRefresh() {
  const context = useContext(HealthDataRefreshContext);
  if (!context) throw new Error("useHealthDataRefresh must be used within HealthDataRefreshProvider");
  return context;
}
