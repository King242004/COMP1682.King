import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useMeals } from "@/context/MealsContext";
import { createPost } from "@/features/community/api";
import { PhotoPickerModal } from "@/features/community/PhotoPickerModal";
import {
  PostMealSelector,
  type MealSource,
  type PostKind,
  type PostMealChoice,
} from "@/features/community/PostMealSelector";
import { recentUniqueMeals } from "@/utils/mealSlot";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Card } from "@/ui/components/Card";
import { Screen } from "@/ui/components/Screen";
import { ScreenHeader } from "@/ui/components/ScreenHeader";

export default function PostCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();

  const [caption, setCaption] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]); // Instagram-style, max 10
  const [postKind, setPostKind] = useState<PostKind>("share");
  const [mealSource, setMealSource] = useState<MealSource>("manual");
  const [dishName, setDishName] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<PostMealChoice | null>(null);
  const [posting, setPosting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => { fetchMealHistory(); }, [fetchMealHistory]);

  const MAX_IMAGES = 10; // Instagram-style carousel cap

  // In-app Instagram-style gallery grid; the modal compresses on confirm
  const pickImages = () => setPickerOpen(true);

  const removeImage = (uri: string) => setImageUris((prev) => prev.filter((u) => u !== uri));

  // Instagram rule: at least ONE photo is required — caption/meal are extras
  const hasValidDish = dishName.trim().length >= 2;
  const canPost = imageUris.length > 0 && (postKind === "share" || hasValidDish) && !posting;

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

  const handlePost = async () => {
    if (!token || !canPost) return;
    setPosting(true);
    try {
      await createPost(token, {
        caption: caption.trim(),
        imageUris,
        dishName: postKind === "meal" ? dishName.trim() : null,
        meal: postKind === "meal" && mealSource === "diary" && selectedMeal
          ? {
              name: selectedMeal.name,
              calories: selectedMeal.calories,
              protein: selectedMeal.protein ?? 0,
              carbs: selectedMeal.carbs ?? 0,
              fat: selectedMeal.fat ?? 0,
            }
          : null,
      });
      // Community tab refetches on focus, so simply going back shows the new post
      router.back();
    } catch (e: any) {
      Alert.alert(t.community.couldntPost, e.message || t.common.tryAgain);
    } finally {
      setPosting(false);
    }
  };

  // Show a handful of recent meals to optionally attach — one card per dish
  // name (the newest of each) so eating the same thing daily doesn't fill the
  // list with duplicates.
  const recentMeals = recentUniqueMeals(historyMeals, 8);

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t.community.newPost} />

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

        {/* Images — Instagram-style strip: thumbnails with a per-image ✕ and an
            "add more" tile while under the 10-image cap */}
        {imageUris.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {imageUris.map((uri) => (
              <View key={uri} style={styles.thumbBox}>
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                <Pressable onPress={() => removeImage(uri)} hitSlop={6} style={styles.removeImageBtn}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {imageUris.length < MAX_IMAGES && (
              <Pressable onPress={pickImages} style={styles.addThumb}>
                <Ionicons name="add" size={26} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.addThumbCount}>{imageUris.length}/{MAX_IMAGES}</AppText>
              </Pressable>
            )}
          </ScrollView>
        ) : (
          <Pressable onPress={pickImages}>
            <Card style={styles.addPhotoCard}>
              <Ionicons name="images-outline" size={32} color={theme.colors.subtle} />
              <AppText variant="muted">{t.community.addPhoto}</AppText>
              <AppText variant="subtle" style={styles.photoRequiredHint}>{t.community.photoRequiredHint}</AppText>
            </Card>
          </Pressable>
        )}

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

        <Button title={posting ? t.community.posting : t.community.post} size="lg" disabled={!canPost} onPress={handlePost} />
      </ScrollView>

      <PhotoPickerModal
        visible={pickerOpen}
        maxCount={MAX_IMAGES - imageUris.length}
        onClose={() => setPickerOpen(false)}
        onDone={(uris) => setImageUris((prev) => [...prev, ...uris].slice(0, MAX_IMAGES))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  captionCard: { padding: theme.space.lg },
  captionInput: { minHeight: 90, fontSize: 15, color: theme.colors.text, textAlignVertical: "top" },
  charCount: { fontSize: 11, textAlign: "right" },
  thumbRow: { gap: theme.space.sm },
  thumbBox: { borderRadius: 14, overflow: "hidden" },
  thumb: { width: 110, height: 110 },
  removeImageBtn: {
    position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12, width: 24, height: 24, alignItems: "center", justifyContent: "center",
  },
  addThumb: {
    width: 110, height: 110, borderRadius: 14,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  addThumbCount: { fontSize: 11 },
  photoRequiredHint: { fontSize: 11 },
  addPhotoCard: {
    padding: theme.space.xl, alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
  },
});
