// Bottom sheet with the Open Food Facts product found for a barcode.
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import type { Product } from "@/features/scan/api";

export function ProductSheet({ visible, product, onAdd, onClose }: {
  visible: boolean;
  product: Product | null;
  onAdd: (p: Product) => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <AppText variant="h2">{t.scan.productFound}</AppText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color={theme.colors.subtle} />
            </Pressable>
          </View>
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
                      {/* color known per item at runtime */}
                      <AppText style={[styles.macroVal, { color: m.color }]}>{Math.round(m.value)}</AppText>
                      <AppText variant="subtle" style={styles.macroLabel}>{m.label}</AppText>
                    </View>
                  ))}
                </View>
              </Card>
              <View style={styles.actionWrap}>
                <Button title={t.scan.addToMeal} size="lg" onPress={() => onAdd(product)} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg, paddingBottom: 40,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: "center", marginBottom: theme.space.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space.md },
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
  actionWrap: { marginTop: theme.space.lg },
});
