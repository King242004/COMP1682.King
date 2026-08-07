// ═══ FILE NÀY LÀM GÌ ═══
// Màn Ghi hoạt động. File BẮT ĐẦU của luồng ghi buổi tập.
//
// Ai gọi tới: Trang chủ và màn Tiến trình
// Nhận vào:   hoạt động đã chọn và thời lượng
// Trả ra:     không trả gì, ghi xong thì quay lại màn trước
// Khi lỗi:    chưa chọn hoạt động thì nút Lưu bị khóa

// Màn có HAI lối, chọn ở đầu màn:
// LỐI A, tập theo bài hướng dẫn trong app
// 1. Chọn nhóm bài và độ dài buổi tập
// 2. Danh sách bài lọc theo hai lựa chọn đó, dữ liệu nằm sẵn trong guidedRoutines
// 3. Bấm một bài, sang màn GuidedRoutineScreen, màn đó mới là nơi ghi lại
// LỐI B, ghi một hoạt động làm ngoài app
// 1. Bấm mở hộp Ghi hoạt động khác
// 2. Chọn hoạt động, số phút, và ngày hoàn thành trên lịch
// 3. Bấm Lưu, chạy saveExternalActivity
// 4. exerciseApi.addExercise          (POST /exercise)
// 5. Route gọi hàm addExercise trong backend/src/controllers/exerciseController.js;
//    hàm này gọi computeBurned
//    để nhân MET với cân nặng và thời lượng
// 6. markHealthDataChanged, nên Trang chủ và Tiến trình tự tải lại
// Vì sao lối B bắt buộc phải có cân nặng: calo đốt tính từ MET và cân nặng thật.
// Thiếu cân nặng thì exerciseController.addExercise trả PROFILE_WEIGHT_REQUIRED,
// thay vì đoán một con số rồi ghi vào nhật ký.
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useHealthDataRefresh } from "@/context/HealthDataRefreshContext";
import { addExercise } from "@/features/exercise/exerciseApi";
import { calendarMonthDays, shiftCalendarMonth } from "@/features/exercise/calendarUtils";
import {
  GUIDED_ROUTINES,
  ROUTINE_CATEGORIES,
  ROUTINE_DURATIONS,
  type RoutineCategory,
  type RoutineDuration,
} from "@/features/exercise/guidedRoutines";
import { DURATION_PRESETS, POPULAR_ACTIVITIES } from "@/config/activityCatalog";
import { useT } from "@/i18n";
import { dateKey, todayKey } from "@/utils/dateUtils";
import { localeTag, resolveLanguage } from "@/utils/languageUtils";
import { theme, shadow } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

const CATEGORY_ICONS: Record<RoutineCategory, keyof typeof Ionicons.glyphMap> = {
  everyday: "sunny-outline",
  recovery: "leaf-outline",
  strength: "barbell-outline",
  cardio: "heart-outline",
};

export default function LogActivityScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { markHealthDataChanged } = useHealthDataRefresh();
  const t = useT();
  const lang = resolveLanguage(user?.language);
  const locale = localeTag(lang);
  const [duration, setDuration] = useState<RoutineDuration>(10);
  const [category, setCategory] = useState<RoutineCategory>("everyday");
  const [externalVisible, setExternalVisible] = useState(false);
  const [externalActivityKey, setExternalActivityKey] = useState(POPULAR_ACTIVITIES[0].key);
  const [externalDuration, setExternalDuration] = useState(30);
  const [externalDate, setExternalDate] = useState(todayKey());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [externalSaving, setExternalSaving] = useState(false);
  const [externalError, setExternalError] = useState("");

  const selectedRoutines = useMemo(
    () => GUIDED_ROUTINES.filter(
      (routine) => routine.category === category && routine.durationMin === duration,
    ),
    [category, duration],
  );

  const externalDateLabel = new Date(`${externalDate}T00:00:00`).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const calendarLabel = calendarMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const calendarDays = calendarMonthDays(calendarMonth);
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Date(2024, 0, 1 + index).toLocaleDateString(locale, { weekday: "short" }),
  );
  const now = new Date();
  const canGoNextMonth = calendarMonth.getFullYear() < now.getFullYear() ||
    (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth());

  const toggleCalendar = () => {
    if (!datePickerVisible) {
      const selected = new Date(`${externalDate}T00:00:00`);
      setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    setDatePickerVisible((visible) => !visible);
  };

  // BƯỚC 3 CỦA LỐI B. Người dùng bấm Lưu trong hộp Ghi hoạt động khác.
  // Chỉ gửi mã hoạt động, không gửi MET. exerciseController.addExercise tra MET từ
  // của nó, nên app không thể gửi lên một chỉ số sai hay đã lỗi thời.
  const saveExternalActivity = async () => {
    const activity = POPULAR_ACTIVITIES.find((item) => item.key === externalActivityKey);
    if (!token || !activity || externalSaving) return;
    if (!user?.weight || user.weight <= 0) {
      setExternalError(t.exercise.weightRequired);
      return;
    }

    setExternalSaving(true);
    setExternalError("");
    try {
      const name = t.exercise.activities[activity.key] ?? activity.key;
      const saved = await addExercise(token, {
        name,
        activityKey: activity.key,
        durationMin: externalDuration,
        date: externalDate,
      });
      markHealthDataChanged();
      setExternalVisible(false);
      Alert.alert(t.exercise.externalSavedTitle, t.exercise.externalSavedMsg(name, saved.caloriesBurned));
    } catch (error) {
      setExternalError(
        error instanceof Error && error.message === "PROFILE_WEIGHT_REQUIRED"
          ? t.exercise.weightRequired
          : t.exercise.failed,
      );
    } finally {
      setExternalSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <ScreenHeader title={t.exercise.title} />
          <AppText variant="muted" style={styles.subtitle}>{t.exercise.subtitle}</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.exercise.externalLogTitle}
          onPress={() => {
            setExternalError("");
            setDatePickerVisible(false);
            setExternalVisible(true);
          }}
          style={({ pressed }) => [styles.externalLogCard, pressed && styles.pressed]}
        >
          <View style={styles.externalLogIcon}>
            <Ionicons name="footsteps-outline" size={21} color={theme.colors.primary} />
          </View>
          <View style={styles.externalLogCopy}>
            <AppText variant="body2">{t.exercise.externalLogTitle}</AppText>
            <AppText variant="subtle" style={styles.externalLogSub}>{t.exercise.externalLogSub}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
        </Pressable>

        <Card style={styles.timeCard}>
          <View style={styles.timeHeading}>
            <View style={styles.timeIcon}>
              <Ionicons name="time-outline" size={21} color={theme.colors.primary} />
            </View>
            <View style={styles.timeCopy}>
              <AppText variant="h2">{t.exercise.timeQuestion}</AppText>
              <AppText variant="subtle" style={styles.timeHint}>{t.exercise.timeHint}</AppText>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationRow}>
            {ROUTINE_DURATIONS.map((minutes) => {
              const active = duration === minutes;
              return (
                <Pressable
                  key={minutes}
                  onPress={() => setDuration(minutes)}
                  style={({ pressed }) => [
                    styles.durationChip,
                    active ? styles.durationChipActive : styles.durationChipIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText style={[styles.durationText, active && styles.durationTextActive]}>
                    {t.exercise.durationMinutes(minutes)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        <View style={styles.tabs}>
          {ROUTINE_CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
              >
                <AppText style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.exercise.routineTabs[item]}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.categoryIcon}>
              <Ionicons name={CATEGORY_ICONS[category]} size={19} color={theme.colors.primary} />
            </View>
            <View style={styles.sectionCopy}>
              <AppText variant="h2">{t.exercise.routineGroups[category]}</AppText>
              <AppText variant="subtle" style={styles.sectionDescription}>
                {t.exercise.routineGroupDescriptions[category]}
              </AppText>
            </View>
          </View>

          {selectedRoutines.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={28} color={theme.colors.subtle} />
            <AppText variant="subtle" style={styles.emptyText}>{t.exercise.noMatchingRoutine}</AppText>
          </Card>
          ) : (
            <View style={styles.routineList}>
              {selectedRoutines.map((routine) => (
                <Pressable
                  key={routine.key}
                  onPress={() => router.push({
                    pathname: "/exercise/guided",
                    params: { routine: routine.key },
                  })}
                  style={({ pressed }) => [styles.routineCard, pressed && styles.pressed]}
                >
                  <View style={styles.routineHeading}>
                    <AppText variant="h2" style={styles.routineTitle} numberOfLines={2}>
                      {routine.title[lang]}
                    </AppText>
                    <View style={styles.levelBadge}>
                      <AppText style={styles.levelText}>{t.exercise.levels[routine.level]}</AppText>
                    </View>
                  </View>
                  <AppText variant="subtle" style={styles.routineDescription} numberOfLines={3}>
                    {routine.description[lang]}
                  </AppText>

                  <View style={styles.routineMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={15} color={theme.colors.primary} />
                      <AppText style={styles.metaText}>{t.exercise.durationMinutes(routine.durationMin)}</AppText>
                    </View>
                    <View style={styles.metaDot} />
                    <View style={styles.metaItem}>
                      <Ionicons name="list-outline" size={15} color={theme.colors.primary} />
                      <AppText style={styles.metaText}>{t.exercise.routineExerciseCount(routine.exerciseCount)}</AppText>
                    </View>
                  </View>

                  <View style={styles.equipmentRow}>
                    <Ionicons name="home-outline" size={15} color={theme.colors.subtle} />
                    <AppText variant="subtle" style={styles.equipmentText}>{t.exercise.noEquipment}</AppText>
                    <Ionicons name="chevron-forward" size={17} color={theme.colors.primary} style={styles.chevron} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={externalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDatePickerVisible(false);
          setExternalVisible(false);
        }}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => {
          setDatePickerVisible(false);
          setExternalVisible(false);
        }}>
          <Pressable style={styles.externalSheet} onPress={() => {}}>
            <View style={styles.sheetGrabber} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleCopy}>
                <AppText variant="h1" style={styles.sheetTitle}>{t.exercise.externalSheetTitle}</AppText>
                <AppText variant="subtle" style={styles.sheetSubtitle}>{t.exercise.externalSheetSub}</AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.common.cancel}
                hitSlop={10}
                onPress={() => {
                  setDatePickerVisible(false);
                  setExternalVisible(false);
                }}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.sheetSection}>
                <AppText variant="caption">{t.exercise.chooseActivity}</AppText>
                <View style={styles.activityGrid}>
                  {POPULAR_ACTIVITIES.map((activity) => {
                    const active = activity.key === externalActivityKey;
                    return (
                      <Pressable
                        key={activity.key}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        onPress={() => setExternalActivityKey(activity.key)}
                        style={({ pressed }) => [
                          styles.activityChoice,
                          active && styles.activityChoiceActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppText style={[styles.activityChoiceText, active && styles.activityChoiceTextActive]}>
                          {t.exercise.activities[activity.key] ?? activity.key}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sheetSection}>
                <AppText variant="caption">{t.exercise.chooseDuration}</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetChipRow}>
                  {DURATION_PRESETS.map((minutes) => {
                    const active = minutes === externalDuration;
                    return (
                      <Pressable
                        key={minutes}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        onPress={() => setExternalDuration(minutes)}
                        style={({ pressed }) => [
                          styles.sheetChip,
                          active && styles.sheetChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppText style={[styles.sheetChipText, active && styles.sheetChipTextActive]}>
                          {t.exercise.durationMinutes(minutes)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sheetSection}>
                <AppText variant="caption">{t.exercise.chooseDate}</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.exercise.chooseDate}
                  onPress={toggleCalendar}
                  style={({ pressed }) => [styles.dateField, pressed && styles.pressed]}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                  <AppText style={styles.dateFieldText}>{externalDateLabel}</AppText>
                  <Ionicons
                    name={datePickerVisible ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.colors.subtle}
                  />
                </Pressable>
                {datePickerVisible ? (
                  <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={shiftCalendarMonth(calendarMonth, -1).toLocaleDateString(locale, {
                          month: "long", year: "numeric",
                        })}
                        onPress={() => setCalendarMonth((month) => shiftCalendarMonth(month, -1))}
                        style={({ pressed }) => [styles.calendarNav, pressed && styles.pressed]}
                      >
                        <Ionicons name="chevron-back" size={19} color={theme.colors.primary} />
                      </Pressable>
                      <AppText style={styles.calendarTitle}>{calendarLabel}</AppText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={shiftCalendarMonth(calendarMonth, 1).toLocaleDateString(locale, {
                          month: "long", year: "numeric",
                        })}
                        disabled={!canGoNextMonth}
                        onPress={() => setCalendarMonth((month) => shiftCalendarMonth(month, 1))}
                        style={({ pressed }) => [
                          styles.calendarNav,
                          !canGoNextMonth && styles.calendarNavDisabled,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons name="chevron-forward" size={19} color={theme.colors.primary} />
                      </Pressable>
                    </View>
                    <View style={styles.calendarWeekRow}>
                      {weekdayLabels.map((label) => (
                        <AppText key={label} style={styles.calendarWeekday}>{label}</AppText>
                      ))}
                    </View>
                    <View style={styles.calendarGrid}>
                      {calendarDays.map((day, index) => {
                        if (!day) return <View key={`blank-${index}`} style={styles.calendarDaySlot} />;
                        const value = dateKey(new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day,
                        ));
                        const selected = value === externalDate;
                        const disabled = value > todayKey();
                        const isToday = value === todayKey();
                        const accessibilityLabel = new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                        });

                        return (
                          <View key={value} style={styles.calendarDaySlot}>
                            <Pressable
                              accessibilityRole="radio"
                              accessibilityLabel={accessibilityLabel}
                              accessibilityState={{ selected, disabled }}
                              disabled={disabled}
                              onPress={() => {
                                setExternalDate(value);
                                setDatePickerVisible(false);
                              }}
                              style={({ pressed }) => [
                                styles.calendarDay,
                                isToday && styles.calendarDayToday,
                                selected && styles.calendarDaySelected,
                                disabled && styles.calendarDayDisabled,
                                pressed && styles.pressed,
                              ]}
                            >
                              <AppText style={[
                                styles.calendarDayText,
                                selected && styles.calendarDayTextSelected,
                                disabled && styles.calendarDayTextDisabled,
                              ]}>
                                {day}
                              </AppText>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={[styles.estimateNote, (!user?.weight || user.weight <= 0) && styles.estimateNoteWarn]}>
                <Ionicons
                  name={!user?.weight || user.weight <= 0 ? "alert-circle-outline" : "information-circle-outline"}
                  size={18}
                  color={!user?.weight || user.weight <= 0 ? theme.colors.danger : theme.colors.accent}
                />
                <AppText
                  variant="subtle"
                  style={[styles.estimateNoteText, (!user?.weight || user.weight <= 0) && styles.estimateNoteTextWarn]}
                >
                  {!user?.weight || user.weight <= 0 ? t.exercise.weightRequired : t.exercise.externalEstimateNote}
                </AppText>
              </View>

              {externalError ? <AppText style={styles.externalError}>{externalError}</AppText> : null}

              <Button
                title={externalSaving ? t.common.saving : t.exercise.saveExternal}
                size="lg"
                disabled={externalSaving || !user?.weight || user.weight <= 0}
                onPress={saveExternalActivity}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 44, gap: theme.space.xl },
  subtitle: { marginTop: -8, lineHeight: 21 },
  pressed: { opacity: 0.72 },

  externalLogCard: {
    minHeight: 68, flexDirection: "row", alignItems: "center", gap: theme.space.md,
    paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md,
    borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface, ...shadow(1),
  },
  externalLogIcon: {
    width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tint,
  },
  externalLogCopy: { flex: 1, gap: 2 },
  externalLogSub: { fontSize: 11, lineHeight: 17 },

  timeCard: { padding: theme.space.lg, gap: theme.space.lg },
  timeHeading: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  timeIcon: {
    width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tint,
  },
  timeCopy: { flex: 1, gap: 3 },
  timeHint: { fontSize: 12, lineHeight: 18 },
  durationRow: { gap: 8, paddingRight: 2 },
  durationChip: { minWidth: 68, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5 },
  durationChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  durationChipIdle: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  durationText: { textAlign: "center", fontSize: 13, fontWeight: "700", color: theme.colors.subtle },
  durationTextActive: { color: "#FFFFFF" },

  tabs: {
    flexDirection: "row", padding: 4, borderRadius: 14,
    borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
  },
  tab: { flex: 1, minHeight: 42, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { textAlign: "center", fontSize: 11, fontWeight: "700", color: theme.colors.subtle },
  tabTextActive: { color: "#FFFFFF" },
  section: { gap: theme.space.md },
  sectionHeading: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.sm },
  categoryIcon: {
    width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tint,
  },
  sectionCopy: { flex: 1, gap: 3 },
  sectionDescription: { fontSize: 12, lineHeight: 18 },
  routineList: { gap: theme.space.md },
  routineCard: {
    width: "100%", padding: theme.space.md, borderRadius: theme.radius.card,
    borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
    ...shadow(1),
  },
  routineHeading: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(5,150,105,0.10)" },
  levelText: { color: theme.colors.accent, fontSize: 11, fontWeight: "700" },
  routineTitle: { flex: 1, fontSize: 17 },
  routineDescription: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  routineMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 9 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: theme.colors.primary2, fontSize: 11, fontWeight: "700" },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: theme.colors.border },
  equipmentRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  equipmentText: { fontSize: 11 },
  chevron: { marginLeft: "auto" },

  emptyCard: { alignItems: "center", padding: theme.space.xl, gap: theme.space.sm },
  emptyText: { textAlign: "center", lineHeight: 20 },

  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.38)" },
  externalSheet: {
    maxHeight: "88%", paddingTop: 10, paddingHorizontal: theme.space.lg, paddingBottom: 30,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.colors.surface,
    ...shadow(3),
  },
  sheetGrabber: {
    alignSelf: "center", width: 42, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.border, marginBottom: theme.space.md,
  },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.md },
  sheetTitleCopy: { flex: 1, gap: 4 },
  sheetTitle: { fontSize: 21 },
  sheetSubtitle: { fontSize: 12, lineHeight: 18 },
  sheetContent: { paddingTop: theme.space.lg, gap: theme.space.lg },
  sheetSection: { gap: theme.space.sm },
  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  activityChoice: {
    width: "48.5%", minHeight: 44, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 8, borderRadius: 12, borderWidth: 1.5,
    borderColor: theme.colors.border, backgroundColor: theme.colors.bg,
  },
  activityChoiceActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  activityChoiceText: { textAlign: "center", fontSize: 12, fontWeight: "700", color: theme.colors.text },
  activityChoiceTextActive: { color: "#FFFFFF" },
  sheetChipRow: { gap: 8, paddingRight: 2 },
  sheetChip: {
    minHeight: 40, justifyContent: "center", paddingHorizontal: 14,
    borderRadius: 999, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  sheetChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  sheetChipText: { fontSize: 12, fontWeight: "700", color: theme.colors.text },
  sheetChipTextActive: { color: "#FFFFFF" },
  dateField: {
    minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5,
    borderColor: theme.colors.border, backgroundColor: theme.colors.bg,
  },
  dateFieldText: { flex: 1, fontSize: 13, fontWeight: "700", color: theme.colors.text },
  calendarCard: {
    overflow: "hidden", borderRadius: 16, borderWidth: 1,
    borderColor: theme.colors.border, backgroundColor: theme.colors.bg,
  },
  calendarHeader: {
    minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  calendarTitle: { fontSize: 15, fontWeight: "800", color: theme.colors.text, textTransform: "capitalize" },
  calendarNav: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tint,
  },
  calendarNavDisabled: { opacity: 0.3 },
  calendarWeekRow: {
    flexDirection: "row", paddingVertical: 9,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border,
  },
  calendarWeekday: {
    width: "14.2857%", textAlign: "center", fontSize: 11,
    fontWeight: "800", color: theme.colors.subtle,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 8 },
  calendarDaySlot: { width: "14.2857%", alignItems: "center", paddingVertical: 2 },
  calendarDay: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "transparent",
  },
  calendarDayToday: { borderColor: theme.colors.primary },
  calendarDaySelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  calendarDayDisabled: { opacity: 0.28 },
  calendarDayText: { fontSize: 13, fontWeight: "700", color: theme.colors.text },
  calendarDayTextSelected: { color: "#FFFFFF" },
  calendarDayTextDisabled: { color: theme.colors.subtle },
  estimateNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: theme.space.md, borderRadius: 12, backgroundColor: "rgba(5,150,105,0.08)",
  },
  estimateNoteWarn: { backgroundColor: "rgba(229,72,77,0.08)" },
  estimateNoteText: { flex: 1, color: theme.colors.accent, fontSize: 11, lineHeight: 17 },
  estimateNoteTextWarn: { color: theme.colors.danger },
  externalError: { color: theme.colors.danger, fontSize: 12 },
});
