// Một màn điều phối cả quét ảnh và barcode. Kết quả chỉ điền sẵn Add Meal;
// người dùng vẫn phải kiểm tra và tự lưu món.
import { useEffect, useState, useRef } from "react";
import { Alert, Pressable, View, ActivityIndicator, Image, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions, scanFromURLAsync, type BarcodeScanningResult } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/features/auth/AuthContext";
import { compressImage, scanImage, lookupBarcode, BARCODE_TYPES, BARCODE_SETTINGS, type Candidate, type Product, type ScanMode } from "@/features/scan/scanApi";
import { ScanOverlay } from "@/features/scan/ScanOverlay";
import { CandidatesSheet } from "@/features/scan/CandidatesSheet";
import { ProductSheet } from "@/features/scan/ProductSheet";
import { ManualBarcodeModal } from "@/features/scan/ManualBarcodeModal";
import { mealSlotByHour } from "@/features/meals/mealHelpers";
import { resolveLanguage } from "@/utils/languageUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";

export default function ScanScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: ScanMode }>();
  const { token, user } = useAuth();
  const t = useT();
  const language = resolveLanguage(user?.language);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [mode, setMode] = useState<ScanMode>(modeParam === "barcode" ? "barcode" : "photo");
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

  const askedRef = useRef(false);
  // Tự xin quyền camera một lần khi mở màn, để cả hai chế độ đều dùng được.
  // askedRef chặn hỏi lại nhiều lần nếu người dùng từ chối.
  useEffect(() => {
    if (permission && !permission.granted && !askedRef.current) {
      askedRef.current = true;
      void requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  // AbortController cho phép người dùng hủy request AI mà không hiện lỗi giả.
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
      // Nén trước khi gửi. Ảnh gốc điện thoại nặng vài MB, gửi thẳng
      // sẽ rất chậm trên mạng di động mà AI cũng không đoán chính xác hơn.
      const compressed = await compressImage(uri);
      const cs = await scanImage(compressed, token, language, controller.signal);
      if (cs.length === 0) {
        Alert.alert(t.scan.noFood, t.scan.noFoodMsg);
        setPreviewUri(null);
        return;
      }
      setCandidates(cs);
    } catch (error) {
      // Người dùng tự bấm hủy thì không phải lỗi, không hiện thông báo.
      if (!(error instanceof Error) || error.name !== "AbortError") {
        Alert.alert(t.scan.scanFailed, getUserErrorMessage(error, t, t.scan.scanFailedMsg));
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

  const pickImageFromLibrary = async (quality: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.scan.pickImagePerm);
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality,
      allowsEditing: false,
    });
    return result.canceled ? null : result.assets?.[0]?.uri || null;
  };

  const handlePickFromLibrary = async () => {
    const uri = await pickImageFromLibrary(0.7);
    if (uri) await processImage(uri);
  };

  const handleBarcodeFromLibrary = async () => {
    const uri = await pickImageFromLibrary(1);
    if (!uri) return;
    try {
      const found = await scanFromURLAsync(uri, [...BARCODE_TYPES]);
      if (found && found.length > 0) {
        doBarcodeLookup(found[0].data);
      } else {
        Alert.alert(t.scan.noBarcode, t.scan.noBarcodeMsg1);
      }
    } catch {
      Alert.alert(t.scan.noBarcode, t.scan.noBarcodeMsg2);
    }
  };

  // Nếu camera bị từ chối, người dùng vẫn có thể chọn ảnh hoặc mở cài đặt.
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
    } catch (error) {
      Alert.alert(t.common.errorTitle, getUserErrorMessage(error, t, t.scan.takePhotoError));
    }
  };

  const doBarcodeLookup = async (code: string) => {
    if (!token) {
      Alert.alert(t.scan.notLoggedIn, t.scan.loginAgain);
      return;
    }
    setIsScanning(true);
    try {
      const p = await lookupBarcode(code, token);
      setProduct(p);
    } catch (error) {
      Alert.alert(
        t.scan.productNotFound,
        getUserErrorMessage(error, t, t.scan.productNotFoundMsg),
        [
          { text: t.scan.enterManually, onPress: handleManual },
          { text: t.common.ok, style: "cancel" },
        ]
      );
      // Cho phép quét lại khi lần quét trước không tìm thấy sản phẩm.
      barcodeLockRef.current = false;
    } finally {
      setIsScanning(false);
    }
  };

  // Camera phát hiện liên tục nên khóa sau lần gọi đầu tiên.
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

  const openScannedMeal = ({ name, calories, protein, carbs, fat, unit, note, source }: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    unit: string;
    note?: string;
    source: "photo" | "barcode";
  }) => {
    router.replace({
      pathname: "/meals/add",
      params: {
        prefillName: name,
        prefillCalories: String(calories),
        prefillProtein: String(protein),
        prefillCarbs: String(carbs),
        prefillFat: String(fat),
        prefillAmount: "1",
        prefillUnit: unit,
        ...(note ? { prefillNote: note } : {}),
        source,
        mealType: mealSlotByHour(new Date().getHours()),
      },
    });
  };

  const handlePick = (candidate: Candidate) => {
    openScannedMeal({
      ...candidate,
      unit: t.meals.visiblePortion,
      note: candidate.portionDescription,
      source: "photo",
    });
    setCandidates(null);
    setPreviewUri(null);
  };

  const handleAddProduct = (product: Product) => {
    openScannedMeal({
      ...product,
      name: product.brand ? `${product.name} (${product.brand})` : product.name,
      unit: product.servingSize || t.meals.servingUnit,
      source: "barcode",
    });
    setProduct(null);
    barcodeLockRef.current = false;
  };

  const handleAskCoach = (p: Product) => {
    setProduct(null);
    barcodeLockRef.current = false;
    router.replace({
      pathname: "/tabs/coach",
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
