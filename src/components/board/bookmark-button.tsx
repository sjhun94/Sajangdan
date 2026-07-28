"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookmarkButton({
  postId,
  initialBookmarked,
}: {
  postId: string;
  initialBookmarked: boolean;
}) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBookmarked(data.bookmarked);
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
        bookmarked
          ? "border-accent bg-accent text-accent-foreground"
          : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
      }`}
    >
      {bookmarked ? "스크랩됨" : "스크랩"}
    </button>
  );
}
