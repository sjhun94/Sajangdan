"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationReviewForm({
  verificationId,
}: {
  verificationId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !reason.trim()) {
      setError("반려 사유를 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(action);

    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "reject" ? reason : undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "처리에 실패했어요.");
        setLoading(null);
        return;
      }

      router.push("/admin/verifications");
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="반려 시 사유를 입력하세요 (승인 시에는 필요 없음)"
        rows={3}
        className="rounded-xl border border-foreground/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {loading === "approve" ? "처리 중..." : "승인"}
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="flex-1 rounded-full border border-foreground/15 px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading === "reject" ? "처리 중..." : "반려"}
        </button>
      </div>
    </div>
  );
}
