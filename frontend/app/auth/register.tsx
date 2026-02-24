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
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = email.trim().length >= 3 && email.includes("@");
    const okPass = password.length >= 6;
    const match = password === confirmPassword && confirmPassword.length > 0;
    return okName && okEmail && okPass && match;
  }, [name, email, password, confirmPassword]);

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
            onChangeText={setName}
            textContentType="name"
            returnKeyType="next"
            inputProps={{ autoFocus: true }}
          />
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <TextField
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            returnKeyType="next"
          />
          <TextField
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            returnKeyType="done"
          />

          <Button
            title="Create account"
            disabled={!canSubmit}
            size="lg"
            onPress={() => {
              login({ name: name.trim(), email: email.trim() });
              router.replace("/tabs");
            }}
          />

          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Pressable>
              <Link href="/auth/login" asChild>
                <AppText variant="body2" style={{ color: theme.colors.primary }}>
                  Back to login
                </AppText>
              </Link>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}