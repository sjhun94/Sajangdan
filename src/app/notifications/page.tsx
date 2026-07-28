import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listNotifications, markAllAsRead } from "@/lib/notifications";
import { formatShortDate } from "@/lib/format";
import { Pagination, getTotalPages } from "@/components/board/pagination";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { results, total } = await listNotifications({
    userId: session.user.id,
    page,
  });
  const totalPages = getTotalPages(total);

  // 알림 목록을 확인하면 읽음 처리 (표시는 조회 시점 상태 기준)
  await markAllAsRead(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">알림</h1>

      <div className="flex flex-col divide-y divide-foreground/10">
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            받은 알림이 없어요.
          </p>
        )}
        {results.map((n) => (
          <Link
            key={n.id}
            href={`/board/${n.boardSlug}/${n.postId}`}
            className={`flex flex-col gap-1 py-4 hover:opacity-80 ${
              n.isRead ? "" : "bg-accent/5"
            }`}
          >
            <span className="text-xs font-medium text-foreground/60">
              {n.actorLabel}이{" "}
              {n.type === "reply" ? "회원님의 댓글에 답글" : "회원님의 글에 댓글"}
              을 남겼어요
            </span>
            <span className="font-medium">{n.postTitle}</span>
            {n.commentContent && (
              <span className="line-clamp-1 text-sm text-foreground/50">
                {n.commentContent}
              </span>
            )}
            <span className="text-xs text-foreground/40">
              {formatShortDate(n.createdAt)}
            </span>
          </Link>
        ))}
      </div>

      <Pagination
        basePath="/notifications"
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
