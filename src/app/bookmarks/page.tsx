import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listMyBookmarks } from "@/lib/bookmarks";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { formatShortDate } from "@/lib/format";
import { Pagination, getTotalPages } from "@/components/board/pagination";

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { results, total } = await listMyBookmarks({
    userId: session.user.id,
    page,
  });
  const totalPages = getTotalPages(total);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">내 스크랩</h1>

      <div className="flex flex-col divide-y divide-foreground/10">
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            스크랩한 글이 없어요.
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

      <Pagination basePath="/bookmarks" page={page} totalPages={totalPages} />
    </div>
  );
}
