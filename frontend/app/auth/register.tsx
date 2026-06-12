import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { theme } from "../ui/theme";
import { AppText } from "../ui/components/AppText";
import { Button } from "../ui/components/Button";
import { Screen } from "../ui/components/Screen";
import { TextField } from "../ui/components/TextField";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string | null => {
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    // \p{L} = any Unicode letter (supports Vietnamese, Chinese, etc.)
    if (!/^[\p{L}\s]+$/u.test(name.trim())) return "Name must not contain numbers or special characters.";
    if (!email.trim().includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
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
      router.replace("/auth/login");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen keyboard style={{ justifyContent: "center" }}>
      <View style={{ gap: theme.space.xl }}>
        <View style={{ gap: 8 }}>
          <AppText variant="h1">Create your account</AppText>
          <AppText variant="muted">
            Start tracking meals with a clean daily calorie view.
          </AppText>
        </View>

        <View style={{ gap: theme.space.md }}>
          <TextField
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={(t) => { setName(t); setError(""); }}
            textContentType="name"
            autoCapitalize="words"
            inputProps={{ autoFocus: true }}
            returnKeyType="next"
          />
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(""); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(""); }}
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="done"
          />

          {error ? (
            <AppText variant="subtle" style={{ color: "red", textAlign: "center" }}>
              {error}
            </AppText>
          ) : null}

          <Button
            title={isLoading ? "Creating account..." : "Create account"}
            disabled={!canSubmit}
            size="lg"
            onPress={handleRegister}
          />

          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Pressable>
              <Link href="/auth/login" asChild>
                <AppText variant="body2" style={{ color: theme.colors.primary }}>
                  Already have an account? Sign in
                </AppText>
              </Link>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
