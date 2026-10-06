"use client";

import { useEffect, useState } from "react";
import {
  PUSH_PROMPT_EVENT,
  getIosInstallHint,
  hasPushSubscription,
  isWebPushSupported,
  subscribePush,
  type PushPromptReason,
} from "@/lib/webPushClient";
import { IosInstallGuide } from "@/components/ios-install-guide";

// "나중에"를 누르면 이 기간 동안은 다시 묻지 않는다
const DISMISS_KEY = "sajangdan:push-prompt-dismissed-at";
const DISMISS_DAYS = 7;

const MESSAGES: Record<PushPromptReason, string> = {
  post: "내 글에 댓글이 달리면 바로 알려드릴까요?",
  comment: "내 댓글에 답글이 달리면 바로 알려드릴까요?",
};

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return !!at && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

// 글/댓글을 쓴 직후 화면 아래에 뜨는 알림 받기 안내 (layout 에 한 번만 둔다)
export function PushPrompt() {
  const [reason, setReason] = useState<PushPromptReason | null>(null);
  const [result, setResult] = useState<"on" | "denied" | null>(null);
  const [busy, setBusy] = useState(false);
  // 아이폰(홈 화면 미설치)이면 알림 켜기 대신 설치 방법을 보여준다
  const [iosHint, setIosHint] = useState<"install" | "open-in-browser" | null>(
    null
  );

  useEffect(() => {
    async function onPrompt(e: Event) {
      const r = (e as CustomEvent<PushPromptReason>).detail;
      if (dismissedRecently()) return;
      const hint = getIosInstallHint();
      if (hint) {
        setResult(null);
        setIosHint(hint);
        setReason(r);
        return;
      }
      if (!isWebPushSupported()) return;
      if (Notification.permission === "denied") return;
      try {
        if (await hasPushSubscription()) return;
      } catch {
        return;
      }
      setResult(null);
      setReason(r);
    }
    window.addEventListener(PUSH_PROMPT_EVENT, onPrompt);
    return () => window.removeEventListener(PUSH_PROMPT_EVENT, onPrompt);
  }, []);

  // 결과 안내는 잠깐 보여주고 닫는다
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setReason(null), 2500);
    return () => clearTimeout(t);
  }, [result]);

  if (!reason) return null;

  async function accept() {
    setBusy(true);
    try {
      const r = await subscribePush();
      if (r === "off") setReason(null);
      else setResult(r);
    } catch {
      setReason(null);
    } finally {
      setBusy(false);
    }
  }

  function later() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setReason(null);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-foreground/10 bg-background p-4 shadow-lg">
        {iosHint ? (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">🔔 {MESSAGES[reason]}</span>
              <span className="text-xs text-foreground/50">
                아이폰은 사장단을 홈 화면에 추가하면 알림을 받을 수 있어요.
              </span>
              <IosInstallGuide hint={iosHint} />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={later}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground"
              >
                확인
              </button>
            </div>
          </>
        ) : result ? (
          <p className="text-sm font-semibold">
            {result === "on"
              ? "🔔 알림이 켜졌어요. 알림 페이지에서 언제든 끌 수 있어요."
              : "알림이 차단됐어요. 나중에 브라우저 설정에서 허용할 수 있어요."}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">🔔 {MESSAGES[reason]}</span>
              <span className="text-xs text-foreground/50">
                사이트를 안 열어놔도 알림으로 알려드려요. 알림 페이지에서 언제든 끌 수 있어요.
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={later}
                disabled={busy}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-foreground/60 disabled:opacity-50"
              >
                나중에
              </button>
              <button
                type="button"
                onClick={accept}
                disabled={busy}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                알림 받기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
