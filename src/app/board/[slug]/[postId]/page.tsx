import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBoardBySlug } from "@/lib/boards";
import { getPostById } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { listComments } from "@/lib/comments";
import { LikeButton } from "@/components/board/like-button";
import { CommentSection } from "@/components/board/comment-section";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  const session = await auth();
  const currentUserId = session?.user?.id;

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const post = await getPostById(postId, currentUserId);
  if (!post || post.board_id !== board.id) notFound();

  const comments = await listComments(postId, currentUserId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3 border-b border-foreground/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground/70">
            {post.author_label}
          </span>
          {post.industry_slug && (
            <span className="w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              {getIndustryName(post.industry_slug)}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-7">
          {post.content}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <LikeButton
            targetType="post"
            targetId={post.id}
            initialLiked={post.liked_by_me}
            initialCount={post.like_count}
          />
          <span className="text-xs text-foreground/50">
            댓글 {post.comment_count}
          </span>
        </div>
      </div>

      <CommentSection
        postId={post.id}
        comments={comments}
        isLoggedIn={!!currentUserId}
      />
    </div>
  );
}
