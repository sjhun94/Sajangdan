import Link from "next/link";
import { auth } from "@/auth";
import { listBoards } from "@/lib/boards";
import { listHotPosts } from "@/lib/posts";
import { getBlockedUserIds } from "@/lib/blocks";
import { getIndustryName } from "@/lib/industries";
import { getTopicName } from "@/lib/topics";
import { formatShortDate } from "@/lib/format";

export const metadata = {
  title: "자영업자 커뮤니티 게시판 - 사장님들의 익명 이야기 | 사장단",
  description:
    "익명게시판, 업종별·동네별·주제별 게시판, 지원사업 정보까지. 자영업자 사장님들이 솔직하게 이야기 나누는 커뮤니티 사장단의 게시판 모음이에요.",
  alternates: { canonical: "/board" },
};

const HOT_PREVIEW_COUNT = 5;

export default async function BoardListPage() {
  const session = await auth();
  const excludeUserIds = await getBlockedUserIds(session?.user?.id);

  const [boards, { results: hotPosts }] = await Promise.all([
    listBoards(),
    listHotPosts({
      period: "week",
      excludeUserIds,
      page: 1,
      pageSize: HOT_PREVIEW_COUNT,
    }),
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

      <Link
        href="/support"
        className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/5 p-5 transition-colors hover:border-accent"
      >
        <div>
          <div className="font-bold">📢 지원사업 공고</div>
          <div className="text-sm text-foreground/60">
            지금 신청할 수 있는 정부·지자체 지원사업을 매일 모아드려요
          </div>
        </div>
        <span className="text-sm font-medium text-accent">보기</span>
      </Link>

      <Link
        href="/stats"
        className="flex items-center justify-between rounded-2xl border border-foreground/10 p-5 transition-colors hover:border-accent"
      >
        <div>
          <div className="font-bold">📊 업종별 사장님 현황</div>
          <div className="text-sm text-foreground/60">
            우리 업종 사장님들은 매출이 어느 정도일까?
          </div>
        </div>
        <span className="text-sm font-medium text-accent">보기</span>
      </Link>

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
