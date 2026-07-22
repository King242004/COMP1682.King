import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { ApiTimeoutError } from "@/utils/api";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

type RegisterStep = "details" | "verify";
const RESEND_SECONDS = 60;

export default function RegisterScreen() {
  const router = useRouter();
  const { requestRegistrationOTP, register } = useAuth();
  const t = useT();

  const [step, setStep] = useState<RegisterStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const validateDetails = (): string | null => {
    if (name.trim().length < 2) return t.auth.nameTooShort;
    if (!/^[\p{L}\s]+$/u.test(name.trim())) return t.auth.nameNoSpecial;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t.auth.invalidEmail;
    if (password.length < 6) return t.auth.passwordTooShort;
    if (!/[A-Z]/.test(password)) return t.auth.passwordNeedUpper;
    if (!/[0-9]/.test(password)) return t.auth.passwordNeedNumber;
    return null;
  };

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (step === "verify") return /^\d{6}$/.test(otp.trim());
    return name.trim().length >= 2 && email.trim().includes("@") && password.length >= 6;
  }, [email, isLoading, name, otp, password, step]);

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
      setResendSeconds(RESEND_SECONDS);
    } catch (e: any) {
      setError(e instanceof ApiTimeoutError ? t.auth.otpTimeout : e.message || t.auth.failedSendOtp);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError(t.auth.otpMustBe6);
      return;
    }

    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, otp.trim());
      router.replace("/onboarding" as any);
    } catch (e: any) {
      setError(e.message || t.auth.invalidOtp);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setError("");
    setNotice("");
    setIsLoading(true);
    try {
      await requestRegistrationOTP(email.trim());
      setOtp("");
      setNotice(t.auth.registrationCodeResent);
      setResendSeconds(RESEND_SECONDS);
    } catch (e: any) {
      setError(e instanceof ApiTimeoutError ? t.auth.otpTimeout : e.message || t.auth.failedSendOtp);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("details");
    setOtp("");
    setError("");
    setNotice("");
    setResendSeconds(0);
  };

  const pwChecks = [
    { ok: password.length >= 6, label: t.auth.passwordChecklistLength },
    { ok: /[A-Z]/.test(password), label: t.auth.passwordChecklistUpper },
    { ok: /[0-9]/.test(password), label: t.auth.passwordChecklistNumber },
  ];

  const isDetails = step === "details";

  return (
    <Screen keyboard style={styles.screen}>
      <View style={styles.wrap}>
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
          {isDetails ? (
            <>
              <TextField
                label={t.auth.name}
                placeholder={t.auth.namePlaceholder}
                value={name}
                onChangeText={(value) => { setName(value); setError(""); }}
                textContentType="name"
                autoCapitalize="words"
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
                returnKeyType="next"
              />
              <TextField
                label={t.auth.password}
                placeholder="••••••••"
                value={password}
                onChangeText={(value) => { setPassword(value); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="done"
                inputProps={{ onSubmitEditing: handleSendCode }}
              />

              {password.length > 0 && (
                <View style={styles.checks}>
                  {pwChecks.map((check) => (
                    <View key={check.label} style={styles.checkRow}>
                      <Ionicons
                        name={check.ok ? "checkmark-circle" : "ellipse-outline"}
                        size={14}
                        color={check.ok ? theme.colors.accent : theme.colors.subtle}
                      />
                      <AppText variant="subtle" style={[styles.checkText, check.ok && styles.checkTextOk]}>
                        {check.label}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
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
                inputProps={{
                  autoFocus: true,
                  maxLength: 6,
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
            <Link replace href="/auth/login" asChild>
              <Pressable hitSlop={10}>
                <AppText variant="body2" style={styles.linkPrimary}>{t.auth.haveAccount}</AppText>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  wrap: { gap: theme.space.xl },
  stepsRow: { flexDirection: "row", gap: 8 },
  stepSegment: { flex: 1, height: 4, borderRadius: 999, backgroundColor: theme.colors.border },
  stepSegmentActive: { backgroundColor: theme.colors.primary },
  header: { gap: 8 },
  form: { gap: theme.space.md },
  checks: { gap: 4 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkText: { fontSize: 12, color: theme.colors.subtle },
  checkTextOk: { color: theme.colors.accent },
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
