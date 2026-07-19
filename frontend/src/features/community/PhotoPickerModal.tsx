import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable,
  StyleSheet, View, useWindowDimensions,
} from "react-native";
// expo-image renders iOS ph:// asset URIs, which plain RN <Image> cannot
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { compressImage } from "@/features/scan/api";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { ActionSheet, type ActionItem } from "@/ui/components/ActionSheet";

// Instagram-style in-app photo picker: interactive square crop preview on top
// (pan + pinch, 3x3 grid while touching, each photo remembers its own framing),
// 4-column gallery grid below, ordered multi-select badges, album switcher,
// camera tile. On confirm every selected photo is cropped to its framed square
// (untouched photos get the default center crop), resized and compressed.
// Falls back to the system picker on web or when library access is denied.

type GridItem = { kind: "camera" } | { kind: "asset"; asset: MediaLibrary.Asset };
type Selected = { key: string; uri: string; assetId?: string; width: number; height: number };
type Framing = { tx: number; ty: number; scale: number };

const PAGE_SIZE = 60;
const MAX_ZOOM = 3;

function clampW(v: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, v));
}

export function PhotoPickerModal({
  visible,
  maxCount,
  onClose,
  onDone,
}: {
  visible: boolean;
  maxCount: number;
  onClose: () => void;
  onDone: (uris: string[]) => void;
}) {
  const t = useT();
  const { width } = useWindowDimensions();
  const tileSize = width / 4;

  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(true);
  const [album, setAlbum] = useState<MediaLibrary.Album | null>(null);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [albumSheetOpen, setAlbumSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [preview, setPreview] = useState<Selected | null>(null);
  const [processing, setProcessing] = useState(false);
  const loadingRef = useRef(false);
  // Per-photo framing (keyed like selection); survives preview switches
  const framingsRef = useRef<Record<string, Framing>>({});

  // ── Crop gesture state (reanimated) ──────────────────────────────────────
  // The photo is laid out at cover size (baseW x baseH) centered in the square
  // window, then user-transformed. Translation is clamped so the window always
  // stays fully covered; zoom is clamped to [1, MAX_ZOOM].
  const baseW = useSharedValue(0);
  const baseH = useSharedValue(0);
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const gridOn = useSharedValue(0);

  const saveFraming = useCallback((key: string, f: Framing) => {
    framingsRef.current[key] = f;
  }, []);

  // Load (or reset) the transform whenever the previewed photo changes
  useEffect(() => {
    if (!preview) return;
    const cover = Math.max(width / preview.width, width / preview.height);
    baseW.value = preview.width * cover;
    baseH.value = preview.height * cover;
    const f = framingsRef.current[preview.key] || { tx: 0, ty: 0, scale: 1 };
    scale.value = f.scale; savedScale.value = f.scale;
    tx.value = f.tx; savedTx.value = f.tx;
    ty.value = f.ty; savedTy.value = f.ty;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, width]);

  const previewKey = preview?.key;
  const endGesture = useCallback(() => {
    if (previewKey) saveFraming(previewKey, { tx: tx.value, ty: ty.value, scale: scale.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, saveFraming]);

  const pan = Gesture.Pan()
    .onStart(() => { gridOn.value = withTiming(1, { duration: 120 }); })
    .onUpdate((e) => {
      const maxX = Math.max(0, (baseW.value * scale.value - width) / 2);
      const maxY = Math.max(0, (baseH.value * scale.value - width) / 2);
      tx.value = clampW(savedTx.value + e.translationX, -maxX, maxX);
      ty.value = clampW(savedTy.value + e.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedTx.value = tx.value; savedTy.value = ty.value;
      gridOn.value = withTiming(0, { duration: 250 });
      runOnJS(endGesture)();
    });

  const pinch = Gesture.Pinch()
    .onStart(() => { gridOn.value = withTiming(1, { duration: 120 }); })
    .onUpdate((e) => {
      scale.value = clampW(savedScale.value * e.scale, 1, MAX_ZOOM);
      // Re-clamp translation for the new zoom so edges never show
      const maxX = Math.max(0, (baseW.value * scale.value - width) / 2);
      const maxY = Math.max(0, (baseH.value * scale.value - width) / 2);
      tx.value = clampW(tx.value, -maxX, maxX);
      ty.value = clampW(ty.value, -maxY, maxY);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTx.value = tx.value; savedTy.value = ty.value;
      gridOn.value = withTiming(0, { duration: 250 });
      runOnJS(endGesture)();
    });

  const cropGesture = Gesture.Simultaneous(pan, pinch);

  const photoStyle = useAnimatedStyle(() => ({
    width: baseW.value,
    height: baseH.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));
  const gridStyle = useAnimatedStyle(() => ({ opacity: gridOn.value }));

  // ── Library loading ──────────────────────────────────────────────────────
  // System picker fallback keeps the feature working without library access
  const fallbackSystemPicker = useCallback(async () => {
    onClose();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
    });
    if (result.canceled || !result.assets?.length) return;
    const uris = await Promise.all(result.assets.slice(0, maxCount).map((a) => compressImage(a.uri)));
    onDone(uris);
  }, [maxCount, onClose, onDone]);

  const loadAssets = useCallback(async (target: MediaLibrary.Album | null, after?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: PAGE_SIZE,
        after,
        album: target ?? undefined,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setAssets((prev) => (after ? [...prev, ...page.assets] : page.assets));
      setCursor(page.endCursor);
      setHasNext(page.hasNextPage);
      if (!after && page.assets[0]) {
        const a = page.assets[0];
        setPreview((p) => p ?? { key: a.id, uri: a.uri, assetId: a.id, width: a.width, height: a.height });
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // On open: permission gate, then first page + album list
  useEffect(() => {
    if (!visible) return;
    (async () => {
      if (Platform.OS === "web") { await fallbackSystemPicker(); return; }
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted && perm.accessPrivileges !== "limited") {
        await fallbackSystemPicker();
        return;
      }
      await loadAssets(null);
      const all = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      setAlbums(
        all
          .filter((a) => a.assetCount > 0)
          .sort((a, b) => b.assetCount - a.assetCount)
          .slice(0, 15)
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const switchAlbum = (target: MediaLibrary.Album | null) => {
    setAlbum(target);
    setAssets([]);
    setCursor(undefined);
    setHasNext(true);
    setPreview(null);
    loadAssets(target);
  };

  const toggleSelect = (item: Selected) => {
    setPreview(item);
    setSelected((prev) => {
      const idx = prev.findIndex((s) => s.key === item.key);
      if (idx >= 0) return prev.filter((s) => s.key !== item.key);
      if (prev.length >= maxCount) {
        Alert.alert(t.community.pickerMax(maxCount));
        return prev;
      }
      return [...prev, item];
    });
  };

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.scan.cameraDenied, t.scan.cameraDeniedMsg);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const a = result.assets[0];
    toggleSelect({ key: a.uri, uri: a.uri, width: a.width || 0, height: a.height || 0 });
  };

  // ── Confirm: bake each framing into a real square crop, then compress ────
  const finish = async () => {
    if (selected.length === 0 || processing) return;
    setProcessing(true);
    try {
      const uris: string[] = [];
      for (const s of selected) {
        let uri = s.uri;
        // ph:// asset URIs need their file:// counterpart before manipulation
        if (s.assetId) {
          try {
            const info = await MediaLibrary.getAssetInfoAsync(s.assetId);
            uri = info.localUri || uri;
          } catch {}
        }

        const actions: ImageManipulator.Action[] = [];
        if (s.width > 0 && s.height > 0) {
          // Map the framed window back to original-pixel coordinates
          const f = framingsRef.current[s.key] || { tx: 0, ty: 0, scale: 1 };
          const cover = Math.max(width / s.width, width / s.height);
          const S = cover * f.scale;
          const dispW = s.width * S;
          const dispH = s.height * S;
          const originXScreen = width / 2 + f.tx - dispW / 2; // image left edge on screen
          const originYScreen = width / 2 + f.ty - dispH / 2;
          let size = Math.floor(width / S);
          size = Math.min(size, s.width, s.height);
          let cropX = Math.round(-originXScreen / S);
          let cropY = Math.round(-originYScreen / S);
          cropX = Math.min(Math.max(0, cropX), s.width - size);
          cropY = Math.min(Math.max(0, cropY), s.height - size);
          if (size > 0) actions.push({ crop: { originX: cropX, originY: cropY, width: size, height: size } });
        }
        actions.push({ resize: { width: 1024 } });

        try {
          const out = await ImageManipulator.manipulateAsync(uri, actions, {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
          });
          uris.push(out.uri);
        } catch {
          // Crop failed (odd EXIF/dims) → fall back to plain compression
          uris.push(await compressImage(uri));
        }
      }
      reset();
      onClose();
      onDone(uris);
    } finally {
      setProcessing(false);
    }
  };

  // Fresh state for the next open (album + preview reset with the framings,
  // otherwise the preview shows a framing that will no longer be applied)
  const reset = () => {
    setSelected([]);
    framingsRef.current = {};
    setAlbum(null);
    setPreview(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const gridData: GridItem[] = [{ kind: "camera" }, ...assets.map((asset) => ({ kind: "asset" as const, asset }))];

  const albumItems: ActionItem[] = [
    { label: t.community.pickerRecents, icon: "time-outline", onPress: () => switchAlbum(null) },
    ...albums.map((a): ActionItem => ({
      label: `${a.title} (${a.assetCount})`,
      icon: "images-outline",
      onPress: () => switchAlbum(a),
    })),
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      {/* Gestures inside a Modal need their own gesture-handler root */}
      <GestureHandlerRootView style={styles.flex1}>
        <View style={styles.root}>
          {/* Header: ✕ | album switcher | Done(n) */}
          <View style={styles.header}>
            <Pressable onPress={close} hitSlop={10} accessibilityLabel={t.common.cancel}>
              <Ionicons name="close" size={26} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => setAlbumSheetOpen(true)} style={styles.albumBtn} hitSlop={8}>
              <AppText style={styles.albumLabel} numberOfLines={1}>
                {album ? album.title : t.community.pickerRecents}
              </AppText>
              <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={finish} hitSlop={10} disabled={selected.length === 0}>
              <AppText style={[styles.doneLabel, selected.length === 0 && styles.doneDisabled]}>
                {t.community.pickerDone}{selected.length > 0 ? ` (${selected.length})` : ""}
              </AppText>
            </Pressable>
          </View>

          {/* Square crop window: pan + pinch to frame, 3x3 grid while touching */}
          {preview && (
            <GestureDetector gesture={cropGesture}>
              <View style={[styles.cropWindow, { width, height: width }]}>
                <Animated.View style={photoStyle}>
                  <Image source={{ uri: preview.uri }} style={styles.flex1} contentFit="cover" />
                </Animated.View>
                <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, gridStyle]}>
                  <View style={[styles.gridLineV, styles.gridV1]} />
                  <View style={[styles.gridLineV, styles.gridV2]} />
                  <View style={[styles.gridLineH, styles.gridH1]} />
                  <View style={[styles.gridLineH, styles.gridH2]} />
                </Animated.View>
              </View>
            </GestureDetector>
          )}

          <FlatList
            data={gridData}
            numColumns={4}
            keyExtractor={(item) => (item.kind === "camera" ? "__camera__" : item.asset.id)}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <AppText variant="muted">{t.community.pickerEmpty}</AppText>
              </View>
            }
            onEndReached={() => { if (hasNext && cursor) loadAssets(album, cursor); }}
            onEndReachedThreshold={2}
            renderItem={({ item }) => {
              if (item.kind === "camera") {
                return (
                  <Pressable onPress={openCamera} style={[styles.cameraTile, { width: tileSize, height: tileSize }]}>
                    <Ionicons name="camera-outline" size={28} color={theme.colors.subtle} />
                  </Pressable>
                );
              }
              const order = selected.findIndex((s) => s.key === item.asset.id);
              const isSelected = order >= 0;
              return (
                <Pressable
                  onPress={() => toggleSelect({
                    key: item.asset.id,
                    uri: item.asset.uri,
                    assetId: item.asset.id,
                    width: item.asset.width,
                    height: item.asset.height,
                  })}
                  style={{ width: tileSize, height: tileSize, padding: 0.5 }}
                >
                  <Image source={{ uri: item.asset.uri }} style={styles.tileImg} />
                  {isSelected && <View style={styles.tileDim} />}
                  <View style={[styles.orderBadge, isSelected && styles.orderBadgeOn]}>
                    {isSelected && <AppText style={styles.orderText}>{order + 1}</AppText>}
                  </View>
                </Pressable>
              );
            }}
          />

          {/* Blocking overlay while selected photos are cropped + compressed */}
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#fff" size="large" />
              <AppText style={styles.processingText}>{t.community.pickerProcessing}</AppText>
            </View>
          )}

          <ActionSheet visible={albumSheetOpen} onClose={() => setAlbumSheetOpen(false)} items={albumItems} />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  root: { flex: 1, backgroundColor: theme.colors.surface, paddingTop: 54 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: theme.space.lg, paddingBottom: theme.space.sm, gap: theme.space.md,
  },
  albumBtn: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  albumLabel: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  doneLabel: { fontSize: 15, fontWeight: "700", color: theme.colors.primary },
  doneDisabled: { color: theme.colors.subtle },
  cropWindow: {
    overflow: "hidden", backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(90,90,90,0.7)" },
  gridV1: { left: "33.33%" },
  gridV2: { left: "66.66%" },
  gridLineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(90,90,90,0.7)" },
  gridH1: { top: "33.33%" },
  gridH2: { top: "66.66%" },
  emptyBox: { padding: theme.space.xl, alignItems: "center" },
  cameraTile: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: theme.colors.tintSoft,
    borderWidth: 0.5, borderColor: theme.colors.border,
  },
  tileImg: { width: "100%", height: "100%" },
  tileDim: { ...StyleSheet.absoluteFillObject, margin: 0.5, backgroundColor: "rgba(255,255,255,0.45)" },
  orderBadge: {
    position: "absolute", top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: "#fff",
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  orderBadgeOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  orderText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  processingText: { color: "#fff", fontWeight: "600" },
});
