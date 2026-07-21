import { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ApiTimeoutError, apiRequest } from "@/utils/api";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

type Step = "email" | "otp" | "password";
const STEPS: Step[] = ["email", "otp", "password"];
const OTP_REQUEST_TIMEOUT_MS = 60_000;
const RESEND_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const t = useT();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError(t.auth.invalidEmail);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiRequest(
        "/user/send-otp",
        "POST",
        { email: email.trim() },
        undefined,
        { timeoutMs: OTP_REQUEST_TIMEOUT_MS }
      );
      setStep("otp");
      setResendSeconds(RESEND_SECONDS);
    } catch (e: any) {
      setError(e instanceof ApiTimeoutError ? t.auth.otpTimeout : e.message || t.auth.failedSendOtp);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend: the UI countdown mirrors the server's silent cooldown so a tap
  // always means a fresh code was eligible to be issued.
  const handleResendOTP = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setOtp("");
    setError("");
    setIsLoading(true);
    try {
      await apiRequest(
        "/user/send-otp",
        "POST",
        { email: email.trim() },
        undefined,
        { timeoutMs: OTP_REQUEST_TIMEOUT_MS }
      );
      setResendSeconds(RESEND_SECONDS);
      Alert.alert(t.auth.otpTitle, t.auth.otpResent);
    } catch (e: any) {
      setError(e instanceof ApiTimeoutError ? t.auth.otpTimeout : e.message || t.auth.failedSendOtp);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  // Actually asks the server (used to advance locally — any 6 digits "passed").
  // Wrong guesses count toward the 5-attempt limit; the 5th burns the code.
  const handleVerifyOTP = async () => {
    if (otp.trim().length !== 6) {
      setError(t.auth.otpMustBe6);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/user/verify-otp", "POST", { email: email.trim(), otp: otp.trim() });
      setStep("password");
    } catch (e: any) {
      setError(e.message || t.auth.invalidOtp);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3: Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError(t.auth.passwordNeedUpper);
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError(t.auth.passwordNeedNumber);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordsNoMatch);
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/user/reset-password", "POST", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      Alert.alert(t.auth.resetSuccessTitle, t.auth.resetSuccessMsg, [
        { text: t.auth.signIn, onPress: () => router.replace("/auth/login") },
      ]);
    } catch (e: any) {
      setError(e.message || t.auth.failedReset);
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
    <Screen keyboard style={styles.screen}>
      <View style={styles.wrap}>

        {/* Step indicator */}
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
          {/* Step 1 - Email */}
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
              inputProps={{ autoFocus: true }}
            />
          )}

          {/* Step 2 - OTP */}
          {step === "otp" && (
            <TextField
              label={t.auth.otpLabel}
              placeholder={t.auth.otpPlaceholder}
              value={otp}
              onChangeText={(v) => { setOtp(v); setError(""); }}
              keyboardType="number-pad"
              inputProps={{ autoFocus: true, maxLength: 6 }}
            />
          )}

          {/* Step 3 - New Password */}
          {step === "password" && (
            <>
              <TextField
                label={t.auth.newPassword}
                placeholder="••••••••"
                value={newPassword}
                onChangeText={(v) => { setNewPassword(v); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
                inputProps={{ autoFocus: true }}
              />
              <TextField
                label={t.auth.confirmPassword}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
              />
            </>
          )}

          {error ? <AppText variant="subtle" style={styles.error}>{error}</AppText> : null}

          <Button
            title={
              isLoading && step === "email" ? t.auth.sendingOtp :
              isLoading ? t.common.loading :
              step === "email" ? t.auth.sendOtp :
              step === "otp" ? t.auth.verifyOtp :
              t.auth.changePassword
            }
            size="lg"
            disabled={isLoading}
            onPress={
              step === "email" ? handleSendOTP :
              step === "otp" ? handleVerifyOTP :
              handleResetPassword
            }
          />

          {/* Resend OTP — sends a real new code (stays on this step) */}
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  wrap: { gap: theme.space.xl },
  stepsRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  stepSeg: { height: 4, flex: 1, borderRadius: 99, backgroundColor: "rgba(8,145,178,0.12)" },
  stepSegActive: { backgroundColor: theme.colors.primary },
  header: { gap: 8 },
  form: { gap: theme.space.md },
  error: { color: theme.colors.danger, textAlign: "center" },
});
