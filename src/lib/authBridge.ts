import { randomBytes } from "crypto";
import { pool } from "@/lib/db";

const TOKEN_TTL_MS = 2 * 60 * 1000;

export async function createBridgeToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await pool.query(
    `insert into auth_bridge_tokens (id, token, user_id, expires_at)
     values (gen_random_uuid(), $1, $2, $3)`,
    [token, userId, expiresAt]
  );
  return token;
}

export async function consumeBridgeToken(token: string): Promise<string | null> {
  const { rows } = await pool.query<{ user_id: string }>(
    `update auth_bridge_tokens
     set used_at = now()
     where token = $1 and used_at is null and expires_at > now()
     returning user_id`,
    [token]
  );
  return rows[0]?.user_id ?? null;
}
