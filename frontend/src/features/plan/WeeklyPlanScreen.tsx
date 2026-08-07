// ═══ FILE NÀY LÀM GÌ ═══
// Màn Kế hoạch tuần. Đây là file BẮT ĐẦU của luồng tạo kế hoạch an toàn,
// một trong bốn luồng quan trọng nhất của app.
//
// Ai gọi tới: người dùng bấm vào từ Trang chủ
// Nhận vào:   phạm vi ngày và ghi chú khẩu vị người dùng gõ
// Trả ra:     thực đơn từng ngày kèm gợi ý bài tập, hiện lên màn hình
// Khi lỗi:    chưa có mục tiêu calo thì mời hoàn tất hồ sơ.
//             AI hết lượt thì báo thử lại sau, kế hoạch cũ vẫn còn nguyên.
//
// LUỒNG TẠO KẾ HOẠCH AN TOÀN
// 1. Bấm nút Tạo, GenerateModal mở ra cho chọn phạm vi và ghi chú khẩu vị
// 2. Bấm xác nhận, chạy runGenerate ở file này
// 3. generateWeekPlan          (POST /plan/generate)
// 4. Route gọi hàm generatePlan trong backend/src/controllers/planController.js;
//    hàm này đọc hồ sơ và BỆNH NỀN
// 5. LỚP AN TOÀN 1, đưa bệnh nền vào câu lệnh gửi cho Gemini
// 6. Gemini trả các món cho từng ngày
// 7. LỚP AN TOÀN 2, services/nutrition/foodSafetyFilter.js lọc lại theo tên món
// 8. planReplacement.replacePlanRange ghi bản mới rồi xóa kế hoạch cũ trong khoảng ngày
// 9. màn này tải lại và hiện kế hoạch
// Vì sao cần hai lớp: lớp 1 chỉ là lời dặn, AI có thể quên.
// Lớp 2 chạy trong planController.generatePlan sau phản hồi AI nên app không bỏ qua được.
// Giới hạn phải nói rõ khi bảo vệ: lớp 2 chỉ đọc TÊN món,
// không phân tích được nguyên liệu, nên đây là lưới chắn thêm
// chứ không phải bảo đảm y khoa.
// BIẾN KẾ HOẠCH THÀNH DỮ LIỆU THẬT
//   "Đã ăn" gọi POST /plan/:id/eaten; planController.markEaten tạo Meal từ món kế hoạch.
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useHealthDataRefresh } from "@/context/HealthDataRefreshContext";
import { getPlanMeals, deletePlanMeal, markPlanEaten, generateWeekPlan, getGroceryList, getCachedGrocery, cacheGrocery, getCachedPlanWeek, cachePlanWeek, type PlanMeal, type PlanDayWorkout, type GroceryGroup } from "@/features/plan/planApi";
import { resolvePlannedRoutine } from "@/features/exercise/guidedRoutines";
import { GenerateModal } from "@/features/plan/GenerateModal";
import { GroceryModal } from "@/features/plan/GroceryModal";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { getErrorMessage, getUserErrorMessage } from "@/utils/errorUtils";
import { useT } from "@/i18n";
import { theme, shadow } from "@/ui/theme";
import { MEAL_TYPE_META } from "@/features/meals/mealTypeDisplay";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { dateKey } from "@/utils/dateUtils";
import { aiResetWhen } from "@/utils/aiQuota";


// Tìm Thứ hai của tuần chứa base rồi dịch chuyển theo weekOffset.
function mondayOf(base: Date, weekOffset: number) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  // JavaScript đánh số Chủ nhật là 0.
  const dow = d.getDay();
  d.setDate(d.getDate() - ((dow + 6) % 7) + weekOffset * 7);
  return d;
}

export default function WeeklyPlanScreen() {
  const router = useRouter();
  const { token, user, updateProfile } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();
  const lang = resolveLanguage(user?.language);
  // Nhãn ngày tháng đi theo ngôn ngữ trong app, không theo điện thoại.
  const locale = localeTag(lang);
  const t = useT();
  // Viết tắt cụm chữ của phần Kế hoạch, màn này dùng rất nhiều lần.
  const L = t.plan;

  const [todayKey, setTodayKey] = useState(dateKey(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [plan, setPlan] = useState<PlanMeal[]>([]);
  const [workouts, setWorkouts] = useState<Record<string, PlanDayWorkout>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  // Hộp tạo thực đơn cho một tuần hoặc một ngày, kèm ghi chú khẩu vị.
  // Khẩu vị lấy từ hồ sơ và có thể lưu lại để các tính năng AI cùng sử dụng.
  const [genVisible, setGenVisible] = useState(false);
  const [genScope, setGenScope] = useState<"week" | "day">("week");
  const [note, setNote] = useState("");
  const [rememberTaste, setRememberTaste] = useState(true);
  // Danh sách mua sắm AI và trạng thái từng món được lưu theo tuần.
  const [grocery, setGrocery] = useState<GroceryGroup[] | null>(null);
  const [groceryChecked, setGroceryChecked] = useState<Record<string, boolean>>({});
  const [groceryVisible, setGroceryVisible] = useState(false);
  const [groceryLoading, setGroceryLoading] = useState(false);
  // Dấu nhận diện giúp chỉ dùng lại danh sách mua sắm khi thực đơn chưa đổi.
  const planSigRef = useRef("");

  // Chưa đủ hồ sơ thì mục tiêu là rỗng. Không thay bằng con số mặc định.
  const goal = user?.calorieGoal ?? null;

  // Bảy ngày từ Thứ hai đến Chủ nhật của tuần đang xem.
  const weekDays = useMemo(() => {
    const monday = mondayOf(new Date(), weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const weekStart = dateKey(weekDays[0]);
  const weekEnd = dateKey(weekDays[6]);

  // planSigRef ghi dấu danh sách mã món. Nếu dấu không đổi thì kế hoạch
  // vẫn y nguyên, nên KHÔNG xóa danh sách đi chợ đã tốn một lượt AI để tạo.
  const load = useCallback(async () => {
    if (!token) return;
    const cached = await getCachedPlanWeek(weekStart);
    if (cached) {
      setPlan(cached.meals);
      setWorkouts(cached.workouts);
      // Ghi dấu nhận diện để lần tải giống hệt không xóa trạng thái mua sắm.
      if (!planSigRef.current) {
        planSigRef.current = cached.meals.map((m) => m.id).sort().join(",");
      }
    } else {
      setLoading(true);
    }
    try {
      const { meals, workouts: nextWorkouts } = await getPlanMeals(token, weekStart, weekEnd);
      setPlan(meals);
      setWorkouts(nextWorkouts);
      cachePlanWeek(weekStart, { meals, workouts: nextWorkouts });
      // Chỉ xóa danh sách mua sắm khi thực đơn thật sự thay đổi.
      // Tải lại do focus không được làm mất kết quả đã tốn một lượt AI.
      const sig = meals.map((m) => m.id).sort().join(",");
      if (sig !== planSigRef.current) {
        planSigRef.current = sig;
        setGrocery(null);
        setGroceryChecked({});
      }
    } catch {
      if (!cached) {
        setPlan([]);
        setWorkouts({});
      }
    } finally {
      setLoading(false);
    }
  }, [token, weekStart, weekEnd]);

  // Tải lại khi quay về màn hình hoặc đổi tuần.
  // Đặt ngay sau hàm load để luồng mở màn đọc liền nhau: dựng khoảng tuần → tải → đặt state.
  useFocusEffect(
    useCallback(() => {
      const fresh = dateKey(new Date());
      if (fresh !== todayKey) setTodayKey(fresh);
      load();
    }, [load, todayKey])
  );

  // Đổi tuần cũng đổi ngày đang chọn để ngày đó luôn nằm trong dải đang hiển thị.
  const changeWeek = (delta: number) => {
    const next = weekOffset + delta;
    setWeekOffset(next);
    setSelectedDate(next === 0 ? todayKey : dateKey(mondayOf(new Date(), next)));
  };

  // AI không tạo kế hoạch cho quá khứ nên khoảng tạo bắt đầu từ hôm nay hoặc đầu tuần.
  // Chuỗi YYYY-MM-DD có thể so sánh trực tiếp.
  const genRange = (scope: "week" | "day"): [string, string] | null => {
    if (scope === "day") {
      return selectedDate >= todayKey ? [selectedDate, selectedDate] : null;
    }
    // Không chọn ngày mặc định khi cả tuần đã nằm trong quá khứ.
    if (weekEnd < todayKey) return null;
    return [weekStart > todayKey ? weekStart : todayKey, weekEnd];
  };

  // Nút Tạo kế hoạch. Chưa gọi AI, mới chỉ mở hộp thoại.
  // Phải hỏi xác nhận vì tạo lại sẽ XÓA HẲN kế hoạch cũ trong khoảng đó.
  const openGenerate = (scope: "week" | "day") => {
    if (generating) return;
    const range = genRange(scope);
    if (!range) {
      Alert.alert(L.error, L.pastWeek);
      return;
    }
    // Mở hộp tạo kế hoạch sau khi đã chốt phạm vi và ghi chú khẩu vị.
    const show = () => {
      setGenScope(scope);
      // Điền khẩu vị đã lưu trong hồ sơ nếu ô hiện đang trống.
      setNote((n) => n.trim() ? n : (user?.tastePreferences || ""));
      setGenVisible(true);
    };
    // Yêu cầu xác nhận trước vì tạo lại sẽ thay thế các món hiện có.
    const hasExistingPlan = plan.some((p) => p.date >= range[0] && p.date <= range[1]) ||
      Object.values(workouts).some((workout) => workout.date >= range[0] && workout.date <= range[1]);
    if (hasExistingPlan) {
      Alert.alert(L.confirmTitle, scope === "day" ? L.confirmDayMsg : L.confirmWeekMsg, [
        { text: L.cancel, style: "cancel" },
        { text: L.continue, style: "destructive", onPress: show },
      ]);
    } else {
      show();
    }
  };

  // Đây là bước gọi AI thật, chạy khi người dùng xác nhận trong hộp thoại.
  const runGenerate = async () => {
    const range = genRange(genScope);
    if (!token || generating || !range) return;
    setGenVisible(false);
    setGenerating(true);
    // Lưu khẩu vị vào hồ sơ để Suggest và Coach cũng sử dụng.
    // Lỗi lưu khẩu vị không được làm thất bại việc tạo thực đơn.
    const taste = note.trim();
    // Không chờ lệnh lưu này xong, và nuốt lỗi của nó, vì lưu khẩu vị
    // thất bại không được làm hỏng việc tạo kế hoạch.
    if (rememberTaste && taste && taste !== (user?.tastePreferences || "")) {
      updateProfile({ tastePreferences: taste }).catch(() => {});
    }
    try {
      await generateWeekPlan(token, range[0], range[1], lang, taste || undefined);
      await load();
    } catch (error) {
      const quota = /quota/i.test(getErrorMessage(error));
      Alert.alert(L.error, quota ? L.quota(aiResetWhen(t)) : L.genErr);
    } finally {
      setGenerating(false);
    }
  };

  // Nút Danh sách đi chợ.
  // Tìm theo ba bậc để tiết kiệm lượt gọi AI, vì mỗi danh sách tốn một lượt.
  // Bản lưu chỉ dùng lại khi dấu nhận diện còn khớp với kế hoạch hiện tại.
  const openGrocery = async () => {
    if (groceryLoading || !token) return;
    // Dùng lại danh sách mua sắm cho đến khi thực đơn thay đổi.
    if (grocery) { setGroceryVisible(true); return; }
    const cached = await getCachedGrocery(weekStart, lang);
    if (cached && cached.sig === planSigRef.current) {
      setGrocery(cached.groups);
      setGroceryChecked(cached.checked || {});
      setGroceryVisible(true);
      return;
    }
    const start = weekStart > todayKey ? weekStart : todayKey;
    setGroceryLoading(true);
    try {
      const groups = await getGroceryList(token, start, weekEnd, lang);
      setGrocery(groups);
      setGroceryChecked({});
      cacheGrocery(weekStart, lang, { groups, checked: {}, sig: planSigRef.current });
      setGroceryVisible(true);
    } catch (error) {
      const quota = /quota/i.test(getErrorMessage(error));
      Alert.alert(L.error, quota ? L.quota(aiResetWhen(t)) : L.groceryErr);
    } finally {
      setGroceryLoading(false);
    }
  };

  // Lưu trạng thái đánh dấu cùng danh sách để đóng mở lại vẫn còn.
  const toggleGroceryItem = (key: string) => {
    setGroceryChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      cacheGrocery(weekStart, lang, { groups: grocery || [], checked: next, sig: planSigRef.current });
      return next;
    });
  };

  // Các món trong thực đơn của ngày đang chọn.
  const dayPlan = useMemo(() => plan.filter((p) => p.date === selectedDate), [plan, selectedDate]);

  // Cộng calo của từng ngày trong tuần, để hiện dưới mỗi cột ngày.
  // Chỉ cộng món trong kế hoạch, không tính món đã ăn thật.
  const dayTotals = useMemo(
    () =>
      dayPlan.reduce(
        (acc, p) => {
          acc.calories += p.calories;
          acc.protein += p.protein;
          acc.carbs += p.carbs;
          acc.fat += p.fat;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayPlan]
  );

  // Đếm món từng ngày để hiện dấu chấm trên dải tuần.
  const plannedDays = useMemo(() => {
    const set = new Set(plan.map((p) => p.date));
    Object.keys(workouts).forEach((date) => set.add(date));
    return set;
  }, [plan, workouts]);

  // Nút "Đã ăn". Đây là chỗ kế hoạch biến thành dữ liệu thật.
  const onMarkEaten = async (item: PlanMeal) => {
    if (!token) return;
    // Cập nhật giao diện trước để thao tác phản hồi ngay.
    setPlan((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: true } : p)));
    try {
      await markPlanEaten(token, item.id);
      markHealthDataChanged();
    } catch (error) {
      setPlan((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: false } : p)));
      Alert.alert(L.couldntLog, getUserErrorMessage(error, t, t.common.tryAgain));
    }
  };

  // Xóa một món khỏi kế hoạch.
  // Bỏ khỏi màn hình trước rồi mới gọi mạng, lỗi thì tải lại cho hiện lại.
  const onDelete = (item: PlanMeal) => {
    Alert.alert(t.home.removePlanTitle, L.removePlanMsg(item.name), [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.home.remove,
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          setPlan((prev) => prev.filter((p) => p.id !== item.id));
          try {
            await deletePlanMeal(token, item.id);
          } catch {
          load();
          }
        },
      },
    ]);
  };

  // Bấm hỏi cách nấu một món trong kế hoạch thì sang tab Coach kèm sẵn câu hỏi.
  const askCoach = (item: PlanMeal) =>
    router.push({
      pathname: "/tabs/coach",
      params: {
        ask: t.community.cookQuestion(item.name),
        // Mỗi lần chạm có một mã riêng để tab Coach chỉ xử lý yêu cầu một lần.
        askId: String(Date.now()),
      },
    });

  // Ngày quá khứ chỉ được xem vì thêm hoặc đánh dấu ăn có thể ghi sai vào hôm nay.
  // Người dùng vẫn có thể xóa món cũ.
  const isPast = selectedDate < todayKey;
  const plannedWorkout = workouts[selectedDate] || null;
  const plannedRoutine = plannedWorkout
    ? resolvePlannedRoutine(plannedWorkout.category, plannedWorkout.durationMin, selectedDate)
    : null;

  const selectedLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Screen padded={false}>
      {/* Phần đầu cố định khi danh sách cuộn. */}
      <View style={styles.headerWrap}>
        <ScreenHeader title={L.mealPlanTitle} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Chuyển qua lại giữa các tuần. */}
        <View style={styles.weekNav}>
          <Pressable
            onPress={() => changeWeek(-1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.prevWeek}
            style={({ pressed }) => [styles.navBtn, pressed && styles.dim]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.subtle} />
          </Pressable>
          <AppText variant="body2" style={styles.weekLabel}>
            {weekOffset === 0
              ? L.thisWeek
              : weekDays[0].toLocaleDateString(locale, { month: "short", day: "numeric" }) +
                " – " +
                weekDays[6].toLocaleDateString(locale, { month: "short", day: "numeric" })}
          </AppText>
          <Pressable
            onPress={() => changeWeek(1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.nextWeek}
            style={({ pressed }) => [styles.navBtn, pressed && styles.dim]}
          >
            <Ionicons name="chevron-forward" size={22} color={theme.colors.subtle} />
          </Pressable>
        </View>

        {/* Dải bảy ngày của tuần. */}
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const key = dateKey(d);
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const isPastDay = key < todayKey;
            const hasPlan = plannedDays.has(key);
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(key)}
                style={({ pressed }) => [
                  styles.dayChip,
                  hasPlan && styles.dayChipPlanned,
                  isPastDay && !isSelected && styles.dayChipPast,
                  isSelected && styles.dayChipSelected,
                  pressed && styles.dayChipPressed,
                ]}
              >
                <AppText style={[styles.dayLabel, isPastDay && styles.dayTextPast, isSelected && styles.dayLabelSelected]}>
                  {t.labels.daysShort[i]}
                </AppText>
                <AppText style={[styles.dayNum, isPastDay && styles.dayTextPast, isToday && styles.dayNumToday, isSelected && styles.dayNumSelected]}>
                  {d.getDate()}
                </AppText>
                <View style={[styles.dayDot, hasPlan && styles.dayDotPlanned, isSelected && styles.dayDotSelected]} />
              </Pressable>
            );
          })}
        </View>

        {/* Thẻ tổng dinh dưỡng trong ngày. */}
        <Card style={styles.totalCard}>
          {isPast && (
            <View style={styles.pastBanner}>
              <Ionicons name="time-outline" size={15} color={theme.colors.subtle} />
              <AppText variant="subtle" style={styles.pastBannerText}>{L.pastDay}</AppText>
            </View>
          )}
          {/* Đặt nút tạo lại ngang hàng với ngày và tránh số calo lớn. */}
          <View style={styles.totalHead}>
            <View style={styles.totalBlock}>
              <AppText variant="subtle" style={styles.smallLabel}>{selectedLabel}</AppText>
              <View style={styles.baselineRow}>
                <AppText variant="h0" style={styles.totalKcal}>{dayTotals.calories.toLocaleString()}</AppText>
                {goal != null && <AppText variant="muted" style={styles.totalGoal}>/ {goal.toLocaleString()} {t.common.kcal}</AppText>}
              </View>
            </View>
            {/* Chỉ tạo lại ngày hôm nay hoặc ngày tương lai. */}
            {selectedDate >= todayKey && dayPlan.length > 0 && (
              <Pressable
                onPress={() => openGenerate("day")}
                disabled={generating}
                hitSlop={8}
                style={({ pressed }) => [styles.redoBtn, pressed && styles.redoBtnPressed]}
              >
                {/* Khung cố định để vòng tải không làm nút lớn lên. */}
                <View style={styles.redoIconBox}>
                  {generating && genScope === "day" ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.redoSpinner} />
                  ) : (
                    <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                  )}
                </View>
                <AppText style={styles.redoText}>{L.redoDay}</AppText>
              </Pressable>
            )}
          </View>
          <View style={styles.macroStrip}>
            <AppText variant="subtle" style={[styles.smallLabel, styles.macroP]}>P {Math.round(dayTotals.protein)}g</AppText>
            <View style={styles.macroDivider} />
            <AppText variant="subtle" style={[styles.smallLabel, styles.macroC]}>C {Math.round(dayTotals.carbs)}g</AppText>
            <View style={styles.macroDivider} />
            <AppText variant="subtle" style={[styles.smallLabel, styles.macroF]}>F {Math.round(dayTotals.fat)}g</AppText>
          </View>
        </Card>

        {plannedWorkout && plannedRoutine && (
          <Card style={[styles.workoutCard, plannedWorkout.done && styles.workoutCardDone]}>
            <View style={styles.workoutHead}>
              <View style={styles.workoutIcon}>
                <Ionicons name="fitness-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.flex1}>
                <AppText variant="subtle" style={styles.workoutEyebrow}>{L.plannedActivity}</AppText>
                <AppText variant="h2" style={styles.workoutTitle}>{plannedRoutine.title[lang]}</AppText>
              </View>
              {plannedWorkout.done && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
              )}
            </View>

            <View style={styles.workoutMeta}>
              <View style={styles.workoutMetaItem}>
                <Ionicons name="time-outline" size={15} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.workoutMetaText}>
                  {t.exercise.durationMinutes(plannedRoutine.durationMin)}
                </AppText>
              </View>
              <View style={styles.workoutMetaItem}>
                <Ionicons name="home-outline" size={15} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.workoutMetaText}>{t.exercise.noEquipment}</AppText>
              </View>
              <View style={styles.workoutMetaItem}>
                <Ionicons name="speedometer-outline" size={15} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.workoutMetaText}>
                  {t.exercise.levels[plannedRoutine.level]}
                </AppText>
              </View>
            </View>

            {plannedWorkout.done ? (
              <View style={styles.workoutStatus}>
                <AppText style={styles.workoutStatusText}>{L.workoutDone}</AppText>
              </View>
            ) : selectedDate === todayKey ? (
              <Pressable
                onPress={() => router.push({
                  pathname: "/exercise/guided",
                  params: { routine: plannedRoutine.key, planWorkoutId: plannedWorkout.id },
                })}
                style={({ pressed }) => [styles.workoutStart, pressed && styles.workoutStartPressed]}
              >
                <Ionicons name="play" size={17} color="#fff" />
                <AppText style={styles.workoutStartText}>{L.startPlannedWorkout}</AppText>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push({
                  pathname: "/exercise/guided",
                  params: { routine: plannedRoutine.key, previewOnly: "1", planDate: selectedDate },
                })}
                style={({ pressed }) => [styles.workoutPreview, pressed && styles.dim]}
              >
                <AppText variant="subtle" style={styles.workoutReadOnly}>
                  {isPast ? L.pastWorkout : L.scheduledWorkout}
                </AppText>
                <Ionicons name="chevron-forward" size={17} color={theme.colors.primary} />
              </Pressable>
            )}
          </Card>
        )}

        {loading && dayPlan.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <>
          {/* Ngày cũ chỉ để xem. Hôm nay và tương lai có gợi ý cùng nút tạo thực đơn. */}
          {dayPlan.length === 0 && (
            <View style={styles.emptyBlock}>
              <View style={styles.hintBox}>
                <Ionicons name={isPast ? "time-outline" : "sparkles"} size={15} color={theme.colors.primary} style={styles.hintIcon} />
                <AppText variant="subtle" style={styles.hintText}>
                  {isPast ? L.pastDay : L.emptyHint}
                </AppText>
              </View>
              {!isPast && (
                <Pressable
                  onPress={() => openGenerate(plan.length === 0 ? "week" : "day")}
                  disabled={generating}
                  style={({ pressed }) => [
                    styles.emptyCta,
                    generating ? styles.emptyCtaDisabled : pressed && styles.emptyCtaPressed,
                  ]}
                >
                  {generating && <ActivityIndicator color="#fff" size="small" />}
                  <AppText style={styles.emptyCtaText}>
                    {generating ? L.generating : plan.length === 0 ? L.generate : L.emptyDayCta}
                  </AppText>
                </Pressable>
              )}
            </View>
          )}
          {MEAL_TYPE_META.map((mt) => {
            const items = dayPlan.filter((p) => p.mealType === mt.key);
            return (
              <View key={mt.key} style={styles.mealSection}>
                <View style={styles.mealSectionHead}>
                  <Ionicons name={mt.icon as any} size={16} color={mt.color} />
                  <AppText variant="h2" style={styles.mealSectionTitle}>{t.labels.mealType[mt.key]}</AppText>
                </View>

                {items.length === 0 ? (
                  <AppText variant="subtle" style={styles.nothingText}>{L.nothingPlanned}</AppText>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} style={[styles.dishCard, item.done && styles.dishCardDone]}>
                      <View style={styles.dishRow}>
                        <View style={styles.flex1}>
                          <AppText variant="body2" style={[styles.dishName, item.done && styles.dishNameDone]}>
                            {item.name}
                          </AppText>
                          <AppText variant="subtle" style={styles.dishMacros}>
                            {item.calories} {t.common.kcal} · P {item.protein} · C {item.carbs} · F {item.fat}
                          </AppText>
                        </View>

                        {item.done ? (
                          <View style={styles.eatenChip}>
                            <AppText style={styles.eatenText}>{L.eaten}</AppText>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                          </View>
                        ) : selectedDate === todayKey ? (
                          /* Ăn sẽ ghi món vào nhật ký ngay nên chỉ dùng cho hôm nay.
                             Backend markEaten cũng chặn ngày quá khứ và tương lai. */
                          <Pressable
                            onPress={() => onMarkEaten(item)}
                            hitSlop={6}
                            style={({ pressed }) => [styles.eatBtn, pressed && styles.eatBtnPressed]}
                          >
                            <AppText style={styles.eatenText}>{t.home.eat}</AppText>
                            <Ionicons name="checkmark" size={15} color={theme.colors.accent} />
                          </Pressable>
                        ) : null}

                        {/* Hỏi Coach cách nấu món này. */}
                        <Pressable
                          onPress={() => askCoach(item)}
                          hitSlop={10}
                          accessibilityRole="button"
                          accessibilityLabel={t.a11y.askCoach}
                          style={({ pressed }) => pressed && styles.dim}
                        >
                          <Ionicons name="chatbubble-ellipses-outline" size={17} color={theme.colors.primary} />
                        </Pressable>

                        {!isPast && (
                          <Pressable
                            onPress={() => onDelete(item)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={t.a11y.deletePlanned}
                            style={({ pressed }) => pressed && styles.dim}
                          >
                            <Ionicons name="trash-outline" size={18} color={theme.colors.subtle} />
                          </Pressable>
                        )}
                      </View>
                    </Card>
                  ))
                )}
              </View>
            );
          })}
          </>
        )}

        {/* Đặt hành động AI dưới cùng để lịch tuần vẫn là nội dung chính.
            Ngày trống đã có nút tạo riêng nên không lặp lại nút tại đây. */}
        <View style={styles.aiActions}>
          {dayPlan.length > 0 && (
            <Button
              title={generating && genScope === "week" ? L.generating : L.generate}
              variant="primary"
              size="lg"
              // Chỉ hiện vòng tải này khi tạo cả tuần. Tạo một ngày có vòng tải riêng.
              left={generating && genScope === "week"
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="sparkles" size={19} color="#fff" />}
              disabled={generating}
              onPress={() => openGenerate("week")}
            />
          )}

          {plan.length > 0 && (
            <Button
              title={groceryLoading ? L.groceryLoading : L.grocery}
              variant="secondary"
              size="lg"
              left={groceryLoading
                ? <ActivityIndicator color={theme.colors.primary} size="small" />
                : <Ionicons name="cart-outline" size={19} color={theme.colors.primary} />}
              disabled={groceryLoading}
              onPress={openGrocery}
            />
          )}
        </View>
      </ScrollView>

      {/* Các hộp thoại nằm trong src/features/plan. */}
      <GenerateModal
        visible={genVisible}
        scope={genScope}
        note={note}
        onChangeNote={setNote}
        remember={rememberTaste}
        onToggleRemember={() => setRememberTaste((v) => !v)}
        onCancel={() => setGenVisible(false)}
        onStart={runGenerate}
      />
      <GroceryModal
        visible={groceryVisible}
        groups={grocery}
        checked={groceryChecked}
        onToggle={toggleGroceryItem}
        onClose={() => setGroceryVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.5 },
  smallLabel: { fontSize: 12 },
  baselineRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },

  headerWrap: { paddingHorizontal: theme.space.lg, paddingTop: 60 },
  content: {
    paddingHorizontal: theme.space.lg,
    paddingBottom: 40,
    gap: theme.space.lg,
  },

  // Phần chuyển tuần và dải ngày.
  weekNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    paddingVertical: 6, paddingHorizontal: 8,
    ...shadow(1),
  },
  navBtn: { padding: 4 },
  weekLabel: { fontWeight: "700" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayChip: {
    width: 42, paddingVertical: 9, borderRadius: 16,
    alignItems: "center", gap: 5,
    backgroundColor: theme.colors.surface,
  },
  dayChipPlanned: { backgroundColor: "rgba(8,145,178,0.10)" },
  dayChipPast: { opacity: 0.52 },
  dayChipSelected: { backgroundColor: theme.colors.primary },
  dayChipPressed: { transform: [{ scale: 0.94 }] },
  dayLabel: { fontSize: 10, fontWeight: "700", color: theme.colors.subtle },
  dayTextPast: { color: theme.colors.subtle },
  dayLabelSelected: { color: "rgba(255,255,255,0.8)" },
  dayNum: { fontSize: 14, fontWeight: "800", color: theme.colors.muted },
  dayNumToday: { color: theme.colors.primary },
  dayNumSelected: { color: "#fff" },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  dayDotPlanned: { backgroundColor: theme.colors.accent },
  dayDotSelected: { backgroundColor: "rgba(255,255,255,0.9)" },

  // Thẻ tổng trong ngày.
  totalCard: { padding: theme.space.lg, gap: 10 },
  pastBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: theme.colors.bg, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  pastBannerText: { flex: 1, fontSize: 12, fontWeight: "600" },
  totalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  totalBlock: { gap: 2 },
  totalKcal: { fontSize: 28, color: theme.colors.text },
  totalGoal: { fontSize: 13 },
  redoBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
    backgroundColor: "rgba(8,145,178,0.08)",
  },
  redoBtnPressed: { backgroundColor: theme.colors.tint },
  redoIconBox: { width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  redoSpinner: { transform: [{ scale: 0.7 }] },
  redoText: { fontSize: 11, fontWeight: "700", color: theme.colors.primary },
  macroStrip: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  macroDivider: { width: 1, height: 11, backgroundColor: theme.colors.border },
  // Màu macro giống Progress: protein cam, carb xanh lá và fat tím.
  macroP: { color: theme.colors.accent2, fontWeight: "700" },
  macroC: { color: theme.colors.accent, fontWeight: "700" },
  macroF: { color: theme.colors.indigo, fontWeight: "700" },
  workoutCard: { padding: theme.space.lg, gap: theme.space.md },
  workoutCardDone: { borderColor: "rgba(5,150,105,0.25)" },
  workoutHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  workoutIcon: {
    width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tint,
  },
  workoutEyebrow: { fontSize: 11, fontWeight: "700", color: theme.colors.primary },
  workoutTitle: { fontSize: 16 },
  workoutMeta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  workoutMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  workoutMetaText: { fontSize: 11 },
  workoutStart: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 11,
  },
  workoutStartPressed: { backgroundColor: theme.colors.primary2 },
  workoutStartText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  workoutStatus: {
    alignSelf: "flex-start", backgroundColor: "rgba(5,150,105,0.10)",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  workoutStatusText: { color: theme.colors.accent, fontSize: 12, fontWeight: "700" },
  workoutPreview: { flexDirection: "row", alignItems: "center", gap: 8 },
  workoutReadOnly: { flex: 1, fontSize: 11 },
  // Nội dung của ngày đang chọn.
  loadingWrap: { paddingVertical: theme.space.xl, alignItems: "center" },
  emptyBlock: { gap: theme.space.md },
  hintBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "rgba(8,145,178,0.05)", borderRadius: 12, padding: theme.space.md,
  },
  emptyCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 14, paddingVertical: 13,
  },
  emptyCtaPressed: { backgroundColor: theme.colors.primary2 },
  emptyCtaDisabled: { backgroundColor: theme.colors.border },
  emptyCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  hintIcon: { marginTop: 1 },
  hintText: { flex: 1, fontSize: 12 },
  mealSection: { gap: 8 },
  mealSectionHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealSectionTitle: { fontSize: 15 },
  nothingText: { fontSize: 12, paddingLeft: 4 },
  dishCard: { padding: theme.space.md },
  dishCardDone: { opacity: 0.6 },
  dishRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dishName: { fontWeight: "700" },
  dishNameDone: { textDecorationLine: "line-through" },
  dishMacros: { fontSize: 11 },
  eatenChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  eatenText: { fontSize: 12, fontWeight: "700", color: theme.colors.accent },
  eatBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "rgba(5,150,105,0.10)",
  },
  eatBtnPressed: { backgroundColor: theme.colors.tint },

  // Các nút hành động AI.
  aiActions: { gap: 10, marginTop: 6 },
});
