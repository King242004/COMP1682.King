// SCAN SCREEN — photo (AI recognition) + barcode (Open Food Facts).
// Flow/state machine lives here; camera overlay + result sheets are in
// src/features/scan.
import { useEffect, useState, useRef } from "react";
import { Alert, Pressable, View, ActivityIndicator, Image, Linking, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions, scanFromURLAsync, type BarcodeScanningResult } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import {
  compressImage, scanImage, lookupBarcode,
  BARCODE_TYPES, BARCODE_SETTINGS,
  type Candidate, type Product, type ScanMode,
} from "@/features/scan/api";
import { ScanOverlay } from "@/features/scan/ScanOverlay";
import { CandidatesSheet } from "@/features/scan/CandidatesSheet";
import { ProductSheet } from "@/features/scan/ProductSheet";
import { ManualBarcodeModal } from "@/features/scan/ManualBarcodeModal";
import { mealSlotByHour } from "@/utils/mealSlot";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export default function ScanScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [mode, setMode] = useState<ScanMode>("photo");
  const [isScanning, setIsScanning] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [manualVisible, setManualVisible] = useState(false);
  const [torch, setTorch] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Prevents the live barcode scanner from firing repeatedly on the same frame
  const barcodeLockRef = useRef(false);

  // Ask for camera access as soon as the screen opens (once). Barcode mode had
  // NO way to trigger the prompt at all — only the photo shutter asked.
  const askedRef = useRef(false);
  useEffect(() => {
    if (permission && !permission.granted && !askedRef.current) {
      askedRef.current = true;
      requestPermission();
    }
  }, [permission]);

  // ── Photo flow: upload → show candidates ───────────────────────────────────
  const processImage = async (uri: string) => {
    if (!token) {
      Alert.alert(t.scan.notLoggedIn, t.scan.loginAgain);
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
        Alert.alert(t.scan.noFood, t.scan.noFoodMsg);
        setPreviewUri(null);
        return;
      }
      setCandidates(cs);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        Alert.alert(t.scan.scanFailed, e.message || t.scan.scanFailedMsg);
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
      Alert.alert(t.profile.permissionNeeded, t.scan.pickImagePerm);
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
      Alert.alert(t.profile.permissionNeeded, t.scan.pickImagePerm);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: false });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      // CameraView can extract barcodes from a still image file
      const found = await scanFromURLAsync(result.assets[0].uri, [...BARCODE_TYPES]);
      if (found && found.length > 0) {
        doBarcodeLookup(found[0].data);
      } else {
        Alert.alert(t.scan.noBarcode, t.scan.noBarcodeMsg1);
      }
    } catch {
      Alert.alert(t.scan.noBarcode, t.scan.noBarcodeMsg2);
    }
  };

  // ── Capture (photo mode) ───────────────────────────────────────────────────
  const handleCapture = async () => {
    if (isScanning) return;
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          t.scan.cameraDenied,
          t.scan.cameraDeniedMsg,
          [
            { text: t.scan.useLibrary, onPress: handlePickFromLibrary },
            { text: t.scan.openSettings, onPress: () => Linking.openSettings() },
            { text: t.common.cancel, style: "cancel" },
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
      Alert.alert(t.common.errorTitle, e.message || t.scan.takePhotoError);
    }
  };

  // ── Barcode flow ───────────────────────────────────────────────────────────
  const doBarcodeLookup = async (code: string) => {
    if (!token) {
      Alert.alert(t.scan.notLoggedIn, t.scan.loginAgain);
      return;
    }
    setIsScanning(true);
    try {
      const p = await lookupBarcode(code, token);
      setProduct(p);
    } catch (e: any) {
      Alert.alert(
        t.scan.productNotFound,
        e.message || t.scan.productNotFoundMsg,
        [
          { text: t.scan.enterManually, onPress: handleManual },
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

  const handleManualSubmit = (code: string) => {
    setManualVisible(false);
    doBarcodeLookup(code);
  };

  // ── Shared navigation helpers ──────────────────────────────────────────────
  // REPLACE scan with the Add screen: after saving, back() lands on Home/diary
  // instead of dropping the user back onto the live camera.
  const handleManual = () => {
    setCandidates(null);
    setProduct(null);
    setPreviewUri(null);
    router.replace({ pathname: "/meals/add", params: { mealType: mealSlotByHour(new Date().getHours()) } });
  };

  const handlePick = (c: Candidate) => {
    router.replace({
      pathname: "/meals/add",
      params: {
        prefillName: c.name,
        prefillCalories: String(c.calories),
        prefillProtein: String(c.protein),
        prefillCarbs: String(c.carbs),
        prefillFat: String(c.fat),
        mealType: mealSlotByHour(new Date().getHours()),
      },
    });
    setCandidates(null);
    setPreviewUri(null);
  };

  const handleAddProduct = (p: Product) => {
    router.replace({
      pathname: "/meals/add",
      params: {
        prefillName: p.brand ? `${p.name} (${p.brand})` : p.name,
        prefillCalories: String(p.calories),
        prefillProtein: String(p.protein),
        prefillCarbs: String(p.carbs),
        prefillFat: String(p.fat),
        mealType: mealSlotByHour(new Date().getHours()),
      },
    });
    setProduct(null);
    barcodeLockRef.current = false;
  };

  // "Right for me?" → Coach tab with the product's facts; the Coach grounds the
  // verdict in the user's saved conditions (diabetes, gout, ...). REPLACE like
  // the other scan exits so back() from Coach doesn't land on a live camera.
  const handleAskCoach = (p: Product) => {
    setProduct(null);
    barcodeLockRef.current = false;
    router.replace({
      pathname: "/tabs/coach" as any,
      params: {
        ask: t.scan.suitsMeQuestion(
          p.brand ? `${p.name} (${p.brand})` : p.name,
          Math.round(p.calories), Math.round(p.protein), Math.round(p.carbs), Math.round(p.fat)
        ),
        askId: String(Date.now()), // unique per tap — consumed once on the Coach tab
      },
    });
  };

  const switchMode = (m: ScanMode) => {
    setMode(m);
    barcodeLockRef.current = false;
  };

  if (!permission) {
    return (
      <View style={styles.loadingScreen}>
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
    <View style={styles.screen}>
      {cameraGranted ? (
        <CameraView
          ref={cameraRef}
          style={styles.flex1}
          facing={facing}
          enableTorch={torchOn}
          barcodeScannerSettings={BARCODE_SETTINGS}
          onBarcodeScanned={handleBarcodeScanned}
        >
          {overlay}
        </CameraView>
      ) : (
        <View style={styles.screen}>{overlay}</View>
      )}

      {/* ── Loading overlay — absolute View (NOT a Modal) so it never collides
            with the manual-entry Modal dismissing (that combo freezes iOS) ──── */}
      {isScanning && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          {previewUri && <Image source={{ uri: previewUri }} style={styles.loadingPreview} />}
          <ActivityIndicator color="#fff" size="large" />
          <AppText style={styles.loadingTitle}>
            {mode === "barcode" ? t.scan.loadingBarcode : t.scan.loadingPhoto}
          </AppText>
          <AppText style={styles.loadingSub}>
            {mode === "barcode" ? t.scan.loadingBarcodeSub : t.scan.loadingPhotoSub}
          </AppText>
          {mode === "photo" && (
            <Pressable onPress={handleCancelScan} style={({ pressed }) => [styles.cancelBtn, pressed && styles.dim]}>
              <AppText style={styles.cancelText}>{t.common.cancel}</AppText>
            </Pressable>
          )}
        </View>
      )}

      {/* Result sheets + manual entry (components in src/features/scan) */}
      <CandidatesSheet
        visible={!!candidates && !isScanning}
        candidates={candidates}
        previewUri={previewUri}
        onPick={handlePick}
        onManual={handleManual}
        onClose={() => { setCandidates(null); setPreviewUri(null); }}
      />
      <ProductSheet
        visible={!!product && !isScanning}
        product={product}
        onAdd={handleAddProduct}
        onAskCoach={handleAskCoach}
        onClose={() => { setProduct(null); barcodeLockRef.current = false; }}
      />
      <ManualBarcodeModal
        visible={manualVisible}
        onClose={() => setManualVisible(false)}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.6 },
  screen: { flex: 1, backgroundColor: "#000" },
  loadingScreen: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  loadingOverlay: {
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center", justifyContent: "center", gap: 16,
    zIndex: 20, elevation: 20,
  },
  loadingPreview: { width: 220, height: 220, borderRadius: 16 },
  loadingTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loadingSub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  cancelBtn: {
    marginTop: 12,
    paddingHorizontal: 28, paddingVertical: 11,
    borderRadius: theme.radius.button,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
  },
  cancelText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
