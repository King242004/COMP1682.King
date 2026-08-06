// Lớp phủ camera gồm thanh đầu, chọn chế độ, khung ngắm và nút điều khiển dưới.
// Tách riêng khỏi ScanScreen để màn đó chỉ lo phần gọi mạng và xử lý dữ liệu.
import { ActivityIndicator, Linking, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import type { ScanMode } from "@/features/scan/scanApi";

export function ScanOverlay({
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
  const t = useT();
  const isBarcode = mode === "barcode";
  const { width, height } = useWindowDimensions();
  // Chiều rộng vùng nhìn rõ để quét.
  const frameW = width - 72;
  // Cả hai chế độ dùng chung một khung quét dọc.
  const frameH = frameW * 1.45;
  // Canh vùng quét vào giữa theo chiều dọc.
  const frameTop = (height - frameH) / 2;
  // Bán kính góc bên trong của vùng quét.
  const R = 28;
  // Viền phải đủ dày để phủ kín phần còn lại của màn hình.
  const BIG = Math.max(width, height);

  // Nút biểu tượng tròn nhỏ dùng ở hàng dưới.
  const IconBtn = ({ icon, onPress, active }: { icon: any; onPress: () => void; active?: boolean }) => (
    <Pressable
      onPress={onPress}
      disabled={isScanning}
      style={({ pressed }) => [
        styles.iconBtn,
        active && styles.iconBtnActive,
        (pressed || isScanning) && styles.dim,
      ]}
    >
      <Ionicons name={icon} size={24} color={active ? theme.colors.primary : "#fff"} />
    </Pressable>
  );

  // Nút biểu tượng không nền ở thanh đầu, dùng để quay lại hoặc đổi camera.
  const TopBtn = ({ icon, onPress }: { icon: any; onPress: () => void }) => (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [styles.topBtn, pressed && styles.dim]}>
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );

  return (
    <View style={styles.flex1}>
      {cameraGranted && (
        <>
          <View
            pointerEvents="none"
            style={[styles.dimDonut, {
              top: frameTop - BIG,
              left: 36 - BIG,
              width: frameW + BIG * 2,
              height: frameH + BIG * 2,
              borderWidth: BIG,
              borderRadius: BIG + R,
            }]}
          />
          {/* Viền trắng nằm trên mép khung trong suốt. */}
          <View
            pointerEvents="none"
            style={[styles.frameLine, { top: frameTop, width: frameW, height: frameH, borderRadius: R }]}
          />
        </>
      )}

      {/* Lớp nút điều khiển nằm trên phần làm tối. */}
      <View style={styles.flex1}>
        {/* Thanh đầu gồm nút quay lại, tiêu đề và đổi camera ở chế độ ảnh. */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TopBtn icon="chevron-back" onPress={onClose} />
            <AppText style={styles.title}>{isBarcode ? t.scan.scanBarcode : t.scan.scanMeal}</AppText>
          </View>
          {cameraGranted && !isBarcode ? (
            <TopBtn icon="camera-reverse-outline" onPress={onFlipCamera} />
          ) : (
            <View style={styles.topBtnSpacer} />
          )}
        </View>

        {/* Chuyển giữa chế độ Ảnh và Mã vạch. */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggle}>
            {([["photo", t.scan.photo], ["barcode", t.scan.barcode]] as [ScanMode, string][]).map(([key, label]) => {
              const active = mode === key;
              return (
                <Pressable key={key} onPress={() => onSwitchMode(key)} style={[styles.toggleBtn, active && styles.toggleBtnActive]}>
                  <Ionicons
                    name={key === "photo" ? "camera" : "barcode-outline"}
                    size={15}
                    color={active ? theme.colors.primary : "#fff"}
                  />
                  <AppText style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Phần giữa hiện hướng dẫn trên khung hoặc thông báo quyền camera. */}
        <View style={styles.middle}>
          {!cameraGranted ? (
            <View style={styles.permBlock}>
              <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.5)" />
              <AppText style={styles.permTitle}>{t.scan.cameraNotEnabled}</AppText>
              <AppText style={styles.permText}>
                {isBarcode ? t.scan.camOffBarcode : t.scan.camOffPhoto}
              </AppText>
              <Pressable
                onPress={() => Linking.openSettings()}
                style={({ pressed }) => [styles.settingsBtn, pressed && styles.dim]}
              >
                <Ionicons name="settings-outline" size={15} color="#fff" />
                <AppText style={styles.settingsBtnText}>{t.scan.openSettings}</AppText>
              </Pressable>
            </View>
          ) : (
            // marginBottom được tính khi chạy để lời nhắc nằm gần mép trên khung.
            <View style={[styles.hintPill, { marginBottom: frameH - 56 }]}>
              <AppText style={styles.hintText}>
                {isBarcode ? t.scan.pointBarcode : t.scan.pointMeal}
              </AppText>
            </View>
          )}
        </View>

        {/* Các nút điều khiển phía dưới. */}
        <View style={styles.bottom}>
          {isBarcode ? (
            // Chế độ mã vạch tự quét trực tiếp, nút giữa dùng để nhập mã thủ công.
            <>
              <AppText style={styles.bottomHint}>{t.scan.holdSteady}</AppText>
              <View style={styles.controlRow}>
                <IconBtn icon="images-outline" onPress={onLibrary} />
                <Pressable
                  onPress={onManualBarcode}
                  disabled={isScanning}
                  style={({ pressed }) => [styles.mainBtn, (pressed || isScanning) && styles.mainBtnPressed, isScanning && styles.dim]}
                >
                  <Ionicons name="keypad" size={28} color={theme.colors.primary} />
                </Pressable>
                <IconBtn icon={torchOn ? "flash" : "flash-off"} onPress={onToggleFlash} active={torchOn} />
              </View>
            </>
          ) : (
            // Chế độ ảnh: thư viện bên trái, chụp ở giữa và đèn flash bên phải.
            <>
              <AppText style={styles.bottomHint}>{t.scan.photoHint}</AppText>
              <View style={styles.controlRow}>
                <IconBtn icon="images-outline" onPress={onLibrary} />
                <Pressable
                  onPress={onCapture}
                  disabled={isScanning}
                  style={({ pressed }) => [styles.mainBtn, (pressed || isScanning) && styles.mainBtnPressed]}
                >
                  {isScanning ? (
                    <ActivityIndicator color={theme.colors.primary} size="small" />
                  ) : (
                    <View style={styles.shutterCore} />
                  )}
                </Pressable>
                <IconBtn icon={torchOn ? "flash" : "flash-off"} onPress={onToggleFlash} active={torchOn} />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// Màu làm tối khu vực nằm ngoài khung quét.
const DIM = "rgba(0,0,0,0.72)";

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  dim: { opacity: 0.5 },

  dimDonut: { position: "absolute", borderColor: DIM },
  frameLine: {
    position: "absolute", left: 36,
    borderWidth: 2.5, borderColor: "rgba(255,255,255,0.9)",
  },

  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: theme.space.lg, paddingTop: 56, paddingBottom: theme.space.md,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  topBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topBtnSpacer: { width: 40 },
  title: { color: "#fff", fontWeight: "700", fontSize: 18 },

  toggleWrap: { alignItems: "center", paddingBottom: theme.space.md },
  toggle: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 99, padding: 4 },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99,
  },
  toggleBtnActive: { backgroundColor: "#fff" },
  toggleText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  toggleTextActive: { color: theme.colors.primary },

  middle: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space.lg },
  permBlock: { alignItems: "center", gap: 12 },
  permTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  permText: { color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center" },
  settingsBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 4, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 99, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
  },
  settingsBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  hintPill: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 99,
  },
  hintText: { color: "#fff", fontSize: 13, textAlign: "center" },

  bottom: { paddingBottom: 60, paddingHorizontal: theme.space.lg, alignItems: "center", gap: theme.space.lg },
  bottomHint: { color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" },
  controlRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%" },
  iconBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  iconBtnActive: { backgroundColor: "#fff" },
  mainBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "rgba(255,255,255,0.4)",
  },
  mainBtnPressed: { backgroundColor: "rgba(255,255,255,0.7)" },
  shutterCore: { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.primary },
});
