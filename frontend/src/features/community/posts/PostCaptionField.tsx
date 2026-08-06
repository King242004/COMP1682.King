// ═══ FILE NÀY LÀM GÌ ═══
// Ô nhập lời chú thích, dùng chung cho màn Tạo bài và Sửa bài.
//
// Ai gọi tới: PostCreateScreen, PostEditScreen
// Nhận vào:   nội dung đang gõ
// Trả ra:     ô nhập kèm bộ đếm ký tự
// Khi lỗi:    vượt giới hạn thì bộ đếm đổi màu

// Nhận giá trị từ màn cha, áp giới hạn ký tự rồi trả nội dung mới qua onChange.
import { StyleSheet, TextInput } from "react-native";
import { INPUT_LIMITS } from "@/config/inputLimits";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Card } from "@/ui/components/Card";

export function PostCaptionField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useT();
  return (
    <Card style={styles.card}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t.community.shareSomething}
        placeholderTextColor={theme.colors.subtle}
        multiline
        maxLength={INPUT_LIMITS.POST_CAPTION}
        style={styles.input}
      />
      <AppText variant="subtle" style={styles.count}>{value.length}/{INPUT_LIMITS.POST_CAPTION}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.space.lg },
  input: { minHeight: 90, fontSize: 15, color: theme.colors.text, textAlignVertical: "top" },
  count: { fontSize: 11, textAlign: "right" },
});
