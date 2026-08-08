// ═══ FILE NÀY LÀM GÌ ═══
// Màn Đăng ký. Hai bước trong cùng một màn: nhập thông tin, rồi xác minh mã 6 số.
//
// Ai gọi tới: LoginScreen, qua liên kết Đăng ký
// Nhận vào:   tên, email, mật khẩu, và mã 6 số
// Trả ra:     không trả gì, tạo xong thì đi thẳng sang bước Thiết lập lần đầu
// Khi lỗi:    email đã có tài khoản thì báo chung chung, không nói rõ để tránh lộ tài khoản
//
// Nhớ: chỉ có MỘT màn nhưng hai bước, phân biệt bằng state step.
//      step là "details" thì hiện form thông tin, là "verify" thì hiện ô nhập mã.

import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { ApiTimeoutError } from "@/utils/apiClient";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { isStrongPassword, isValidEmail, isValidOtp } from "@/features/auth/authValidation";
import { useOtpCooldown } from "@/features/auth/useOtpCooldown";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";
import { INPUT_LIMITS } from "@/config/inputLimits";

type RegisterStep = "details" | "verify";

// ══════════════════════════════════════════════════════════
// ĐĂNG KÝ
//
// Đến từ liên kết Đăng ký ở màn Đăng nhập. Bốn bước, đọc từ trên xuống
// là đúng thứ tự. Hai chặng chờ mạng, ở BƯỚC 2 xin mã và BƯỚC 3 tạo tài khoản.
// Xong thì đi thẳng sang màn Thiết lập lần đầu, KHÔNG phải đăng nhập lại,
// vì backend đã trả thẻ về ngay lúc tạo tài khoản.
// ══════════════════════════════════════════════════════════

// ĐĂNG KÝ BƯỚC 1. Nhận thông tin người dùng gõ.
export default function RegisterScreen() {
  const router = useRouter();
  const { requestRegistrationOTP, register } = useAuth();
  const t = useT();

  const [step, setStep] = useState<RegisterStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const { seconds: resendSeconds, start: startOtpCooldown, reset: resetOtpCooldown } = useOtpCooldown();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Kiểm dữ liệu bước 1. Sáu quy tắc này phải khớp với
  // hàm register trong backend/src/controllers/authController.js;
  // nếu lỏng hơn thì người dùng chờ gửi mã xong mới bị báo lỗi.
  const validateDetails = (): string | null => {
    if (name.trim().length < 2) return t.auth.nameTooShort;
    if (!/^[\p{L}\s]+$/u.test(name.trim())) return t.auth.nameNoSpecial;
    if (!isValidEmail(email)) return t.auth.invalidEmail;
    if (password.length < 6) return t.auth.passwordTooShort;
    if (!/[A-Z]/.test(password)) return t.auth.passwordNeedUpper;
    if (!/[0-9]/.test(password)) return t.auth.passwordNeedNumber;
    return null;
  };

  // Điều kiện bật nút. Lỏng hơn hàm kiểm ở trên, chỉ để nút đừng mờ mãi.
  // Hai bước dùng chung một nút, nên phải xét step để biết đang kiểm cái gì.
  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (step === "verify") return isValidOtp(otp);
    return name.trim().length >= 2
      && /^[\p{L}\s]+$/u.test(name.trim())
      && isValidEmail(email)
      && isStrongPassword(password);
  }, [email, isLoading, name, otp, password, step]);

  // ĐĂNG KÝ BƯỚC 2. Bấm nút Gửi mã.
  // Kiểm hết tại máy trước, sai thì báo ngay chứ đừng để họ chờ một lượt mạng rồi mới biết.
  // Đường đi: AuthContext.requestRegistrationOTP → authApi → apiClient
  //           → POST /auth/register/send-otp → authController.sendRegistrationOTP
  //           → otpService → email relay
  // Gửi xong thì đổi step sang verify và bật đồng hồ đếm ngược nút Gửi lại.
  const handleSendCode = async () => {
    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await requestRegistrationOTP(email.trim());
      setStep("verify");
      startOtpCooldown();
    } catch (error) {
      setError(error instanceof ApiTimeoutError ? t.auth.otpTimeout : getUserErrorMessage(error, t, t.auth.failedSendOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // ĐĂNG KÝ BƯỚC 3. Bấm nút Tạo tài khoản, kèm mã 6 số vừa nhận trong email.
  // Đường đi: AuthContext.register → authApi → apiClient → POST /auth/register
  //           → authController.register
  // Bên đó so mã, tạo tài khoản, rồi trả THẺ về luôn. Nhờ vậy dòng dưới đi thẳng
  // sang màn Thiết lập lần đầu mà không phải qua màn Đăng nhập.
  const handleCreateAccount = async () => {
    if (!isValidOtp(otp)) {
      setError(t.auth.otpMustBe6);
      return;
    }

    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, otp.trim());
      router.replace("/onboarding");
    } catch (error) {
      setError(getUserErrorMessage(error, t, t.auth.invalidOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // ĐĂNG KÝ BƯỚC 4. Nút Gửi lại mã, chỉ bấm được khi đồng hồ đã về 0.
  // Đi cùng một đường với BƯỚC 2. Xóa ô mã cũ đi, vì mã cũ đã hết hiệu lực.
  const handleResend = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await requestRegistrationOTP(email.trim());
      setOtp("");
      setNotice(t.auth.registrationCodeResent);
      startOtpCooldown();
    } catch (error) {
      setError(error instanceof ApiTimeoutError ? t.auth.otpTimeout : getUserErrorMessage(error, t, t.auth.failedSendOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // Nút Đổi email, quay ngược về bước nhập thông tin.
  // Dọn sạch mã, lỗi, lời nhắc và đồng hồ, coi như bắt đầu lại từ đầu.
  const handleChangeEmail = () => {
    setStep("details");
    setOtp("");
    setError("");
    setNotice("");
    resetOtpCooldown();
  };

  const isDetails = step === "details";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.wrap}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hai vạch báo đang ở bước nào. Vạch hai sáng lên khi sang bước nhập mã. */}
        <View style={styles.stepsRow} accessibilityLabel={t.auth.registrationProgress(step)}>
          <View style={[styles.stepSegment, styles.stepSegmentActive]} />
          <View style={[styles.stepSegment, !isDetails && styles.stepSegmentActive]} />
        </View>

        <View style={styles.header}>
          <AppText variant="h1">
            {isDetails ? t.auth.registerTitle : t.auth.registerVerifyTitle}
          </AppText>
          <AppText variant="muted">
            {isDetails ? t.auth.registerSubtitle : t.auth.registerVerifySubtitle(email.trim())}
          </AppText>
        </View>

        <View style={styles.form}>
          {/* Bước 1 hiện ba ô nhập, bước 2 hiện thẻ email và ô nhập mã. */}
          {isDetails ? (
            <>
              <TextField
                label={t.auth.name}
                placeholder={t.auth.namePlaceholder}
                value={name}
                onChangeText={(value) => { setName(value); setError(""); }}
                textContentType="name"
                autoCapitalize="words"
                maxLength={INPUT_LIMITS.DISPLAY_NAME}
                inputProps={{ autoFocus: true }}
                returnKeyType="next"
              />
              <TextField
                label={t.auth.email}
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChangeText={(value) => { setEmail(value); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                maxLength={INPUT_LIMITS.EMAIL}
                returnKeyType="next"
              />
              <TextField
                label={t.auth.password}
                placeholder="••••••••"
                value={password}
                onChangeText={(value) => { setPassword(value); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
                maxLength={INPUT_LIMITS.PASSWORD}
                returnKeyType="done"
                inputProps={{ onSubmitEditing: handleSendCode }}
              />

              <View style={styles.checks}>
                <AppText variant="subtle" style={styles.checkText}>• {t.auth.passwordChecklistLength}</AppText>
                <AppText variant="subtle" style={styles.checkText}>• {t.auth.passwordChecklistUpperAndNumber}</AppText>
              </View>
            </>
          ) : (
            <>
              <View style={styles.emailCard}>
                <View style={styles.emailIcon}>
                  <Ionicons name="mail-open-outline" size={22} color={theme.colors.primary2} />
                </View>
                <View style={styles.emailCopy}>
                  <AppText variant="caption" style={styles.emailCaption}>{t.auth.verificationSentTo}</AppText>
                  <AppText variant="body2" numberOfLines={1} style={styles.emailAddress}>{email.trim()}</AppText>
                </View>
              </View>

              <TextField
                label={t.auth.otpLabel}
                placeholder={t.auth.otpPlaceholder}
                value={otp}
                onChangeText={(value) => { setOtp(value.replace(/\D/g, "")); setError(""); setNotice(""); }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                returnKeyType="done"
                maxLength={INPUT_LIMITS.OTP_CODE}
                inputProps={{
                  autoFocus: true,
                  onSubmitEditing: handleCreateAccount,
                }}
              />

              <AppText variant="subtle" style={styles.otpHint}>{t.auth.registrationOtpHint}</AppText>
            </>
          )}

          {error ? (
            <AppText variant="subtle" style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          ) : null}
          {notice ? (
            <AppText variant="subtle" style={styles.notice} accessibilityLiveRegion="polite">
              {notice}
            </AppText>
          ) : null}

          <Button
            title={
              isLoading
                ? isDetails ? t.auth.sendingOtp : t.auth.creatingAccount
                : isDetails ? t.auth.sendRegistrationCode : t.auth.verifyAndCreateAccount
            }
            disabled={!canSubmit}
            size="lg"
            onPress={isDetails ? handleSendCode : handleCreateAccount}
          />

          {!isDetails && (
            <>
              <Button
                title={resendSeconds > 0 ? t.auth.resendOtpIn(resendSeconds) : t.auth.resendOtp}
                variant="secondary"
                disabled={resendSeconds > 0 || isLoading}
                onPress={handleResend}
              />
              <Button
                title={t.auth.changeEmail}
                variant="ghost"
                disabled={isLoading}
                onPress={handleChangeEmail}
              />
            </>
          )}

          <View style={styles.linkRow}>
            <Pressable hitSlop={10} onPress={() => router.back()}>
              <AppText variant="body2" style={styles.linkPrimary}>{t.auth.haveAccount}</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, gap: theme.space.xl },
  stepsRow: { flexDirection: "row", gap: 8 },
  stepSegment: { flex: 1, height: 4, borderRadius: 999, backgroundColor: theme.colors.border },
  stepSegmentActive: { backgroundColor: theme.colors.primary },
  header: { gap: 8 },
  form: { gap: theme.space.md },
  checks: { gap: 4 },
  checkText: { fontSize: 12, color: theme.colors.subtle },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  emailIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.tint,
  },
  emailCopy: { flex: 1, gap: 2 },
  emailCaption: { color: theme.colors.muted },
  emailAddress: { color: theme.colors.text, fontWeight: "700" },
  otpHint: { textAlign: "center", color: theme.colors.muted },
  error: { color: theme.colors.danger, textAlign: "center" },
  notice: { color: theme.colors.accent, textAlign: "center" },
  linkRow: { alignItems: "center", marginTop: 4 },
  linkPrimary: { color: theme.colors.primary },
});
