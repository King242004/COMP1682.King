import { useState, useRef } from "react";
import { Alert, Pressable, View, ActivityIndicator, ScrollView, Image, Modal, Linking, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions, scanFromURLAsync, type BarcodeScanningResult } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../utils/api";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { TextField } from "../ui/components/TextField";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type ScanMode = "photo" | "barcode";

// Stable reference so CameraView doesn't reconfigure the session each render
const BARCODE_SETTINGS = { barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"] } as {
  barcodeTypes: ("ean13" | "ean8" | "upc_a" | "upc_e" | "code128")[];
};

type Candidate = {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionDescription?: string;
};

type Product = {
  name: string;
  brand?: string | null;
  image?: string | null;
  servingSize?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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

// Upload helper - returns parsed candidates or throws.
// Accepts an AbortSignal so the user can cancel an in-flight scan.
async function scanImage(uri: string, token: string, signal?: AbortSignal): Promise<Candidate[]> {
  const formData = new FormData();
  const filename = uri.split("/").pop() || "meal.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  formData.append("image", { uri, name: filename, type: mimeType } as any);

  const res = await fetch(`${BASE_URL}/scan/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Scan failed");
  return data.candidates || [];
}

// Look up a packaged product by barcode (Open Food Facts via backend)
async function lookupBarcode(barcode: string, token: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/scan/barcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ barcode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Product not found");
  return data.product;
}

export default function ScanScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [mode, setMode] = useState<ScanMode>("photo");
  const [isScanning, setIsScanning] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [torch, setTorch] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Prevents the live barcode scanner from firing repeatedly on the same frame
  const barcodeLockRef = useRef(false);

  // ── Photo flow: upload → show candidates ───────────────────────────────────
  const processImage = async (uri: string) => {
    if (!token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setPreviewUri(uri);
    setIsScanning(true);
    try {
      const compressed = await compressImage(uri);
      const cs = await scanImage(compressed, token, controller.signal);
      if (cs.length === 0) {
        Alert.alert("No food detected", "Couldn't identify food in this photo. Try another angle.");
        setPreviewUri(null);
        return;
      }
      setCandidates(cs);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        Alert.alert("Scan failed", e.message || "AI couldn't process this image.");
      }
      setPreviewUri(null);
    } finally {
      setIsScanning(false);
      abortRef.current = null;
    }
  };

  const handleCancelScan = () => {
    abortRef.current?.abort();
    setIsScanning(false);
    setPreviewUri(null);
  };

  // ── Pick from library (photo mode) ─────────────────────────────────────────
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

  // ── Pick an image from library and read a barcode out of it (barcode mode) ─
  const handleBarcodeFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: false });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      // CameraView can extract barcodes from a still image file
      const found = await scanFromURLAsync(result.assets[0].uri, ["ean13", "ean8", "upc_a", "upc_e", "code128"]);
      if (found && found.length > 0) {
        doBarcodeLookup(found[0].data);
      } else {
        Alert.alert("No barcode found", "Couldn't detect a barcode in that image. Try another photo or enter the code manually.");
      }
    } catch {
      Alert.alert("No barcode found", "Couldn't read a barcode from that image.");
    }
  };

  // ── Capture (photo mode) ───────────────────────────────────────────────────
  const handleCapture = async () => {
    if (isScanning) return;
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
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

  // ── Barcode flow ───────────────────────────────────────────────────────────
  const doBarcodeLookup = async (code: string) => {
    if (!token) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }
    setIsScanning(true);
    try {
      const p = await lookupBarcode(code, token);
      setProduct(p);
    } catch (e: any) {
      Alert.alert(
        "Product not found",
        e.message || "This barcode isn't in the database. Try entering the meal manually.",
        [
          { text: "Enter manually", onPress: handleManual },
          { text: "OK", style: "cancel" },
        ]
      );
      barcodeLockRef.current = false; // allow re-scan after a miss
    } finally {
      setIsScanning(false);
    }
  };

  // Live scanner callback — always attached (toggling the prop would reconfigure
  // the camera session and freeze ~2s). Gate by mode/state inside instead.
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (mode !== "barcode" || barcodeLockRef.current || isScanning || product) return;
    barcodeLockRef.current = true;
    doBarcodeLookup(result.data);
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!/^\d{8,14}$/.test(code)) {
      Alert.alert("Invalid barcode", "Barcode must be 8 to 14 digits.");
      return;
    }
    setManualVisible(false);
    setManualCode("");
    doBarcodeLookup(code);
  };

  // ── Shared navigation helpers ──────────────────────────────────────────────
  const handleManual = () => {
    setCandidates(null);
    setProduct(null);
    setPreviewUri(null);
    router.push({ pathname: "/tabs/meals/add", params: { mealType: getMealTypeByHour() } });
  };

  const handlePick = (c: Candidate) => {
    router.push({
      pathname: "/tabs/meals/add",
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

  const handleAddProduct = (p: Product) => {
    router.push({
      pathname: "/tabs/meals/add",
      params: {
        prefillName: p.brand ? `${p.name} (${p.brand})` : p.name,
        prefillCalories: String(p.calories),
        prefillProtein: String(p.protein),
        prefillCarbs: String(p.carbs),
        prefillFat: String(p.fat),
        mealType: getMealTypeByHour(),
      },
    });
    setProduct(null);
    barcodeLockRef.current = false;
  };

  const switchMode = (m: ScanMode) => {
    setMode(m);
    barcodeLockRef.current = false;
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const cameraGranted = permission.granted;

  // Torch only makes sense on the back camera
  const torchOn = torch && facing === "back";

  const overlay = (
    <ScanOverlay
      mode={mode}
      onSwitchMode={switchMode}
      onClose={() => router.back()}
      onFlipCamera={() => setFacing((f) => (f === "back" ? "front" : "back"))}
      onCapture={handleCapture}
      onLibrary={mode === "barcode" ? handleBarcodeFromLibrary : handlePickFromLibrary}
      onManualBarcode={() => setManualVisible(true)}
      onToggleFlash={() => setTorch((t) => !t)}
      torchOn={torchOn}
      isScanning={isScanning}
      cameraGranted={cameraGranted}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {cameraGranted ? (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          enableTorch={torchOn}
          barcodeScannerSettings={BARCODE_SETTINGS}
          onBarcodeScanned={handleBarcodeScanned}
        >
          {overlay}
        </CameraView>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#000" }}>{overlay}</View>
      )}

      {/* ── Loading overlay — absolute View (NOT a Modal) so it never collides
            with the manual-entry Modal dismissing (that combo freezes iOS) ──── */}
      {isScanning && (
        <View style={[StyleSheet.absoluteFill, {
          backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", gap: 16,
          zIndex: 20, elevation: 20,
        }]}>
          {previewUri && (
            <Image source={{ uri: previewUri }} style={{ width: 220, height: 220, borderRadius: 16 }} />
          )}
          <ActivityIndicator color="#fff" size="large" />
          <AppText style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {mode === "barcode" ? "Looking up product..." : "AI is analyzing your meal..."}
          </AppText>
          <AppText style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            {mode === "barcode" ? "Just a moment" : "This usually takes 5-10 seconds"}
          </AppText>
          {mode === "photo" && (
            <Pressable
              onPress={handleCancelScan}
              style={({ pressed }) => ({
                marginTop: 12,
                paddingHorizontal: 28, paddingVertical: 11,
                borderRadius: theme.radius.button,
                borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <AppText style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Cancel</AppText>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Photo result modal: top 3 candidates ─────────────────────────── */}
      <Modal visible={!!candidates && !isScanning} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40,
            maxHeight: "85%",
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: "center", marginBottom: theme.space.md }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md }}>
              <View>
                <AppText variant="h2">What did AI see?</AppText>
                <AppText variant="muted" style={{ fontSize: 13 }}>Pick the closest match</AppText>
              </View>
              <Pressable onPress={() => { setCandidates(null); setPreviewUri(null); }}>
                <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
              </Pressable>
            </View>
            {previewUri && (
              <Image source={{ uri: previewUri }} style={{ width: "100%", height: 140, borderRadius: 12, marginBottom: theme.space.md }} resizeMode="cover" />
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: theme.space.sm }}>
                {candidates?.map((c, i) => {
                  const pct = Math.round(c.confidence * 100);
                  const isTop = i === 0;
                  return (
                    <Pressable key={i} onPress={() => handlePick(c)}>
                      <Card style={{ padding: theme.space.lg, borderWidth: isTop ? 2 : 1, borderColor: isTop ? theme.colors.primary : theme.colors.border }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <AppText variant="h2" style={{ fontSize: 17 }}>{c.name}</AppText>
                              {isTop && (
                                <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                  <AppText style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>BEST MATCH</AppText>
                                </View>
                              )}
                            </View>
                            {c.portionDescription && (
                              <AppText variant="muted" style={{ fontSize: 12 }}>{c.portionDescription}</AppText>
                            )}
                            <View style={{ flexDirection: "row", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                              <AppText style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>{c.calories} kcal</AppText>
                              <AppText style={{ fontSize: 12, color: theme.colors.subtle }}>P {c.protein}g · C {c.carbs}g · F {c.fat}g</AppText>
                            </View>
                          </View>
                          <View style={{ alignItems: "flex-end", gap: 2, marginLeft: 8 }}>
                            <AppText style={{ fontSize: 18, fontWeight: "800", color: isTop ? theme.colors.primary : theme.colors.subtle }}>{pct}%</AppText>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
                <Pressable onPress={handleManual} style={{ marginTop: theme.space.sm }}>
                  <View style={{ padding: theme.space.md, borderRadius: theme.radius.card, borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border, alignItems: "center", gap: 4 }}>
                    <AppText style={{ fontSize: 14, fontWeight: "600", color: theme.colors.subtle }}>None of these → enter manually</AppText>
                  </View>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Barcode result modal: product card ───────────────────────────── */}
      <Modal visible={!!product && !isScanning} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40,
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: "center", marginBottom: theme.space.md }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md }}>
              <AppText variant="h2">Product found</AppText>
              <Pressable onPress={() => { setProduct(null); barcodeLockRef.current = false; }}>
                <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
              </Pressable>
            </View>
            {product && (
              <>
                <Card style={{ padding: theme.space.lg, gap: theme.space.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space.md }}>
                    <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "rgba(37,99,235,0.08)", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {product.image ? (
                        <Image source={{ uri: product.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                      ) : (
                        <AppText style={{ fontSize: 28 }}>🛒</AppText>
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="h2" style={{ fontSize: 16 }}>{product.name}</AppText>
                      {product.brand ? <AppText variant="muted" style={{ fontSize: 13 }}>{product.brand}</AppText> : null}
                      {product.servingSize ? <AppText variant="subtle" style={{ fontSize: 11 }}>Per serving: {product.servingSize}</AppText> : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: theme.space.sm, borderTopWidth: 0.5, borderTopColor: theme.colors.border }}>
                    {[
                      { label: "kcal", value: product.calories, color: theme.colors.primary },
                      { label: "P", value: product.protein, color: theme.colors.accent2 },
                      { label: "C", value: product.carbs, color: theme.colors.accent },
                      { label: "F", value: product.fat, color: theme.colors.indigo },
                    ].map((m) => (
                      <View key={m.label} style={{ alignItems: "center", gap: 2 }}>
                        <AppText style={{ fontSize: 17, fontWeight: "800", color: m.color }}>{Math.round(m.value)}</AppText>
                        <AppText variant="subtle" style={{ fontSize: 11 }}>{m.label}</AppText>
                      </View>
                    ))}
                  </View>
                </Card>
                <View style={{ marginTop: theme.space.lg }}>
                  <Button title="Add to meal" size="lg" onPress={() => handleAddProduct(product)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Manual barcode entry modal ───────────────────────────────────── */}
      <Modal visible={manualVisible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: theme.space.xl }}
          onPress={() => setManualVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Card style={{ padding: theme.space.xl, gap: theme.space.lg }}>
              <View style={{ gap: 4 }}>
                <AppText variant="h2">Enter barcode</AppText>
                <AppText variant="muted" style={{ fontSize: 13 }}>Type the 8-14 digit number under the bars.</AppText>
              </View>
              <TextField
                label="Barcode number"
                placeholder="e.g. 8934563138189"
                value={manualCode}
                onChangeText={setManualCode}
                keyboardType="number-pad"
              />
              <View style={{ flexDirection: "row", gap: theme.space.md }}>
                <View style={{ flex: 1 }}>
                  <Button title="Cancel" variant="secondary" onPress={() => { setManualVisible(false); setManualCode(""); }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Look up" onPress={handleManualSubmit} />
                </View>
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlay on top of camera: top bar + mode toggle, viewfinder, bottom controls.
// ─────────────────────────────────────────────────────────────────────────────
function ScanOverlay({
  mode, onSwitchMode, onClose, onFlipCamera, onCapture, onLibrary, onManualBarcode, onToggleFlash, torchOn, isScanning, cameraGranted,
}: {
  mode: ScanMode;
  onSwitchMode: (m: ScanMode) => void;
  onClose: () => void;
  onFlipCamera: () => void;
  onCapture: () => void;
  onLibrary: () => void;
  onManualBarcode: () => void;
  onToggleFlash: () => void;
  torchOn: boolean;
  isScanning: boolean;
  cameraGranted: boolean;
}) {
  const isBarcode = mode === "barcode";
  const { width, height } = useWindowDimensions();
  const frameW = width - 72;       // clear scan window width
  const frameH = frameW * 1.45;    // taller window (same for both modes)
  const frameTop = (height - frameH) / 2; // vertical offset (window is centered)
  const R = 28;                    // inner corner radius of the hole
  const BIG = Math.max(width, height); // border thickness big enough to cover screen
  const DIM = "rgba(0,0,0,0.72)";  // darkened area around the window

  // Small circular icon button used in the bottom row + top-right slot
  const IconBtn = ({ icon, onPress, active }: { icon: any; onPress: () => void; active?: boolean }) => (
    <Pressable
      onPress={onPress}
      disabled={isScanning}
      style={({ pressed }) => ({
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: active ? "#fff" : "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
        opacity: pressed || isScanning ? 0.5 : 1,
      })}
    >
      <Ionicons name={icon} size={24} color={active ? theme.colors.primary : "#fff"} />
    </Pressable>
  );

  // Plain icon button for top bar (back / flip) — no background
  const TopBtn = ({ icon, onPress }: { icon: any; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 40, height: 40,
        alignItems: "center", justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Dimmed overlay with a clear rounded scan window (only when camera live).
          "Donut" trick: a huge dim border leaves a rounded-rectangle hole in the
          middle. Inner corner radius = borderRadius - borderWidth = R. */}
      {cameraGranted && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: frameTop - BIG,
              left: 36 - BIG,
              width: frameW + BIG * 2,
              height: frameH + BIG * 2,
              borderWidth: BIG,
              borderColor: DIM,
              borderRadius: BIG + R,
            }}
          />
          {/* White frame line on top of the hole edge */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: frameTop, left: 36,
              width: frameW, height: frameH,
              borderWidth: 2.5, borderColor: "rgba(255,255,255,0.9)", borderRadius: R,
            }}
          />
        </>
      )}

      {/* Controls layer (sits above the dim/cutout) */}
      <View style={{ flex: 1 }}>
        {/* Top bar: circular back + title, flip on the right (photo only) */}
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          paddingHorizontal: theme.space.lg, paddingTop: 56, paddingBottom: theme.space.md,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TopBtn icon="chevron-back" onPress={onClose} />
            <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
              {isBarcode ? "Scan Barcode" : "Scan Meal"}
            </AppText>
          </View>
          {cameraGranted && !isBarcode ? (
            <TopBtn icon="camera-reverse-outline" onPress={onFlipCamera} />
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Mode toggle: Photo | Barcode */}
        <View style={{ alignItems: "center", paddingBottom: theme.space.md }}>
          <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 99, padding: 4 }}>
            {([["photo", "Photo"], ["barcode", "Barcode"]] as [ScanMode, string][]).map(([key, label]) => {
              const active = mode === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => onSwitchMode(key)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99,
                    backgroundColor: active ? "#fff" : "transparent",
                  }}
                >
                  <Ionicons
                    name={key === "photo" ? "camera" : "barcode-outline"}
                    size={15}
                    color={active ? theme.colors.primary : "#fff"}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: "700", color: active ? theme.colors.primary : "#fff" }}>
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Middle: hint pill (over the clear window) or permission message */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space.lg }}>
          {!cameraGranted ? (
            <View style={{ alignItems: "center", gap: 12 }}>
              <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.5)" />
              <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Camera not enabled</AppText>
              <AppText style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center" }}>
                {isBarcode
                  ? "Tap below to enter the barcode number manually, or enable camera to scan."
                  : "Tap the capture button to enable camera, or pick from your library below."}
              </AppText>
            </View>
          ) : (
            <View style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 18, paddingVertical: 10, borderRadius: 99,
              marginBottom: frameH - 56, // sit near the top edge of the frame
            }}>
              <AppText style={{ color: "#fff", fontSize: 13, textAlign: "center" }}>
                {isBarcode ? "Point camera at a barcode" : "Point camera at your meal"}
              </AppText>
            </View>
          )}
        </View>

      {/* Bottom controls */}
      <View style={{
        paddingBottom: 60, paddingHorizontal: theme.space.lg,
        alignItems: "center", gap: theme.space.lg,
      }}>
        {isBarcode ? (
          // Barcode mode: auto live-scan. Bottom row = library (left) + enter code (right)
          <>
            <AppText style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>
              Hold steady, the barcode is detected automatically
            </AppText>
            {/* Same layout as photo mode: library (left) · main (center) · flash (right) */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%" }}>
              <IconBtn icon="images-outline" onPress={onLibrary} />
              {/* Center main action: enter code manually */}
              <Pressable
                onPress={onManualBarcode}
                disabled={isScanning}
                style={({ pressed }) => ({
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: pressed || isScanning ? "rgba(255,255,255,0.7)" : "#fff",
                  alignItems: "center", justifyContent: "center",
                  borderWidth: 4, borderColor: "rgba(255,255,255,0.4)",
                  opacity: isScanning ? 0.5 : 1,
                })}
              >
                <Ionicons name="keypad" size={28} color={theme.colors.primary} />
              </Pressable>
              <IconBtn icon={torchOn ? "flash" : "flash-off"} onPress={onToggleFlash} active={torchOn} />
            </View>
          </>
        ) : (
          // Photo mode: library (left) | capture (center) | flash (right)
          <>
            <AppText style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>
              AI will automatically detect your food and estimate calories
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%" }}>
              <IconBtn icon="images-outline" onPress={onLibrary} />
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
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.primary }} />
                )}
              </Pressable>
              {/* Flash → right, in line with library */}
              <IconBtn icon={torchOn ? "flash" : "flash-off"} onPress={onToggleFlash} active={torchOn} />
            </View>
          </>
        )}
      </View>
      </View>
    </View>
  );
}
