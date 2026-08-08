// ═══ FILE NÀY LÀM GÌ ═══
// Khai hình dạng dữ liệu món ăn dùng khắp app. Chỉ có kiểu, không có code chạy.
//
// Ai gọi tới: MealsContext, mealsApi, và các màn về món
// Nhận vào:   không nhận gì
// Trả ra:     các kiểu dữ liệu cho TypeScript kiểm lúc build
// Khi lỗi:    gán sai kiểu thì TypeScript báo lỗi ngay lúc build

// RawMeal khớp JSON backend trả về và còn dùng _id, Meal là dạng app dùng với id
// Việc đổi tên trường nằm ở src/features/meals/mealsApi.ts
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
