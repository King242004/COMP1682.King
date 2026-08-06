// ═══ FILE NÀY LÀM GÌ ═══
// Màn Đăng nhập. Đây là file BẮT ĐẦU của luồng đăng nhập.
//
// Ai gọi tới: app/index đá tới đây khi máy chưa có phiên đăng nhập nào
// Nhận vào:   email và mật khẩu người dùng gõ
// Trả ra:     không trả gì, chỉ chuyển màn sang /tabs khi đăng nhập được
// Khi lỗi:    sai email hoặc mật khẩu thì hiện một câu chung chung,
//             không nói rõ sai cái nào, để người lạ không dò được tài khoản
//
// LUỒNG ĐĂNG NHẬP
// 1. Bấm nút Đăng nhập tại đây, chạy handleLogin
// 2. AuthContext.login
// 3. accountApi.loginRequest      (POST /auth/login)
// 4. backend authController.login, so mật khẩu đã mã hóa
// 5. trả thẻ đăng nhập và hồ sơ
// 6. AuthContext lưu vào state và vào bộ nhớ máy
// 7. router.replace chuyển sang /tabs
// Hai lối đi khác từ màn này: sang Đăng ký, và sang Quên mật khẩu.
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { resolveLanguage, type Lang } from "@/utils/languageUtils";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { isValidEmail } from "@/features/auth/authValidation";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";
import { INPUT_LIMITS } from "@/config/inputLimits";

const LOGIN_KEYBOARD_SHIFT = -56;

export default function LoginScreen() {
  const router = useRouter();
  const { login, languagePreference, setLanguagePreference } = useAuth();
  const t = useT();
  const currentLanguage = resolveLanguage(languagePreference);
  const keyboardShift = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const animate = (toValue: number, duration?: number) => {
      keyboardShift.stopAnimation();
      Animated.timing(keyboardShift, {
        toValue,
        duration: duration || 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const showSubscription = Keyboard.addListener(showEvent, (event) => animate(LOGIN_KEYBOARD_SHIFT, event.duration));
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => animate(0, event.duration));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      keyboardShift.stopAnimation();
    };
  }, [keyboardShift]);
  // Kiểm tại chỗ trước khi gọi mạng, để báo lỗi ngay mà không tốn một lượt gọi.
  // Backend vẫn kiểm lại lần nữa, vì kiểm ở app có thể bị bỏ qua.
  const validate = (): string | null => {
    if (!isValidEmail(email)) return t.auth.invalidEmail;
    if (password.length < 6) return t.auth.passwordTooShort;
    return null;
  };

  // Điều kiện bật nút. Lỏng hơn hàm kiểm ở trên, chỉ để nút không bị mờ
  // ngay từ khi người dùng mới gõ vài ký tự.
  const canSubmit = useMemo(() => {
    const okEmail = isValidEmail(email);
    const okPassword = password.length >= 6;
    return okEmail && okPassword && !isLoading;
  }, [email, password, isLoading]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      // Dùng replace chứ không push, để vuốt ngược không quay lại màn đăng nhập.
      router.replace("/tabs");
    } catch (error) {
      setError(getUserErrorMessage(error, t, t.auth.invalidCredentials));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <Animated.ScrollView
        style={[styles.scroll, { transform: [{ translateY: keyboardShift }] }]}
        contentContainerStyle={styles.wrap}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.languageRow}>
          <View style={styles.languageToggle}>
            {(["vi", "en"] as Lang[]).map((language) => {
              const active = currentLanguage === language;
              return (
                <Pressable
                  key={language}
                  onPress={() => { void setLanguagePreference(language); setError(""); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.languageOption,
                    active && styles.languageOptionActive,
                    pressed && styles.languageOptionPressed,
                  ]}
                >
                  <AppText style={[styles.languageText, active && styles.languageTextActive]}>
                    {language.toUpperCase()}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.hero}>
          <Image
            source={require("../../../assets/images/mealmate-logo-transparent.png")}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="MealMate"
          />
          <AppText variant="h0">MealMate</AppText>
          <AppText variant="muted" style={styles.tagline}>{t.auth.tagline}</AppText>
        </View>

        <View style={styles.form}>
          <TextField
            label={t.auth.email}
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(""); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            maxLength={INPUT_LIMITS.EMAIL}
          />
          <TextField
            label={t.auth.password}
            placeholder="••••••••"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(""); }}
            secureTextEntry
            textContentType="password"
            maxLength={INPUT_LIMITS.PASSWORD}
            returnKeyType="done"
            inputProps={{ onSubmitEditing: handleLogin }}
          />

          {error ? <AppText variant="subtle" style={styles.error}>{error}</AppText> : null}

          <Button
            title={isLoading ? t.auth.signingIn : t.auth.signIn}
            disabled={!canSubmit}
            size="lg"
            onPress={handleLogin}
          />

          <View style={styles.linkRowFirst}>
            <Link href="/auth/register" asChild>
              <Pressable hitSlop={10}>
                <AppText variant="body2" style={styles.linkPrimary}>{t.auth.noAccount}</AppText>
              </Pressable>
            </Link>
          </View>

          <View style={styles.linkRow}>
            <Link href="/auth/forgot-password" asChild>
              <Pressable hitSlop={10}>
                <AppText variant="body2" style={styles.linkSubtle}>{t.auth.forgotPassword}</AppText>
              </Pressable>
            </Link>
          </View>
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  wrap: { flexGrow: 1, justifyContent: "center", paddingVertical: 40, gap: theme.space.xl },
  languageRow: { alignItems: "flex-end" },
  languageToggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tintSoft,
  },
  languageOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.pill },
  languageOptionActive: { backgroundColor: theme.colors.primary },
  languageOptionPressed: { opacity: 0.7 },
  languageText: { fontSize: 12, fontWeight: "700", color: theme.colors.subtle },
  languageTextActive: { color: "#FFFFFF" },
  hero: { gap: 12, alignItems: "center" },
  logoImage: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.card,
    overflow: "hidden",
  },
  tagline: { textAlign: "center", paddingHorizontal: theme.space.lg },
  form: { gap: theme.space.md },
  error: { color: theme.colors.danger, textAlign: "center" },
  linkRowFirst: { alignItems: "center", marginTop: 4 },
  linkRow: { alignItems: "center" },
  linkPrimary: { color: theme.colors.primary },
  linkSubtle: { color: theme.colors.subtle },
});
