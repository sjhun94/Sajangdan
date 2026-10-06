"use client";

import { useRouter } from "next/navigation";
import { SIDO_COOKIE, SIDO_LIST } from "@/lib/sido";

// 지원사업 지역 선택. 고른 지역은 쿠키에 기억해서 다음에 와도 그대로 보여준다.
export function SidoSelect({
  value,
  group,
}: {
  value: string | null;
  group: string | null;
}) {
  const router = useRouter();

  function change(next: string) {
    document.cookie = `${SIDO_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const params = new URLSearchParams();
    if (group) params.set("group", group);
    params.set("sido", next);
    router.push(`/support?${params.toString()}`);
  }

  return (
    <select
      value={value ?? "all"}
      onChange={(e) => change(e.target.value)}
      aria-label="지역 선택"
      className="rounded-full border border-foreground/15 bg-transparent px-3 py-1.5 text-xs font-medium outline-none focus:border-accent"
    >
      <option value="all">📍 전체 지역</option>
      {SIDO_LIST.map((s) => (
        <option key={s.key} value={s.key}>
          📍 {s.key} + 전국 공고
        </option>
      ))}
    </select>
  );
}
