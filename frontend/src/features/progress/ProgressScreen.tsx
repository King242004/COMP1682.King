// ═══ FILE NÀY LÀM GÌ ═══
// Màn Tiến trình. File BẮT ĐẦU của luồng xem thống kê.
//
// Ai gọi tới: ProfileScreen
// Nhận vào:   khoảng ngày người dùng chọn, theo tuần hoặc tháng
// Trả ra:     biểu đồ calo, chuỗi ngày ghi món, hoạt động, và cân nặng
// Khi lỗi:    một phần hỏng thì phần đó báo lỗi riêng, các phần khác vẫn hiện

// LUỒNG XEM TIẾN TRÌNH, tự chạy khi mở màn
// 1. useEffect gọi MealsContext.fetchMealHistory
// 2. mealsApi.fetchMealHistoryRequest    (GET /meals/history)
// 3. Route gọi hàm getMealHistory trong backend/src/controllers/mealController.js;
//    hàm này trả toàn bộ lịch sử món
// 4. progress/summary.ts gom món theo ngày, theo tháng, tính tổng và tỷ lệ
// 5. các thành phần con vẽ biểu đồ cột, lưới nhiệt và hàng đều đặn
// Ba chế độ xem: Tuần, Tháng, Năm. Đổi chế độ chỉ tính lại từ dữ liệu
// đã tải, KHÔNG gọi mạng thêm.
// Ba phần khác trong màn này: Hoạt động, Cân nặng, và chuỗi ngày dài nhất.
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { buildDaySummaries, getWeekDays, getMonthDays, getYearMonthTotals } from "@/features/progress/progressSummary";
import { WeightSection } from "@/features/weight/WeightSection";
import { ActivitySection } from "@/features/progress/ActivitySection";
import { longestMealStreak, streakEligibleDates } from "@/utils/mealStreak";
import { resolveLanguage, localeTag } from "@/utils/languageUtils";
import { useAnimatedNumber } from "@/ui/useAnimatedNumber";
import { WeeklyBarChart, type Bar } from "@/features/progress/WeeklyBarChart";
import { MonthHeatmap } from "@/features/progress/MonthHeatmap";
import { ConsistencyRow } from "@/features/progress/ConsistencyRow";

type Tab = "calories" | "activity" | "weight";
type Mode = "week" | "month" | "year";

export default function ProgressScreen() {
  const { user } = useAuth();
  // historyMeals chứa mọi ngày đã ghi, còn meals chỉ chứa ngày đang chọn.
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();
  // Ngày tháng đi theo ngôn ngữ đã chọn trong app.
  const locale = localeTag(resolveLanguage(user?.language));
  const [activeTab, setActiveTab] = useState<Tab>("calories");
  const [mode, setMode] = useState<Mode>("week");
  // anchor là một ngày trong kỳ hiện tại. Hai mũi tên đổi tuần, tháng hoặc năm.
  const [anchor, setAnchor] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  // Khóa của cột biểu đồ mà người dùng đang chọn.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const now = new Date(); now.setHours(0, 0, 0, 0);

  // Các phần chi tiết theo ngày không hiểu dữ liệu gộp theo năm.
  // Vì vậy chế độ năm dùng tháng của anchor cho các phần này.
  const subMode: "week" | "month" = mode === "week" ? "week" : "month";
  const windowDays = subMode === "week"
    ? getWeekDays(anchor)
    : getMonthDays(anchor.getFullYear(), anchor.getMonth());
  const days = windowDays.length;

  // Thứ tự tab là calo nạp, hoạt động tiêu hao rồi cân nặng.
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "calories", label: t.progress.tabCalories, icon: "flame-outline" },
    { key: "activity", label: t.progress.tabActivity, icon: "walk-outline" },
    { key: "weight", label: t.weight.tab, icon: "scale-outline" },
  ];

  // Tự tải toàn bộ lịch sử món khi mở màn, mọi biểu đồ đều tính từ đây.
  useEffect(() => { void fetchMealHistory().catch(() => {}); }, [fetchMealHistory]);

  // Chưa đủ hồ sơ thì mục tiêu là rỗng. Không thay bằng con số mặc định.
  const goal = user?.calorieGoal ?? null;
  // Dùng cho phép tính thang đo. Không có mục tiêu thì mọi phần giao diện
  // so với mục tiêu đều bị ẩn, nên giá trị 0 ở đây không bao giờ hiện ra.
  const goalScale = goal ?? 0;

  const summaries = buildDaySummaries(historyMeals, goal, windowDays, locale);
  const daysWithMeals = summaries.filter((s) => s.calories > 0);
  const eligibleMealDates = streakEligibleDates(historyMeals);
  const periodKeys = new Set(summaries.map((summary) => summary.key));
  const periodMealDates =
    mode === "year"
      ? eligibleMealDates.filter((date) => date.startsWith(`${anchor.getFullYear()}-`))
      : eligibleMealDates.filter((date) => periodKeys.has(date));
  const longestStreak = longestMealStreak(periodMealDates);

  // Biểu đồ dùng cột theo ngày cho tuần hoặc tháng, theo tháng cho năm.
  const yearMonths = mode === "year" ? getYearMonthTotals(historyMeals, anchor.getFullYear(), locale) : [];
  const bars: Bar[] = mode === "year"
    ? yearMonths.map((mt, i) => ({ key: mt.key, label: String(i + 1), fullLabel: mt.label, value: mt.calories, color: theme.colors.primary, dim: mt.isFuture }))
    : summaries.map((d, i) => ({
        key: d.key,
        label: subMode === "week" ? t.labels.daysShort[i] : d.key.slice(-2),
        value: d.calories,
        color: goal != null && d.calories > goal ? theme.colors.accent2 : d.onTrack ? theme.colors.accent : theme.colors.primary,
        dim: d.isFuture,
      }));
  // Đưa mục tiêu vào thang đo để đường mục tiêu luôn nằm trong biểu đồ.
  const rawMax = bars.reduce((m, b) => Math.max(m, b.value), 0);
  const maxValue = (mode === "year" ? rawMax : Math.max(rawMax, goalScale)) || 1;

  // Tính tổng và trung bình theo ngày hoặc theo tháng tùy chế độ.
  const unitsWithData = mode === "year" ? yearMonths.filter((mt) => mt.calories > 0).length : daysWithMeals.length;
  const maxMonth = mode === "year" ? Math.max(0, ...yearMonths.map((mt) => mt.calories)) : 0;
  const periodTotal = bars.reduce((s, b) => s + b.value, 0);
  const periodAvg = unitsWithData > 0 ? Math.round(periodTotal / unitsWithData) : 0;
  const heroCaloriesAnimated = useAnimatedNumber(periodTotal);

  const daysOnTrack = summaries.filter((s) => s.onTrack).length;

  // Macro trung bình theo ngày ở tuần và tháng, theo tháng ở chế độ năm.
  // Cách tính này khớp với số calo trung bình bên cạnh.
  const macroUnits: { protein: number; carbs: number; fat: number }[] =
    mode === "year" ? yearMonths.filter((mt) => mt.calories > 0) : daysWithMeals;
  const heroMacro = (pick: (u: { protein: number; carbs: number; fat: number }) => number) =>
    macroUnits.length > 0 ? Math.round(macroUnits.reduce((sum, u) => sum + pick(u), 0) / macroUnits.length) : 0;
  const heroProtein = heroMacro((u) => u.protein);
  const heroCarbs = heroMacro((u) => u.carbs);
  const heroFat = heroMacro((u) => u.fat);

  const bestDay = daysWithMeals.length > 0
    ? daysWithMeals.reduce((best, s) => (s.distToGoal < best.distToGoal ? s : best), daysWithMeals[0])
    : null;

  const selectedBar = selectedKey ? bars.find((b) => b.key === selectedKey) ?? null : null;
  const selectedSummary = selectedKey ? summaries.find((s) => s.key === selectedKey) ?? null : null;

  // Nhãn và xử lý của nút chuyển kỳ.
  const periodLabel = mode === "week"
    ? `${windowDays[0].toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${windowDays[6].toLocaleDateString(locale, { day: "numeric", month: "short" })}`
    : mode === "month"
    ? anchor.toLocaleDateString(locale, { month: "long", year: "numeric" })
    : String(anchor.getFullYear());
  const shiftPeriod = (delta: 1 | -1) => {
    const d = new Date(anchor);
    if (mode === "week") d.setDate(d.getDate() + delta * 7);
    else if (mode === "month") d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + delta);
    d.setHours(0, 0, 0, 0);
    setAnchor(d);
    setSelectedKey(null);
  };
  const nextDisabled = mode === "week"
    ? getWeekDays(anchor)[0].getTime() >= getWeekDays(now)[0].getTime()
    : mode === "month"
    ? anchor.getFullYear() > now.getFullYear() || (anchor.getFullYear() === now.getFullYear() && anchor.getMonth() >= now.getMonth())
    : anchor.getFullYear() >= now.getFullYear();
  const avgLabel = mode === "year" ? t.progress.avgKcalMonth : t.progress.avgKcalDay;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Phần đầu và bộ chọn tuần, tháng hoặc năm. */}
        <ScreenHeader
          title={t.progress.title}
          right={
            <View style={styles.rangeToggle}>
              {(["week", "month", "year"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => { setMode(m); setSelectedKey(null); }}
                  style={[styles.rangeBtn, mode === m && styles.rangeBtnActive]}
                >
                  <AppText style={[styles.rangeText, mode === m && styles.rangeTextActive]}>
                    {m === "week" ? t.progress.rangeWeek : m === "month" ? t.progress.rangeMonth : t.progress.rangeYear}
                  </AppText>
                </Pressable>
              ))}
            </View>
          }
        />

        {/* Các tab có cùng chiều rộng để vừa màn hình điện thoại. */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}
              >
                <Ionicons name={tab.icon as any} size={18} color={active ? "#fff" : theme.colors.subtle} />
                <AppText style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>{tab.label}</AppText>
              </Pressable>
            );
          })}
        </View>

          {/* Tab calo. */}
        {activeTab === "calories" && (
          <>
            {/* Một thẻ gồm chuyển kỳ, biểu đồ và tổng của kỳ. */}
            <Card style={styles.todayCard}>
              <View style={styles.periodNav}>
                <Pressable onPress={() => shiftPeriod(-1)} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
                </Pressable>
                <AppText variant="body2" style={styles.periodLabel}>{periodLabel}</AppText>
                <Pressable onPress={() => shiftPeriod(1)} disabled={nextDisabled} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="chevron-forward" size={22} color={nextDisabled ? theme.colors.border : theme.colors.primary} />
                </Pressable>
              </View>

              <View style={styles.chartBox}>
                {mode === "month" ? (
                  <MonthHeatmap
                    cells={summaries.map((s) => ({ key: s.key, value: s.calories, isFuture: s.isFuture, isToday: s.isToday }))}
                    maxValue={maxValue}
                    selectedKey={selectedKey}
                    onSelect={(k) => setSelectedKey(k === selectedKey ? null : k)}
                  />
                ) : (
                  <WeeklyBarChart
                    bars={bars}
                    maxValue={maxValue}
                    goalTop={mode === "year" || goal == null ? undefined : goal}
                    focusKey={selectedKey ?? undefined}
                    onSelect={(k) => setSelectedKey(k === selectedKey ? null : k)}
                  />
                )}
              </View>

              {/* App KHÔNG lưu mục tiêu của từng ngày trong quá khứ, nên đường kẻ,
                  màu cột và các dòng vượt hay thấp hơn bên dưới đều so với mục tiêu
                  HIỆN TẠI. Đổi mục tiêu là cả biểu đồ cũ được chấm lại. Nói rõ chỗ
                  này thay vì để người dùng tự đoán vì sao lịch sử đổi màu.
                  Chế độ Năm gom theo tháng nên không có đường kẻ để giải thích. */}
              {mode !== "year" && goal != null && (
                <AppText variant="subtle" style={styles.goalBasis}>
                  {t.progress.goalBasis(goal.toLocaleString(locale))}
                </AppText>
              )}

                {/* Giá trị của cột người dùng vừa chọn. */}
              {selectedBar && (
                <AppText variant="subtle" style={styles.selectedLine}>
                  {(selectedSummary?.fullLabel ?? selectedBar.fullLabel ?? selectedBar.label)}: {selectedBar.value.toLocaleString()} {t.common.kcal}
                </AppText>
              )}

                {/* Tổng của kỳ với nhãn nằm sát phía trên. */}
              <View style={styles.eatenGroup}>
                <AppText variant="subtle" style={styles.todayLabel}>{t.progress.eatenLabel}</AppText>
                <View style={styles.todayValueRow}>
                  <AppText variant="h0" style={styles.todayValue}>{heroCaloriesAnimated.toLocaleString()}</AppText>
                  <AppText variant="muted">{t.common.kcal}</AppText>
                </View>
              </View>

              <AppText variant="subtle" style={styles.todayFootText}>
                {avgLabel}: {periodAvg.toLocaleString()} {t.common.kcal}
              </AppText>

              <View style={styles.macroBlock}>
                <AppText variant="subtle" style={styles.macroNote}>{mode === "year" ? t.progress.avgMacroNoteMonth : t.progress.avgMacroNote}</AppText>
                <View style={styles.focusMacros}>
                  <AppText variant="subtle" style={[styles.focusMacro, styles.focusProtein]}>{t.labels.protein} {heroProtein}g</AppText>
                  <View style={styles.focusMacroDiv} />
                  <AppText variant="subtle" style={[styles.focusMacro, styles.focusCarbs]}>{t.labels.carbs} {heroCarbs}g</AppText>
                  <View style={styles.focusMacroDiv} />
                  <AppText variant="subtle" style={[styles.focusMacro, styles.focusFat]}>{t.labels.fat} {heroFat}g</AppText>
                </View>
              </View>
            </Card>

                {/* Thống kê theo ngày hoặc theo tháng tùy chế độ. */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statPrimary}>
                  {mode === "year" ? (maxMonth > 0 ? maxMonth.toLocaleString() : "-") : `${daysWithMeals.length}/${days}`}
                </AppText>
                <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.highestMonth : t.progress.daysLoggedStat}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <AppText variant="h2" style={styles.statAccent}>{mode === "year" ? `${unitsWithData}/12` : `${daysOnTrack}/${days}`}</AppText>
                <AppText variant="subtle" style={styles.statLabel}>{mode === "year" ? t.progress.monthsLoggedStat : t.progress.daysOnTrack}</AppText>
              </Card>
              <Card style={styles.statCard}>
                <View style={styles.statStreak}>
                  <AppText variant="h2" style={styles.statOrange}>{longestStreak}</AppText>
                  <Ionicons name="flame" size={16} color={theme.colors.accent2} />
                </View>
                <AppText variant="subtle" style={styles.statLabel}>{t.progress.longestStreak}</AppText>
              </Card>
            </View>

              {/* Tuần hiển thị danh sách chi tiết từng ngày. */}
            {mode === "week" && (
              <Card style={styles.sectionCard}>
                <AppText variant="h2">{t.progress.summaryTitle}</AppText>
                <View style={styles.summaryList}>
                  {summaries.map((day) => (
                    <View key={day.key} style={[styles.summaryRow, day.calories === 0 && styles.summaryRowDim]}>
                      <View style={styles.summaryLeft}>
                        <AppText variant="body2" style={day.isToday ? styles.bold : undefined}>
                          {day.fullLabel}{day.isToday ? t.progress.todaySuffix : ""}
                        </AppText>
                        <AppText variant="subtle" style={styles.summaryMeta}>
                          {day.mealCount > 0 ? t.progress.mealsLogged(day.mealCount) : t.progress.noMealsLogged}
                        </AppText>
                      </View>
                      <View style={styles.summaryRight}>
                        <AppText style={[styles.summaryKcal, {
                          color: day.calories === 0 ? theme.colors.subtle
                            : goal != null && day.calories > goal ? theme.colors.accent2
                            : day.onTrack ? theme.colors.accent
                            : theme.colors.primary,
                        }]}>
                          {day.calories > 0 ? `${day.calories.toLocaleString()} ${t.common.kcal}` : "-"}
                        </AppText>
                        {day.calories > 0 && (
                          <AppText variant="subtle" style={styles.summaryDelta}>
                            {goal == null ? "" : day.calories > goal
                              ? t.progress.over((day.calories - goal).toLocaleString())
                              : day.onTrack ? t.progress.onTrack
                              : t.progress.under((goal - day.calories).toLocaleString())}
                          </AppText>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

              {/* Tháng đã có heatmap nên chỉ cần hiện số ngày đã ghi. */}
            {mode === "month" && (
              <Card style={styles.sectionCard}>
                <AppText variant="subtle">{t.progress.daysLoggedMonth(daysWithMeals.length, days)}</AppText>
              </Card>
            )}

              {/* Ngày tốt nhất là ngày gần mục tiêu nhất trong tuần hoặc tháng. */}
            {mode !== "year" && bestDay && (
              <Card style={styles.bestCard}>
                <View style={styles.bestHead}>
                  <Ionicons name="trophy-outline" size={16} color={theme.colors.accent} />
                  <AppText variant="h2" style={styles.bestTitle}>{t.progress.closestToGoal}</AppText>
                </View>
                <AppText variant="muted">
                  {bestDay.onTrack
                    ? t.progress.closestOnTrack(bestDay.fullLabel, bestDay.calories.toLocaleString())
                    : t.progress.closestOff(bestDay.fullLabel, bestDay.calories.toLocaleString(), Math.abs(bestDay.calories - goalScale).toLocaleString())}
                </AppText>
              </Card>
            )}

              {/* Tuần hiển thị bảy chấm về mức độ đều đặn. */}
            {mode === "week" && (
              <ConsistencyRow
                summaries={summaries.slice(-7)}
                goal={goalScale}
                daysLogged={summaries.slice(-7).filter((s) => s.calories > 0).length}
              />
            )}

              {/* Năm hiển thị chi tiết từng tháng. */}
            {mode === "year" && (
              <Card style={styles.sectionCard}>
                <AppText variant="h2">{t.progress.monthlyTitle}</AppText>
                <View style={styles.summaryList}>
                  {yearMonths.map((mt) => (
                    <View key={mt.key} style={[styles.summaryRow, mt.calories === 0 && styles.summaryRowDim]}>
                      <AppText variant="body2">{mt.label}</AppText>
                      <AppText style={[styles.summaryKcal, { color: mt.calories > 0 ? theme.colors.primary : theme.colors.subtle }]}>
                        {mt.calories > 0 ? `${mt.calories.toLocaleString()} ${t.common.kcal}` : "-"}
                      </AppText>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
        )}

          {/* Tab hoạt động dùng kỳ, biểu đồ và độ đều đặn tương tự tab calo. */}
        {activeTab === "activity" && (
          <ActivitySection
            mode={mode}
            anchor={anchor}
            windowDays={windowDays}
            locale={locale}
            selectedKey={selectedKey}
            onSelectKey={(k) => setSelectedKey(k === selectedKey ? null : k)}
            periodLabel={periodLabel}
            onShiftPeriod={shiftPeriod}
            nextDisabled={nextDisabled}
          />
        )}


        {activeTab === "weight" && <WeightSection />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  rangeToggle: { flexDirection: "row", gap: 4, backgroundColor: theme.colors.tintSoft, borderRadius: 10, padding: 3 },
  rangeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  rangeBtnActive: { backgroundColor: theme.colors.primary },
  rangeText: { fontSize: 12, fontWeight: "700", color: theme.colors.subtle },
  rangeTextActive: { color: "#fff" },
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.tintSoft },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 11, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#fff" },
  pressed: { opacity: 0.7 },

  // Thẻ của ngày đang được chọn.
  todayCard: { padding: theme.space.xl, gap: theme.space.md },
  periodNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  periodLabel: { fontWeight: "700" },
  selectedLine: { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  goalBasis: { fontSize: 11, lineHeight: 15 },
  // Tạo khoảng cách giữa phần chuyển kỳ và biểu đồ.
  chartBox: { marginTop: theme.space.sm },
  todayValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  todayValue: { fontSize: 32, color: theme.colors.primary },
  todayFootText: { fontSize: 12 },
  focusMacros: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, rowGap: 4 },
  macroNote: { fontSize: 10 },
  eatenGroup: { gap: 2 },
  macroBlock: { gap: 4 },
  todayLabel: { fontSize: 12 },
  focusMacro: { fontSize: 12, fontWeight: "700" },
  focusProtein: { color: theme.colors.accent2 },
  focusCarbs: { color: theme.colors.accent },
  focusFat: { color: theme.colors.indigo },
  focusMacroDiv: { width: 1, height: 11, backgroundColor: theme.colors.border },

  // Hàng thống kê.
  statsRow: { flexDirection: "row", gap: theme.space.md },
  statCard: { flex: 1, padding: theme.space.lg, gap: 4, alignItems: "center" },
  statPrimary: { color: theme.colors.primary, fontSize: 18 },
  statAccent: { color: theme.colors.accent, fontSize: 18 },
  statOrange: { color: theme.colors.accent2, fontSize: 18 },
  statStreak: { flexDirection: "row", alignItems: "center", gap: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },

  // Thẻ phần nội dung dùng chung.
  sectionCard: { padding: theme.space.lg, gap: theme.space.lg },
  bold: { fontWeight: "700" },

  // Chi tiết từng ngày.
  summaryList: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.border },
  // Làm mờ ngày chưa ghi dữ liệu, gồm cả ngày tương lai trong chế độ tháng.
  summaryRowDim: { opacity: 0.4 },
  summaryLeft: { gap: 2 },
  summaryMeta: { fontSize: 11 },
  summaryRight: { alignItems: "flex-end", gap: 2 },
  summaryKcal: { fontSize: 14, fontWeight: "700" },
  summaryDelta: { fontSize: 11 },

  // Ngày gần mục tiêu nhất.
  bestCard: { padding: theme.space.lg, gap: 6, borderColor: "rgba(5,150,105,0.2)", backgroundColor: "rgba(5,150,105,0.06)" },
  bestHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  bestTitle: { fontSize: 14 },
});
