import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { getPost, updatePost, type FeedPost } from "@/features/community/api";
import { PhotoPickerModal } from "@/features/community/PhotoPickerModal";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

// Edit = caption + attached meal + photos. Existing photos can be removed
// (keepUrls) and new ones added (picker), min 1 / max 10 like post-create.
export default function PostEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [caption, setCaption] = useState("");
  const [keepMeal, setKeepMeal] = useState(true);
  const [keepUrls, setKeepUrls] = useState<string[]>([]); // existing images kept
  const [newUris, setNewUris] = useState<string[]>([]);   // freshly picked, local
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getPost(token, id)
      .then((p) => {
        setPost(p);
        setCaption(p.caption);
        setKeepUrls(p.images || []);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [token, id]);

  const MAX_IMAGES = 10;
  const totalImages = keepUrls.length + newUris.length;

  // Photo-required rule: the post must keep at least one image after the edit
  const canSave = totalImages > 0 && !saving;

  const handleSave = async () => {
    if (!token || !id || !canSave) return;
    setSaving(true);
    try {
      await updatePost(token, id, {
        caption: caption.trim(),
        removeMeal: !!post?.meal && !keepMeal,
        keepUrls,
        newImageUris: newUris,
      });
      router.back(); // detail refetches on focus → shows the update
    } catch (e: any) {
      Alert.alert(t.community.couldntSave, e.message || t.common.tryAgain);
    } finally {
      setSaving(false);
    }
  };

  if (!post) {
    return (
      <Screen padded={false}>
        <View style={styles.stateBox}>
          <ScreenHeader title={t.community.editPost} />
          {loadError ? (
            <Card style={styles.errorCard}>
              <AppText variant="muted" style={styles.centerText}>{t.community.loadPostError}</AppText>
            </Card>
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t.community.editPost} />

        {/* Caption */}
        <Card style={styles.captionCard}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t.community.shareSomething}
            placeholderTextColor={theme.colors.subtle}
            multiline
            maxLength={500}
            style={styles.captionInput}
          />
          <AppText variant="subtle" style={styles.charCount}>{caption.length}/500</AppText>
        </Card>

        {/* Photos — same strip as post-create: ✕ per image + add tile */}
        <View style={styles.photoSection}>
          <AppText variant="subtle" style={styles.sectionLabel}>{t.community.photosLabel}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {keepUrls.map((uri) => (
              <View key={uri} style={styles.thumbBox}>
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                <Pressable
                  onPress={() => setKeepUrls((prev) => prev.filter((u) => u !== uri))}
                  hitSlop={6}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {newUris.map((uri) => (
              <View key={uri} style={styles.thumbBox}>
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                <Pressable
                  onPress={() => setNewUris((prev) => prev.filter((u) => u !== uri))}
                  hitSlop={6}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {totalImages < MAX_IMAGES && (
              <Pressable onPress={() => setPickerOpen(true)} style={styles.addThumb}>
                <Ionicons name="add" size={26} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.addThumbCount}>{totalImages}/{MAX_IMAGES}</AppText>
              </Pressable>
            )}
          </ScrollView>
          {totalImages === 0 && (
            <AppText variant="subtle" style={styles.photoRequiredHint}>{t.community.photoRequiredHint}</AppText>
          )}
        </View>

        {/* Attached meal — can be kept or removed (not re-picked here) */}
        {post.meal && (
          <View style={styles.mealSection}>
            <AppText variant="subtle" style={styles.sectionLabel}>{t.community.attachedMeal}</AppText>
            <Card style={[styles.mealCard, !keepMeal && styles.mealCardOff]}>
              <View style={styles.mealIcon}>
                <AppText style={styles.mealEmoji}>🍽️</AppText>
              </View>
              <View style={styles.mealInfo}>
                <AppText variant="body2" style={[styles.mealName, !keepMeal && styles.strike]}>{post.meal.name}</AppText>
                <AppText variant="subtle" style={styles.mealMeta}>{post.meal.calories} kcal</AppText>
              </View>
              <Pressable onPress={() => setKeepMeal((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={keepMeal ? "close-circle" : "add-circle"}
                  size={22}
                  color={keepMeal ? theme.colors.subtle : theme.colors.accent}
                />
              </Pressable>
            </Card>
          </View>
        )}

        <Button title={saving ? t.common.saving : t.community.saveChanges} size="lg" disabled={!canSave} onPress={handleSave} />
      </ScrollView>

      <PhotoPickerModal
        visible={pickerOpen}
        maxCount={MAX_IMAGES - totalImages}
        onClose={() => setPickerOpen(false)}
        onDone={(uris) => setNewUris((prev) => [...prev, ...uris].slice(0, MAX_IMAGES - keepUrls.length))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  stateBox: { paddingHorizontal: theme.space.lg, paddingTop: 60, gap: theme.space.lg },
  loadingBox: { paddingVertical: theme.space.xl, alignItems: "center" },
  errorCard: { padding: theme.space.xl, alignItems: "center" },
  centerText: { textAlign: "center" },
  captionCard: { padding: theme.space.lg },
  captionInput: { minHeight: 90, fontSize: 15, color: theme.colors.text, textAlignVertical: "top" },
  charCount: { fontSize: 11, textAlign: "right" },
  photoSection: { gap: theme.space.sm },
  thumbRow: { gap: theme.space.sm },
  thumbBox: { borderRadius: 12, overflow: "hidden" },
  thumb: { width: 90, height: 90 },
  removeImageBtn: {
    position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12, width: 24, height: 24, alignItems: "center", justifyContent: "center",
  },
  addThumb: {
    width: 90, height: 90, borderRadius: 12,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  addThumbCount: { fontSize: 11 },
  photoRequiredHint: { fontSize: 11, marginLeft: 4 },
  mealSection: { gap: theme.space.sm },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  mealCard: { padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 10 },
  mealCardOff: { opacity: 0.6 },
  mealIcon: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  mealEmoji: { fontSize: 18 },
  mealInfo: { flex: 1 },
  mealName: { fontWeight: "700" },
  strike: { textDecorationLine: "line-through" },
  mealMeta: { fontSize: 11 },
});
