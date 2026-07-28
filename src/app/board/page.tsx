import Link from "next/link";
import { listBoards } from "@/lib/boards";
import { listHotPosts } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { formatShortDate } from "@/lib/format";

const HOT_PREVIEW_COUNT = 5;

export default async function BoardListPage() {
  const [boards, { results: hotPosts }] = await Promise.all([
    listBoards(),
    listHotPosts({ period: "week", page: 1, pageSize: HOT_PREVIEW_COUNT }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">게시판</h1>

      <form action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="전체 게시판에서 검색"
          className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          검색
        </button>
      </form>

      {hotPosts.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-foreground/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">🔥 인기글</h2>
            <Link href="/hot" className="text-xs font-medium text-accent">
              더보기
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-foreground/10">
            {hotPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/board/${post.board_slug}/${post.id}`}
                className="flex flex-col gap-1 py-3 hover:opacity-80"
              >
                <span className="flex items-center gap-1">
                  <span className="text-xs font-bold text-accent">
                    {index + 1}
                  </span>
                  <span className="inline-flex w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                    {post.board_name}
                  </span>
                  {(post.industry_slug || post.topic_slug) && (
                    <span className="inline-flex w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                      {getIndustryName(post.industry_slug) ??
                        getTopicName(post.topic_slug)}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium">{post.title}</span>
                <span className="text-xs text-foreground/50">
                  {post.author_label} · {formatShortDate(post.created_at)} ·
                  좋아요 {post.like_count} · 댓글 {post.comment_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.slug}`}
            className="rounded-2xl border border-foreground/10 p-5 transition-colors hover:border-accent"
          >
            <div className="font-bold">{board.name}</div>
            <div className="text-sm text-foreground/60">
              {board.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
