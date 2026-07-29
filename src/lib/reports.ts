import { pool } from "@/lib/db";
import { formatOwnerLabel } from "@/lib/anon";

export type ReportReason = "spam" | "abuse" | "fraud" | "other";
export type ReportTargetType = "post" | "comment";

const REASON_LABEL: Record<ReportReason, string> = {
  spam: "스팸/광고",
  abuse: "욕설/비방",
  fraud: "사기/허위정보",
  other: "기타",
};

export async function createReport({
  reporterUserId,
  targetType,
  postId,
  commentId,
  reason,
  detail,
}: {
  reporterUserId: string;
  targetType: ReportTargetType;
  postId: string;
  commentId?: string;
  reason: ReportReason;
  detail?: string;
}): Promise<void> {
  await pool.query(
    `insert into reports (id, reporter_user_id, target_type, post_id, comment_id, reason, detail)
     values (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
    [
      reporterUserId,
      targetType,
      postId,
      commentId ?? null,
      reason,
      detail ?? null,
    ]
  );
}

export type PendingReportView = {
  id: string;
  targetType: ReportTargetType;
  postId: string;
  boardSlug: string;
  postTitle: string;
  commentContent: string | null;
  reasonLabel: string;
  detail: string | null;
  reporterLabel: string;
  createdAt: string;
};

export async function listPendingReports(): Promise<PendingReportView[]> {
  const { rows } = await pool.query<{
    id: string;
    target_type: ReportTargetType;
    post_id: string;
    board_slug: string;
    post_title: string;
    comment_content: string | null;
    reason: ReportReason;
    detail: string | null;
    created_at: string;
    reporter_region: string | null;
    reporter_industry_slug: string | null;
    reporter_owner_status: string;
  }>(
    `select
       r.id, r.target_type, r.post_id, r.reason, r.detail, r.created_at,
       b.slug as board_slug, p.title as post_title,
       c.content as comment_content,
       ru.region as reporter_region, ru.industry_slug as reporter_industry_slug,
       ru.owner_status as reporter_owner_status
     from reports r
     join posts p on p.id = r.post_id
     join boards b on b.id = p.board_id
     join users ru on ru.id = r.reporter_user_id
     left join comments c on c.id = r.comment_id
     where r.status = 'pending'
     order by r.created_at asc`
  );

  return rows.map((row) => ({
    id: row.id,
    targetType: row.target_type,
    postId: row.post_id,
    boardSlug: row.board_slug,
    postTitle: row.post_title,
    commentContent: row.comment_content,
    reasonLabel: REASON_LABEL[row.reason],
    detail: row.detail,
    reporterLabel: formatOwnerLabel({
      region: row.reporter_region,
      industry_slug: row.reporter_industry_slug,
      owner_status: row.reporter_owner_status,
    }),
    createdAt: row.created_at,
  }));
}

export async function resolveReport({
  reportId,
  adminId,
  status,
}: {
  reportId: string;
  adminId: string;
  status: "resolved" | "dismissed";
}): Promise<void> {
  await pool.query(
    `update reports
     set status = $2, reviewer_admin_id = $3, reviewed_at = now()
     where id = $1`,
    [reportId, status, adminId]
  );
}
