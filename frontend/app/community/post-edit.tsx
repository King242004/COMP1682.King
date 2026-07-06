import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getPost, updatePost, type FeedPost } from "@/features/community/api";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function PostEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const t = useT();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [caption, setCaption] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null); // current server image, kept unless removed
  const [newImageUri, setNewImageUri] = useState<string | null>(null);      // freshly picked replacement
  const [keepMeal, setKeepMeal] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getPost(token, id)
      .then((p) => {
        setPost(p);
        setCaption(p.caption);
        setExistingImage(p.image);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [token, id]);

  const shownImage = newImageUri ?? existingImage;

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.community.photoPermChange);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setNewImageUri(result.assets[0].uri);
  };

  const removeImage = () => {
    setNewImageUri(null);
    setExistingImage(null);
  };

  // Post must keep something after the edit
  const hasMeal = !!post?.meal && keepMeal;
  const canSave = (caption.trim().length > 0 || shownImage || hasMeal) && !saving;

  const handleSave = async () => {
    if (!token || !id || !canSave) return;
    setSaving(true);
    try {
      await updatePost(token, id, {
        caption: caption.trim(),
        newImageUri,
        // clear on server only if there was an image and it's now gone (no replacement)
        removeImage: !newImageUri && !existingImage && !!post?.image,
        removeMeal: !!post?.meal && !keepMeal,
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
        <ScreenHeader title="Edit post" />

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

        {/* Image */}
        {shownImage ? (
          <View style={styles.imageBox}>
            <Image source={{ uri: shownImage }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageActions}>
              <Pressable onPress={pickImage} style={styles.imageActionBtn}>
                <Ionicons name="swap-horizontal" size={18} color="#fff" />
              </Pressable>
              <Pressable onPress={removeImage} style={styles.imageActionBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={pickImage}>
            <Card style={styles.addPhotoCard}>
              <Ionicons name="image-outline" size={32} color={theme.colors.subtle} />
              <AppText variant="muted">{t.community.addPhoto}</AppText>
            </Card>
          </Pressable>
        )}

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
  imageBox: { borderRadius: theme.radius.card, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  imageActions: { position: "absolute", top: 10, right: 10, flexDirection: "row", gap: 8 },
  imageActionBtn: {
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 18,
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
  },
  addPhotoCard: {
    padding: theme.space.xl, alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
  },
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
