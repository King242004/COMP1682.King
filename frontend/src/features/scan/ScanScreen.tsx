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
import { mealSlotByHour } from "@/utils/meals/mealSlot";
import { resolveLanguage } from "@/utils/language";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export default function ScanScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const t = useT();
  const language = resolveLanguage(user?.language);
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
  // Chặn máy quét mã vạch gọi lặp nhiều lần trên cùng một khung hình.
  const barcodeLockRef = useRef(false);

  // Xin quyền camera một lần ngay khi mở màn hình để cả hai chế độ đều dùng được.
  const askedRef = useRef(false);
  useEffect(() => {
    if (permission && !permission.granted && !askedRef.current) {
      askedRef.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Luồng ảnh: tải lên rồi hiện các món dự đoán.
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
      const cs = await scanImage(compressed, token, language, controller.signal);
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

  // Chọn ảnh trong thư viện cho chế độ ảnh.
  const handlePickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.scan.pickImagePerm);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processImage(result.assets[0].uri);
  };

  // Chọn ảnh trong thư viện và đọc mã vạch từ ảnh.
  const handleBarcodeFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.scan.pickImagePerm);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: false });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      // CameraView có thể đọc mã vạch từ một file ảnh tĩnh.
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

  // Chụp ảnh trong chế độ nhận diện món.
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

  // Luồng xử lý mã vạch.
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
      // Cho phép quét lại khi lần quét trước không tìm thấy sản phẩm.
      barcodeLockRef.current = false;
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (mode !== "barcode" || barcodeLockRef.current || isScanning || product) return;
    barcodeLockRef.current = true;
    doBarcodeLookup(result.data);
  };

  const handleManualSubmit = (code: string) => {
    setManualVisible(false);
    doBarcodeLookup(code);
  };

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

  // Gửi thông tin sản phẩm sang Coach để đánh giá theo tình trạng sức khỏe đã lưu.
  // Dùng replace để quay lại không rơi vào camera đang chạy.
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
        // Mỗi lần chạm có một mã riêng để tab Coach chỉ xử lý yêu cầu một lần.
        askId: String(Date.now()),
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

  // Đèn pin chỉ dùng được với camera sau.
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

      {/* Các bảng kết quả và nhập thủ công nằm trong src/features/scan. */}
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
