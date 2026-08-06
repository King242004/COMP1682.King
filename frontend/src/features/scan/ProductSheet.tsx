// ═══ FILE NÀY LÀM GÌ ═══
// Bảng trượt hiện sản phẩm tìm được sau khi quét mã vạch.
//
// Ai gọi tới: ScanScreen
// Nhận vào:   thông tin sản phẩm từ Open Food Facts
// Trả ra:     bảng cho xem và bấm Thêm vào nhật ký
// Khi lỗi:    không tìm thấy sản phẩm thì ScanScreen mời gõ tên món thay vì mở bảng này

import { Image, Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import type { Product } from "@/features/scan/scanApi";
import { ScanBottomSheet } from "./ScanBottomSheet";

export function ProductSheet({ visible, product, onAdd, onAskCoach, onClose }: {
  visible: boolean;
  product: Product | null;
  onAdd: (p: Product) => void;
  // Coach dùng tình trạng sức khỏe của người dùng để đánh giá sản phẩm.
  onAskCoach: (p: Product) => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <ScanBottomSheet visible={visible} title={t.scan.productFound} onClose={onClose}>
          {product && (
            <>
              <Card style={styles.card}>
                <View style={styles.productRow}>
                  <View style={styles.thumb}>
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.thumbImg} resizeMode="cover" />
                    ) : (
                      <AppText style={styles.thumbEmoji}>🛒</AppText>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <AppText variant="h2" style={styles.productName}>{product.name}</AppText>
                    {product.brand ? <AppText variant="muted" style={styles.brand}>{product.brand}</AppText> : null}
                    {product.servingSize ? <AppText variant="subtle" style={styles.serving}>{t.scan.perServing(product.servingSize)}</AppText> : null}
                  </View>
                </View>
                <View style={styles.macroStrip}>
                  {[
                    { label: t.common.kcal, value: product.calories, color: theme.colors.primary },
                    { label: "P", value: product.protein, color: theme.colors.accent2 },
                    { label: "C", value: product.carbs, color: theme.colors.accent },
                    { label: "F", value: product.fat, color: theme.colors.indigo },
                  ].map((m) => (
                    <View key={m.label} style={styles.macroCol}>
                    {/* Màu của từng chỉ số chỉ biết khi component đang chạy. */}
                      <AppText style={[styles.macroVal, { color: m.color }]}>{Math.round(m.value)}</AppText>
                      <AppText variant="subtle" style={styles.macroLabel}>{m.label}</AppText>
                    </View>
                  ))}
                </View>
              </Card>
              <View style={styles.actionWrap}>
                <Button title={t.scan.addToMeal} size="lg" onPress={() => onAdd(product)} />
                {/* Coach dùng tình trạng sức khỏe để đánh giá sản phẩm cụ thể này. */}
                <Pressable
                  onPress={() => onAskCoach(product)}
                  style={({ pressed }) => [styles.askBtn, pressed && styles.askBtnPressed]}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={17} color={theme.colors.primary} />
                  <AppText style={styles.askText}>{t.scan.suitsMe}</AppText>
                </Pressable>
              </View>
            </>
          )}
    </ScanBottomSheet>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.lg, gap: theme.space.md },
  productRow: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  thumb: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: "rgba(8,145,178,0.08)",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbEmoji: { fontSize: 28 },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 16 },
  brand: { fontSize: 13 },
  serving: { fontSize: 11 },
  macroStrip: {
    flexDirection: "row", justifyContent: "space-between",
    paddingTop: theme.space.sm, borderTopWidth: 0.5, borderTopColor: theme.colors.border,
  },
  macroCol: { alignItems: "center", gap: 2 },
  macroVal: { fontSize: 17, fontWeight: "800" },
  macroLabel: { fontSize: 11 },
  actionWrap: { marginTop: theme.space.lg, gap: theme.space.sm },
  askBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 13, borderRadius: theme.radius.button,
    backgroundColor: theme.colors.tint,
  },
  askBtnPressed: { backgroundColor: "rgba(8,145,178,0.18)" },
  askText: { fontSize: 14, fontWeight: "700", color: theme.colors.primary },
});
