import { useState, useRef } from "react";
import { Alert, Pressable, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{
        flex: 1, backgroundColor: theme.colors.bg,
        alignItems: "center", justifyContent: "center",
        paddingHorizontal: theme.space.lg, gap: theme.space.lg,
      }}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.subtle} />
        <View style={{ gap: 8, alignItems: "center" }}>
          <AppText variant="h2">Camera access needed</AppText>
          <AppText variant="muted" style={{ textAlign: "center" }}>
            Meal Snap needs camera access to scan your meals and detect food automatically.
          </AppText>
        </View>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => ({
            paddingHorizontal: 32, paddingVertical: 14,
            borderRadius: theme.radius.button,
            backgroundColor: pressed ? theme.colors.primary2 : theme.colors.primary,
          })}
        >
          <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Allow camera access
          </AppText>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isScanning) return;
    setIsScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (!photo) {
        setIsScanning(false);
        return;
      }

      // TODO: Gửi ảnh lên backend AI để nhận diện món ăn TEST
      setTimeout(() => {
        setIsScanning(false);
        router.push({
          pathname: "/tabs/meal-add",
          params: {
            prefillName: "Pho Bo",
            prefillCalories: "420",
            prefillProtein: "28",
            prefillCarbs: "52",
            prefillFat: "10",
            mealType: "lunch",
          },
        });
      }, 1500);

    } catch (e) {
      setIsScanning(false);
      Alert.alert("Error", "Could not take photo. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        <View style={{ flex: 1 }}>

          {/* Top bar */}
          <View style={{
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
            paddingHorizontal: theme.space.lg,
            paddingTop: 60, paddingBottom: theme.space.lg,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Scan Meal
            </AppText>
            <Pressable
              onPress={() => setFacing(f => f === "back" ? "front" : "back")}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            </Pressable>
          </View>

          {/* Viewfinder */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 260, height: 260, position: "relative" }}>
              {[
                { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
                { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
                { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
                { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
              ].map((s, i) => (
                <View key={i} style={{ position: "absolute", width: 28, height: 28, borderColor: "#fff", ...s }} />
              ))}
            </View>
            <AppText style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 16, textAlign: "center" }}>
              Point camera at your meal
            </AppText>
          </View>

          {/* Bottom controls */}
          <View style={{
            paddingBottom: 60, paddingHorizontal: theme.space.lg,
            alignItems: "center", gap: theme.space.lg,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}>
            <AppText style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>
              AI will automatically detect your food and estimate calories
            </AppText>

            <Pressable
              onPress={handleCapture}
              disabled={isScanning}
              style={({ pressed }) => ({
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: pressed || isScanning ? "rgba(255,255,255,0.7)" : "#fff",
                alignItems: "center", justifyContent: "center",
                borderWidth: 4, borderColor: "rgba(255,255,255,0.4)",
              })}
            >
              {isScanning ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
              ) : (
                <View style={{
                  width: 54, height: 54, borderRadius: 27,
                  backgroundColor: theme.colors.primary,
                }} />
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/tabs/meal-add")}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <AppText style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>
                Add manually instead
              </AppText>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}