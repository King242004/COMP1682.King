import { useState, useRef } from "react";
import { Alert, Pressable, View, ActivityIndicator, ScrollView, Image, Modal, Linking } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../utils/api";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type Candidate = {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionDescription?: string;
};

// Smart default meal type based on current local hour
// 6-10 = breakfast, 11-14 = lunch, 17-21 = dinner, else snack
function getMealTypeByHour(): MealType {
  const h = new Date().getHours();
  if (h >= 6 && h <= 10) return "breakfast";
  if (h >= 11 && h <= 14) return "lunch";
  if (h >= 17 && h <= 21) return "dinner";
  return "snack";
}

// Compress + resize before upload: big phone photos (4000px) → max 1024px wide,
// JPEG quality 0.5. Cuts upload size ~5-10x → faster scan. Falls back to original on error.
async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri;
  }
}

// Upload helper - returns parsed candidates or throws
async function scanImage(uri: string, token: string): Promise<Candidate[]> {
  const formData = new FormData();
  const filename = uri.split("/").pop() || "meal.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  formData.append("image", { uri, name: filename, type: mimeType } as any);

  const res = await fetch(`${BASE_URL}/scan/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Scan failed");
  return data.candidates || [];
}

export default function ScanScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isScanning, setIsScanning] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // ── Common flow: upload → show candidates ──────────────────────────────────
  // Defined BEFORE other handlers because they call into it.
  const processImage = async (uri: string) => {
    if (!token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }
    setPreviewUri(uri);
    setIsScanning(true);
    try {
      // Shrink image first so upload + Gemini are faster
      const compressed = await compressImage(uri);
      const cs = await scanImage(compressed, token);
      if (cs.length === 0) {
        Alert.alert("No food detected", "Couldn't identify food in this photo. Try another angle.");
        setPreviewUri(null);
        return;
      }
      setCandidates(cs);
    } catch (e: any) {
      Alert.alert("Scan failed", e.message || "AI couldn't process this image.");
      setPreviewUri(null);
    } finally {
      setIsScanning(false);
    }
  };

  // ── Pick from library (does NOT require camera permission) ────────────────
  const handlePickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processImage(result.assets[0].uri);
  };

  // ── Capture from camera (requests permission lazily on first tap) ─────────
  const handleCapture = async () => {
    if (isScanning) return;

    // Request permission only when user actually tries to use camera
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        // User denied: offer to open device settings
        Alert.alert(
          "Camera permission denied",
          "Please enable camera access in Settings to scan meals, or pick a photo from library instead.",
          [
            { text: "Use library", onPress: handlePickFromLibrary },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }
    }

    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      if (!photo?.uri) return;
      await processImage(photo.uri);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not take photo.");
    }
  };

  // ── Manual entry skipping scan ─────────────────────────────────────────────
  const handleManual = () => {
    setCandidates(null);
    setPreviewUri(null);
    router.push({
      pathname: "/tabs/meal-add",
      params: { mealType: getMealTypeByHour() },
    });
  };

  // ── User picks one candidate → go to meal-add with prefill ────────────────
  const handlePick = (c: Candidate) => {
    router.push({
      pathname: "/tabs/meal-add",
      params: {
        prefillName: c.name,
        prefillCalories: String(c.calories),
        prefillProtein: String(c.protein),
        prefillCarbs: String(c.carbs),
        prefillFat: String(c.fat),
        mealType: getMealTypeByHour(),
      },
    });
    setCandidates(null);
    setPreviewUri(null);
  };

  // ── Permission still loading (first launch only) ───────────────────────────
  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  // No early return for !permission.granted — we render camera area always,
  // and overlay a "permission needed" prompt INSIDE if not granted.
  const cameraGranted = permission.granted;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Camera area: real CameraView if granted, dark placeholder if not */}
      {cameraGranted ? (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
          <ScanOverlay
            onClose={() => router.back()}
            onFlipCamera={() => setFacing(f => f === "back" ? "front" : "back")}
            onCapture={handleCapture}
            onLibrary={handlePickFromLibrary}
            isScanning={isScanning}
            cameraGranted
          />
        </CameraView>
      ) : (
        // No camera permission: dark area with overlay buttons
        // Library button still works without camera permission
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <ScanOverlay
            onClose={() => router.back()}
            onFlipCamera={() => {}}
            onCapture={handleCapture}
            onLibrary={handlePickFromLibrary}
            isScanning={isScanning}
            cameraGranted={false}
          />
        </View>
      )}

      {/* ── Loading overlay during AI scan ────────────────────────────────── */}
      <Modal visible={isScanning && !!previewUri} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", gap: 16 }}>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={{ width: 220, height: 220, borderRadius: 16 }}
            />
          )}
          <ActivityIndicator color="#fff" size="large" />
          <AppText style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            AI is analyzing your meal...
          </AppText>
          <AppText style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            This usually takes 2-5 seconds
          </AppText>
        </View>
      </Modal>

      {/* ── Result modal: top 3 candidates ───────────────────────────────── */}
      <Modal visible={!!candidates && !isScanning} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40,
            maxHeight: "85%",
          }}>
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: theme.colors.border,
              alignSelf: "center", marginBottom: theme.space.md,
            }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md }}>
              <View>
                <AppText variant="h2">What did AI see?</AppText>
                <AppText variant="muted" style={{ fontSize: 13 }}>
                  Pick the closest match
                </AppText>
              </View>
              <Pressable onPress={() => { setCandidates(null); setPreviewUri(null); }}>
                <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
              </Pressable>
            </View>

            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={{
                  width: "100%", height: 140, borderRadius: 12,
                  marginBottom: theme.space.md,
                }}
                resizeMode="cover"
              />
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: theme.space.sm }}>
                {candidates?.map((c, i) => {
                  const pct = Math.round(c.confidence * 100);
                  const isTop = i === 0;
                  return (
                    <Pressable key={i} onPress={() => handlePick(c)}>
                      <Card style={{
                        padding: theme.space.lg,
                        borderWidth: isTop ? 2 : 1,
                        borderColor: isTop ? theme.colors.primary : theme.colors.border,
                      }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <AppText variant="h2" style={{ fontSize: 17 }}>{c.name}</AppText>
                              {isTop && (
                                <View style={{
                                  backgroundColor: theme.colors.primary,
                                  paddingHorizontal: 8, paddingVertical: 2,
                                  borderRadius: 6,
                                }}>
                                  <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                                    BEST MATCH
                                  </AppText>
                                </View>
                              )}
                            </View>
                            {c.portionDescription && (
                              <AppText variant="muted" style={{ fontSize: 12 }}>
                                {c.portionDescription}
                              </AppText>
                            )}
                            <View style={{ flexDirection: "row", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                              <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>
                                {c.calories} kcal
                              </AppText>
                              <AppText style={{ fontSize: 12, color: theme.colors.subtle }}>
                                P {c.protein}g · C {c.carbs}g · F {c.fat}g
                              </AppText>
                            </View>
                          </View>
                          <View style={{ alignItems: "flex-end", gap: 2, marginLeft: 8 }}>
                            <AppText style={{ fontSize: 18, fontWeight: "800", color: isTop ? theme.colors.primary : theme.colors.subtle }}>
                              {pct}%
                            </AppText>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}

                <Pressable onPress={handleManual} style={{ marginTop: theme.space.sm }}>
                  <View style={{
                    padding: theme.space.md,
                    borderRadius: theme.radius.card,
                    borderWidth: 1, borderStyle: "dashed",
                    borderColor: theme.colors.border,
                    alignItems: "center", gap: 4,
                  }}>
                    <AppText style={{ fontSize: 14, fontWeight: "600", color: theme.colors.subtle }}>
                      None of these → enter manually
                    </AppText>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: overlay rendered on top of camera (or dark area if no perm).
// Top bar, viewfinder, bottom controls. Stays the same regardless of permission.
// ─────────────────────────────────────────────────────────────────────────────
function ScanOverlay({
  onClose, onFlipCamera, onCapture, onLibrary, isScanning, cameraGranted,
}: {
  onClose: () => void;
  onFlipCamera: () => void;
  onCapture: () => void;
  onLibrary: () => void;
  isScanning: boolean;
  cameraGranted: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* Top bar */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: theme.space.lg,
        paddingTop: 60, paddingBottom: theme.space.lg,
        backgroundColor: "rgba(0,0,0,0.3)",
      }}>
        <Pressable onPress={onClose} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          Scan Meal
        </AppText>
        {cameraGranted ? (
          <Pressable onPress={onFlipCamera} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </Pressable>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {/* Viewfinder OR permission-needed message */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {cameraGranted ? (
          <>
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
          </>
        ) : (
          // Inline permission-needed message — library/manual buttons still work below
          <View style={{ alignItems: "center", gap: 12, paddingHorizontal: theme.space.lg }}>
            <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.5)" />
            <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Camera not enabled
            </AppText>
            <AppText style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center" }}>
              Tap the capture button to enable camera, or pick from your library below.
            </AppText>
          </View>
        )}
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

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%" }}>
          {/* Library button — always works, no camera permission required */}
          <Pressable
            onPress={onLibrary}
            disabled={isScanning}
            style={({ pressed }) => ({
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center", justifyContent: "center",
              opacity: pressed || isScanning ? 0.5 : 1,
            })}
          >
            <Ionicons name="images-outline" size={24} color="#fff" />
          </Pressable>

          {/* Capture button — requests camera permission lazily on first tap */}
          <Pressable
            onPress={onCapture}
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

          {/* Spacer to keep capture button centered (manual entry lives in the + menu) */}
          <View style={{ width: 52, height: 52 }} />
        </View>
      </View>
    </View>
  );
}
