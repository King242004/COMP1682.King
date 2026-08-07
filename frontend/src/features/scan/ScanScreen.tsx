// ═══ FILE NÀY LÀM GÌ ═══
// Màn Quét. File BẮT ĐẦU của luồng quét ảnh và luồng quét mã vạch,
// hai trong bốn luồng defend. Một màn điều phối cả hai chế độ.
//
// Ai gọi tới: nút quét ở giữa thanh tab dưới
// Nhận vào:   ảnh chụp từ camera, hoặc mã vạch camera đọc được
// Trả ra:     không trả gì, chọn xong món thì chuyển sang màn Thêm món
//             với dữ liệu đã điền sẵn
// Khi lỗi:    chưa có quyền camera thì hiện khối báo thiếu quyền kèm nút mở
//             Cài đặt và nút chọn ảnh từ thư viện. AI không nhận ra món thì
//             mời nhập tay. Mã vạch không có trong kho thì mời gõ tên món.
//
// Điểm cần nói khi bảo vệ: kết quả AI chỉ ĐIỀN SẴN vào màn Thêm món.
// Người dùng vẫn phải tự kiểm tra và tự bấm Lưu. AI không tự ghi gì vào nhật ký.
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
import { getErrorMessage, getUserErrorMessage } from "@/utils/errorUtils";
import { aiResetWhen } from "@/utils/aiQuota";
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
  // Tay cầm của camera, cần để gọi lệnh chụp.
  const cameraRef = useRef<CameraView>(null);
  // Cầm sẵn nút hủy của lượt gọi AI đang chạy, để người dùng bấm Hủy là dừng được.
  const abortRef = useRef<AbortController | null>(null);
  // Chặn máy quét mã vạch gọi lặp nhiều lần trên cùng một khung hình.
  const barcodeLockRef = useRef(false);

  // Đã hỏi quyền camera lần nào chưa. Chặn hỏi lại liên tục nếu người dùng từ chối.
  const askedRef = useRef(false);
  // Tự xin quyền camera một lần khi mở màn, để cả hai chế độ đều dùng được.
  // askedRef chặn hỏi lại nhiều lần nếu người dùng từ chối.
  useEffect(() => {
    if (permission && !permission.granted && !askedRef.current) {
      askedRef.current = true;
      void requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  // ══════════════════════════════════════════════════════════
  // QUÉT ẢNH
  //
  // Đến từ nút chụp giữa màn, hoặc nút chọn ảnh từ thư viện.
  // Năm bước, đọc từ trên xuống là đúng thứ tự.
  // Xong thì sang màn Thêm món với dữ liệu đã điền sẵn.
  // ══════════════════════════════════════════════════════════

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

  // Lối vào thứ hai của QUÉT ẢNH: chọn ảnh có sẵn thay vì chụp mới.
  const handlePickFromLibrary = async () => {
    const uri = await pickImageFromLibrary(0.7);
    if (uri) await processImage(uri);
  };

  // QUÉT ẢNH BƯỚC 1. Đã có ảnh trong tay, bắt đầu xử lý.
  // AbortController cho phép người dùng hủy giữa chừng mà không hiện lỗi giả.
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
      // QUÉT ẢNH BƯỚC 2. Nén trước khi gửi. Ảnh gốc điện thoại nặng vài MB,
      // gửi thẳng thì rất chậm trên mạng di động mà AI cũng không đoán đúng hơn.
      const compressed = await compressImage(uri);
      // QUÉT ẢNH BƯỚC 3. scanApi.scanImage → POST /scan/photo
      // → scanController.scanPhoto → aiClient.generateWithFallback.
      // Gửi kèm language để Gemini trả tên món đúng tiếng đang chọn.
      // scanController.scanPhoto dùng scanTranslation.hasLanguageMismatch;
      // nếu Gemini lẫn ngôn ngữ thì generateJson dịch và mergeLocalizedText ghép lại phần chữ.
      const cs = await scanImage(compressed, token, language, controller.signal);
      if (cs.length === 0) {
        Alert.alert(t.scan.noFood, t.scan.noFoodMsg);
        setPreviewUri(null);
        return;
      }
      // QUÉT ẢNH BƯỚC 4. Mở bảng cho người dùng chọn.
      // AI chỉ ĐỀ XUẤT, không tự ghi món nào vào nhật ký cả.
      setCandidates(cs);
    } catch (error) {
      // Người dùng tự bấm hủy thì không phải lỗi, không hiện thông báo.
      if (!(error instanceof Error) || error.name !== "AbortError") {
        const message = getErrorMessage(error);
        Alert.alert(
          t.scan.scanFailed,
          /quota/i.test(message)
            ? t.plan.quota(aiResetWhen(t))
            : getUserErrorMessage(error, t, t.scan.scanFailedMsg)
        );
      }
      setPreviewUri(null);
    } finally {
      setIsScanning(false);
      abortRef.current = null;
    }
  };

  // QUÉT ẢNH bước cuối. Người dùng chọn một trong ba món AI đoán.
  // Đây là bước XÁC NHẬN của con người, AI không tự quyết.
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

  // Bấm Hủy giữa lúc chờ AI. Gọi abort để dừng request, dọn màn về như cũ.
  const handleCancelScan = () => {
    abortRef.current?.abort();
    setIsScanning(false);
    setPreviewUri(null);
  };

  // ══════════════════════════════════════════════════════════
  // QUÉT MÃ VẠCH
  //
  // Có BA lối vào: camera đọc được mã, đọc mã từ ảnh trong thư viện,
  // hoặc người dùng gõ tay dãy số. Cả ba đều dồn về doBarcodeLookup.
  // Xong thì sang màn Thêm món với dữ liệu đã điền sẵn.
  // ══════════════════════════════════════════════════════════

  // Camera phát hiện liên tục nên khóa sau lần gọi đầu tiên.
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (mode !== "barcode" || barcodeLockRef.current || isScanning || product) return;
    barcodeLockRef.current = true;
    doBarcodeLookup(result.data);
  };

  // Lối vào thứ hai của QUÉT MÃ VẠCH: đọc mã từ một ảnh trong thư viện.
  // Dùng khi mã trên bao bì mờ, chụp thẳng camera không bắt được.
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

  // Lối vào thứ ba của QUÉT MÃ VẠCH: người dùng gõ tay dãy số.
  const handleManualSubmit = (code: string) => {
    setManualVisible(false);
    doBarcodeLookup(code);
  };

  // MÃ VẠCH BƯỚC 1. Đã có dãy số mã vạch, đi tra sản phẩm.
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

  // MÃ VẠCH bước cuối. Người dùng bấm thêm sản phẩm tìm được vào nhật ký.
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

  // Hỏi Coach về sản phẩm vừa quét, ví dụ có hợp với bệnh nền không.
  // Chuyển sang tab Coach kèm sẵn câu hỏi, người dùng không phải gõ lại.
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

  // ══════════════════════════════════════════════════════════
  // DÙNG CHUNG CHO CẢ HAI LUỒNG
  //
  // Mấy việc mà cả quét ảnh lẫn quét mã vạch đều cần.
  // Không thuộc riêng luồng nào nên không đánh số bước.
  // ══════════════════════════════════════════════════════════

  // Mở thư viện ảnh của máy. Dùng chung cho cả quét ảnh lẫn quét mã vạch,
  // nên có tham số quality: quét ảnh nén 0.7 cho nhẹ, quét mã vạch để 1 cho nét.
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

  // Cửa ra chung của CẢ HAI luồng quét. Mở màn Thêm món với dữ liệu điền sẵn.
  // Dùng router.replace chứ không push, để bấm back từ màn Thêm món
  // sẽ về thẳng màn trước đó chứ không rơi ngược lại vào camera.
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

  // Bỏ quét, sang màn Thêm món để gõ tay tên món.
  // Dùng khi AI không nhận ra món, hoặc mã vạch không có trong kho dữ liệu.
  const handleManual = () => {
    setCandidates(null);
    setProduct(null);
    setPreviewUri(null);
    router.replace("/meals/add");
  };

  // Đổi giữa chế độ chụp ảnh và chế độ quét mã vạch.
  // Mở khóa barcodeLockRef vì khóa cũ thuộc về khung hình của chế độ trước.
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

  // Lớp phủ nằm trên camera. Dựng sẵn ở đây vì cả hai nhánh render bên dưới
  // đều dùng lại đúng lớp này, có quyền camera hay không cũng vậy.
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
      {/* CameraView không nhận component con. Lớp phủ phải là anh em nằm cạnh
          nó trong cùng một View, khai báo sau nên được vẽ chồng lên trên. */}
      {cameraGranted && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torchOn}
          barcodeScannerSettings={BARCODE_SETTINGS}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}
      {overlay}

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
