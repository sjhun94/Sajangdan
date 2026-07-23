import Link from "next/link";
import { searchAllPosts } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { Pagination, getTotalPages } from "@/components/board/pagination";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim();

  const { results, total } = query
    ? await searchAllPosts({ query, page })
    : { results: [], total: 0 };
  const totalPages = getTotalPages(total);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">전체 게시판 검색</h1>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="모든 게시판에서 검색"
          className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          검색
        </button>
      </form>

      {query && (
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>
            &lsquo;{query}&rsquo; 검색결과 {total}건
          </span>
          <Link href="/search" className="font-medium text-accent">
            검색 지우기
          </Link>
        </div>
      )}

      <div className="flex flex-col divide-y divide-foreground/10">
        {!query && (
          <p className="py-10 text-center text-sm text-foreground/50">
            검색어를 입력해주세요.
          </p>
        )}
        {query && results.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            검색 결과가 없어요.
          </p>
        )}
        {results.map((post) => (
          <Link
            key={post.id}
            href={`/board/${post.board_slug}/${post.id}`}
            className="flex flex-col gap-1 py-4 hover:opacity-80"
          >
            <span className="flex gap-1">
              <span className="inline-flex w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                {post.board_name}
              </span>
              {post.industry_slug && (
                <span className="inline-flex w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                  {getIndustryName(post.industry_slug)}
                </span>
              )}
            </span>
            <span className="font-medium">{post.title}</span>
            <span className="text-xs text-foreground/50">
              익명 · 좋아요 {post.like_count} · 댓글 {post.comment_count}
            </span>
          </Link>
        ))}
      </div>

      {query && (
        <Pagination
          basePath="/search"
          page={page}
          totalPages={totalPages}
          extraParams={{ q: query }}
        />
      )}
    </div>
  );
}
