import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string; // ISO
};

type MealsContextType = {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, "id" | "createdAt">) => void;
  clearMeals: () => void;
};

const MealsContext = createContext<MealsContextType | null>(null);

function randomId() {
  // Good enough for UI demo; replace with real IDs later.
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);

  const addMeal: MealsContextType["addMeal"] = (meal) => {
    setMeals((prev) => [
      {
        id: randomId(),
        createdAt: new Date().toISOString(),
        ...meal,
      },
      ...prev,
    ]);
  };

  const clearMeals = () => setMeals([]);

  const value = useMemo(() => ({ meals, addMeal, clearMeals }), [meals]);

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used inside MealsProvider");
  return ctx;
}

