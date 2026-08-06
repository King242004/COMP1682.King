// Màn Trang chủ, màn người dùng thấy đầu tiên sau khi đăng nhập.
// Đây là màn gom nhiều nguồn dữ liệu nhất trong app.
// LUỒNG MỞ TRANG CHỦ, tự chạy chứ không do ai bấm
// 1. useFocusEffect chạy mỗi lần màn được nhìn thấy
// 2. gọi song song năm thứ, xem chú thích tại chỗ
//    món trong ngày, buổi tập, lịch sử món, kế hoạch hôm nay, số ngày tập trong tuần
// 3. mỗi hàm gọi api riêng của mình tới backend
// 4. đặt kết quả vào state
// 5. màn hình vẽ lại vòng calo, danh sách bữa, thẻ hoạt động và thẻ Coach
// LUỒNG TỰ TẢI LẠI KHI DỮ LIỆU ĐỔI
// 1. Thêm món ở màn khác, MealsContext tăng số đếm revision
// 2. useFocusEffect ở đây thấy revision đổi nên chạy lại
// 3. handledRevisionRef nhớ đã xử lý số nào, để không tải lại hai lần
// Các lối đi từ màn này: Thêm món, Chi tiết món, Lịch sử món, Ghi buổi tập,
// Kế hoạch tuần, và tab Coach.
import { useCallback, useState, useRef } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useHealthDataRefresh } from "@/context/HealthDataRefreshContext";
import { useMeals } from "@/features/meals/MealsContext";
import { getExercisesByDate, deleteExercise, getExerciseHistory, type Exercise } from "@/features/exercise/exerciseApi";
import { getPlanMeals, markPlanEaten, deletePlanMeal, type PlanMeal } from "@/features/plan/planApi";
import { getInsight, getCachedInsight, cacheInsight, INSIGHT_TTL_MS, type CoachInsight } from "@/features/coach/coachApi";
import { SuggestMealCard } from "@/features/plan/SuggestMealCard";
import { ProgressRing } from "@/ui/components/ProgressRing";
import { getCurrentWeekDays } from "@/features/home/weekDates";
import { dateKey } from "@/utils/dateUtils";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { useT } from "@/i18n";
import { theme, shadow } from "@/ui/theme";
import { ATWATER_KCAL_PER_GRAM, macroTargets } from "@/config/nutritionCalculations";
import { MEAL_TYPE_META, type MealTypeKey } from "@/features/meals/mealTypeDisplay";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { Skeleton } from "@/ui/components/Skeleton";
import { useAnimatedNumber } from "@/ui/useAnimatedNumber";

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { revision, markHealthDataChanged } = useHealthDataRefresh();
  const { meals, dailyTotals, historyMeals, isLoading, fetchMealsByDate, fetchMealHistory } = useMeals();

  const today = new Date();
  const todayKey = dateKey(today);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalBurned, setTotalBurned] = useState(0);
  const [coachInsight, setCoachInsight] = useState<CoachInsight | null>(null);
  const [planToday, setPlanToday] = useState<PlanMeal[]>([]);
  const [weekActiveDays, setWeekActiveDays] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Các ref này chặn thao tác lặp và bỏ kết quả tải đã cũ.
  const eatingPlanRef = useRef(false);
  const insightRequestIdRef = useRef(0);
  const handledRevisionRef = useRef(0);

  const loadExercises = useCallback(async () => {
    if (!token) return;
    try {
      const { exercises, totalBurned } = await getExercisesByDate(token, selectedDate);
      setExercises(exercises);
      setTotalBurned(totalBurned);
    } catch {
      setExercises([]);
      setTotalBurned(0);
    }
  }, [token, selectedDate]);

  // Mục tiêu số buổi tập mỗi tuần do người dùng tự đặt trong hồ sơ.
  // Bản cũ suy ra từ mức vận động bằng ba con số gán cứng trong file này.
  const weekTarget = user?.weeklyWorkoutTarget ?? null;
  const loadWeekActivity = useCallback(async () => {
    if (!token) return;
    try {
      const days = getCurrentWeekDays(weekOffset);
      const list = await getExerciseHistory(token, dateKey(days[0]), dateKey(days[6]));
      setWeekActiveDays(new Set(list.map((e) => e.date)).size);
    } catch {
    // Giữ lại giá trị gần nhất nếu tải thất bại.
    }
  }, [token, weekOffset]);

  const loadPlanToday = useCallback(async () => {
    if (!token) return;
    try {
      const { meals } = await getPlanMeals(token, todayKey, todayKey);
      setPlanToday(meals);
    } catch {
      setPlanToday([]);
    }
  }, [token, todayKey]);

  // Nút "Đã ăn" trên thẻ Kế hoạch.
  // eatingPlanRef chặn bấm hai lần liên tiếp, tránh ghi trùng món vào nhật ký.
  const eatPlanned = async (p: PlanMeal) => {
    if (!token || eatingPlanRef.current) return;
    eatingPlanRef.current = true;
    try {
      await markPlanEaten(token, p.id);
      await Promise.all([fetchMealsByDate(todayKey), loadPlanToday()]);
      markHealthDataChanged();
    } catch {
      Alert.alert(t.common.errorTitle, t.home.logMealErr);
    } finally {
      eatingPlanRef.current = false;
    }
  };

  // Nút xóa một món dự định ngay tại Trang chủ.
  // Ở đây chỉ xóa được, muốn sửa món thì phải vào màn Kế hoạch tuần.
  const removePlanned = (p: PlanMeal) => {
    Alert.alert(t.home.removePlanTitle, t.home.removePlanMsg(p.name), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.home.remove,
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setPlanToday((prev) => prev.filter((x) => x.id !== p.id));
          try {
            await deletePlanMeal(token, p.id);
          } catch {
            loadPlanToday();
          }
        },
      },
    ]);
  };

  const lang = resolveLanguage(user?.language);
  // Nhãn ngày tháng đi theo ngôn ngữ trong app, không theo ngôn ngữ điện thoại.
  const locale = localeTag(lang);
  const t = useT();
  // Chỉ chạy cho hôm nay, xem ngày cũ thì bỏ trống thẻ Coach.
  // insightRequestIdRef đánh số từng lần gọi, kết quả về muộn hơn lần gọi mới nhất
  // sẽ bị bỏ, tránh việc bấm đổi ngày liên tục rồi dữ liệu cũ đè lên dữ liệu mới.
  const loadInsight = useCallback(async (force = false) => {
    if (!token || selectedDate !== todayKey) { setCoachInsight(null); return; }
    const requestId = ++insightRequestIdRef.current;
    const cached = await getCachedInsight(todayKey, lang);
    if (requestId !== insightRequestIdRef.current) return;
    if (cached) {
      setCoachInsight(cached.insight);
      // Không gọi AI lại khi insight trong bộ nhớ đệm vẫn còn mới.
      if (!force && Date.now() - cached.at < INSIGHT_TTL_MS) return;
    }
    try {
      const fresh = await getInsight(token, todayKey, lang);
      if (requestId !== insightRequestIdRef.current) return;
      setCoachInsight(fresh);
      cacheInsight(todayKey, lang, fresh);
    } catch {
      if (requestId === insightRequestIdRef.current && !cached) setCoachInsight(null);
    }
  }, [token, selectedDate, todayKey, lang]);

  // Kéo màn hình xuống để làm mới.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchMealsByDate(selectedDate),
      fetchMealHistory(),
      loadExercises(),
      loadWeekActivity(),
      loadInsight(true),
      loadPlanToday(),
    ]);
    setRefreshing(false);
  }, [
    selectedDate,
    fetchMealsByDate,
    fetchMealHistory,
    loadExercises,
    loadWeekActivity,
    loadInsight,
    loadPlanToday,
  ]);

  // Tự động tải lại, chạy mỗi lần màn được nhìn thấy chứ không do ai bấm.
  // Chạy lại mỗi khi quay về màn này, nên món thêm ở màn Thêm món
  // hay buổi tập ghi ở màn khác đều hiện ra ngay.
  useFocusEffect(
    useCallback(() => {
      // Nếu app mở qua nửa đêm thì cập nhật ngày hôm nay và chạy lại effect.
      const freshToday = dateKey(new Date());
      if (todayKey !== freshToday && selectedDate === todayKey) {
        setSelectedDate(freshToday);
        return;
      }
      void fetchMealsByDate(selectedDate).catch(() => {});
      void fetchMealHistory().catch(() => {});
      loadExercises();
      loadWeekActivity();
      // So số đếm với lần trước để biết dữ liệu sức khỏe có thật sự đổi không.
      // Chỉ khi đổi mới ép Coach gọi AI lại, tránh tốn lượt gọi mỗi lần
      // người dùng chỉ đơn giản là quay về màn này.
      const healthChanged = revision !== handledRevisionRef.current;
      handledRevisionRef.current = revision;
      loadInsight(healthChanged);
      loadPlanToday();
    }, [
      selectedDate,
      todayKey,
      fetchMealsByDate,
      fetchMealHistory,
      loadExercises,
      loadWeekActivity,
      loadInsight,
      loadPlanToday,
      revision,
    ])
  );

  // Xóa một buổi tập ngay tại Trang chủ.
  // Hỏi xác nhận rồi gọi DELETE /exercise/:id, sau đó tải lại
  // thẻ Hoạt động và vòng tiến độ tuần.
  const onDeleteExercise = (item: Exercise) => {
    Alert.alert(t.home.deleteWorkoutTitle, t.home.removeFromLog(item.name), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.common.delete,
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setExercises((prev) => prev.filter((e) => e.id !== item.id));
          setTotalBurned((prev) => prev - item.caloriesBurned);
          try {
            await deleteExercise(token, item.id);
            loadWeekActivity();
            markHealthDataChanged();
          } catch {
            loadExercises();
          }
        },
      },
    ]);
  };

  // Mục tiêu có thể chưa có nếu hồ sơ chưa đủ. Không thay bằng con số mặc định,
  // vì như vậy người dùng sẽ tưởng app đã tính riêng cho mình.
  const goal = user?.calorieGoal ?? null;
  // Số lớn, vòng tiến độ và trạng thái cùng chuyển động tới giá trị mới.
  const eaten = useAnimatedNumber(dailyTotals.calories);

  // Mục tiêu calo được tính từ TDEE, mà TDEE ĐÃ nhân hệ số mức vận động.
  // Hệ số đó vốn đã bao gồm tập luyện, nên nếu trừ tiếp calo của buổi tập
  // vừa ghi thì cùng một buổi tập được tính công hai lần và mức thâm hụt
  // bị ăn mòn mà người dùng không biết.
  // Vì vậy vòng calo so LƯỢNG ĂN với mục tiêu, còn buổi tập chỉ để theo dõi.
  const remaining = goal != null ? Math.max(0, goal - eaten) : 0;
  const overGoal = goal != null && eaten > goal;

  const macros = macroTargets(goal, user?.weight);

  const totalCarbs = dailyTotals.carbs;
  const totalFat = dailyTotals.fat;
  const totalProtein = dailyTotals.protein;

  // Nhật ký cho phép xem tuần cũ nhưng không đi quá tuần hiện tại.
  // Ngày tương lai thuộc trách nhiệm của màn Plan.
  const changeWeek = (delta: number) => {
    const next = weekOffset + delta;
    if (next > 0) return;
    setWeekOffset(next);
    setSelectedDate(next === 0 ? todayKey : dateKey(getCurrentWeekDays(next)[0]));
  };

  const weekDays = getCurrentWeekDays(weekOffset);
  const loggedDays = new Set(historyMeals.map((m) => m.date));

  const mealsByType = (type: MealTypeKey) =>
    meals.filter((m) => m.mealType === type);

  const isToday = selectedDate === todayKey;
  const selectedDateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, {
    day: "numeric",
    month: "numeric",
  });

  return (
    <Screen padded={false} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        {/* Tiêu đề bên trái và nút chuyển tuần bên phải. Tuần tương lai bị khóa. */}
        <View style={styles.headerRow}>
          <AppText variant="h1">
            {isToday ? t.meals.today : new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" })}
          </AppText>
          <View style={styles.weekNav}>
            <Pressable
              onPress={() => changeWeek(-1)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t.a11y.prevWeek}
              style={({ pressed }) => [styles.navBtn, pressed && styles.pressedDim]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.subtle} />
            </Pressable>
            {/* Nhãn tuần dùng cùng cách dịch với màn Plan. */}
            <AppText variant="body2" style={[styles.weekLabel, weekOffset === 0 && styles.weekLabelCurrent]}>
              {weekOffset === 0
                ? t.plan.thisWeek
                : weekDays[0].toLocaleDateString(locale, { month: "short", day: "numeric" }) +
                  " – " +
                  weekDays[6].toLocaleDateString(locale, { month: "short", day: "numeric" })}
            </AppText>
            <Pressable
              onPress={() => changeWeek(1)}
              disabled={weekOffset === 0}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t.a11y.nextWeek}
              style={({ pressed }) => [styles.navBtn, weekOffset === 0 ? styles.navBtnDisabled : pressed && styles.pressedDim]}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.subtle} />
            </Pressable>
          </View>
        </View>

        {/* Dải Thứ hai đến Chủ nhật. Ngày tương lai được làm mờ. */}
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const key = dateKey(d);
            const logged = loggedDays.has(key);
            const isSelected = key === selectedDate;
            // Chuỗi YYYY-MM-DD có thể so sánh trực tiếp để nhận biết ngày tương lai.
            const isFuture = key > todayKey;
            return (
              <Pressable
                key={i}
                disabled={isFuture}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => [
                  styles.dayChip,
                  logged && styles.dayChipLogged,
                  // Mọi chip có bóng nhẹ, chip được chọn trông chìm sâu hơn.
                  isSelected ? styles.dayChipSelected : shadow(1),
                  isFuture && styles.dayChipFuture,
                  pressed && styles.dayChipPressed,
                ]}
              >
                <AppText style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {t.labels.daysShort[i]}
                </AppText>
                <AppText style={[styles.dayNum, isSelected ? styles.dayNumSelected : logged && styles.dayNumLogged]}>
                  {d.getDate()}
                </AppText>
                {/* Dấu chấm nhỏ cho biết ngày đã có dữ liệu. */}
                <View style={[styles.dayDot, isSelected ? styles.dayDotSelected : logged && styles.dayDotLogged]} />
              </Pressable>
            );
          })}
        </View>

        {/* Một thẻ chính gộp calo và macro của ngày đang xem. */}
        <Card style={styles.summaryCard}>
          <AppText variant="h2" style={styles.calorieTitle}>{t.home.caloriesTitle}</AppText>
          {goal == null ? (
            /* Hồ sơ chưa đủ để tính mục tiêu. Mời hoàn tất thay vì hiện số bịa. */
            <Pressable onPress={() => router.push("/profile/edit")} style={({ pressed }) => pressed && styles.pressedDim}>
              <View style={styles.setupBlock}>
                <Ionicons name="person-circle-outline" size={26} color={theme.colors.primary} />
                <View style={styles.flex1}>
                  <AppText variant="h2" style={styles.cardTitleText}>{t.home.noGoalTitle}</AppText>
                  <AppText variant="subtle" style={styles.smallLabel}>{t.home.noGoalSub}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
              </View>
            </Pressable>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.eatenBlock}>
                  <View style={styles.eatenNumBlock}>
                    <AppText variant="subtle" style={styles.smallLabel}>
                      {isToday ? t.home.eatenToday : t.home.eatenOnDate(selectedDateLabel)}
                    </AppText>
                    <View style={styles.baselineRow}>
                      <AppText variant="h0" style={styles.kcalBig}>{eaten.toLocaleString()}</AppText>
                      <AppText variant="muted" style={styles.kcalGoal}>/ {goal.toLocaleString()} {t.common.kcal}</AppText>
                    </View>
                  </View>
                  <View style={[styles.statusChip, overGoal && styles.statusChipOver]}>
                    <AppText style={[styles.statusChipText, overGoal && styles.statusChipTextOver]}>
                      {overGoal
                        ? t.home.overGoal((eaten - goal).toLocaleString())
                        : t.home.kcalLeft(remaining.toLocaleString())}
                    </AppText>
                  </View>
                </View>
                <View style={styles.ringRaised}>
                  <ProgressRing eaten={Math.max(0, eaten)} goal={goal} />
                </View>
              </View>

              <View style={styles.divider} />

              {macros && (
                <View style={styles.macroRow}>
                  {[
                    { label: t.labels.protein, value: totalProtein, goal: macros.protein, color: theme.colors.accent2 },
                    { label: t.labels.carbs, value: totalCarbs, goal: macros.carbs, color: theme.colors.accent },
                    { label: t.labels.fat, value: totalFat, goal: macros.fat, color: theme.colors.indigo },
                  ].map((m) => (
                    <View key={m.label} style={styles.macroCol}>
                      <AppText variant="subtle" style={styles.macroLabel}>{m.label}</AppText>
                      <View style={styles.baselineRowTight}>
                        <AppText variant="h2" style={styles.macroVal}>{Math.round(m.value)}</AppText>
                        <AppText variant="subtle" style={styles.macroUnit}>g</AppText>
                      </View>
                      <AppText variant="subtle" style={styles.macroUnit}>/ {m.goal}g</AppText>
                      <View style={styles.macroTrack}>
                        {/* Chiều rộng chỉ tính được khi component đang chạy. */}
                        <View style={[styles.macroFill, { width: `${m.goal > 0 ? Math.min(m.value / m.goal, 1) * 100 : 0}%`, backgroundColor: m.color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </Card>

        {/* Nhật ký bữa ăn. */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">{t.home.diary}</AppText>
            <Pressable onPress={() => router.push("/meals/history")} hitSlop={10}>
              <AppText variant="subtle" style={styles.sectionLink}>{t.home.viewAll}</AppText>
            </Pressable>
          </View>

          {MEAL_TYPE_META.map((mt) => {
            const typeMeals = mealsByType(mt.key);
            const typeCalories = typeMeals.reduce((s, m) => s + m.calories, 0);
            const typeCarbs = typeMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
            const typeFat = typeMeals.reduce((s, m) => s + (m.fat ?? 0), 0);
            const typeProtein = typeMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
            const carbKcal = typeCarbs * ATWATER_KCAL_PER_GRAM.carbs;
            const fatKcal = typeFat * ATWATER_KCAL_PER_GRAM.fat;
            const proteinKcal = typeProtein * ATWATER_KCAL_PER_GRAM.protein;
            const totalMacroKcal = carbKcal + fatKcal + proteinKcal;

            const plannedForType = isToday
              ? planToday.filter((p) => p.mealType === mt.key && !p.done)
              : [];

            const isEmptySlot = typeMeals.length === 0 && plannedForType.length === 0;

            return (
              /* Bữa trống dùng thẻ thấp, bữa có dữ liệu dùng thẻ đầy đủ. */
              <Card key={mt.key} style={[styles.mealCard, isEmptySlot && styles.mealCardEmpty]}>
                {/* Biểu tượng, tên bữa, tổng kcal và nút thêm món. */}
                <View style={styles.mealCardHeader}>
                  <View style={styles.mealCardTitle}>
                    <View style={[styles.iconBox, { backgroundColor: mt.bg }]}>
                      <Ionicons name={mt.icon as any} size={18} color={mt.color} />
                    </View>
                    <AppText variant="h2" style={styles.cardTitleText}>{t.labels.mealType[mt.key]}</AppText>
                  </View>
                  <View style={styles.mealCardRight}>
                    {typeCalories > 0 && (
                      <AppText style={styles.typeKcal}>
                        {typeCalories} <AppText variant="subtle" style={styles.typeKcalUnit}>{t.common.kcal}</AppText>
                      </AppText>
                    )}
                    {/* Thêm nhanh chọn sẵn loại bữa và ngày. Có thể ghi bổ sung ngày cũ. */}
                    <Pressable
                      onPress={() => router.push({ pathname: "/meals/add", params: { mealType: mt.key, date: selectedDate } })}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`${t.a11y.addMeal}, ${t.labels.mealType[mt.key]}`}
                      style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                    >
                      <Ionicons name="add" size={17} color={theme.colors.primary} />
                    </Pressable>
                  </View>
                </View>

                {/* Chạm món đã ăn để mở chi tiết, sửa hoặc xóa. */}
                {typeMeals.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push({ pathname: "/meals/detail", params: { id: m.id } })}
                    style={({ pressed }) => [styles.mealRow, pressed && styles.rowPressed]}
                  >
                    <AppText variant="body2" numberOfLines={1} style={styles.mealName}>{m.name}</AppText>
                    <AppText variant="subtle" style={styles.mealKcal}>{m.calories} {t.common.kcal}</AppText>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.subtle} />
                  </Pressable>
                ))}

                {/* Món dự kiến có viền nét đứt, có thể ghi đã ăn hoặc xóa. */}
                {plannedForType.map((p) => (
                  <View key={p.id} style={styles.plannedRow}>
                    <AppText variant="body2" numberOfLines={1} style={styles.plannedName}>{p.name}</AppText>
                    <AppText variant="subtle" style={styles.plannedKcal}>{p.calories} {t.common.kcal}</AppText>
                    <Pressable
                      onPress={() => eatPlanned(p)}
                      hitSlop={6}
                      style={({ pressed }) => [styles.eatBtn, pressed && styles.rowPressed]}
                    >
                      <AppText style={styles.eatBtnText}>{t.home.eat}</AppText>
                      <Ionicons name="checkmark" size={14} color={theme.colors.accent} />
                    </Pressable>
                    <Pressable
                      onPress={() => removePlanned(p)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t.a11y.removePlanned}
                      style={({ pressed }) => pressed && styles.pressedDim}
                    >
                      <Ionicons name="close" size={16} color={theme.colors.subtle} />
                    </Pressable>
                  </View>
                ))}

                {/* Chỉ hiện trống khi bữa không có món. Trong lúc tải thì hiện Skeleton. */}
                {isEmptySlot && isLoading && <Skeleton width="55%" height={14} />}

                {/* Thanh nhỏ thể hiện tỷ lệ năng lượng từ từng macro. */}
                {totalMacroKcal > 0 && (
                  <View style={styles.splitBar}>
                    {carbKcal > 0 && <View style={[styles.splitCarbs, { flex: carbKcal }]} />}
                    {fatKcal > 0 && <View style={[styles.splitFat, { flex: fatKcal }]} />}
                    {proteinKcal > 0 && <View style={[styles.splitProtein, { flex: proteinKcal }]} />}
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Phần hoạt động có liên kết ghi bài tập ở tiêu đề. */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">{t.home.activity}</AppText>
            {/* Bài hướng dẫn chỉ bắt đầu ở ngày hiện tại. Ngày cũ chỉ xem lịch sử. */}
            {isToday && (
              <Pressable
                onPress={() => router.push("/exercise/log-workout")}
                hitSlop={10}
              >
                <AppText variant="subtle" style={styles.sectionLink}>{t.exercise.title}</AppText>
              </Pressable>
            )}
          </View>

          {/* Ngày cũ chỉ xem dữ liệu đã ghi, không mở bài tập rồi ghi ngược ngày. */}
          <Pressable
            onPress={() => {
              if (isToday) router.push("/exercise/log-workout");
            }}
            disabled={!isToday}
            style={({ pressed }) => isToday && pressed ? styles.pressedFaint : undefined}
          >
          <Card style={styles.mealCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.iconBox, styles.flameBox]}>
                <Ionicons name="flame" size={18} color={theme.colors.accent2} />
              </View>
              <AppText variant="body2" style={styles.burnedText}>
                {totalBurned > 0 ? t.home.kcalBurned(totalBurned) : t.home.noWorkout}
              </AppText>
            </View>

            {/* Các chấm so sánh số ngày tập trong tuần với mục tiêu.
                Chưa đặt mục tiêu thì chỉ đếm số ngày đã tập, không vẽ chấm. */}
            <View style={styles.weekDotsRow}>
              {weekTarget != null &&
                Array.from({ length: weekTarget }).map((_, i) => (
                  <View key={i} style={[styles.weekDot, i < weekActiveDays && styles.weekDotOn]} />
                ))}
              <AppText variant="subtle" style={styles.weekDotsLabel}>
                {weekTarget != null
                  ? weekOffset === 0
                    ? t.home.weekWorkouts(weekActiveDays, weekTarget)
                    : t.home.viewedWeekWorkouts(weekActiveDays, weekTarget)
                  : weekOffset === 0
                    ? t.home.weekWorkoutsNoTarget(weekActiveDays)
                    : t.home.viewedWeekWorkoutsNoTarget(weekActiveDays)}
              </AppText>
            </View>

            {/* Các bài tập đã ghi dùng cùng cách trình bày với nhật ký món. */}
            {exercises.map((ex) => (
              <View key={ex.id} style={styles.workoutRow}>
                <View style={styles.flex1}>
                  <AppText variant="body2" numberOfLines={1} style={styles.mealName}>{ex.name}</AppText>
                  <AppText variant="subtle" style={styles.workoutMeta}>{ex.durationMin} {t.home.min} · {ex.caloriesBurned} {t.common.kcal}</AppText>
                </View>
                {/* Có thể xóa bài tập ở bất kỳ ngày nào đang xem. */}
                <Pressable
                  onPress={() => onDeleteExercise(ex)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={t.a11y.deleteWorkout}
                  style={({ pressed }) => pressed && styles.pressedDim}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.colors.subtle} />
                </Pressable>
              </View>
            ))}
          </Card>
          </Pressable>
        </View>

        {/* Phần dành cho bạn gồm kế hoạch tuần và gợi ý món. */}
        {isToday && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="h2">{t.home.forYou}</AppText>
              <Pressable onPress={() => router.push("/plan/weekly")} hitSlop={10}>
                <AppText variant="subtle" style={styles.sectionLink}>{t.home.viewWeek}</AppText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/plan/weekly")}
              style={({ pressed }) => pressed && styles.pressedFaint}
            >
              <Card style={styles.mealCard}>
                <View style={styles.planHeader}>
                  <View style={[styles.iconBox, styles.planIconBox]}>
                    <Ionicons name="calendar" size={18} color={theme.colors.indigo} />
                  </View>
                  {/* Tiêu đề và trạng thái dùng cùng bố cục với thẻ gợi ý. */}
                  <View style={styles.planTitleBlock}>
                    <AppText variant="h2" style={styles.cardTitleText}>{t.home.weeklyPlan}</AppText>
                    <AppText variant="subtle" numberOfLines={1} style={styles.smallLabel}>
                      {(() => {
                        const pending = planToday.filter((p) => !p.done);
                        return planToday.length === 0
                          ? t.home.planNone
                          : pending.length === 0
                          ? t.home.planDone
                          : t.home.planPending(pending.length);
                      })()}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
                </View>

              </Card>
            </Pressable>

            {/* Thẻ gợi ý món nằm trong src/features/plan/SuggestMealCard. */}
            <SuggestMealCard planToday={planToday} />
          </View>
        )}

        {/* Lối vào AI Coach. */}
        {isToday && (
          <Pressable
            onPress={() => router.push("/tabs/coach")}
            style={({ pressed }) => pressed && styles.pressedScale}
          >
            <Card style={styles.coachCard}>
              <View style={styles.planHeader}>
                <View style={styles.coachIcon}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View style={styles.planTitleBlock}>
                  <View style={styles.coachTitleRow}>
                    <AppText variant="h2" style={styles.cardTitleText}>AI Coach</AppText>
                    {coachInsight && (
                      <View style={styles.scoreChip}>
                        <AppText style={styles.scoreVal}>{coachInsight.score}</AppText>
                        <AppText style={styles.scoreMax}>/100</AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="muted" style={styles.coachSummary}>
                    {coachInsight?.summary || t.home.coachFallback}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
              </View>

              {/* Hiện cảnh báo quan trọng nhất nếu có. */}
              {coachInsight && coachInsight.warnings.length > 0 && (
                <View style={styles.warnRow}>
                  <Ionicons name="warning-outline" size={15} color={theme.colors.danger} />
                  <AppText style={styles.warnText}>{coachInsight.warnings[0]}</AppText>
                </View>
              )}
            </Card>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 0 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.lg,
    paddingBottom: 40,
    gap: theme.space.lg,
  },

  flex1: { flex: 1 },
  pressedDim: { opacity: 0.5 },
  pressedFaint: { opacity: 0.9 },
  pressedScale: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  smallLabel: { fontSize: 12 },
  divider: { height: 1, backgroundColor: theme.colors.border },
  baselineRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  baselineRowTight: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitleText: { fontSize: 15 },

  // Phần đầu và nút chuyển tuần.
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  weekNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  navBtn: { padding: 4 },
  navBtnDisabled: { opacity: 0.25 },
  weekLabel: { fontWeight: "700", color: theme.colors.text },
  weekLabelCurrent: { color: theme.colors.primary },

  // Các chip ngày trong tuần.
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 42, paddingVertical: 9, borderRadius: 14,
    alignItems: "center", gap: 5,
    backgroundColor: theme.colors.surface,
  },
  dayChipLogged: { backgroundColor: "rgba(8,145,178,0.10)" },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 4,
  },
  dayChipFuture: { opacity: 0.35 },
  dayChipPressed: { transform: [{ scale: 0.94 }] },
  dayLabel: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  dayLabelSelected: { color: "rgba(255,255,255,0.8)" },
  dayNum: { fontSize: 14, fontWeight: "800", color: theme.colors.muted },
  dayNumLogged: { color: theme.colors.primary },
  dayNumSelected: { color: "#fff" },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  dayDotLogged: { backgroundColor: theme.colors.accent },
  dayDotSelected: { backgroundColor: "rgba(255,255,255,0.9)" },

  // Thẻ tổng kết ngày đang xem.
  summaryCard: {
    paddingHorizontal: theme.space.xl, paddingVertical: theme.space.lg,
    gap: theme.space.xs, ...shadow(2),
  },
  calorieTitle: { fontSize: 20 },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  ringRaised: { transform: [{ translateY: -5 }] },
  eatenBlock: { gap: 10, flex: 1 },
  setupBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  eatenNumBlock: { gap: 2 },
  kcalBig: { fontSize: 34, color: theme.colors.text },
  kcalGoal: { fontSize: 13 },
  statusChip: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(5,150,105,0.12)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
  },
  // Vượt mục tiêu dùng màu cam. Màu đỏ chỉ dành cho lỗi và hành động nguy hiểm.
  statusChipOver: { backgroundColor: "rgba(255,138,61,0.12)" },
  statusChipText: { fontSize: 13, fontWeight: "700", color: theme.colors.accent },
  statusChipTextOver: { color: theme.colors.accent2 },
  macroRow: { flexDirection: "row", gap: 12 },
  macroCol: { flex: 1, alignItems: "center", gap: 6, paddingHorizontal: 4 },
  macroLabel: { fontSize: 11 },
  macroVal: { fontSize: 15 },
  macroUnit: { fontSize: 10 },
  macroTrack: { height: 6, width: "80%", borderRadius: 99, backgroundColor: "rgba(22,78,99,0.08)", overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: 99 },

  // Các phần nội dung.
  section: { gap: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionLink: { fontSize: 13, color: theme.colors.primary },

  // Thẻ món trong nhật ký.
  mealCard: { padding: theme.space.lg, gap: 10 },
  mealCardEmpty: { paddingVertical: theme.space.sm, gap: 0 },
  mealCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealCardTitle: { flexDirection: "row", alignItems: "center", gap: 10 },
  mealCardRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeKcal: { fontSize: 14, fontWeight: "800", color: theme.colors.text },
  typeKcalUnit: { fontSize: 11 },
  addBtn: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(8,145,178,0.10)",
  },
  addBtnPressed: { backgroundColor: theme.colors.tint },
  mealRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    // Dùng nền chìm nhẹ thay cho đường viền cứng.
    backgroundColor: theme.colors.bg,
  },
  rowPressed: { backgroundColor: theme.colors.tint },
  mealName: { flex: 1, fontSize: 13, fontWeight: "600" },
  mealKcal: { fontSize: 12 },
  plannedRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  plannedName: { flex: 1, fontSize: 13, color: theme.colors.muted },
  plannedKcal: { fontSize: 11 },
  eatBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(5,150,105,0.10)",
  },
  eatBtnText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  splitBar: { flexDirection: "row", height: 3, borderRadius: 99, overflow: "hidden", gap: 1 },
  splitCarbs: { backgroundColor: theme.colors.accent },
  splitFat: { backgroundColor: theme.colors.indigo },
  splitProtein: { backgroundColor: theme.colors.accent2 },

  // Phần hoạt động.
  activityHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  weekDotsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  weekDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.tint },
  weekDotOn: { backgroundColor: theme.colors.accent },
  weekDotsLabel: { fontSize: 11, marginLeft: 4 },
  flameBox: { backgroundColor: "rgba(255,138,61,0.12)" },
  burnedText: { fontWeight: "700" },
  workoutRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: theme.colors.bg,
  },
  workoutMeta: { fontSize: 11 },

  // Phần dành cho bạn và thẻ kế hoạch tuần.
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconBox: { backgroundColor: "rgba(99,102,241,0.12)" },
  planTitleBlock: { flex: 1, gap: 2 },
  // Thẻ AI Coach.
  coachCard: {
    padding: theme.space.lg,
    borderColor: "rgba(8,145,178,0.20)",
    backgroundColor: "rgba(8,145,178,0.05)",
  },
  coachIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  coachTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(8,145,178,0.10)",
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
  },
  scoreVal: { fontSize: 11, fontWeight: "800", color: theme.colors.primary },
  scoreMax: { fontSize: 10, color: theme.colors.primary },
  coachSummary: { fontSize: 13 },
  warnRow: {
    flexDirection: "row", gap: 6, alignItems: "flex-start", marginTop: 10,
    backgroundColor: "rgba(229,72,77,0.08)", borderRadius: 10, padding: 10,
  },
  warnText: { fontSize: 12, color: theme.colors.danger, flex: 1 },
});
