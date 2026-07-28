import Link from "next/link";
import { listHotPosts, type HotPostPeriod } from "@/lib/posts";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { formatShortDate } from "@/lib/format";
import { Pagination, getTotalPages } from "@/components/board/pagination";

const PERIOD_LABELS: Record<HotPostPeriod, string> = {
  today: "오늘",
  week: "이번주",
  all: "전체",
};

export default async function HotPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; page?: string }>;
}) {
  const { period: periodParam, page: pageParam } = await searchParams;
  const period: HotPostPeriod =
    periodParam === "today" || periodParam === "all" ? periodParam : "week";
  const page = Math.max(1, Number(pageParam) || 1);

  const { results, total } = await listHotPosts({ period, page });
  const totalPages = getTotalPages(total);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">인기글</h1>

      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as HotPostPeriod[]).map((p) => (
          <Link
            key={p}
            href={`/hot?period=${p}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p
                ? "border-accent bg-accent text-accent-foreground"
                : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
            }`}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-foreground/10">
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            아직 인기글이 없어요.
          </p>
        )}
        {results.map((post, index) => (
          <Link
            key={post.id}
            href={`/board/${post.board_slug}/${post.id}`}
            className="flex flex-col gap-1 py-4 hover:opacity-80"
          >
            <span className="flex items-center gap-1">
              <span className="text-xs font-bold text-accent">
                {(page - 1) * 20 + index + 1}
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
        basePath="/hot"
        page={page}
        totalPages={totalPages}
        extraParams={{ period }}
      />
    </div>
  );
}
