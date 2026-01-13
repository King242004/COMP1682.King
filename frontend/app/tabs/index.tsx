import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Meal Snap</Text>
        <Text style={styles.subtitle}>
          Scan meals, track calories, and get daily suggestions.
        </Text>
      </View>

      {/* Main actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start here</Text>

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push("/scan")}
        >
          <Text style={styles.primaryBtnText}>📷 Scan Meal</Text>
          <Text style={styles.primaryBtnDesc}>
            Use camera to capture your meal
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => router.push("/meals")}
        >
          <Text style={styles.secondaryBtnText}>📒 My Meals</Text>
          <Text style={styles.secondaryBtnDesc}>
            View history & daily summary
          </Text>
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.smallCard, pressed && styles.pressed]}
          onPress={() => router.push("/meal-add")}
        >
          <Text style={styles.smallTitle}>➕ Add Meal</Text>
          <Text style={styles.smallDesc}>Manual input</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.smallCard, pressed && styles.pressed]}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.smallTitle}>👤 Profile</Text>
          <Text style={styles.smallDesc}>Settings</Text>
        </Pressable>
      </View>

      {/* Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Tip</Text>
        <Text style={styles.tipText}>
          Start by scanning one meal today. The app will suggest what to eat next
          based on your daily target.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  header: {
    paddingTop: 10,
    gap: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.75,
    lineHeight: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  primaryBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#111827",
    gap: 4,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  primaryBtnDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  secondaryBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    gap: 4,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryBtnDesc: {
    fontSize: 13,
    opacity: 0.7,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  smallTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  smallDesc: {
    fontSize: 13,
    opacity: 0.7,
  },

  tipBox: {
    marginTop: 2,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.10)",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  tipText: {
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 18,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
