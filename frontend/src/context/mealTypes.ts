export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  image?: string | null;
  note?: string;
  date: string;
  createdAt: string;
};

export type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NewMeal = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: MealType;
  date: string;
  note?: string;
  image?: string | null;
};

export type UpdateMeal = Partial<NewMeal>;

export type RawMeal = Omit<Meal, "id"> & { _id: string };

export type MealsContextType = {
  meals: Meal[];
  historyMeals: Meal[];
  dailyTotals: DailyTotals;
  isLoading: boolean;
  fetchMealsByDate: (date: string) => Promise<void>;
  fetchMealHistory: () => Promise<void>;
  addMeal: (meal: NewMeal) => Promise<void>;
  updateMeal: (id: string, updates: UpdateMeal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};
