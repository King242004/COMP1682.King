import { useState } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { apiRequest } from "@/utils/api";
import { theme } from "@/ui/theme";
import { AppText } from "@/ui/components/AppText";
import { Button } from "@/ui/components/Button";
import { Screen } from "@/ui/components/Screen";
import { TextField } from "@/ui/components/TextField";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/user/send-otp", "POST", { email: email.trim() });
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  // Actually asks the server (used to advance locally — any 6 digits "passed").
  // Wrong guesses count toward the 5-attempt limit; the 5th burns the code.
  const handleVerifyOTP = async () => {
    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/user/verify-otp", "POST", { email: email.trim(), otp: otp.trim() });
      setStep("password");
    } catch (e: any) {
      setError(e.message || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3: Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
      Alert.alert("Success", "Password changed successfully!", [
        { text: "Sign In", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (e: any) {
      setError(e.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    email: { title: "Forgot Password", subtitle: "Enter your email to receive an OTP." },
    otp: { title: "Enter OTP", subtitle: `We sent a 6-digit code to ${email}` },
    password: { title: "New Password", subtitle: "Create a new password for your account." },
  };

  return (
    <Screen keyboard style={{ justifyContent: "center" }}>
      <View style={{ gap: theme.space.xl }}>

        {/* Step indicator */}
        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
          {["email", "otp", "password"].map((s, i) => (
            <View
              key={s}
              style={{
                height: 4, flex: 1, borderRadius: 99,
                backgroundColor: ["email", "otp", "password"].indexOf(step) >= i
                  ? theme.colors.primary
                  : "rgba(8,145,178,0.12)",
              }}
            />
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <AppText variant="h1">{stepTitles[step].title}</AppText>
          <AppText variant="muted">{stepTitles[step].subtitle}</AppText>
        </View>

        <View style={{ gap: theme.space.md }}>
          {/* Step 1 - Email */}
          {step === "email" && (
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
          )}

          {/* Step 2 - OTP */}
          {step === "otp" && (
            <TextField
              label="OTP Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(t) => { setOtp(t); setError(""); }}
              keyboardType="number-pad"
              inputProps={{ autoFocus: true, maxLength: 6 }}
            />
          )}

          {/* Step 3 - New Password */}
          {step === "password" && (
            <>
              <TextField
                label="New Password"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
                inputProps={{ autoFocus: true }}
              />
              <TextField
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                secureTextEntry
                textContentType="newPassword"
              />
            </>
          )}

          {error ? (
            <AppText variant="subtle" style={{ color: theme.colors.danger, textAlign: "center" }}>
              {error}
            </AppText>
          ) : null}

          <Button
            title={
              isLoading ? "Loading..." :
              step === "email" ? "Send OTP" :
              step === "otp" ? "Verify OTP" :
              "Change Password"
            }
            size="lg"
            disabled={isLoading}
            onPress={
              step === "email" ? handleSendOTP :
              step === "otp" ? handleVerifyOTP :
              handleResetPassword
            }
          />

          {/* Resend OTP */}
          {step === "otp" && (
            <Button
              title="Resend OTP"
              variant="ghost"
              onPress={() => { setStep("email"); setOtp(""); setError(""); }}
            />
          )}

          <Button
            title="Back to Sign In"
            variant="ghost"
            onPress={() => router.replace("/auth/login")}
          />
        </View>
      </View>
    </Screen>
  );
}
