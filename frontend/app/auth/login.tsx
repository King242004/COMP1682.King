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

  const canSubmit = useMemo(() => {
    const okEmail = email.trim().length >= 3 && email.includes("@");
    const okPass = password.length >= 6;
    return okEmail && okPass;
  }, [email, password]);

  return (
    <Screen keyboard style={{ justifyContent: "center" }}>
      <View style={{ gap: theme.space.xl }}>
        <View style={{ gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 18,
              backgroundColor: theme.colors.tint,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(11, 42, 111, 0.18)",
            }}
          >
            <AppText variant="h2" style={{ color: theme.colors.primary }}>
              MS
            </AppText>
          </View>
          <AppText variant="h0">Meal Snap</AppText>
          <AppText
            variant="muted"
            style={{ textAlign: "center", paddingHorizontal: theme.space.lg }}
          >
            Log your meals in seconds. Scan or add manually to stay on track.
          </AppText>
        </View>

        <View style={{ gap: theme.space.md }}>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            inputProps={{ autoFocus: true }}
          />
          <TextField
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            returnKeyType="done"
          />

          <Button
            title="Log in"
            disabled={!canSubmit}
            size="lg"
            onPress={() => {
              login({ name: "Alex", email: email.trim() });
              router.replace("/tabs");
            }}
          />

          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Pressable>
              <Link href="/auth/register" asChild>
                <AppText variant="body2" style={{ color: theme.colors.primary }}>
                  Create account
                </AppText>
              </Link>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
