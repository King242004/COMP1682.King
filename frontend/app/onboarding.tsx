// ═══ FILE NÀY LÀM GÌ ═══ (route mỏng, không chứa logic nào)
// Route mỏng cho /onboarding. Toàn bộ luồng thiết lập lần đầu
// nằm trong src/features/onboarding/OnboardingFlow.
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";

export default function OnboardingScreen() {
  return <OnboardingFlow />;
}
