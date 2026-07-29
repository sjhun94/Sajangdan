"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle(action: "delete_content" | "dismiss") {
    if (
      action === "delete_content" &&
      !confirm("이 글/댓글을 삭제 처리할까요?")
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("처리에 실패했어요.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle("delete_content")}
        disabled={loading}
        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        삭제 처리
      </button>
      <button
        onClick={() => handle("dismiss")}
        disabled={loading}
        className="rounded-full border border-foreground/15 px-3 py-1.5 text-xs font-medium text-foreground/60 disabled:opacity-50"
      >
        기각
      </button>
    </div>
  );
}
