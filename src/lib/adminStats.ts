import { pool } from "@/lib/db";

// 운영 대시보드용 숫자. 데모·테스트·관리자·탈퇴 계정은 빼고 실제 사장님 활동만 센다.
const REAL_USER = `u.role = 'user' and u.deleted_at is null
  and u.email not like '%@sajangdan.demo' and u.email not like '%@example.com'`;
const KST_TODAY = `(now() at time zone 'Asia/Seoul')::date`;
const kstDate = (col: string) => `(${col} at time zone 'Asia/Seoul')::date`;

export type AdminOverview = {
  pending: { business: number; revenue: number; reports: number };
  users: { total: number; today: number; week: number; pushOn: number };
  posts: { today: number; week: number };
  comments: { today: number; week: number };
  lastSupportFetch: string | null;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const { rows } = await pool.query<Record<string, string | null>>(`
    select
      (select count(*) from business_verifications where status = 'pending') as pending_business,
      (select count(*) from revenue_verifications where status = 'pending') as pending_revenue,
      (select count(*) from reports where status = 'pending') as pending_reports,
      (select count(*) from users u where ${REAL_USER}) as users_total,
      (select count(*) from users u where ${REAL_USER} and ${kstDate("u.created_at")} = ${KST_TODAY}) as users_today,
      (select count(*) from users u where ${REAL_USER} and ${kstDate("u.created_at")} > ${KST_TODAY} - 7) as users_week,
      (select count(distinct s.user_id) from push_subscriptions s join users u on u.id = s.user_id where ${REAL_USER}) as push_on,
      (select count(*) from posts p join users u on u.id = p.user_id where ${REAL_USER} and p.deleted_at is null and ${kstDate("p.created_at")} = ${KST_TODAY}) as posts_today,
      (select count(*) from posts p join users u on u.id = p.user_id where ${REAL_USER} and p.deleted_at is null and ${kstDate("p.created_at")} > ${KST_TODAY} - 7) as posts_week,
      (select count(*) from comments c join users u on u.id = c.user_id where ${REAL_USER} and c.deleted_at is null and ${kstDate("c.created_at")} = ${KST_TODAY}) as comments_today,
      (select count(*) from comments c join users u on u.id = c.user_id where ${REAL_USER} and c.deleted_at is null and ${kstDate("c.created_at")} > ${KST_TODAY} - 7) as comments_week,
      (select to_char(max(created_at) at time zone 'Asia/Seoul', 'MM/DD HH24:MI') from support_programs) as last_support_fetch
  `);
  const r = rows[0];
  const n = (v: string | null) => Number(v ?? 0);
  return {
    pending: {
      business: n(r.pending_business),
      revenue: n(r.pending_revenue),
      reports: n(r.pending_reports),
    },
    users: {
      total: n(r.users_total),
      today: n(r.users_today),
      week: n(r.users_week),
      pushOn: n(r.push_on),
    },
    posts: { today: n(r.posts_today), week: n(r.posts_week) },
    comments: { today: n(r.comments_today), week: n(r.comments_week) },
    lastSupportFetch: r.last_support_fetch,
  };
}

export type DailyActivity = {
  date: string; // MM/DD
  signups: number;
  posts: number;
  comments: number;
};

// 최근 14일 하루별 가입·글·댓글 수
export async function getDailyActivity(days = 14): Promise<DailyActivity[]> {
  const { rows } = await pool.query<{
    d: string;
    signups: string;
    posts: string;
    comments: string;
  }>(
    `with days as (
       select generate_series(${KST_TODAY} - ($1::int - 1), ${KST_TODAY}, interval '1 day')::date as d
     )
     select to_char(days.d, 'MM/DD') as d,
       (select count(*) from users u where ${REAL_USER} and ${kstDate("u.created_at")} = days.d) as signups,
       (select count(*) from posts p join users u on u.id = p.user_id
          where ${REAL_USER} and p.deleted_at is null and ${kstDate("p.created_at")} = days.d) as posts,
       (select count(*) from comments c join users u on u.id = c.user_id
          where ${REAL_USER} and c.deleted_at is null and ${kstDate("c.created_at")} = days.d) as comments
     from days order by days.d`,
    [days]
  );
  return rows.map((r) => ({
    date: r.d,
    signups: Number(r.signups),
    posts: Number(r.posts),
    comments: Number(r.comments),
  }));
}

// 최근 7일 게시판별 글 수와 조회수
export async function getBoardActivity(): Promise<
  { slug: string; name: string; posts: number; views: number }[]
> {
  const { rows } = await pool.query<{
    slug: string;
    name: string;
    posts: string;
    views: string;
  }>(
    `select b.slug, b.name,
       count(p.id) as posts,
       coalesce(sum(p.view_count), 0) as views
     from boards b
     left join posts p on p.board_id = b.id and p.deleted_at is null
       and ${kstDate("p.created_at")} > ${KST_TODAY} - 7
       and exists (select 1 from users u where u.id = p.user_id and ${REAL_USER})
     group by b.id, b.slug, b.name
     order by count(p.id) desc, b.name`
  );
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    posts: Number(r.posts),
    views: Number(r.views),
  }));
}

// 최근 7일 글 중 많이 본 글
export async function getTopPostsThisWeek(limit = 5): Promise<
  { id: string; boardSlug: string; title: string; views: number; comments: number }[]
> {
  const { rows } = await pool.query<{
    id: string;
    slug: string;
    title: string;
    view_count: number;
    comment_count: number;
  }>(
    `select p.id, b.slug, p.title, p.view_count, p.comment_count
     from posts p join boards b on b.id = p.board_id join users u on u.id = p.user_id
     where ${REAL_USER} and p.deleted_at is null
       and ${kstDate("p.created_at")} > ${KST_TODAY} - 7
     order by p.view_count desc, p.comment_count desc
     limit $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    boardSlug: r.slug,
    title: r.title,
    views: r.view_count,
    comments: r.comment_count,
  }));
}
