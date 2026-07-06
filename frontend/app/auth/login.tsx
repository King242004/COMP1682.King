import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t.auth.invalidEmail;
    if (password.length < 6) return t.auth.passwordTooShort;
    return null;
  };

  const canSubmit = useMemo(() => {
    const okEmail = email.trim().includes("@");
    const okPassword = password.length >= 6;
    return okEmail && okPassword && !isLoading;
  }, [email, password, isLoading]);

  const handleLogin = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/tabs");
    } catch (e: any) {
      setError(e.message || t.auth.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen keyboard style={styles.screen}>
      <View style={styles.wrap}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <AppText style={styles.logoEmoji}>🥗</AppText>
          </View>
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
            inputProps={{ autoFocus: true }}
          />
          <TextField
            label={t.auth.password}
            placeholder="••••••••"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(""); }}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
          />

          {error ? <AppText variant="subtle" style={styles.error}>{error}</AppText> : null}

          <Button
            title={isLoading ? t.auth.signingIn : t.auth.signIn}
            disabled={!canSubmit}
            size="lg"
            onPress={handleLogin}
          />

          <View style={styles.linkRowFirst}>
            {/* replace: hopping login<->register must not stack screens */}
            <Link replace href="/auth/register" asChild>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: "center" },
  wrap: { gap: theme.space.xl },
  hero: { gap: 12, alignItems: "center" },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: theme.colors.tint,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  logoEmoji: { fontSize: 44 },
  tagline: { textAlign: "center", paddingHorizontal: theme.space.lg },
  form: { gap: theme.space.md },
  error: { color: theme.colors.danger, textAlign: "center" },
  linkRowFirst: { alignItems: "center", marginTop: 4 },
  linkRow: { alignItems: "center" },
  linkPrimary: { color: theme.colors.primary },
  linkSubtle: { color: theme.colors.subtle },
});
