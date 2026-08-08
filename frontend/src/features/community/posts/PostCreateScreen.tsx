// ═══ FILE NÀY LÀM GÌ ═══
// Màn Tạo bài đăng. File BẮT ĐẦU của luồng đăng bài.
//
// Ai gọi tới: CommunityScreen
// Nhận vào:   ảnh, lời chú thích, và món ăn nếu chọn loại bài món ăn
// Trả ra:     không trả gì, đăng xong thì quay lại danh sách bài
// Khi lỗi:    bài không có ảnh nào thì nút Đăng bị khóa

// Nhớ: món đính kèm chỉ lấy được TỪ NHẬT KÝ, không cho gõ tay.
//      Làm vậy để bài luôn mang theo khẩu phần và số dinh dưỡng mà chính
//      người đăng đã xác nhận, chứ không phải một con số gõ đại.
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMeals } from "@/features/meals/MealsContext";
import { createPost, MAX_POST_IMAGES } from "@/features/community/communityApi";
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

export default function PostCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { historyMeals, fetchMealHistory } = useMeals();
  const t = useT();

  const [caption, setCaption] = useState("");
  // Một bài viết được chọn tối đa 10 ảnh.
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<PostMealChoice | null>(null);
  const [posting, setPosting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ══════════════════════════════════════════════════════════
  // ĐĂNG BÀI
  //
  // Đến từ nút cộng ở màn Cộng đồng. Ba bước, đọc từ trên xuống là đúng thứ tự.
  // Hai chặng chờ mạng: BƯỚC 1 tải món cũ, và BƯỚC 3 đăng bài.
  // Xong thì quay về màn Cộng đồng, bài mới nằm ở đầu danh sách.
  // ══════════════════════════════════════════════════════════

  // ĐĂNG BÀI BƯỚC 1. Tải lịch sử món để hàng chọn món đính kèm có dữ liệu.
  // Đường đi: MealsContext.fetchMealHistory → mealsApi → apiClient
  //           → GET /meals/history → mealController.getMealHistory
  // Dùng useEffect nên chỉ chạy MỘT lần lúc mở màn, đủ dùng vì rời màn là màn dựng lại.
  useEffect(() => { void fetchMealHistory().catch(() => {}); }, [fetchMealHistory]);

  // ĐĂNG BÀI BƯỚC 2. Mở bộ chọn ảnh. Trần số ảnh do PhotoPickerModal lo,
  // ở đây chỉ bật cờ cho nó hiện lên.
  const pickImages = () => setPickerOpen(true);

  // Bỏ một ảnh khỏi danh sách. Ảnh chưa lên server nên chỉ cần lọc khỏi mảng.
  const removeImage = (uri: string) => setImageUris((prev) => prev.filter((u) => u !== uri));

  // Bài BẮT BUỘC phải có ảnh. Chưa chọn ảnh nào thì nút Đăng mờ đi.
  const canPost = imageUris.length > 0 && !posting;

  // Đính một món từ nhật ký vào bài. Món là tùy chọn, không có cũng đăng được.
  const selectMeal = (meal: PostMealChoice) => {
    setSelectedMeal(meal);
  };

  // ĐĂNG BÀI BƯỚC 3. Người dùng bấm Đăng.
  // Đường đi: createPost → apiClient → POST /community/posts
  //           → postController.createPost → Cloudinary
  // Gửi bằng FormData vì có kèm file ảnh.
  const handlePost = async () => {
    if (!token || !canPost) return;
    setPosting(true);
    try {
      await createPost(token, {
        caption: caption.trim(),
        imageUris,
        dishName: selectedMeal?.name ?? null,
        meal: selectedMeal
          ? {
              name: selectedMeal.name,
              calories: selectedMeal.calories,
              protein: selectedMeal.protein ?? 0,
              carbs: selectedMeal.carbs ?? 0,
              fat: selectedMeal.fat ?? 0,
              portionAmount: selectedMeal.portionAmount,
              portionUnit: selectedMeal.portionUnit,
              portionText: selectedMeal.portionText,
              nutritionSource: selectedMeal.nutritionSource,
            }
          : null,
      });
      router.back();
    } catch (error) {
      Alert.alert(t.community.couldntPost, getUserErrorMessage(error, t, t.common.tryAgain));
    } finally {
      setPosting(false);
    }
  };

  const recentMeals = recentUniqueMeals(historyMeals, 8);

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t.community.newPost} />

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
            {imageUris.length < MAX_POST_IMAGES && (
              <Pressable onPress={pickImages} style={styles.addThumb}>
                <Ionicons name="add" size={26} color={theme.colors.subtle} />
                <AppText variant="subtle" style={styles.addThumbCount}>{imageUris.length}/{MAX_POST_IMAGES}</AppText>
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

        <PostCaptionField value={caption} onChange={setCaption} />

        <PostMealSelector
          attached={!!selectedMeal}
          onRemove={() => setSelectedMeal(null)}
          recentMeals={recentMeals}
          selectedMeal={selectedMeal}
          onSelectMeal={selectMeal}
        />

        <Button title={posting ? t.community.posting : t.community.post} size="lg" disabled={!canPost} onPress={handlePost} />
      </ScrollView>

      <PhotoPickerModal
        visible={pickerOpen}
        maxCount={MAX_POST_IMAGES - imageUris.length}
        onClose={() => setPickerOpen(false)}
        onDone={(uris) => setImageUris((prev) => [...prev, ...uris].slice(0, MAX_POST_IMAGES))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
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
