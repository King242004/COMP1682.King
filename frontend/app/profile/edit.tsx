import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";
import { TextField } from "@/ui/components/TextField";

const GOALS = [
  { key: "lose_weight", label: "Lose Weight" },
  { key: "gain_muscle", label: "Gain Muscle" },
  { key: "eat_healthy", label: "Eat Healthy" },
];

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary" },
  { key: "moderate", label: "Moderate" },
  { key: "active", label: "Active" },
];

const CONDITIONS = ["diabetes", "hypertension", "none"];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changeName } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : "");
  const [height, setHeight] = useState(user?.height ? String(user.height) : "");
  const [gender, setGender] = useState<"male" | "female" | "">((user?.gender as "male" | "female" | "") ?? "");
  const [goal, setGoal] = useState(user?.goal ?? "eat_healthy");
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel ?? "moderate");
  const [conditions, setConditions] = useState<string[]>(user?.conditions ?? []);

  const toggleCondition = (c: string) => {
    if (c === "none") {
      setConditions([]);
      return;
    }
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev.filter((x) => x !== "none"), c]
    );
  };

  const handleSave = async () => {
    // Validate name first (backend rule: 2+ chars, letters only)
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert("Invalid name", "Name must be at least 2 characters.");
      return;
    }
    // \p{L} = any Unicode letter (supports Vietnamese, Chinese, etc.)
    if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
      Alert.alert("Invalid name", "Name must contain only letters and spaces.");
      return;
    }
    if (age && (Number(age) < 10 || Number(age) > 120)) {
      Alert.alert("Invalid age", "Age must be between 10 and 120.");
      return;
    }
    if (weight && (Number(weight) < 20 || Number(weight) > 300)) {
      Alert.alert("Invalid weight", "Weight must be between 20 and 300 kg.");
      return;
    }
    if (height && (Number(height) < 50 || Number(height) > 250)) {
      Alert.alert("Invalid height", "Height must be between 50 and 250 cm.");
      return;
    }
    setIsSaving(true);
    try {
      // Only call changeName if it actually changed (saves a request)
      if (trimmedName !== user?.name) {
        await changeName(trimmedName);
      }
      await updateProfile({
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        goal: goal || undefined,
        activityLevel: activityLevel || undefined,
        conditions,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Edit profile" />

        <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
          {/* Name */}
          <TextField
            label="Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Gender */}
          <View style={{ gap: 6 }}>
            <AppText variant="muted">Gender</AppText>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["male", "female"].map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g as "male" | "female")}
                  style={{
                    flex: 1, padding: 10, borderRadius: 12, alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: gender === g ? theme.colors.primary : theme.colors.border,
                    backgroundColor: gender === g ? theme.colors.tint : theme.colors.surface,
                  }}
                >
                  <AppText style={{ color: gender === g ? theme.colors.primary : theme.colors.subtle, textTransform: "capitalize" }}>
                    {g}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <TextField label="Age" placeholder="e.g. 21" value={age} onChangeText={setAge} keyboardType="number-pad" />
          <TextField label="Weight (kg)" placeholder="e.g. 65" value={weight} onChangeText={setWeight} keyboardType="number-pad" />
          <TextField label="Height (cm)" placeholder="e.g. 170" value={height} onChangeText={setHeight} keyboardType="number-pad" />

          {/* Goal */}
          <View style={{ gap: 6 }}>
            <AppText variant="muted">Goal</AppText>
            <View style={{ gap: 6 }}>
              {GOALS.map((g) => (
                <Pressable
                  key={g.key}
                  onPress={() => setGoal(g.key)}
                  style={{
                    padding: 12, borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: goal === g.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor: goal === g.key ? theme.colors.tint : theme.colors.surface,
                  }}
                >
                  <AppText style={{ color: goal === g.key ? theme.colors.primary : theme.colors.subtle }}>
                    {g.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Activity Level */}
          <View style={{ gap: 6 }}>
            <AppText variant="muted">Activity Level</AppText>
            <View style={{ gap: 6 }}>
              {ACTIVITY_LEVELS.map((a) => (
                <Pressable
                  key={a.key}
                  onPress={() => setActivityLevel(a.key)}
                  style={{
                    padding: 12, borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: activityLevel === a.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor: activityLevel === a.key ? theme.colors.tint : theme.colors.surface,
                  }}
                >
                  <AppText style={{ color: activityLevel === a.key ? theme.colors.primary : theme.colors.subtle }}>
                    {a.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Conditions */}
          <View style={{ gap: 6 }}>
            <AppText variant="muted">Health Conditions</AppText>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => toggleCondition(c)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: (c === "none" ? conditions.length === 0 : conditions.includes(c))
                      ? theme.colors.primary : theme.colors.border,
                    backgroundColor: (c === "none" ? conditions.length === 0 : conditions.includes(c))
                      ? theme.colors.tint : theme.colors.surface,
                  }}
                >
                  <AppText style={{
                    color: (c === "none" ? conditions.length === 0 : conditions.includes(c))
                      ? theme.colors.primary : theme.colors.subtle,
                    textTransform: "capitalize",
                  }}>
                    {c}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: theme.space.md }}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={isSaving ? "Saving..." : "Save"} onPress={handleSave} disabled={isSaving} />
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
