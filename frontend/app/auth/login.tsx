import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
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
      setError(e.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen keyboard style={{ justifyContent: "center" }}>
      <View style={{ gap: theme.space.xl }}>
        <View style={{ gap: 12, alignItems: "center" }}>
          <View
            style={{
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
            }}
          >
            <AppText style={{ fontSize: 44 }}>🥗</AppText>
          </View>
          <AppText variant="h0">HealthySnap</AppText>
          <AppText
            variant="muted"
            style={{ textAlign: "center", paddingHorizontal: theme.space.lg }}
          >
            Snap a photo, we'll count the calories. Eating healthy made easy.
          </AppText>
        </View>

        <View style={{ gap: theme.space.md }}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(""); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            inputProps={{ autoFocus: true }}
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(""); }}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
          />

          {error ? (
            <AppText variant="subtle" style={{ color: "red", textAlign: "center" }}>
              {error}
            </AppText>
          ) : null}

          <Button
            title={isLoading ? "Signing in..." : "Sign in"}
            disabled={!canSubmit}
            size="lg"
            onPress={handleLogin}
          />

          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Pressable>
              <Link href="/auth/register" asChild>
                <AppText variant="body2" style={{ color: theme.colors.primary }}>
                  Don't have an account? Register
                </AppText>
              </Link>
            </Pressable>
          </View>

          <View style={{ alignItems: "center" }}>
            <Pressable>
              <Link href="/auth/forgot-password" asChild>
                <AppText variant="body2" style={{ color: theme.colors.subtle }}>
                  Forgot password?
                </AppText>
              </Link>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
