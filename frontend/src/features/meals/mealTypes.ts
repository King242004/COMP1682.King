// File này khai báo hình dạng dữ liệu món ăn dùng khắp app.
// Chỉ có kiểu, không có code chạy.
// RawMeal là dạng backend trả về, còn dùng _id.
// Meal là dạng app dùng, đã đổi sang id. Việc đổi nằm ở utils/meals/mealsApi.
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type NutritionSource = "manual" | "ai_estimate" | "ai_adjusted" | "photo_scan" | "barcode" | "community" | "repeat" | "ai_suggestion";

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionAmount?: number | null;
  portionUnit?: string;
  portionText?: string;
  nutritionSource?: NutritionSource;
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
  portionAmount?: number;
  portionUnit?: string;
  portionText?: string;
  nutritionSource?: NutritionSource;
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
  addMeals: (meals: NewMeal[]) => Promise<void>;
  updateMeal: (id: string, updates: UpdateMeal) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};
