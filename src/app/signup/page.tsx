import { SnsLoginButtons } from "@/components/auth/sns-login-buttons";
import { getEnabledSnsProviders } from "@/lib/snsProviders";

export default function SignupPage() {
  const snsProviders = getEnabledSnsProviders();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-black tracking-tight">회원가입</h1>
        <p className="text-sm text-foreground/60">
          SNS 계정으로 간편하게 시작해보세요.
          <br />
          동네와 업종은 가입 직후에 바로 입력받아요.
        </p>
      </div>
      <SnsLoginButtons providers={snsProviders} />
    </div>
  );
}
