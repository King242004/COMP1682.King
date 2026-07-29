import { StyleSheet } from "react-native";
import { AppText } from "./AppText";

export function SectionLabel({ children }: { children: string }) {
  return (
    <AppText variant="subtle" style={styles.label}>{children}</AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.6,
    marginBottom: -6, marginLeft: 4,
  },
});
