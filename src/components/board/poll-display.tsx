"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PollOption = {
  id: string;
  label: string;
  voteCount: number;
  percentage: number;
  isMyVote: boolean;
};

export function PollDisplay({
  postId,
  initialOptions,
  initialTotalVotes,
  isLoggedIn,
}: {
  postId: string;
  initialOptions: PollOption[];
  initialTotalVotes: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [options, setOptions] = useState(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVote(optionId: string) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setError(null);
    setLoading(optionId);

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "투표에 실패했어요.");
        setLoading(null);
        return;
      }

      setOptions(data.poll.options);
      setTotalVotes(data.poll.totalVotes);
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-foreground/10 p-4">
      <span className="text-xs font-medium text-foreground/50">
        투표 {totalVotes}명 참여
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleVote(option.id)}
          disabled={loading !== null}
          className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-70 ${
            option.isMyVote
              ? "border-accent"
              : "border-foreground/15 hover:border-accent"
          }`}
        >
          <span
            className="absolute inset-y-0 left-0 bg-accent/15"
            style={{ width: `${option.percentage}%` }}
          />
          <span className="relative flex items-center justify-between gap-2">
            <span className="font-medium">
              {option.label}
              {option.isMyVote && (
                <span className="ml-1 text-xs text-accent">✓ 내 투표</span>
              )}
            </span>
            <span className="shrink-0 text-xs text-foreground/60">
              {option.percentage}% ({option.voteCount})
            </span>
          </span>
        </button>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!isLoggedIn && (
        <p className="text-xs text-foreground/50">로그인하면 투표할 수 있어요.</p>
      )}
    </div>
  );
}
