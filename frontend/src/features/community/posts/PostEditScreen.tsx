// Màn Sửa bài đăng. Chỉ chủ bài mới vào được.
// LUỒNG SỬA BÀI
// 1. Tải lại bài cần sửa, điền sẵn vào các ô
// 2. Sửa chú thích, đổi loại bài, thêm hoặc bớt ảnh
// 3. Bấm Lưu, api.updatePost                (PATCH /community/posts/:id)
// 4. backend cập nhật rồi trả bài mới
// HAI CÁCH GỬI, api.updatePost tự chọn
//   Không thêm ảnh mới thì gửi JSON thường cho nhẹ.
//   Có thêm ảnh mới thì gửi kèm file, và gửi thêm keepUrls là danh sách
//     ảnh cũ muốn giữ. Ảnh cũ nào không nằm trong danh sách đó
//     sẽ bị backend xóa khỏi kho ảnh.
import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { getPost, MAX_POST_IMAGES, updatePost, type FeedPost } from "@/features/community/communityApi";
import { PhotoPickerModal } from "@/features/community/posts/PhotoPickerModal";
import { PostCaptionField } from "@/features/community/posts/PostCaptionField";
import { PostMealSelector, type PostMealChoice } from "@/features/community/posts/PostMealSelector";
import { recentUniqueMeals } from "@/features/meals/mealHelpers";
import { useT } from "@/i18n";
import { getUserErrorMessage } from "@/utils/errorUtils";
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
  const [legacyDishName, setLegacyDishName] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<PostMealChoice | null>(null);
  // Các ảnh cũ mà người dùng muốn giữ lại.
  const [keepUrls, setKeepUrls] = useState<string[]>([]);
  // Các ảnh mới vừa chọn trên thiết bị.
  const [newUris, setNewUris] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tải bài cần sửa rồi điền sẵn vào các ô.
  useEffect(() => {
    void fetchMealHistory().catch(() => {});
  }, [fetchMealHistory]);

  // Đồng bộ danh sách ảnh vào state khi bài đã tải xong.
  useEffect(() => {
    if (!token || !id) return;
    getPost(token, id)
      .then((p) => {
        setPost(p);
        setCaption(p.caption);
        setKeepUrls(p.images || []);
        const initialDishName = p.dishName || p.meal?.name || "";
        if (p.meal) {
          setSelectedMeal({ id: `attached-${p.id}`, ...p.meal });
          setLegacyDishName("");
        } else {
          setSelectedMeal(null);
          setLegacyDishName(initialDishName);
        }
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  }, [token, id]);

  const totalImages = keepUrls.length + newUris.length;
  const recentMeals = recentUniqueMeals(historyMeals, 8);

  const canSave = totalImages > 0 && !saving;

  const removeAttachedMeal = () => {
    setLegacyDishName("");
    setSelectedMeal(null);
  };

  const selectMeal = (meal: PostMealChoice) => {
    setSelectedMeal(meal);
    setLegacyDishName("");
  };

  // Nút Lưu của màn sửa bài.
  const handleSave = async () => {
    if (!token || !id || !canSave) return;
    setSaving(true);
    try {
      await updatePost(token, id, {
        caption: caption.trim(),
        dishName: selectedMeal?.name || legacyDishName || null,
        meal: selectedMeal,
        removeDish: !selectedMeal && !legacyDishName,
        removeMeal: !selectedMeal,
        keepUrls,
        newImageUris: newUris,
      });
      // Màn chi tiết sẽ tự tải lại bài viết khi được mở lại.
      router.back();
    } catch (error) {
      Alert.alert(t.community.couldntSave, getUserErrorMessage(error, t, t.common.tryAgain));
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
            {totalImages < MAX_POST_IMAGES && (
              <Pressable onPress={() => setPickerOpen(true)} style={styles.addThumb}>
                <Ionicons name="add" size={26} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.addThumbCount}>{totalImages}/{MAX_POST_IMAGES}</AppText>
              </Pressable>
            )}
          </ScrollView>
          {totalImages === 0 && (
            <AppText variant="subtle" style={styles.photoRequiredHint}>{t.community.photoRequiredHint}</AppText>
          )}
        </View>

        <PostCaptionField value={caption} onChange={setCaption} />

        <PostMealSelector
          attached={!!selectedMeal || !!legacyDishName}
          legacyDishName={legacyDishName}
          onRemove={removeAttachedMeal}
          recentMeals={recentMeals}
          selectedMeal={selectedMeal}
          onSelectMeal={selectMeal}
        />

        <Button title={saving ? t.common.saving : t.community.saveChanges} size="lg" disabled={!canSave} onPress={handleSave} />
      </ScrollView>

      <PhotoPickerModal
        visible={pickerOpen}
        maxCount={MAX_POST_IMAGES - totalImages}
        onClose={() => setPickerOpen(false)}
        onDone={(uris) => setNewUris((prev) => [...prev, ...uris].slice(0, MAX_POST_IMAGES - keepUrls.length))}
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
