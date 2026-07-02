import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { addExercise, estimateBurned, ACTIVITY_GROUPS, type Activity } from "@/features/exercise/api";
import { todayKey } from "@/utils/date";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

export default function AddExerciseScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const logDate = date || todayKey();

  const [selected, setSelected] = useState<Activity | null>(null);
  const [duration, setDuration] = useState("");
  const [customName, setCustomName] = useState("");
  const [customMet, setCustomMet] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustom = selected?.custom === true;

  // Effective MET + name (custom entry pulls from the typed fields)
  const met = isCustom ? Number(customMet) : selected?.met ?? 0;
  const name = isCustom ? customName.trim() : selected?.name ?? "";
  const durationNum = Number(duration);

  const estimate = useMemo(() => {
    if (!selected || !durationNum || durationNum <= 0 || !met || met <= 0) return 0;
    return estimateBurned(met, durationNum, user?.weight ?? null);
  }, [selected, durationNum, met, user?.weight]);

  const canSave =
    !!selected &&
    durationNum >= 1 &&
    durationNum <= 600 &&
    met > 0 &&
    (!isCustom || (customName.trim().length >= 2 && Number(customMet) > 0 && Number(customMet) <= 25));

  const handleSave = async () => {
    if (!canSave || !token) return;
    setSaving(true);
    setError(null);
    try {
      await addExercise(token, { name, met, durationMin: durationNum, date: logDate });
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to log workout.");
      setSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScreenHeader title="Log workout" />
          <AppText variant="muted" style={{ marginTop: -8 }}>
            Calories burned are estimated from the MET formula.
          </AppText>
        </View>

        {/* Weight hint — the estimate needs it */}
        {!user?.weight && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "rgba(255,160,0,0.10)", borderColor: "rgba(255,160,0,0.25)",
            borderWidth: 1, borderRadius: 12, padding: theme.space.md,
          }}>
            <AppText style={{ fontSize: 16 }}>⚠️</AppText>
            <AppText variant="subtle" style={{ fontSize: 12, flex: 1 }}>
              Set your weight in Profile for an accurate estimate. Using 60 kg for now.
            </AppText>
          </View>
        )}

        {/* Activity picker */}
        <View style={{ gap: theme.space.md }}>
          {ACTIVITY_GROUPS.map((grp) => (
            <View key={grp.group} style={{ gap: 8 }}>
              <AppText variant="subtle" style={{ fontSize: 12, fontWeight: "700" }}>{grp.group}</AppText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {grp.items.map((a) => {
                  const active = selected?.name === a.name;
                  return (
                    <Pressable
                      key={a.name}
                      onPress={() => { setSelected(a); setError(null); }}
                      style={({ pressed }) => ({
                        flexDirection: "row", alignItems: "center", gap: 6,
                        paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.tint : theme.colors.surface,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 15 }}>{a.icon}</Text>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: active ? theme.colors.primary : theme.colors.text }}>
                        {a.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Custom activity fields */}
        {isCustom && (
          <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
            <TextField
              label="Activity name"
              placeholder="e.g. Rock climbing"
              value={customName}
              onChangeText={setCustomName}
              textContentType="none"
            />
            <TextField
              label="MET value"
              placeholder="e.g. 8"
              value={customMet}
              onChangeText={setCustomMet}
              keyboardType="decimal-pad"
              textContentType="none"
            />
            <AppText variant="subtle" style={{ fontSize: 11 }}>
              MET = how many times harder than resting. Walking ≈ 3.5, running ≈ 8, intense ≈ 10+.
            </AppText>
          </Card>
        )}

        {/* Duration */}
        <Card style={{ padding: theme.space.lg }}>
          <TextField
            label="Duration (minutes)"
            placeholder="e.g. 30"
            value={duration}
            onChangeText={(t) => { setDuration(t); setError(null); }}
            keyboardType="number-pad"
            textContentType="none"
          />
        </Card>

        {/* Live estimate */}
        <Card style={{
          padding: theme.space.lg, alignItems: "center", gap: 4,
          backgroundColor: "rgba(255,138,61,0.06)", borderColor: "rgba(255,138,61,0.2)",
        }}>
          <AppText variant="subtle" style={{ fontSize: 12 }}>Estimated calories burned</AppText>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <AppText variant="h0" style={{ fontSize: 32, color: theme.colors.accent2 }}>{estimate}</AppText>
            <AppText variant="muted" style={{ fontSize: 14 }}>kcal</AppText>
          </View>
        </Card>

        {error && <AppText style={{ fontSize: 13, color: theme.colors.danger, textAlign: "center" }}>{error}</AppText>}

        <Button title={saving ? "Saving..." : "Log workout"} size="lg" disabled={!canSave || saving} onPress={handleSave} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ alignItems: "center", paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
        >
          <AppText style={{ fontSize: 15, fontWeight: "600", color: theme.colors.primary }}>Cancel</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
