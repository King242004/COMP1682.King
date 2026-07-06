import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useMeals, type Meal } from "@/context/MealsContext";
import { createPost } from "@/features/community/api";
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchMealHistory(); }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.profile.permissionNeeded, t.community.photoPermPost);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setImageUri(result.assets[0].uri);
  };

  const canPost = (caption.trim().length > 0 || imageUri || selectedMeal) && !posting;

  const handlePost = async () => {
    if (!token || !canPost) return;
    setPosting(true);
    try {
      await createPost(token, {
        caption: caption.trim(),
        imageUri,
        meal: selectedMeal
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

  // Show a handful of recent meals to optionally attach
  const recentMeals = historyMeals.slice(0, 8);

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

        {/* Image */}
        {imageUri ? (
          <View style={styles.imageBox}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <Pressable onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={pickImage}>
            <Card style={styles.addPhotoCard}>
              <Ionicons name="image-outline" size={32} color={theme.colors.subtle} />
              <AppText variant="muted">{t.community.addPhoto}</AppText>
            </Card>
          </Pressable>
        )}

        {/* Attach a meal */}
        <View style={styles.mealSection}>
          <AppText variant="subtle" style={styles.sectionLabel}>{t.community.attachMeal}</AppText>
          {recentMeals.length === 0 ? (
            <AppText variant="subtle" style={styles.noMeals}>{t.community.noLoggedMeals}</AppText>
          ) : (
            recentMeals.map((m) => {
              const active = selectedMeal?.id === m.id;
              return (
                <Pressable key={m.id} onPress={() => setSelectedMeal(active ? null : m)}>
                  <Card style={[styles.mealCard, active && styles.mealCardActive]}>
                    <View style={styles.mealIcon}>
                      <Ionicons name={active ? "checkmark" : "restaurant-outline"} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.mealInfo}>
                      <AppText variant="body2" style={styles.mealName}>{m.name}</AppText>
                      <AppText variant="subtle" style={styles.mealMeta}>{t.community.mealMeta(m.calories, m.date)}</AppText>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>

        <Button title={posting ? t.community.posting : t.community.post} size="lg" disabled={!canPost} onPress={handlePost} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg },
  captionCard: { padding: theme.space.lg },
  captionInput: { minHeight: 90, fontSize: 15, color: theme.colors.text, textAlignVertical: "top" },
  charCount: { fontSize: 11, textAlign: "right" },
  imageBox: { borderRadius: theme.radius.card, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1 },
  removeImageBtn: {
    position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 18, width: 36, height: 36, alignItems: "center", justifyContent: "center",
  },
  addPhotoCard: {
    padding: theme.space.xl, alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border,
  },
  mealSection: { gap: theme.space.sm },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  noMeals: { marginLeft: 4 },
  mealCard: {
    padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: "transparent",
  },
  mealCardActive: { borderColor: theme.colors.primary },
  mealIcon: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.tint,
    alignItems: "center", justifyContent: "center",
  },
  mealInfo: { flex: 1 },
  mealName: { fontWeight: "700" },
  mealMeta: { fontSize: 11 },
});
