// English catalog — the source-of-truth shape. vi.ts must mirror this exactly
// (it's typed as `typeof en`, so missing/extra keys fail the type-check).
// Strings with runtime values are functions, e.g. remaining: (n) => `${n} left`.
export const en = {
  common: {
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    retry: "Retry",
    back: "Back",
    loading: "Loading...",
    error: "Something went wrong.",
    tryAgain: "Please try again.",
    checkConnection: "Check your connection and try again.",
  },

  auth: {
    tagline: "Your AI meal companion — scan your food, get advice, eat right for you.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    invalidEmail: "Please enter a valid email address.",
    passwordTooShort: "Password must be at least 6 characters.",
    // Login
    signIn: "Sign in",
    signingIn: "Signing in...",
    invalidCredentials: "Invalid email or password.",
    noAccount: "Don't have an account? Register",
    forgotPassword: "Forgot password?",
    // Register
    registerTitle: "Create your account",
    registerSubtitle: "Your AI meal companion is one step away.",
    name: "Name",
    namePlaceholder: "Your name",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    haveAccount: "Already have an account? Sign in",
    nameTooShort: "Name must be at least 2 characters.",
    nameNoSpecial: "Name must not contain numbers or special characters.",
    passwordNeedUpper: "Password must contain at least one uppercase letter.",
    passwordNeedNumber: "Password must contain at least one number.",
    passwordChecklistUpper: "One uppercase letter",
    passwordChecklistNumber: "One number",
    passwordChecklistLength: "At least 6 characters",
    // Forgot password — step titles/subtitles
    forgotTitle: "Forgot Password",
    forgotSubtitle: "Enter your email to receive an OTP.",
    otpTitle: "Enter OTP",
    otpSubtitle: (email: string) => `We sent a 6-digit code to ${email}`,
    newPasswordTitle: "New Password",
    newPasswordSubtitle: "Create a new password for your account.",
    // Fields
    otpLabel: "OTP Code",
    otpPlaceholder: "Enter 6-digit code",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    // Buttons
    sendOtp: "Send OTP",
    verifyOtp: "Verify OTP",
    changePassword: "Change Password",
    resendOtp: "Resend OTP",
    backToSignIn: "Back to Sign In",
    // Validation / errors
    otpMustBe6: "Please enter the 6-digit OTP.",
    passwordsNoMatch: "Passwords do not match.",
    failedSendOtp: "Failed to send OTP.",
    invalidOtp: "Invalid OTP.",
    failedReset: "Failed to reset password.",
    resetSuccessTitle: "Success",
    resetSuccessMsg: "Password changed successfully!",
  },
};

export type Strings = typeof en;
