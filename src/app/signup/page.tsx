import { Suspense } from "react";
import Link from "next/link";
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
      <Suspense>
        <SnsLoginButtons providers={snsProviders} />
      </Suspense>
      <p className="text-center text-xs text-foreground/40">
        가입을 진행하면{" "}
        <Link href="/terms" className="underline hover:text-foreground/70">
          이용약관
        </Link>{" "}
        및{" "}
        <Link href="/privacy" className="underline hover:text-foreground/70">
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주돼요.
      </p>
    </div>
  );
}
