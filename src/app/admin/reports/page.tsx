import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPendingReports } from "@/lib/reports";
import { formatShortDate } from "@/lib/format";
import { ReportActions } from "@/components/admin/report-actions";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const reports = await listPendingReports();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-black">신고 처리</h1>

      <div className="flex flex-col divide-y divide-foreground/10">
        {reports.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            대기 중인 신고가 없어요.
          </p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/60">
                {r.targetType === "post" ? "게시글" : "댓글"} · {r.reasonLabel}
              </span>
              <span className="text-xs text-foreground/40">
                {formatShortDate(r.createdAt)}
              </span>
            </div>
            <Link
              href={`/board/${r.boardSlug}/${r.postId}`}
              className="text-sm font-medium hover:text-accent"
            >
              {r.postTitle}
            </Link>
            {r.commentContent && (
              <p className="rounded-lg bg-foreground/5 px-3 py-2 text-sm text-foreground/70">
                {r.commentContent}
              </p>
            )}
            {r.detail && (
              <p className="text-xs text-foreground/50">사유: {r.detail}</p>
            )}
            <span className="text-xs text-foreground/40">
              신고자: {r.reporterLabel}
            </span>
            <ReportActions reportId={r.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
