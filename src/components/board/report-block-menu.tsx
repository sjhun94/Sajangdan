"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "spam", label: "스팸/광고" },
  { value: "abuse", label: "욕설/비방" },
  { value: "fraud", label: "사기/허위정보" },
  { value: "other", label: "기타" },
];

export function ReportBlockMenu({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment";
  targetId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "report">("menu");
  const [reason, setReason] = useState("spam");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const basePath = targetType === "post" ? "/api/posts" : "/api/comments";

  function reset() {
    setOpen(false);
    setMode("menu");
    setReason("spam");
    setDetail("");
    setLoading(false);
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${basePath}/${targetId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail: detail || undefined }),
      });
      if (res.ok) {
        setDone("신고가 접수됐어요.");
      } else {
        const data = await res.json().catch(() => null);
        setDone(data?.error ?? "신고 접수에 실패했어요.");
      }
    } catch {
      setDone("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock() {
    if (!confirm("이 사용자를 차단할까요? 차단하면 이 사용자의 글/댓글이 더 이상 보이지 않아요.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${basePath}/${targetId}/block`, {
        method: "POST",
      });
      if (res.ok) {
        reset();
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "차단에 실패했어요.");
    } catch {
      alert("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="text-xs text-foreground/40">{done}</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-foreground/40 hover:text-foreground/70"
        aria-label="더보기"
      >
        ⋯
      </button>
    );
  }

  if (mode === "menu") {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <button
          onClick={() => setMode("report")}
          className="font-medium text-foreground/50 hover:text-accent"
        >
          신고하기
        </button>
        <button
          onClick={handleBlock}
          disabled={loading}
          className="font-medium text-foreground/50 hover:text-accent disabled:opacity-50"
        >
          차단하기
        </button>
        <button
          onClick={reset}
          className="font-medium text-foreground/30 hover:text-foreground/60"
        >
          닫기
        </button>
      </span>
    );
  }

  return (
    <form
      onSubmit={handleReportSubmit}
      className="flex flex-col gap-2 rounded-xl border border-foreground/10 p-3"
    >
      <span className="text-xs font-semibold">신고 사유를 선택해주세요</span>
      <div className="flex flex-wrap gap-2">
        {REASON_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
              reason === opt.value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-foreground/15 text-foreground/60"
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={opt.value}
              checked={reason === opt.value}
              onChange={() => setReason(opt.value)}
              className="hidden"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {reason === "other" && (
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="어떤 문제인지 알려주세요"
          rows={2}
          className="rounded-lg border border-foreground/15 bg-transparent px-2 py-1.5 text-xs outline-none focus:border-accent"
        />
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-3 py-1 text-xs text-foreground/50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {loading ? "제출 중..." : "제출"}
        </button>
      </div>
    </form>
  );
}
