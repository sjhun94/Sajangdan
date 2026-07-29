"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Capacitor } from "@capacitor/core";
import type { SnsProvider } from "@/lib/snsProviders";

const PROVIDER_LABEL: Record<SnsProvider, string> = {
  kakao: "카카오로 계속하기",
  google: "구글로 계속하기",
  naver: "네이버로 계속하기",
};

const PROVIDER_STYLE: Record<SnsProvider, string> = {
  kakao: "bg-[#FEE500] text-black hover:opacity-90",
  google:
    "border border-foreground/15 bg-white text-black hover:bg-foreground/5",
  naver: "bg-[#03C75A] text-white hover:opacity-90",
};

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.62 6.58-.2.74-.73 2.7-.84 3.12-.13.51.19.5.4.37.16-.1 2.6-1.77 3.65-2.49.71.1 1.44.16 2.17.16 5.52 0 10-3.48 10-7.74C22 6.48 17.52 3 12 3z"
        fill="#000000"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 6.1 29.7 4 24 4 16.1 4 9.4 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.6 0 10.7-2.1 14.5-5.6l-6.7-5.7C29.6 34.5 26.9 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.3 39.4 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.7 5.7C40.9 36.8 44 31 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.6 12.4L9.6 6.5H6v11h4.4v-5.9l4 5.9H18v-11h-4.4v5.9z"
        fill="#ffffff"
      />
    </svg>
  );
}

const PROVIDER_ICON: Record<SnsProvider, () => React.JSX.Element> = {
  kakao: KakaoIcon,
  google: GoogleIcon,
  naver: NaverIcon,
};

const BRIDGE_CALLBACK_URL = "/auth/bridge/start";

export function SnsLoginButtons({ providers }: { providers: SnsProvider[] }) {
  const searchParams = useSearchParams();
  const nativeProvider = searchParams.get("native") === "1"
    ? (searchParams.get("provider") as SnsProvider | null)
    : null;

  // 안드로이드 앱 안의 외부 브라우저로 이 페이지가 열렸을 때(native=1),
  // 사용자가 다시 누를 필요 없이 바로 SNS 로그인을 시작함
  useEffect(() => {
    if (nativeProvider && providers.includes(nativeProvider)) {
      signIn(nativeProvider, { callbackUrl: BRIDGE_CALLBACK_URL });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (providers.length === 0) return null;

  async function handleClick(provider: SnsProvider) {
    if (Capacitor.isNativePlatform()) {
      // 앱 안 WebView에서는 카카오/구글/네이버 로그인이 정상 동작하지 않아서,
      // 외부 브라우저로 로그인을 열고 끝나면 딥링크로 앱에 돌아오게 함
      const { Browser } = await import("@capacitor/browser");
      const url = new URL("https://worktalk-one.vercel.app/login");
      url.searchParams.set("native", "1");
      url.searchParams.set("provider", provider);
      await Browser.open({ url: url.toString() });
      return;
    }
    signIn(provider, { callbackUrl: "/onboarding" });
  }

  if (nativeProvider) {
    return (
      <p className="text-sm text-foreground/60">로그인 진행 중이에요...</p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {providers.map((provider) => {
        const Icon = PROVIDER_ICON[provider];
        return (
          <button
            key={provider}
            type="button"
            onClick={() => handleClick(provider)}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity ${PROVIDER_STYLE[provider]}`}
          >
            <Icon />
            {PROVIDER_LABEL[provider]}
          </button>
        );
      })}
    </div>
  );
}
