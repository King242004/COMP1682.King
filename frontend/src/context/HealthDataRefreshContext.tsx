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
