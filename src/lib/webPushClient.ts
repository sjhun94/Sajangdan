// 브라우저(클라이언트)에서만 쓰는 웹 푸시 도우미.
// 알림 페이지의 스위치(PushToggle)와 글/댓글 작성 직후 안내(PushPrompt)가 함께 쓴다.
import { Capacitor } from "@capacitor/core";

export const PUSH_PROMPT_EVENT = "sajangdan:push-prompt";
export type PushPromptReason = "post" | "comment";

// 글/댓글을 쓴 직후 호출하면 화면 아래에 "알림 받을까요?" 안내가 뜬다
// (이미 켜져 있거나, 차단했거나, 최근에 "나중에"를 눌렀으면 안 뜸)
export function requestPushPrompt(reason: PushPromptReason) {
  window.dispatchEvent(
    new CustomEvent<PushPromptReason>(PUSH_PROMPT_EVENT, { detail: reason })
  );
}

// 안드로이드 앱(WebView)과 푸시 미지원 브라우저에서는 웹 푸시를 쓰지 않는다
export function isWebPushSupported(): boolean {
  return (
    !Capacitor.isNativePlatform() &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
}

export async function hasPushSubscription(): Promise<boolean> {
  const reg = await navigator.serviceWorker.register("/sw.js");
  return !!(await reg.pushManager.getSubscription());
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

// 권한을 묻고 구독해서 서버에 저장한다. 결과: 켜짐 / 차단됨 / 실패(꺼짐)
export async function subscribePush(): Promise<"on" | "denied" | "off"> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return permission === "denied" ? "denied" : "off";
  }
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return res.ok ? "on" : "off";
}
