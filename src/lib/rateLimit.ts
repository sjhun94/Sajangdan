import { pool } from "@/lib/db";

type RateLimitedTable = "posts" | "comments" | "reports";

export async function isRateLimited({
  table,
  userId,
  windowMinutes,
  maxCount,
}: {
  table: RateLimitedTable;
  userId: string;
  windowMinutes: number;
  maxCount: number;
}): Promise<boolean> {
  const column = table === "reports" ? "reporter_user_id" : "user_id";
  const { rows } = await pool.query<{ count: string }>(
    `select count(*) from ${table}
     where ${column} = $1 and created_at >= now() - interval '${windowMinutes} minutes'`,
    [userId]
  );
  return Number(rows[0].count) >= maxCount;
}
