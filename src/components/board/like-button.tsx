"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LikeButton({
  targetType,
  targetId,
  initialLiked,
  initialCount,
}: {
  targetType: "post" | "comment";
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    const endpoint =
      targetType === "post"
        ? `/api/posts/${targetId}/like`
        : `/api/comments/${targetId}/like`;

    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likeCount);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        liked
          ? "border-accent bg-accent text-accent-foreground"
          : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
      }`}
    >
      좋아요 {count}
    </button>
  );
}
