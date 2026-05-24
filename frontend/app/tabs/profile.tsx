import { useEffect, useState } from "react";
import { Alert, ScrollView, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "H";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, stats, logout, fetchProfile, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("") ;
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const startEditing = () => {
    setAge(user?.age ? String(user.age) : "");
    setWeight(user?.weight ? String(user.weight) : "");
    setHeight(user?.height ? String(user.height) : "");
    setGender((user?.gender as "male" | "female" | "") ?? "");
    setGoal(user?.goal ?? "eat_healthy");
    setActivityLevel(user?.activityLevel ?? "moderate");
    setConditions(user?.conditions ?? []);
    setIsEditing(true);
  };

  const handleSave = async () => {
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
      await updateProfile({
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        goal: goal || undefined,
        activityLevel: activityLevel || undefined,
        conditions,
      });
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCondition = (c: string) => {
    if (c === "none") {
      setConditions([]);
      return;
    }
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev.filter((x) => x !== "none"), c]
    );
  };

  const name = user?.name ?? "HealthySnap User";
  const badge = initials(name);

  return (
    <Screen padded={false} style={{ paddingTop: theme.space.lg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.lg,
          paddingBottom: theme.space.xxl,
          gap: theme.space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ gap: 4 }}>
            <AppText variant="h1">Profile</AppText>
            <AppText variant="muted">Your health info and settings.</AppText>
          </View>
          {!isEditing && (
            <Button title="Edit" variant="secondary" onPress={startEditing} />
          )}
        </View>

        {/* Avatar */}
        <Card style={{ padding: theme.space.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.md }}>
            <View style={{
              width: 68, height: 68, borderRadius: 24,
              backgroundColor: theme.colors.tint,
              borderWidth: 1, borderColor: "rgba(11,42,111,0.18)",
              alignItems: "center", justifyContent: "center",
            }}>
              <AppText variant="h2" style={{ color: theme.colors.primary }}>{badge}</AppText>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="h2">{name}</AppText>
              <AppText variant="muted">{user?.email}</AppText>
            </View>
          </View>
        </Card>

        {/* BMI & TDEE */}
        {stats && (
          <View style={{ flexDirection: "row", gap: theme.space.md }}>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 26, color: theme.colors.primary }}>
                {stats.bmi ?? "—"}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>BMI</AppText>
              {stats.bmiCategory && (
                <AppText variant="subtle" style={{ fontSize: 11 }}>{stats.bmiCategory}</AppText>
              )}
            </Card>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 26, color: theme.colors.primary }}>
                {stats.tdee ?? "—"}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>TDEE (kcal)</AppText>
            </Card>
            <Card style={{ flex: 1, padding: theme.space.lg, alignItems: "center", gap: 4 }}>
              <AppText variant="h0" style={{ fontSize: 26, color: theme.colors.primary }}>
                {user?.calorieGoal ?? 2000}
              </AppText>
              <AppText variant="subtle" style={{ fontSize: 12 }}>Goal (kcal)</AppText>
            </Card>
          </View>
        )}

        {/* Health Info */}
        {!isEditing ? (
          <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
            <AppText variant="h2">Health Info</AppText>
            {[
              { label: "Gender", value: user?.gender ?? "—" },
              { label: "Age", value: user?.age ? `${user.age} years` : "—" },
              { label: "Weight", value: user?.weight ? `${user.weight} kg` : "—" },
              { label: "Height", value: user?.height ? `${user.height} cm` : "—" },
              { label: "Goal", value: GOALS.find((g) => g.key === user?.goal)?.label ?? "—" },
              { label: "Activity", value: ACTIVITY_LEVELS.find((a) => a.key === user?.activityLevel)?.label ?? "—" },
              { label: "Conditions", value: user?.conditions?.length ? user.conditions.join(", ") : "None" },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <AppText variant="muted">{item.label}</AppText>
                <AppText variant="body2" style={{ textTransform: "capitalize" }}>{item.value}</AppText>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
            <AppText variant="h2">Edit Health Info</AppText>

            {/* Gender */}
            <View style={{ gap: 6 }}>
              <AppText variant="muted">Gender</AppText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["male", "female"].map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g as "male" | "female")}
                    style={{
                      flex: 1, padding: 10, borderRadius: 10, alignItems: "center",
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
                      padding: 10, borderRadius: 10,
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
                      padding: 10, borderRadius: 10,
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
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
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
                <Button title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={isSaving ? "Saving..." : "Save"} onPress={handleSave} disabled={isSaving} />
              </View>
            </View>
          </Card>
        )}

        {/* Logout */}
        <Button
          title="Log out"
          variant="danger"
          onPress={() => {
            logout();
            router.replace("/auth/login");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
