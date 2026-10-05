"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = window.location.href;
    // 모바일에서는 카카오톡 등 공유 시트를 띄우고, 지원하지 않는 PC 브라우저는 링크 복사
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 사용자가 공유 창을 닫은 경우
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full border border-foreground/15 px-3 py-1 text-xs font-medium text-foreground/60 transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? "링크 복사됨" : "공유"}
    </button>
  );
}
