import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { getPost, updatePost, type FeedPost } from "@/features/community/api";
import { PhotoPickerModal } from "@/features/community/PhotoPickerModal";
import {
  PostMealSelector,
  type MealSource,
  type PostKind,
  type PostMealChoice,
} from "@/features/community/PostMealSelector";
import { recentUniqueMeals } from "@/utils/meals/mealSlot";
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
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [caption, setCaption] = useState("");
  const [postKind, setPostKind] = useState<PostKind>("share");
  const [mealSource, setMealSource] = useState<MealSource>("manual");
  const [dishName, setDishName] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<PostMealChoice | null>(null);
  // Các ảnh cũ mà người dùng muốn giữ lại.
  const [keepUrls, setKeepUrls] = useState<string[]>([]);
  // Các ảnh mới vừa chọn trên thiết bị.
  const [newUris, setNewUris] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMealHistory();
  }, [fetchMealHistory]);

  useEffect(() => {
    if (!token || !id) return;
    getPost(token, id)
      .then((p) => {
        setPost(p);
        setCaption(p.caption);
        setKeepUrls(p.images || []);
        const initialDishName = p.dishName || p.meal?.name || "";
        setPostKind(initialDishName ? "meal" : "share");
        setDishName(initialDishName);
        if (p.meal) {
          setMealSource("diary");
          setSelectedMeal({ id: `attached-${p.id}`, ...p.meal });
        } else {
          setMealSource("manual");
          setSelectedMeal(null);
        }
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [token, id]);

  const MAX_IMAGES = 10;
  const totalImages = keepUrls.length + newUris.length;
  const recentMeals = recentUniqueMeals(historyMeals, 8);

  const hasValidDish = dishName.trim().length >= 2;
  const canSave = totalImages > 0 && (postKind === "share" || hasValidDish) && !saving;

  const changeMealSource = (source: MealSource) => {
    setMealSource(source);
    if (source === "manual") {
      if (selectedMeal) setDishName(selectedMeal.name);
      setSelectedMeal(null);
    } else {
      setDishName(selectedMeal?.name || "");
    }
  };

  const selectMeal = (meal: PostMealChoice) => {
    setSelectedMeal(meal);
    setDishName(meal.name);
  };

  const handleSave = async () => {
    if (!token || !id || !canSave) return;
    setSaving(true);
    try {
      await updatePost(token, id, {
        caption: caption.trim(),
        dishName: postKind === "meal" ? dishName.trim() : null,
        meal: postKind === "meal" && mealSource === "diary" ? selectedMeal : null,
        removeDish: postKind === "share",
        removeMeal: postKind === "share" || mealSource === "manual" || !selectedMeal,
        keepUrls,
        newImageUris: newUris,
      });
      // Màn chi tiết sẽ tự tải lại bài viết khi được mở lại.
      router.back();
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

        <PostMealSelector
          kind={postKind}
          onKindChange={setPostKind}
          source={mealSource}
          onSourceChange={changeMealSource}
          dishName={dishName}
          onDishNameChange={setDishName}
          recentMeals={recentMeals}
          selectedMeal={selectedMeal}
          onSelectMeal={selectMeal}
        />

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
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
});
