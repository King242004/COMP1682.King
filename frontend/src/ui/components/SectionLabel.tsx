import { StyleSheet } from "react-native";
import { AppText } from "./AppText";

// Small uppercase label above a settings/profile card section.
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
