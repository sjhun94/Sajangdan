import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardBySlug } from "@/lib/boards";
import { listPosts } from "@/lib/posts";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const posts = await listPosts({ boardId: board.id, query: q });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{board.name}</h1>
        <Link
          href={`/board/${slug}/new`}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          글쓰기
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="검색어를 입력하세요"
          className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          검색
        </button>
      </form>

      <div className="flex flex-col divide-y divide-foreground/10">
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            아직 글이 없어요. 첫 글을 남겨보세요.
          </p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${slug}/${post.id}`}
            className="flex flex-col gap-1 py-4 hover:opacity-80"
          >
            <span className="font-medium">{post.title}</span>
            <span className="text-xs text-foreground/50">
              익명 · 좋아요 {post.like_count} · 댓글 {post.comment_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
