import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Screen } from "../ui/components/Screen";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";

export default function ScanScreen() {
  return (
    <Screen
      padded={false}
      backgroundColor="#000000"
      statusBarStyle="light-content"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Camera preview placeholder */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#0A0F1C" }}>
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              paddingHorizontal: theme.space.lg,
              paddingTop: theme.space.lg,
              paddingBottom: theme.space.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 2 }}>
                <AppText variant="h2" style={{ color: "#FFFFFF" }}>
                  Scan Meal
                </AppText>
                <AppText variant="caption" style={{ color: "rgba(255,255,255,0.72)" }}>
                  Center your plate and capture
                </AppText>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    {
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.16)",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="flash" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    {
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.16)",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="images" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Framing guides */}
          <View
            style={{
              position: "absolute",
              left: theme.space.xl,
              right: theme.space.xl,
              top: "22%",
              bottom: "22%",
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",
            }}
          />
        </View>

        {/* Bottom overlay */}
        <View
          style={{
            paddingHorizontal: theme.space.lg,
            paddingTop: theme.space.md,
            paddingBottom: theme.space.xl,
            backgroundColor: "rgba(0,0,0,0.70)",
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.12)",
          }}
        >
          <View style={{ alignItems: "center", gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                {
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.85)",
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                }}
              />
            </Pressable>

            <AppText variant="caption" style={{ color: "rgba(255,255,255,0.75)" }}>
              Tip: keep the camera steady for best results
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
}
