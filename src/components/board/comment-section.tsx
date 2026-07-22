"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LikeButton } from "@/components/board/like-button";

type CommentView = {
  id: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  authorLabel: string;
  isMine: boolean;
  replies: CommentView[];
};

function CommentForm({
  postId,
  parentCommentId,
  onDone,
  autoFocus,
}: {
  postId: string;
  parentCommentId?: string;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "댓글 등록에 실패했어요.");
        setLoading(false);
        return;
      }

      setContent("");
      setLoading(false);
      onDone?.();
      router.refresh();
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        required
        autoFocus={autoFocus}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
        rows={parentCommentId ? 2 : 3}
        className="rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-foreground/50"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {loading ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}

function CommentItem({
  postId,
  comment,
  isReply,
}: {
  postId: string;
  comment: CommentView;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-foreground/70">
          {comment.authorLabel}
        </span>
        <p className="text-sm leading-6 whitespace-pre-wrap">
          {comment.content}
        </p>
        <div className="flex items-center gap-2">
          <LikeButton
            targetType="comment"
            targetId={comment.id}
            initialLiked={comment.likedByMe}
            initialCount={comment.likeCount}
          />
          {!isReply && (
            <button
              onClick={() => setReplying((v) => !v)}
              className="text-xs font-medium text-foreground/50 hover:text-accent"
            >
              답글달기
            </button>
          )}
        </div>
      </div>

      {replying && (
        <div className="pl-4">
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            onDone={() => setReplying(false)}
            autoFocus
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="flex flex-col gap-3 border-l border-foreground/10 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  comments,
  isLoggedIn,
}: {
  postId: string;
  comments: CommentView[];
  isLoggedIn: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-bold text-foreground/70">
        댓글 {comments.length + comments.reduce((n, c) => n + c.replies.length, 0)}
      </h2>

      {isLoggedIn ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="text-sm text-foreground/50">
          <Link href="/login" className="font-medium text-accent">
            로그인
          </Link>
          하면 댓글을 남길 수 있어요.
        </p>
      )}

      <div className="flex flex-col gap-5">
        {comments.map((comment) => (
          <CommentItem key={comment.id} postId={postId} comment={comment} />
        ))}
      </div>
    </div>
  );
}
