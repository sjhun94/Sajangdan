import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardBySlug } from "@/lib/boards";
import { countPosts, listPosts } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { formatShortDate } from "@/lib/format";
import { Pagination, getTotalPages } from "@/components/board/pagination";
import { IndustryTabs } from "@/components/board/industry-tabs";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string; industry?: string }>;
}) {
  const { slug } = await params;
  const { q, page: pageParam, industry } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const isIndustryBoard = slug === "industry";
  const industrySlug = isIndustryBoard ? industry : undefined;

  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const [posts, total] = await Promise.all([
    listPosts({ boardId: board.id, query: q, industrySlug, page }),
    countPosts({ boardId: board.id, query: q, industrySlug }),
  ]);
  const totalPages = getTotalPages(total);

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

      {isIndustryBoard && (
        <IndustryTabs slug={slug} active={industrySlug} q={q} />
      )}

      <form className="flex gap-2">
        {industrySlug && (
          <input type="hidden" name="industry" value={industrySlug} />
        )}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="이 게시판에서 검색"
          className="flex-1 rounded-xl border border-foreground/15 bg-transparent px-4 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          검색
        </button>
      </form>

      {q && (
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>
            &lsquo;{q}&rsquo; 검색결과 {total}건
          </span>
          <Link
            href={
              industrySlug
                ? `/board/${slug}?industry=${industrySlug}`
                : `/board/${slug}`
            }
            className="font-medium text-accent"
          >
            검색 지우기
          </Link>
        </div>
      )}

      <div className="flex flex-col divide-y divide-foreground/10">
        {posts.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            {q
              ? "검색 결과가 없어요."
              : "아직 글이 없어요. 첫 글을 남겨보세요."}
          </p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${slug}/${post.id}`}
            className="flex flex-col gap-1 py-4 hover:opacity-80"
          >
            {post.industry_slug && (
              <span className="w-fit rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                {getIndustryName(post.industry_slug)}
              </span>
            )}
            <span className="font-medium">{post.title}</span>
            <span className="text-xs text-foreground/50">
              {post.author_label} · {formatShortDate(post.created_at)} · 조회{" "}
              {post.view_count} · 좋아요 {post.like_count} · 댓글{" "}
              {post.comment_count}
            </span>
          </Link>
        ))}
      </div>

      <Pagination
        basePath={`/board/${slug}`}
        page={page}
        totalPages={totalPages}
        extraParams={{ q, industry: industrySlug }}
      />
    </div>
  );
}
