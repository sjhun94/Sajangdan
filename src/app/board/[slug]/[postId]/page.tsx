import { notFound } from "next/navigation";
import { getBoardBySlug } from "@/lib/boards";
import { getPostById } from "@/lib/posts";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const post = await getPostById(postId);
  if (!post || post.board_id !== board.id) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex flex-col gap-2 border-b border-foreground/10 pb-6">
        <h1 className="text-xl font-bold">{post.title}</h1>
        <div className="text-xs text-foreground/50">
          익명 · 좋아요 {post.like_count} · 댓글 {post.comment_count}
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7">{post.content}</p>
    </div>
  );
}
