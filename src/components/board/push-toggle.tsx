"use client";

import { useEffect, useState } from "react";
import {
  getIosInstallHint,
  hasPushSubscription,
  isWebPushSupported,
  subscribePush,
} from "@/lib/webPushClient";
import { IosInstallGuide } from "@/components/ios-install-guide";

type State = "loading" | "unsupported" | "denied" | "off" | "on";
type IosHint = "install" | "open-in-browser";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [iosHint, setIosHint] = useState<IosHint | null>(null);

  useEffect(() => {
    // 아이폰에서 아직 홈 화면에 추가하지 않았으면 설치 방법을 안내
    const hint = getIosInstallHint();
    if (hint) {
      setIosHint(hint);
      return;
    }
    // 안드로이드 앱(WebView)과 푸시 미지원 브라우저에서는 숨김
    if (!isWebPushSupported()) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    hasPushSubscription()
      .then((on) => setState(on ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, []);

  async function turnOn() {
    setBusy(true);
    try {
      setState(await subscribePush());
    } catch {
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (iosHint) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-foreground/10 p-4">
        <span className="text-sm font-semibold">📱 아이폰에서 알림 받기</span>
        <IosInstallGuide hint={iosHint} />
      </div>
    );
  }

  if (state === "loading" || state === "unsupported") return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-foreground/10 p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">이 기기로 알림 받기</span>
        <span className="text-xs text-foreground/50">
          {state === "denied"
            ? "브라우저 설정에서 사장단 알림이 차단돼 있어요. 설정에서 허용해주세요."
            : "내 글과 댓글에 반응이 오면 사이트를 안 열어놔도 알려드려요."}
        </span>
      </div>
      {state !== "denied" && (
        <button
          type="button"
          role="switch"
          aria-checked={state === "on"}
          aria-label="이 기기로 알림 받기"
          onClick={state === "on" ? turnOff : turnOn}
          disabled={busy}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            state === "on" ? "bg-accent" : "bg-foreground/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              state === "on" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      )}
    </div>
  );
}
