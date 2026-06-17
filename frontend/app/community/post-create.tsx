import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useMeals, type Meal } from "../context/MealsContext";
import { createPost } from "../utils/community";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Screen } from "../ui/components/Screen";

export default function PostCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { historyMeals, fetchMealHistory } = useMeals();

  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchMealHistory(); }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to add a photo.");
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
      router.replace("/tabs/community");
    } catch (e: any) {
      Alert.alert("Couldn't post", e.message || "Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // Show a handful of recent meals to optionally attach
  const recentMeals = historyMeals.slice(0, 8);

  return (
    <Screen padded={false} keyboard>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingTop: 60, paddingBottom: 40, gap: theme.space.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <AppText style={{ color: theme.colors.primary, fontWeight: "600" }}>Cancel</AppText>
          </Pressable>
          <AppText variant="h2">New post</AppText>
          <View style={{ width: 50 }} />
        </View>

        {/* Caption */}
        <Card style={{ padding: theme.space.lg }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Share something healthy..."
            placeholderTextColor={theme.colors.subtle}
            multiline
            maxLength={500}
            style={{ minHeight: 90, fontSize: 15, color: theme.colors.text, textAlignVertical: "top" }}
          />
          <AppText variant="subtle" style={{ fontSize: 11, textAlign: "right" }}>{caption.length}/500</AppText>
        </Card>

        {/* Image */}
        {imageUri ? (
          <View style={{ borderRadius: theme.radius.card, overflow: "hidden" }}>
            <Image source={{ uri: imageUri }} style={{ width: "100%", aspectRatio: 1 }} resizeMode="cover" />
            <Pressable
              onPress={() => setImageUri(null)}
              style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 18, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={pickImage}>
            <Card style={{ padding: theme.space.xl, alignItems: "center", gap: 8, borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.border }}>
              <Ionicons name="image-outline" size={32} color={theme.colors.subtle} />
              <AppText variant="muted">Add a photo</AppText>
            </Card>
          </Pressable>
        )}

        {/* Attach a meal */}
        <View style={{ gap: theme.space.sm }}>
          <AppText variant="subtle" style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 }}>
            Attach a meal (optional)
          </AppText>
          {recentMeals.length === 0 ? (
            <AppText variant="subtle" style={{ marginLeft: 4 }}>No logged meals yet.</AppText>
          ) : (
            recentMeals.map((m) => {
              const active = selectedMeal?.id === m.id;
              return (
                <Pressable key={m.id} onPress={() => setSelectedMeal(active ? null : m)}>
                  <Card style={{
                    padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: 10,
                    borderWidth: 1.5, borderColor: active ? theme.colors.primary : "transparent",
                  }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(37,99,235,0.08)", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={active ? "checkmark" : "restaurant-outline"} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="body2" style={{ fontWeight: "700" }}>{m.name}</AppText>
                      <AppText variant="subtle" style={{ fontSize: 11 }}>{m.calories} kcal · {m.date}</AppText>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>

        <Button title={posting ? "Posting..." : "Post"} size="lg" disabled={!canPost} onPress={handlePost} />
      </ScrollView>
    </Screen>
  );
}
