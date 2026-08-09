// ═══ FILE NÀY LÀM GÌ ═══
// Màn Quên mật khẩu. Ba bước nằm trong cùng một màn: gửi mã, nhập mã, đặt mật khẩu mới.
//
// Ai gọi tới: LoginScreen, qua liên kết Quên mật khẩu
// Nhận vào:   email, mã 6 số, và mật khẩu mới
// Trả ra:     không trả gì, đặt xong thì quay về màn Đăng nhập
// Khi lỗi:    mã sai hoặc hết hạn thì hiện lỗi ngay tại bước đó, không mất dữ liệu đã gõ

// Mã được gửi lại ở bước cuối vì mỗi request độc lập và chỉ dùng được một lần.
import { useState } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ApiTimeoutError } from "@/utils/apiClient";
import { resetPasswordRequest, sendPasswordOTP, verifyPasswordOTP } from "@/features/auth/authApi";
import { getUserErrorMessage } from "@/utils/errorUtils";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n";
import { resolveLanguage } from "@/utils/languageUtils";
import { isStrongPassword, isValidEmail, isValidOtp, passwordErrorMessage } from "@/features/auth/authValidation";
import { useOtpCooldown } from "@/features/auth/useOtpCooldown";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";
import { INPUT_LIMITS } from "@/config/inputLimits";

type Step = "email" | "otp" | "password";
const STEPS: Step[] = ["email", "otp", "password"];

// ĐẶT LẠI MẬT KHẨU
//
// Đến từ liên kết Quên mật khẩu ở màn Đăng nhập.
// Ba chặng nằm gọn trong một màn, mỗi chặng đều phải chờ mạng.
// Xong thì quay về màn Đăng nhập để đăng nhập bằng mật khẩu mới.

// Ba chặng hiện trên màn phân biệt bằng state step: email, otp, rồi password
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const t = useT();
  const { languagePreference, user } = useAuth();
  const language = resolveLanguage(languagePreference ?? user?.language);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { seconds: resendSeconds, start: startOtpCooldown } = useOtpCooldown();

  const emailIsValid = isValidEmail(email);
  const otpIsValid = isValidOtp(otp);
  const passwordIsValid = isStrongPassword(newPassword) && newPassword === confirmPassword;
  const canContinue = step === "email" ? emailIsValid : step === "otp" ? otpIsValid : passwordIsValid;

  // Bấm Gửi mã. Đi tiếp: src/features/auth/authApi.ts
  // Đường đi: apiClient → POST /user/send-otp → accountController.sendPasswordOTP
  //           → services/emailRelayClient.js → email relay
  // Hạn chờ 60 giây thay vì 45 giây mặc định, đặt trong authApi.sendPasswordOTP,
  // vì lượt gọi này còn phải chờ gửi email thật.
  // Nhớ: accountController.sendPasswordOTP luôn trả câu chung chung, nên bước này
  //      thành công cả khi email chưa có tài khoản. Cố ý, để không lộ email đã đăng ký.
  const handleSendOTP = async () => {
    if (!emailIsValid) {
      setError(t.auth.invalidEmail);
      return;
    }
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await sendPasswordOTP(email.trim(), language);
      setStep("otp");
      startOtpCooldown();
    } catch (error) {
      setError(error instanceof ApiTimeoutError ? t.auth.otpTimeout : getUserErrorMessage(error, t, t.auth.failedSendOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // Nút Gửi lại mã, chỉ bấm được khi đồng hồ đã về 0.
  // Nút Gửi lại, đi cùng đường với Gửi mã. Xóa ô mã cũ vì mã đó hết hiệu lực
  const handleResendOTP = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setOtp("");
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await sendPasswordOTP(email.trim(), language);
      startOtpCooldown();
      setNotice(t.auth.otpResent);
    } catch (error) {
      setError(error instanceof ApiTimeoutError ? t.auth.otpTimeout : getUserErrorMessage(error, t, t.auth.failedSendOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // Bấm Xác minh mã
  // Đường đi: apiClient → POST /user/verify-otp → accountController.verifyPasswordOTP
  // Bước này CHỈ kiểm mã đúng hay sai, chưa đổi mật khẩu gì cả.
  // Tách riêng để người dùng biết mã sai ngay, chứ đừng gõ xong mật khẩu mới mới báo.
  const handleVerifyOTP = async () => {
    if (!otpIsValid) {
      setError(t.auth.otpMustBe6);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await verifyPasswordOTP(email.trim(), otp.trim());
      setStep("password");
    } catch (error) {
      setError(getUserErrorMessage(error, t, t.auth.invalidOtp));
    } finally {
      setIsLoading(false);
    }
  };

  // Bấm Đặt mật khẩu mới
  // Đường đi: apiClient → POST /user/reset-password → accountController.resetPassword
  // Nhớ: phải gửi KÈM LẠI mã 6 số, dù chặng xác minh đã kiểm rồi.
  //      Vì mỗi request là độc lập, backend không nhớ mình vừa kiểm mã xong.
  const handleResetPassword = async () => {
    // Ba luật mật khẩu nằm trong authValidation, ở đây chỉ lấy câu lỗi ra hiện.
    const passwordError = passwordErrorMessage(newPassword, t);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordsNoMatch);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await resetPasswordRequest(email.trim(), otp.trim(), newPassword);
      Alert.alert(t.auth.resetSuccessTitle, t.auth.resetSuccessMsg, [
        { text: t.auth.signIn, onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error) {
      setError(getUserErrorMessage(error, t, t.auth.failedReset));
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    email: { title: t.auth.forgotTitle, subtitle: t.auth.forgotSubtitle },
    otp: { title: t.auth.otpTitle, subtitle: t.auth.otpSubtitle(email) },
    password: { title: t.auth.newPasswordTitle, subtitle: t.auth.newPasswordSubtitle },
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.wrap}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >

        {/* Thanh ba vạch báo đang ở chặng nào */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.stepSeg, STEPS.indexOf(step) >= i && styles.stepSegActive]} />
          ))}
        </View>

        <View style={styles.header}>
          <AppText variant="h1">{stepTitles[step].title}</AppText>
          <AppText variant="muted">{stepTitles[step].subtitle}</AppText>
        </View>

        <View style={styles.form}>
          {/* Chặng 1, nhập email */}
          {step === "email" && (
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
              inputProps={{ autoFocus: true }}
            />
          )}

          {/* Chặng 2, nhập mã 6 số */}
          {step === "otp" && (
            <TextField
              label={t.auth.otpLabel}
              placeholder={t.auth.otpPlaceholder}
              value={otp}
              // Lọc bỏ mọi ký tự không phải số, giống hệt ô mã ở màn Đăng ký.
              onChangeText={(v) => { setOtp(v.replace(/\D/g, "")); setError(""); setNotice(""); }}
              keyboardType="number-pad"
              // oneTimeCode để iOS tự điền mã từ tin nhắn, đỡ phải gõ tay.
              textContentType="oneTimeCode"
              returnKeyType="done"
              maxLength={INPUT_LIMITS.OTP_CODE}
              inputProps={{ autoFocus: true, onSubmitEditing: handleVerifyOTP }}
            />
          )}

          {/* Chặng 3, đặt mật khẩu mới */}
          {step === "password" && (
            <>
              <View style={styles.fieldNote}>
                <TextField
                  label={t.auth.newPassword}
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={(v) => { setNewPassword(v); setError(""); }}
                  secureTextEntry
                  textContentType="newPassword"
                  maxLength={INPUT_LIMITS.PASSWORD}
                  inputProps={{ autoFocus: true }}
                />
                <AppText variant="subtle" style={styles.hint}>• {t.auth.passwordChecklistLength}</AppText>
                <AppText variant="subtle" style={styles.hint}>• {t.auth.passwordChecklistUpperAndNumber}</AppText>
              </View>
              <TextField
                label={t.auth.confirmPassword}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
                maxLength={INPUT_LIMITS.PASSWORD}
              />
            </>
          )}

          {error ? <AppText variant="subtle" style={styles.error}>{error}</AppText> : null}
          {notice ? <AppText variant="subtle" style={styles.notice}>{notice}</AppText> : null}

          <Button
            title={
              isLoading && step === "email" ? t.auth.sendingOtp :
              isLoading ? t.common.loading :
              step === "email" ? t.auth.sendOtp :
              step === "otp" ? t.auth.verifyOtp :
              t.auth.changePassword
            }
            size="lg"
            disabled={isLoading || !canContinue}
            onPress={
              step === "email" ? handleSendOTP :
              step === "otp" ? handleVerifyOTP :
              handleResetPassword
            }
          />

          {/* Gửi lại mã, backend phát mã MỚI thật, màn vẫn đứng ở chặng này */}
          {step === "otp" && (
            <Button
              title={resendSeconds > 0 ? t.auth.resendOtpIn(resendSeconds) : t.auth.resendOtp}
              variant="ghost"
              disabled={isLoading || resendSeconds > 0}
              onPress={handleResendOTP}
            />
          )}

          <Button
            title={t.auth.backToSignIn}
            variant="ghost"
            onPress={() => router.replace("/auth/login")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, gap: theme.space.xl },
  stepsRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  stepSeg: { height: 4, flex: 1, borderRadius: 99, backgroundColor: "rgba(8,145,178,0.12)" },
  stepSegActive: { backgroundColor: theme.colors.primary },
  header: { gap: 8 },
  form: { gap: theme.space.md },
  fieldNote: { gap: theme.space.xs },
  hint: { fontSize: 12 },
  error: { color: theme.colors.danger, textAlign: "center" },
  notice: { color: theme.colors.accent, textAlign: "center" },
});
