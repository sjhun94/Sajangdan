import { pool } from "@/lib/db";

export async function withdrawAccount(userId: string): Promise<void> {
  await pool.query(
    `update users
     set email = 'withdrawn-' || id || '@sajangdan.invalid',
         password_hash = null,
         oauth_provider = null,
         region = null,
         industry_slug = null,
         deleted_at = now()
     where id = $1`,
    [userId]
  );
}
