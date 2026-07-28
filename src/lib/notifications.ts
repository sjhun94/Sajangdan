import { pool } from "@/lib/db";
import { formatOwnerLabel } from "@/lib/anon";

export type NotificationType = "comment" | "reply";

export type NotificationView = {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  postId: string;
  boardSlug: string;
  postTitle: string;
  commentContent: string | null;
  actorLabel: string;
};

type NotificationRow = {
  id: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  post_id: string;
  post_title: string;
  board_slug: string;
  comment_content: string | null;
  author_region: string | null;
  author_industry_slug: string | null;
  author_owner_status: string | null;
  author_revenue_verification_status: string | null;
  author_revenue_tier: string | null;
  author_years_in_business: number | null;
};

function toView(row: NotificationRow): NotificationView {
  return {
    id: row.id,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
    postId: row.post_id,
    boardSlug: row.board_slug,
    postTitle: row.post_title,
    commentContent: row.comment_content,
    actorLabel: row.author_owner_status
      ? formatOwnerLabel({
          region: row.author_region,
          industry_slug: row.author_industry_slug,
          owner_status: row.author_owner_status,
          revenue_verification_status:
            row.author_revenue_verification_status ?? undefined,
          revenue_tier: row.author_revenue_tier,
          years_in_business: row.author_years_in_business,
        })
      : "알 수 없음",
  };
}

export async function listNotifications({
  userId,
  page = 1,
  pageSize = 20,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}): Promise<{ results: NotificationView[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const { rows: countRows } = await pool.query<{ count: string }>(
    `select count(*) from notifications where user_id = $1`,
    [userId]
  );

  const { rows } = await pool.query<NotificationRow>(
    `select
       n.id, n.type, n.is_read, n.created_at,
       n.post_id, p.title as post_title, b.slug as board_slug,
       c.content as comment_content,
       u.region as author_region, u.industry_slug as author_industry_slug,
       u.owner_status as author_owner_status,
       u.revenue_verification_status as author_revenue_verification_status,
       u.revenue_tier as author_revenue_tier,
       u.years_in_business as author_years_in_business
     from notifications n
     join posts p on p.id = n.post_id
     join boards b on b.id = p.board_id
     left join comments c on c.id = n.comment_id
     left join users u on u.id = c.user_id
     where n.user_id = $1
     order by n.created_at desc
     limit $2 offset $3`,
    [userId, pageSize, offset]
  );

  return {
    results: rows.map(toView),
    total: Number(countRows[0].count),
  };
}

export async function countUnread(userId: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `select count(*) from notifications where user_id = $1 and is_read = false`,
    [userId]
  );
  return Number(rows[0].count);
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await pool.query(
    `update notifications set is_read = true where id = $1 and user_id = $2`,
    [notificationId, userId]
  );
}

export async function markAllAsRead(userId: string): Promise<void> {
  await pool.query(
    `update notifications set is_read = true where user_id = $1 and is_read = false`,
    [userId]
  );
}
