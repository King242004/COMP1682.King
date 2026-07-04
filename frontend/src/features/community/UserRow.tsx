import { Image, Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";
import { GOAL_LABEL, initials } from "./helpers";
import type { DiscoverUser } from "./api";

// One user row in Discover: avatar + name/goal + Follow toggle button.
export function UserRow({
  user,
  following,
  onPress,
  onToggleFollow,
}: {
  user: DiscoverUser;
  following: boolean;
  onPress: () => void;
  onToggleFollow: () => void;
}) {
  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.userArea}>
        <View style={styles.avatar}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
          ) : (
            <AppText style={styles.avatarInitials}>{initials(user.name)}</AppText>
          )}
        </View>
        <View style={styles.info}>
          <AppText variant="body2" style={styles.name}>{user.name}</AppText>
          <AppText variant="subtle" style={styles.meta}>
            {user.sameGoal ? "🎯 Same goal · " : ""}
            {GOAL_LABEL[user.goal] ?? user.goal}
            {typeof user.followers === "number" && user.followers > 0 ? ` · ${user.followers} followers` : ""}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        onPress={onToggleFollow}
        style={({ pressed }) => [
          styles.followBtn,
          following && styles.followBtnActive,
          pressed && styles.pressed,
        ]}
      >
        <AppText style={[styles.followText, following && styles.followTextActive]}>
          {following ? "Following" : "Follow"}
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 12 },
  userArea: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 46, height: 46, borderRadius: 16, overflow: "hidden",
    backgroundColor: theme.colors.tint, alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: { color: theme.colors.primary, fontWeight: "700" },
  info: { flex: 1, gap: 2 },
  name: { fontWeight: "700" },
  meta: { fontSize: 11 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  followBtnActive: { backgroundColor: theme.colors.tint },
  followText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  followTextActive: { color: theme.colors.primary },
  pressed: { opacity: 0.7 },
});
