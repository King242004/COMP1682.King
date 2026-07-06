import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const t = useT();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (name.trim().length < 2) return t.auth.nameTooShort;
    // \p{L} = any Unicode letter (supports Vietnamese, Chinese, etc.)
    if (!/^[\p{L}\s]+$/u.test(name.trim())) return t.auth.nameNoSpecial;
    if (!email.trim().includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t.auth.invalidEmail;
    if (password.length < 6) return t.auth.passwordTooShort;
    if (!/[A-Z]/.test(password)) return t.auth.passwordNeedUpper;
    if (!/[0-9]/.test(password)) return t.auth.passwordNeedNumber;
    return null;
  };

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = email.trim().includes("@");
    const okPassword = password.length >= 6;
    return okName && okEmail && okPassword && !isLoading;
  }, [name, email, password, isLoading]);

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // register() already stored the token (auto-login). New accounts go through
      // onboarding first (goal/body/taste) so the AI knows them from day one —
      // it's skippable and only ever shown here, never on login.
      router.replace("/onboarding" as any);
    } catch (e: any) {
      setError(e.message || `${t.common.error} ${t.common.tryAgain}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Live requirement checklist — rules used to surface only AFTER a failed
  // submit, one at a time
  const pwChecks = [
    { ok: password.length >= 6, label: t.auth.passwordChecklistLength },
    { ok: /[A-Z]/.test(password), label: t.auth.passwordChecklistUpper },
    { ok: /[0-9]/.test(password), label: t.auth.passwordChecklistNumber },
  ];

  return (
    <Screen keyboard style={styles.screen}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <AppText variant="h1">{t.auth.registerTitle}</AppText>
          <AppText variant="muted">{t.auth.registerSubtitle}</AppText>
        </View>

        <View style={styles.form}>
          <TextField
            label={t.auth.name}
            placeholder={t.auth.namePlaceholder}
            value={name}
            onChangeText={(v) => { setName(v); setError(""); }}
            textContentType="name"
            autoCapitalize="words"
            inputProps={{ autoFocus: true }}
            returnKeyType="next"
          />
          <TextField
            label={t.auth.email}
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(""); }}
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
            onChangeText={(v) => { setPassword(v); setError(""); }}
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="done"
          />

          {password.length > 0 && (
            <View style={styles.checks}>
              {pwChecks.map((c) => (
                <View key={c.label} style={styles.checkRow}>
                  <Ionicons
                    name={c.ok ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={c.ok ? theme.colors.accent : theme.colors.subtle}
                  />
                  <AppText variant="subtle" style={[styles.checkText, c.ok && styles.checkTextOk]}>
                    {c.label}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {error ? <AppText variant="subtle" style={styles.error}>{error}</AppText> : null}

          <Button
            title={isLoading ? t.auth.creatingAccount : t.auth.createAccount}
            disabled={!canSubmit}
            size="lg"
            onPress={handleRegister}
          />

          <View style={styles.linkRow}>
            {/* replace: hopping login<->register must not stack screens */}
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
  header: { gap: 8 },
  form: { gap: theme.space.md },
  checks: { gap: 4 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkText: { fontSize: 12, color: theme.colors.subtle },
  checkTextOk: { color: theme.colors.accent },
  error: { color: theme.colors.danger, textAlign: "center" },
  linkRow: { alignItems: "center", marginTop: 4 },
  linkPrimary: { color: theme.colors.primary },
});
