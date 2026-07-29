"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function WithdrawButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "정말 탈퇴할까요? 작성한 글/댓글은 남지만 작성자는 '(알 수 없음)'으로 표시되고, 계정은 복구할 수 없어요."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/withdraw", { method: "POST" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
        return;
      }
      alert("탈퇴 처리에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-center text-sm text-foreground/40 hover:text-red-500 disabled:opacity-50"
    >
      {loading ? "처리 중..." : "회원 탈퇴"}
    </button>
  );
}
