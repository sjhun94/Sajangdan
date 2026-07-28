import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOnboardingStatus } from "@/lib/onboarding";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const status = await getOnboardingStatus(session.user.id);
  if (!status || status.onboardingCompleted) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">마지막 한 단계예요</h1>
      <p className="text-center text-sm text-foreground/60">
        동네와 업종을 알려주시면 &quot;동작구 카페사장님&quot;처럼 사장단
        안에서 쓰일 표시 이름이 만들어져요.
      </p>
      <OnboardingForm />
    </div>
  );
}
