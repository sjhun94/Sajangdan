import Link from "next/link";
import { SnsLoginButtons } from "@/components/auth/sns-login-buttons";
import { getEnabledSnsProviders } from "@/lib/snsProviders";

export default function LoginPage() {
  const snsProviders = getEnabledSnsProviders();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <SnsLoginButtons providers={snsProviders} />
      <Link href="/signup" className="text-sm font-medium text-accent">
        계정이 없으신가요? 회원가입
      </Link>
    </div>
  );
}
