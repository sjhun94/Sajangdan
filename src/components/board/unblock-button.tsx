"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnblockButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blocked-users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-foreground/15 px-3 py-1 text-xs font-medium text-foreground/60 hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {loading ? "처리 중..." : "차단 해제"}
    </button>
  );
}
