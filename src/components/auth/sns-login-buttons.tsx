"use client";

import { signIn } from "next-auth/react";
import type { SnsProvider } from "@/lib/snsProviders";

const PROVIDER_LABEL: Record<SnsProvider, string> = {
  kakao: "카카오로 계속하기",
  google: "구글로 계속하기",
  naver: "네이버로 계속하기",
};

const PROVIDER_STYLE: Record<SnsProvider, string> = {
  kakao: "bg-[#FEE500] text-black hover:opacity-90",
  google:
    "border border-foreground/15 bg-transparent text-foreground hover:bg-foreground/5",
  naver: "bg-[#03C75A] text-white hover:opacity-90",
};

export function SnsLoginButtons({ providers }: { providers: SnsProvider[] }) {
  if (providers.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => signIn(provider, { callbackUrl: "/onboarding" })}
          className={`rounded-xl px-4 py-3 text-sm font-semibold transition-opacity ${PROVIDER_STYLE[provider]}`}
        >
          {PROVIDER_LABEL[provider]}
        </button>
      ))}
    </div>
  );
}
