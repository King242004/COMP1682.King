import { createContext, useCallback, useContext, useMemo, useState } from "react";

type HealthDataContextValue = {
  revision: number;
  markHealthDataChanged: () => void;
};

const HealthDataContext = createContext<HealthDataContextValue | null>(null);

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);
  const markHealthDataChanged = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ revision, markHealthDataChanged }),
    [markHealthDataChanged, revision]
  );

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) throw new Error("useHealthData must be used within HealthDataProvider");
  return context;
}
