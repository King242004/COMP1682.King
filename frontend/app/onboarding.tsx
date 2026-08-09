// ═══ FILE NÀY LÀM GÌ ═══ (route mỏng, không chứa logic nào)
// Route mỏng cho địa chỉ /onboarding. Ruột màn nằm ở src/features/onboarding/OnboardingFlow.
// File duy nhất trong nhóm route phải bọc thêm một component, vì OnboardingFlow
// là export CÓ TÊN chứ không phải export mặc định nên không re-export một dòng được.
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";

export default function OnboardingScreen() {
  return <OnboardingFlow />;
}
